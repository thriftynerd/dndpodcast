// src/data/lineups.ts
//
// Per-episode lineup overrides for the "who played what" attribution that
// appears in episode pages. The default behavior (in rss.ts) parses the
// "Character Name (Player Name)" pattern out of episode descriptions —
// that works for many early C1 episodes but won't catch every one.
//
// This file is the manual override layer:
//   - Add an entry here keyed by episode slug
//   - The entry fully replaces the parsed lineup for that episode
//   - Episodes with no entry here use the parsed result, which may be empty

export interface LineupEntry {
  player: string;        // "Tim Lanning"
  character?: string;    // "T'Chuck" — omit for DM
  role?: 'dm' | 'pc';    // defaults to 'pc' if character is set

  // Optional portrait image path. When set, EpisodeCast renders the image
  // in place of player initials. When unset, falls back to initials —
  // which is also the deliberate treatment for some characters (e.g., Junpei).
  portrait?: string;

  absent?: boolean;      // someone normally on the show but missing this week
  guest?: boolean;       // a guest player not part of the regular cast

  // Character status flags — for episode pages to surface
  // "★ first appearance" or "★ final appearance" badges.
  firstAppearance?: boolean;
  finalAppearance?: boolean;

  note?: string;         // optional editorial note ("substituting for...", "departs with the githyanki")
}

// ============== PRESETS ==============

// Episodes 1–29: the original four-PC lineup, before Tum's death.
export const C1_FOUNDING: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  { player: 'Tim Lanning', character: 'Tum Darkblade', portrait: '/images/characters/tum-darkblade.webp' },
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf', portrait: '/images/characters/aludra-the-dwarf.webp' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn', portrait: '/images/characters/thom-the-dragonborn.webp' },
  // Junpei deliberately has no portrait. The fallback to initials renders
  // identically to any character we don't have art for. Don't change this.
  { player: 'Steven Strom', character: 'Junpei Iori' },
];

// Episode 31: Tum is gone, Steven still around playing Junpei (final episode).
export const C1_TRIO_PLUS_JUNPEI: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  // Tim's next character TBD — confirm and fill in
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf', portrait: '/images/characters/aludra-the-dwarf.webp' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn', portrait: '/images/characters/thom-the-dragonborn.webp' },
  { player: 'Steven Strom', character: 'Junpei Iori' },
];

// Episodes 32 onward: post-Steven era.
export const C1_POST_STEVEN: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  // Tim's next character TBD
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf', portrait: '/images/characters/aludra-the-dwarf.webp' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn', portrait: '/images/characters/thom-the-dragonborn.webp' },
];

// PLACEHOLDER — once Nika joins (around ep 81 per build brief)
export const C1_QUINTET: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  // TODO: Tim's character at this point in C1
  { player: 'Jennifer Cheek', character: 'Aludra Wyrmsbane' },
  { player: 'Mike Bachmann', character: 'Thom Vidalis' },
  { player: 'Nika Howard', character: 'Jaela' },
];

// C2 standard lineup. Uses the existing /images/c2/*.webp art.
export const C2_STANDARD: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  { player: 'Tim Lanning', character: "T'Chuck", portrait: '/images/c2/tchuck.webp' },
  { player: 'Jennifer Cheek', character: 'Selene Von Esper', portrait: '/images/c2/selene.webp' },
  { player: 'Mike Bachmann', character: 'Screetch Echo', portrait: '/images/c2/screetch.webp' },
  { player: 'Nika Howard', character: "R'Oarc", portrait: '/images/c2/roarc.webp' },
];

// ============== HELPERS ==============

const markFirst = (entry: LineupEntry, character?: string): LineupEntry => {
  if (!character || entry.character === character) {
    return { ...entry, firstAppearance: true };
  }
  return entry;
};

const markFinal = (entry: LineupEntry, character?: string, note?: string): LineupEntry => {
  if (!character || entry.character === character) {
    return { ...entry, finalAppearance: true, ...(note ? { note } : {}) };
  }
  return entry;
};

