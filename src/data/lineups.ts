// src/data/lineups.ts
//
// Per-episode lineup attribution for the "In this episode" cast cards.
//
// Resolution order (handled in rss.ts → resolveLineup):
//   1. LINEUP_OVERRIDES: per-slug overrides for genuinely weird episodes
//      (guest players, an absent regular, off-format bonus eps).
//   2. MILESTONES: layered onto whatever lineup applies, flagging first/final
//      appearances. Keyed by `${kind}-${episodeNumber}` so they survive
//      title renames.
//   3. LINEUP_RANGES: default lineup for an era. Matched by (kind,
//      episodeNumber). This handles ~99% of episodes.
//   4. Parser fallback: pulled from the description by rss.ts. Last resort,
//      no portraits.

export interface LineupEntry {
  player: string;        // "Tim Lanning"
  character?: string;    // "T'Chuck" — omit for DM
  role?: 'dm' | 'pc';    // defaults to 'pc' if character is set

  // Optional portrait image path. When set, EpisodeCast renders the image
  // in place of player initials. When unset, falls back to initials.
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

// Episodes 1–30: the original four-PC lineup, before Tum's death.
export const C1_FOUNDING: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  { player: 'Tim Lanning', character: 'Tum Darkblade', portrait: '/images/characters/tum-darkblade.webp' },
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf', portrait: '/images/characters/aludra-the-dwarf.webp' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn', portrait: '/images/characters/thom-the-dragonborn.webp' },
  { player: 'Steven Strom', character: 'Junpei Iori' },
];

// Episodes 1–30: the original four-PC lineup, before Tum's death.
export const C1_FOUNDING_A: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  { player: 'Tim Lanning', character: 'Tum Darkblade', portrait: '/images/characters/tum-darkblade.webp' },
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf', portrait: '/images/characters/aludra-the-dwarf.webp' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn', portrait: '/images/characters/thom-the-dragonborn.webp' },
  { player: 'Owen DiMauro', character: 'Aelar', portrait: '/images/characters/aelar.webp' },
];

// Episodes 1–30: the original four-PC lineup, before Tum's death.
export const C1_FOUNDING_NS: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  { player: 'Tim Lanning', character: 'Tum Darkblade', portrait: '/images/characters/tum-darkblade.webp' },
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf', portrait: '/images/characters/aludra-the-dwarf.webp' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn', portrait: '/images/characters/thom-the-dragonborn.webp' },
];

// Episode 31: Tum is gone, Steven still around playing Junpei (his final episode).
export const C1_TRIO_PLUS_JUNPEI: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  // TODO: Tim's next character once Tum dies — confirm and fill in
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf', portrait: '/images/characters/aludra-the-dwarf.webp' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn', portrait: '/images/characters/thom-the-dragonborn.webp' },
  { player: 'Steven Strom', character: 'Junpei Iori' },
];

// Episodes 32 onward: post-Steven era, four-person table.
export const C1_QUARTET: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/thrifty2.webp' },
    { player: 'Tim Lanning', character: 'Lord Titus Harper', portrait: '/images/characters/lord-titus-harper.webp' },
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf', portrait: '/images/characters/aludra-the-dwarf.webp' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn', portrait: '/images/characters/thom-the-dragonborn.webp' },
];

// Episodes 81+: Nika joins the show.
export const C1_QUINTET: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/thrifty2.webp' },
  { player: 'Tim Lanning', character: 'Lord Titus Harper', portrait: '/images/characters/lord-titus-harper.webp' },
  { player: 'Jennifer Cheek', character: 'Aludra Wyrmsbane' , portrait: '/images/characters/aludra-wyrmsbane.webp' },
  { player: 'Mike Bachmann', character: 'Thom Vidalis' , portrait: '/images/characters/thom-vidalis.webp' },
  { player: 'Nika Howard', character: 'Jaela' , portrait: '/images/characters/early-jaela.webp' },
];

