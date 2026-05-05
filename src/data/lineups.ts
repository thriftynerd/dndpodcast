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
// If a title is "Episode 1" in Acast, the slug is `c1-1-episode-1`, not
// `c1-1-so-it-begins`. The override key has to match that exactly or the
// entry is ignored.

export const LINEUP_OVERRIDES: Record<string, LineupEntry[]> = {

  // ============== CAMPAIGN 1 — FOUNDING ERA (Episodes 1–30) ==============

  // Episode 1 — first appearance of all four characters
  // Title in Acast is currently "Episode 1", so slug is c1-1-episode-1
  'c1-1-episode-1': C1_EPISODE_1,

  // Early episodes with placeholder titles ("Episode 2", "Episode 3"...)
  // and parser-unfriendly truncated descriptions
  'c1-2-episode-2': [...C1_FOUNDING],
  'c1-3-episode-3': [...C1_FOUNDING],
  'c1-4-episode-4': [...C1_FOUNDING],

  // Episodes 5–15 — slugs from RSS, lineup is standard founding
  'c1-5-a-brief-respite': [...C1_FOUNDING],
  'c1-6-the-return-of-the-eight-legged-freaks': [...C1_FOUNDING],
  'c1-7-the-next-level': [...C1_FOUNDING],
  'c1-8-robot-no-feel-love': [...C1_FOUNDING],
  'c1-9-thokas-takes-a-header': [...C1_FOUNDING],
  'c1-10-the-long-hallway': [...C1_FOUNDING],
  'c1-11-an-intense-headache': [...C1_FOUNDING],
  'c1-12-not-quite-through-the-woods': [...C1_FOUNDING],
  'c1-13-a-dwarf-dragonborn-and-a-githyanki-walk-into-a-bar': [...C1_FOUNDING],
  'c1-14-dreams-of-dragons': [...C1_FOUNDING],
  'c1-15-a-pirates-life-for-me': [...C1_FOUNDING],

  // TODO: episodes 16-29 — same lineup, slugs to confirm

  // Episode 30 — Tum Darkblade's final episode (he dies)
  // TODO: confirm episode 30's actual slug
  'c1-30-tum-final-episode': C1_EPISODE_30,

  // Episode 31 — Junpei Iori's final episode (departs with the githyanki).
  // TODO: confirm episode 31's actual slug
  'c1-31-junpei-final-episode': C1_EPISODE_31,

  // ============== CAMPAIGN 1 — POST-STEVEN ERA (Episodes 32+) ==============
  // TODO: pick up here once Tim's next-character details are confirmed.

};