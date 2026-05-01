// src/lib/rss.ts
import { XMLParser } from 'fast-xml-parser';
import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const FEED_URL = 'https://feeds.acast.com/public/shows/greetings-adventurers';
const CACHE_PATH = resolve(process.cwd(), '.cache/feed.xml');
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours during dev

const isDev = process.env.NODE_ENV !== 'production';

export type EpisodeKind = 'c1' | 'c2' | 'bonus';

export interface Episode {
  // identifiers
  guid: string;             // Acast episode GUID, stable id
  slug: string;             // URL slug like 'c2-182-big-bad-bread-wars'
  acastEpisodeId: string;   // extracted from audio URL or guid for embeds
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
    // If fetch fails but we have a stale cache, use it
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
  // Many RSS fields can have either a string value or an attribute-bearing object.
  // This keeps things consistent.
  parseAttributeValue: false,
  trimValues: true,
});

export interface CastMember {
  player: string;
  initials: string;
  role: string;          // "as Screech Echo" or "Dungeon Master"
  avatarClass: string;   // 'avatar-bach' | 'avatar-jen' | 'avatar-michael' | 'avatar-nika' | 'avatar-tim'
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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, '')              // strip apostrophes
    .replace(/[^a-z0-9]+/g, '-')       // non-alphanumeric to dashes
    .replace(/^-+|-+$/g, '')           // trim leading/trailing dashes
    .slice(0, 80);                     // cap length
}

function parseDuration(raw: string | number | undefined): { seconds: number; display: string } {
  if (raw == null) return { seconds: 0, display: '?' };
  const s = String(raw).trim();

  let seconds = 0;
  if (/^\d+$/.test(s)) {
    // pure seconds
    seconds = parseInt(s, 10);
  } else if (/^\d+:\d+:\d+$/.test(s)) {
    // HH:MM:SS
    const [h, m, sec] = s.split(':').map(Number);
    seconds = h * 3600 + m * 60 + sec;
  } else if (/^\d+:\d+$/.test(s)) {
    // MM:SS
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
  // YYYY-MM-DD in UTC, keeps date stable regardless of viewer timezone
  return d.toISOString().slice(0, 10);
}

function humanReleaseDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function detectKind(title: string, episodeType: string | undefined, season: number, episodeNumber: number | null): EpisodeKind {
  const t = title.toLowerCase();
  // Acast's itunes:episodeType can be 'full', 'bonus', or 'trailer'
  if (episodeType === 'bonus' || episodeType === 'trailer') return 'bonus';
  if (t.includes('bonus')) return 'bonus';
  // Heuristic: season 1 = c1 (Drunks and Dragons era), season 2 = c2
  if (season === 1) return 'c1';
  if (season === 2) return 'c2';
  // Default for unmarked episodes
  return episodeNumber == null ? 'bonus' : 'c2';
}

function extractGuidString(guid: RssItem['guid']): string {
  if (!guid) return '';
  if (typeof guid === 'string') return guid;
  return guid['#text'] || '';
}

// Acast audio URLs look like:
// https://sphinx.acast.com/p/open/s/{showId}/e/{episodeId}/media.mp3
function extractAcastIds(audioUrl: string): { showId: string; episodeId: string } {
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
    const { showId, episodeId } = extractAcastIds(audioUrl);
    const guid = extractGuidString(item.guid) || episodeId;

    const episodeNumber =
      item['itunes:episode'] != null ? Number(item['itunes:episode']) : null;
    const season = item['itunes:season'] != null ? Number(item['itunes:season']) : 0;

    const descriptionHtml = item['content:encoded'] || item.description || '';
    const description = stripHtml(descriptionHtml);

    const date = isoDateFromPubDate(item.pubDate);
    const releaseDate = humanReleaseDate(date);
    const dur = parseDuration(item['itunes:duration']);

    const artUrl = item['itunes:image']?.['@_href'] || channel['itunes:image']?.['@_href'] || '';

    const kind = detectKind(item.title, item['itunes:episodeType'], season, episodeNumber);

    return {
      guid,
      slug: buildSlug(kind, episodeNumber, item.title),
      acastEpisodeId: episodeId,
      acastShowId: showId,

      episodeNumber: Number.isFinite(episodeNumber) ? episodeNumber : null,
      season,
      title: item.title,
      description,
      descriptionHtml,
      artUrl,
      audioUrl,
      duration: dur.display,
      durationSeconds: dur.seconds,
      date,
      releaseDate,
      kind,
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