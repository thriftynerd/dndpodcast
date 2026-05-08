// src/lib/rss.ts
import { XMLParser } from 'fast-xml-parser';
import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { LINEUP_OVERRIDES, type LineupEntry } from '../data/lineups';

const FEED_URL = 'https://feeds.acast.com/public/shows/greetings-adventurers';
const CACHE_PATH = resolve(process.cwd(), '.cache/feed.xml');
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours during dev

const isDev = process.env.NODE_ENV !== 'production';

export type EpisodeKind = 'c1' | 'c2' | 'bonus';

export interface Episode {
  // identifiers
  guid: string;             // Acast episode GUID, stable id
  slug: string;             // URL slug like 'c2-182-big-bad-bread-wars'
  acastEpisodeId: string;   // for embed URL
  acastShowId: string;      // for embed URL

  // display
  episodeNumber: number | null;
  season: number;
  title: string;
  description: string;      // plain text version (HTML stripped)
  descriptionHtml: string;  // original HTML version, for richer rendering if wanted
  artUrl: string;
  audioUrl: string;
  duration: string;         // human-readable "1h 7m"
  durationSeconds: number;  // raw, for math
  date: string;             // ISO date "2026-04-20"
  releaseDate: string;      // human-readable "April 20, 2026"

  kind: EpisodeKind;

  // attribution — who played what
  // Auto-extracted from description text where possible, manually overridden
  // via src/data/lineups.ts where parsing fails or is incomplete.
  lineup: LineupEntry[];
}

// ---------- fetching with cache ----------

async function fetchFeedXml(): Promise<string> {
  if (isDev && existsSync(CACHE_PATH)) {
    const age = Date.now() - statSync(CACHE_PATH).mtimeMs;
    if (age < CACHE_TTL_MS) {
      return readFileSync(CACHE_PATH, 'utf-8');
    }
  }

  console.log('[rss] fetching feed from', FEED_URL);
  const res = await fetch(FEED_URL);
  if (!res.ok) {
    if (existsSync(CACHE_PATH)) {
      console.warn('[rss] fetch failed, using stale cache');
      return readFileSync(CACHE_PATH, 'utf-8');
    }
    throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  if (isDev) {
    mkdirSync(dirname(CACHE_PATH), { recursive: true });
    writeFileSync(CACHE_PATH, xml);
  }
  return xml;
}

// ---------- parsing ----------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: false,
  trimValues: true,
});

export interface CastMember {
  player: string;
  initials: string;
  role: string;          // "as Screech Echo" or "Dungeon Master"
  avatarClass: string;
  portrait?: string; 
}

export interface MentionItem {
  type: 'character' | 'location' | 'faction' | 'event' | 'item';
  name: string;
  href: string;
  note: string;
}

export interface EpisodeNavLink {
  href: string;
  label: string;
  title: string;
}

export interface TranscriptSegment {
  time: string;
  speaker: string;
  speakerClass: string;
  text: string;
  inCharacter?: boolean;
  characterName?: string;
  characterClass?: string;
}

interface RssItem {
  title: string;
  description?: string;
  'content:encoded'?: string;
  pubDate?: string;
  enclosure?: { '@_url': string; '@_type'?: string; '@_length'?: string };
  guid?: string | { '#text': string; '@_isPermaLink'?: string };
  'itunes:episode'?: string | number;
  'itunes:season'?: string | number;
  'itunes:duration'?: string | number;
  'itunes:image'?: { '@_href': string };
  'itunes:episodeType'?: string;
  'itunes:title'?: string;
  // Acast-specific tags. These give us the IDs directly without
  // having to regex-parse them out of the audio URL — the audio URL
  // sometimes contains URL-encoded WordPress permalinks instead of the
  // hex episode IDs, which broke the embed.
  'acast:episodeId'?: string;
  'acast:showId'?: string;
  'acast:episodeUrl'?: string;
}

interface RssChannel {
  title: string;
  description: string;
  'itunes:image'?: { '@_href': string };
  item: RssItem | RssItem[];
}

interface RssFeed {
  rss: { channel: RssChannel };
}