export const C1_BOATSITTERS: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  { player: 'Tim Lanning', character: 'Telir Thumble' },
  { player: 'Jennifer Cheek', character: 'Temerity Barakas' },
  { player: 'Nika Howard', character: 'Rhavar' },
];

export const C1_SEXTET: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/thrifty2.webp' },
  { player: 'Tim Lanning', character: 'Lord Titus Harper', portrait: '/images/characters/lord-titus-harper.webp' },
  { player: 'Jennifer Cheek', character: 'Aludra Wyrmsbane' , portrait: '/images/characters/aludra-wyrmsbane.webp' },
  { player: 'Mike Bachmann', character: 'Thom and Steve' , portrait: '/images/characters/thom-and-steve.webp' },
  { player: 'Nika Howard', character: 'Jaela' , portrait: '/images/characters/early-jaela.webp' },
];

export const C1_SEXTET_NB: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/thrifty2.webp' },
  { player: 'Tim Lanning', character: 'Lord Titus Harper', portrait: '/images/characters/lord-titus-harper.webp' },
  { player: 'Jennifer Cheek', character: 'Aludra Wyrmsbane' , portrait: '/images/characters/aludra-wyrmsbane.webp' },
  { player: 'Nika Howard', character: 'Jaela' , portrait: '/images/characters/early-jaela.webp' },
];

export const C1_FIFTY: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/thrifty2.webp' },
  { player: 'Mike Bachmann', character: 'Thom and Steve' , portrait: '/images/characters/thom-and-steve.webp' },
  { player: 'Sarah Tompkins', character: 'Wren' , portrait: '/images/characters/wren.webp' },
  { player: 'Adam Bash', character: 'Watari' , portrait: '/images/characters/watari.webp' },
];


// C2 standard lineup. Uses the existing /images/c2/*.webp art.
export const C2_STANDARD: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm', portrait: '/images/characters/michael-dimauro.webp' },
  { player: 'Tim Lanning', character: "T'Chuck", portrait: '/images/c2/tchuck.webp' },
  { player: 'Jennifer Cheek', character: 'Selene Von Esper', portrait: '/images/c2/selene.webp' },
  { player: 'Mike Bachmann', character: 'Screetch Echo', portrait: '/images/c2/screetch.webp' },
  { player: 'Nika Howard', character: "R'Oarc", portrait: '/images/c2/roarc.webp' },
];



// ============== RANGE-BASED DEFAULTS ==============
//
// Each rule applies to a (kind, episode-number) range. First match wins,
// so list more specific ranges before broader ones if they overlap.
//
// `to` is inclusive. Omit `to` for "from this number onward."

export interface LineupRange {
  kind: 'c1' | 'c2' | 'bonus';
  from: number;
  to?: number;
  lineup: LineupEntry[];
}