// ============== SPECIFIC EPISODE LINEUPS ==============

// Episode 1 — first appearance of all four founding characters
const C1_EPISODE_1: LineupEntry[] = C1_FOUNDING.map((entry) => {
  if (entry.role === 'dm') return entry;
  return { ...entry, firstAppearance: true };
});

// Episode 30 — Tum Darkblade's final episode (he dies)
const C1_EPISODE_30: LineupEntry[] = C1_FOUNDING.map((entry) =>
  markFinal(entry, 'Tum Darkblade'),
);

// Episode 31 — Junpei Iori's final episode (departs with the githyanki).
const C1_EPISODE_31: LineupEntry[] = C1_TRIO_PLUS_JUNPEI.map((entry) =>
  markFinal(entry, 'Junpei Iori', 'Goes off with the githyanki'),
);

// ============== OVERRIDES ==============
// IMPORTANT: slug keys must match exactly what rss.ts buildSlug() produces.
// If you rename an episode in the RSS feed, the slug changes here too —
// stale keys are silently ignored, which means the page will fall back to
// whatever the parser can scrape from the description (often broken).
//
// To verify a key, look at the URL of the rendered episode page in dev.

export const LINEUP_OVERRIDES: Record<string, LineupEntry[]> = {

  // ============== CAMPAIGN 1 — FOUNDING ERA (Episodes 1–30) ==============

  // Episode 1 — "So it Begins!" — confirmed slug from dev
  'c1-1-so-it-begins': C1_EPISODE_1,

  // TODO: episodes 2–15 keys below were written against the OLD slugs (when
  // titles were placeholder "Episode 2", "Episode 3", etc.). After the RSS
  // cleanup the titles changed, which means these slugs are likely stale.
  // Click through each episode in dev and update the key to match the URL.
  // The lineup data itself is fine — it's just the keys that need updating.

  'c1-2-episode-2': [...C1_FOUNDING],                                              // TODO: confirm slug
  'c1-3-episode-3': [...C1_FOUNDING],                                              // TODO: confirm slug
  'c1-4-episode-4': [...C1_FOUNDING],                                              // TODO: confirm slug
  'c1-5-a-brief-respite': [...C1_FOUNDING],                                        // TODO: confirm slug
  'c1-6-the-return-of-the-eight-legged-freaks': [...C1_FOUNDING],                  // TODO: confirm slug
  'c1-7-the-next-level': [...C1_FOUNDING],                                         // TODO: confirm slug
  'c1-8-robot-no-feel-love': [...C1_FOUNDING],                                     // TODO: confirm slug
  'c1-9-thokas-takes-a-header': [...C1_FOUNDING],                                  // TODO: confirm slug
  'c1-10-the-long-hallway': [...C1_FOUNDING],                                      // TODO: confirm slug
  'c1-11-an-intense-headache': [...C1_FOUNDING],                                   // TODO: confirm slug
  'c1-12-not-quite-through-the-woods': [...C1_FOUNDING],                           // TODO: confirm slug
  'c1-13-a-dwarf-dragonborn-and-a-githyanki-walk-into-a-bar': [...C1_FOUNDING],    // TODO: confirm slug
  'c1-14-dreams-of-dragons': [...C1_FOUNDING],                                     // TODO: confirm slug
  'c1-15-a-pirates-life-for-me': [...C1_FOUNDING],                                 // TODO: confirm slug

  // TODO: episodes 16-29 — same lineup, slugs to confirm

  // Episode 30 — Tum Darkblade's final episode (he dies)
  'c1-30-tum-final-episode': C1_EPISODE_30,                                        // TODO: confirm slug

  // Episode 31 — Junpei Iori's final episode (departs with the githyanki).
  'c1-31-junpei-final-episode': C1_EPISODE_31,                                     // TODO: confirm slug

  // ============== CAMPAIGN 1 — POST-STEVEN ERA (Episodes 32+) ==============
  // TODO: pick up here once Tim's next-character details are confirmed.

};