// ---------- normalizers ----------

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Strip lead-in phrases that the greedy capture sucks up. Without this,
// a description like "Join us on our adventure as Tum Darkblade (Tim Lanning)"
// captures the whole run instead of just "Tum Darkblade". We split on the
// last occurrence of common lead-ins and take what comes after.
function cleanCharacterName(raw: string): string {
  let s = raw.trim();
  const leadIns = [' as ', ' with ', ' featuring ', ' starring ', ' including '];
  for (const lead of leadIns) {
    const idx = s.toLowerCase().lastIndexOf(lead);
    if (idx >= 0) s = s.slice(idx + lead.length);
  }
  return s.trim();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`]/g, '')              // strip apostrophes (straight + curly)
    .replace(/[^a-z0-9]+/g, '-')        // non-alphanumeric to dashes
    .replace(/^-+|-+$/g, '')            // trim leading/trailing dashes
    .slice(0, 80);                      // cap length
}

function parseDuration(raw: string | number | undefined): { seconds: number; display: string } {
  if (raw == null) return { seconds: 0, display: '?' };
  const s = String(raw).trim();

  let seconds = 0;
  if (/^\d+$/.test(s)) {
    seconds = parseInt(s, 10);
  } else if (/^\d+:\d+:\d+$/.test(s)) {
    const [h, m, sec] = s.split(':').map(Number);
    seconds = h * 3600 + m * 60 + sec;
  } else if (/^\d+:\d+$/.test(s)) {
    const [m, sec] = s.split(':').map(Number);
    seconds = m * 60 + sec;
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const display = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return { seconds, display };
}

function isoDateFromPubDate(pubDate: string | undefined): string {
  if (!pubDate) return '';
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function humanReleaseDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function detectKind(title: string, episodeType: string | undefined, season: number, episodeNumber: number | null): EpisodeKind {
  const t = title.toLowerCase();
  if (episodeType === 'bonus' || episodeType === 'trailer') return 'bonus';
  if (t.includes('bonus')) return 'bonus';
  if (season === 1) return 'c1';
  if (season === 2) return 'c2';
  return episodeNumber == null ? 'bonus' : 'c2';
}

function extractGuidString(guid: RssItem['guid']): string {
  if (!guid) return '';
  if (typeof guid === 'string') return guid;
  return guid['#text'] || '';
}

// Fallback for the rare episode that's missing the dedicated acast:episodeId
// and acast:showId tags. Acast audio URLs USED to look like:
//   https://sphinx.acast.com/p/open/s/{showId}/e/{episodeId}/media.mp3
// But early-imported episodes use URL-encoded WordPress permalinks in the
// `e/` segment instead of hex IDs, so this fallback only works for newer
// episodes. Most episodes should hit the acast:episodeId tag path instead.
function extractAcastIdsFromUrl(audioUrl: string): { showId: string; episodeId: string } {
  const m = audioUrl.match(/\/s\/([a-f0-9]+)\/e\/([a-f0-9]+)\//i);
  if (m) return { showId: m[1], episodeId: m[2] };
  return { showId: '', episodeId: '' };
}

function buildSlug(kind: EpisodeKind, episodeNumber: number | null, title: string): string {
  const titleSlug = slugify(title);
  if (kind === 'bonus') return `bonus-${titleSlug}`;
  if (episodeNumber == null) return `${kind}-${titleSlug}`;
  return `${kind}-${episodeNumber}-${titleSlug}`;
}

// Strip leading "Episode N -", "Ep N:", "C1 Episode N -" type prefixes
// that some episodes have in their titles. The prefix is redundant because
// we already have episode number + kind tags as separate fields.
function cleanTitle(raw: string): string {
  if (!raw) return '';
  let t = raw.trim();
// "Campaign 2: Episode 167 - Title" / "C2 Episode 5: Title" / "Campaign Two Ep 12 — Title"
t = t.replace(/^(Campaign\s+(One|Two|[12])|C[12])\s*[:\s]?\s*(Episode|Ep\.?)\s+\d+\s*[-–—:]\s*/i, '');
  // "Episode 122 - Title" or "Episode 122: Title" or "Ep 122 - Title"
  t = t.replace(/^(Episode|Ep\.?)\s+\d+\s*[-–—:]\s*/i, '');
  // "Bonus Episode 159 - Title"
  t = t.replace(/^Bonus\s+(Episode|Ep\.?)\s+\d+\s*[-–—:]\s*/i, '');
  // "Title - C2: E182" — trailing campaign/episode tag
  t = t.replace(/\s*[-–—]\s*C[12]\s*[:\s]?\s*E\d+\s*$/i, '');
  return t.trim();
}

// ---------- lineup extraction ----------

// Many early episodes follow a description template like:
//   "The adventure continues with Tum Darkblade (Tim Lanning),
//    Thom the Dragonborn (Mike Bachmann), Junpei Iori (Steven Strom)
//    and Aludra (Jennifer Cheek)."
//
// This regex pulls "Character Name (Player Name)" pairs out of any text.
// Returns lineup entries in description order. May return empty array if
// the description doesn't follow this format — that's expected, especially
// for C2 episodes and bonus content where descriptions are written
// differently. The lineups.ts override file fills those gaps.
const PLAYER_RE = /([A-Z][\w''. ]+?)\s*\(([\w'' .]+?)\)/g;

// Known player names to validate matches against. Without this guard, any
// "Word (Word)" pattern in a description would be treated as character/player —
// e.g. "Drunkeros (the world)" would falsely match. We only accept matches
// where the parenthesized name is one of the cast.
const KNOWN_PLAYERS = new Set([
  'Tim Lanning',
  'Mike Bachmann',
  'Michael Bachmann',
  'Bachmann',
  'Jennifer Cheek',
  'Steven Strom',
  'Nika Howard',
  'Michael DiMauro',
  'Vince Kenny',
]);

function extractLineupFromDescription(description: string): LineupEntry[] {
  if (!description) return [];

  const found: LineupEntry[] = [];
  const seen = new Set<string>();

  // We deliberately do not reset PLAYER_RE.lastIndex here because we
  // construct a new regex on each call — but JS RegExp with /g requires
  // resetting if the same instance is reused. So we make a fresh one:
  const re = new RegExp(PLAYER_RE.source, 'g');

  let match: RegExpExecArray | null;
  while ((match = re.exec(description)) !== null) {
    const characterName = cleanCharacterName(match[1]);
    const playerName = match[2].trim();

    // Filter out matches where the parenthesized name isn't a known player
    if (!KNOWN_PLAYERS.has(playerName)) continue;

    // Filter out duplicates — the same description sometimes mentions a
    // character twice (e.g. once in setup paragraph, once in cast list)
    const key = `${characterName}::${playerName}`;
    if (seen.has(key)) continue;
    seen.add(key);

    found.push({
      player: playerName,
      character: characterName,
    });
  }

  return found;
}

// Combine parser output + manual overrides. Override wins where present.
// Override is keyed by slug; if there's an entry for this episode, it
// fully replaces the parsed lineup (so you can fix wrong/missing entries
// without fighting the parser).
function resolveLineup(slug: string, parsedLineup: LineupEntry[]): LineupEntry[] {
  const override = LINEUP_OVERRIDES[slug];
  if (override) return override;
  return parsedLineup;
}

// ---------- main entry point ----------

let cached: Episode[] | null = null;

export async function loadEpisodes(): Promise<Episode[]> {
  if (cached) return cached;

  const xml = await fetchFeedXml();
  const parsed = parser.parse(xml) as RssFeed;
  const channel = parsed.rss?.channel;
  if (!channel) throw new Error('Invalid RSS: no channel found');

  const items = Array.isArray(channel.item) ? channel.item : [channel.item];

  const episodes: Episode[] = items.map((item) => {
    const audioUrl = item.enclosure?.['@_url'] || '';

    // Read Acast IDs directly from the dedicated tags. This is the fix for
    // the broken-embed bug — old episodes have URL-encoded WordPress
    // permalinks in the audio URL where the regex used to look for hex IDs.
    const acastEpisodeId = item['acast:episodeId'] || '';
    const acastShowId = item['acast:showId'] || '';
    // Fallback to URL parsing only if the dedicated tags are missing
    const fallback = (!acastEpisodeId || !acastShowId)
      ? extractAcastIdsFromUrl(audioUrl)
      : { showId: '', episodeId: '' };
    const finalShowId = acastShowId || fallback.showId;
    const finalEpisodeId = acastEpisodeId || fallback.episodeId;

    const guid = extractGuidString(item.guid) || finalEpisodeId;

    const episodeNumber =
      item['itunes:episode'] != null ? Number(item['itunes:episode']) : null;
    const season = item['itunes:season'] != null ? Number(item['itunes:season']) : 0;

    const descriptionHtml = item['content:encoded'] || item.description || '';
    const description = stripHtml(descriptionHtml);

    const date = isoDateFromPubDate(item.pubDate);
    const releaseDate = humanReleaseDate(date);
    const dur = parseDuration(item['itunes:duration']);

    const artUrl = item['itunes:image']?.['@_href'] || channel['itunes:image']?.['@_href'] || '';

    const cleanedTitle = cleanTitle(item.title);
    const kind = detectKind(cleanedTitle, item['itunes:episodeType'], season, episodeNumber);
    const slug = buildSlug(kind, episodeNumber, cleanedTitle);

    const parsedLineup = extractLineupFromDescription(description);
    const lineup = resolveLineup(slug, parsedLineup);

    return {
      guid,
      slug,
      acastEpisodeId: finalEpisodeId,
      acastShowId: finalShowId,

      episodeNumber: Number.isFinite(episodeNumber) ? episodeNumber : null,
      season,
      title: cleanedTitle,
      description,
      descriptionHtml,
      artUrl,
      audioUrl,
      duration: dur.display,
      durationSeconds: dur.seconds,
      date,
      releaseDate,
      kind,
      lineup,
    };
  });

  // Newest first
  episodes.sort((a, b) => b.date.localeCompare(a.date));

  cached = episodes;
  console.log(`[rss] parsed ${episodes.length} episodes`);
  return episodes;
}

// Convenience: get a single episode by slug
export async function getEpisode(slug: string): Promise<Episode | undefined> {
  const all = await loadEpisodes();
  return all.find((ep) => ep.slug === slug);
}

// Convenience: get prev/next neighbors for an episode
export async function getNeighbors(slug: string): Promise<{ prev?: Episode; next?: Episode }> {
  const all = await loadEpisodes();
  const idx = all.findIndex((ep) => ep.slug === slug);
  if (idx < 0) return {};
  // all is sorted newest-first, so "prev" (older episode) is idx+1
  return {
    prev: all[idx + 1],
    next: all[idx - 1],
  };
}