export const LINEUP_RANGES: LineupRange[] = [
  // C1 founding era — episodes 1 through 30 (Tum dies at the end of 30)
  { kind: 'c1', from: 1,  to: 30, lineup: C1_FOUNDING },

  { kind: 'c1', from: 4,  to: 4, lineup: C1_FOUNDING_NS },

  { kind: 'c1', from: 5,  to: 13, lineup: C1_FOUNDING },

  { kind: 'c1', from: 14,  to: 14, lineup: C1_FOUNDING_A },

  { kind: 'c1', from: 15,  to: 15, lineup: C1_FOUNDING },

  { kind: 'c1', from: 17,  to: 17, lineup: C1_FOUNDING_NS },

  { kind: 'c1', from: 18,  to: 30, lineup: C1_FOUNDING },

  // C1 ep 31 — Junpei's last appearance, Tum is gone
  { kind: 'c1', from: 31, to: 31, lineup: C1_TRIO_PLUS_JUNPEI },

  // C1 post-Steven — episodes 32 through 80, four-person table
  { kind: 'c1', from: 32, to: 48, lineup: C1_QUARTET },

  // C1 post-Steven — episodes 32 through 80, four-person table
  { kind: 'c1', from: 49, to: 50, lineup: C1_FIFTY },

  // C1 post-Steven — episodes 32 through 80, four-person table
  { kind: 'c1', from: 51, to: 80, lineup: C1_QUARTET },

  // C1 quintet era — Nika joins around episode 81
  // TODO: confirm the exact episode where Nika first appears
  { kind: 'c1', from: 81, to: 89, lineup: C1_QUINTET },

  // C1 quintet era — Nika joins around episode 81
  // TODO: confirm the exact episode where Nika first appears
  { kind: 'c1', from: 90, to: 91, lineup: C1_BOATSITTERS },

   // C1 quintet era — Nika joins around episode 81
  // TODO: confirm the exact episode where Nika first appears
  { kind: 'c1', from: 92, to: 114, lineup: C1_QUINTET },

  // C1 quintet era — Nika joins around episode 81
  // TODO: confirm the exact episode where Nika first appears
  { kind: 'c1', from: 115, to: 116, lineup: C1_BOATSITTERS },

  // C1 quintet era — Nika joins around episode 81
  // TODO: confirm the exact episode where Nika first appears
  { kind: 'c1', from: 117, to: 123, lineup: C1_SEXTET },

    // C1 quintet era — Nika joins around episode 81
  // TODO: confirm the exact episode where Nika first appears
  { kind: 'c1', from: 124, to: 125, lineup: C1_SEXTET_NB },

  // C1 quintet era — Nika joins around episode 81
  // TODO: confirm the exact episode where Nika first appears
  { kind: 'c1', from: 126, to: 424, lineup: C1_SEXTET },

  // C2 — standard lineup for everything from episode 1 on
  { kind: 'c2', from: 1,          lineup: C2_STANDARD },
];

// ============== MILESTONES ==============
//
// Layered on top of whichever range-based lineup matched. Use these to mark
// first/final appearances and the like, without having to fork an entire
// preset. Keyed by `${kind}-${episodeNumber}` (NOT by slug — this is the
// whole point: stable across title renames).
//
// Each entry is a list of patches. Each patch identifies a character (by
// name) and the flags to set on that lineup entry. Characters not present
// in the matched lineup are silently ignored.

export interface MilestonePatch {
  character: string;
  firstAppearance?: boolean;
  finalAppearance?: boolean;
  note?: string;
}

export const MILESTONES: Record<string, MilestonePatch[]> = {
  // Episode 1 — first appearance of all four founding characters
  'c1-1': [
    { character: 'Tum Darkblade', firstAppearance: true },
    { character: 'Aludra the Dwarf', firstAppearance: true },
    { character: 'Thom the Dragonborn', firstAppearance: true },
    { character: 'Junpei Iori', firstAppearance: true },
  ],

  // Episode 30 — Tum dies
  'c1-30': [
    { character: 'Tum Darkblade', finalAppearance: true },
  ],

  // Episode 31 — Junpei departs with the githyanki
  'c1-31': [
    { character: 'Junpei Iori', finalAppearance: true, note: 'Goes off with the githyanki' },
  ],

  // TODO: Nika's first appearance once that episode number is confirmed
  // 'c1-81': [{ character: 'Jaela', firstAppearance: true }],
};

// ============== PER-SLUG OVERRIDES ==============
//
// For genuinely weird episodes that don't fit any range — guest players,
// an absent regular, Tim-DM bonus episodes, etc. Replaces the range lookup
// entirely (milestones are NOT applied on top of overrides). Use sparingly.

export const LINEUP_OVERRIDES: Record<string, LineupEntry[]> = {
  // Example: a bonus episode where Tim DMs and the cast plays themselves
  // 'bonus-great-kings-and-venturers-part-3': [
  //   { player: 'Tim Lanning', role: 'dm' },
  //   { player: 'Mike Bachmann', character: 'Mike Bachmann', guest: true },
  //   ...
  // ],
};