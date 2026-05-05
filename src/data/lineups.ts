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
  absent?: boolean;      // someone normally on the show but missing this week
  guest?: boolean;       // a guest player not part of the regular cast

  // Character status flags — for episode pages to surface
  // "★ first appearance" or "★ final appearance" badges.
  firstAppearance?: boolean;     // first time this character appears
  finalAppearance?: boolean;     // last time this character appears (death, retirement, departure)

  note?: string;         // optional editorial note ("substituting for...", "departs with the githyanki")
}

// ============== PRESETS ==============
// Reusable lineup templates. Spread one into a slug entry to start from a preset:
//   'c1-15-some-slug': [...C1_FOUNDING],
// Then modify or add flags as needed for that specific episode.

// Episodes 1–29: the original four-PC lineup, before Tum's death.
export const C1_FOUNDING: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  { player: 'Tim Lanning', character: 'Tum Darkblade' },
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn' },
  { player: 'Steven Strom', character: 'Junpei Iori' },
];

// Episodes 31: Tim has lost Tum, Steven still around playing Junpei
// (Junpei's final episode is here too — he departs with the githyanki)
export const C1_TRIO_PLUS_JUNPEI: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  // Tim's next character TBD — confirm and fill in
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn' },
  { player: 'Steven Strom', character: 'Junpei Iori' },
];

// Episodes 32 onward: post-Steven era, three-PC lineup
// TODO: confirm Tim's next character. Until then, this is a partial preset.
export const C1_POST_STEVEN: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  // Tim's next character TBD
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn' },
];

// PLACEHOLDER — once Nika joins (around ep 81 per build brief)
export const C1_QUINTET: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  // TODO: Tim's character at this point in C1
  { player: 'Jennifer Cheek', character: 'Aludra Wyrmsbane' },
  { player: 'Mike Bachmann', character: 'Thom Vidalis' },
  { player: 'Nika Howard', character: 'Jaela' },
];

// C2 standard lineup
export const C2_STANDARD: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  { player: 'Tim Lanning', character: "T'Chuck" },
  { player: 'Jennifer Cheek', character: 'Selene Von Esper' },
  { player: 'Mike Bachmann', character: 'Screetch Echo' },
  { player: 'Nika Howard', character: "R'Oarc" },
];

// ============== HELPERS ==============
// Marker functions for character status flags. Take a base lineup entry and
// return a copy with the flag set, so we don't have to hand-construct
// overrides for episodes that mostly match a preset but with one flag.

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
// Tim's row is open — Tum is dead and Tim's next character isn't here yet.
const C1_EPISODE_31: LineupEntry[] = C1_TRIO_PLUS_JUNPEI.map((entry) =>
  markFinal(entry, 'Junpei Iori', 'Goes off with the githyanki'),
);

// ============== OVERRIDES ==============
// Slug-keyed map. Slugs match what rss.ts builds, e.g.
// 'c1-1-so-it-begins' or 'c2-182-big-bad-bread-wars'.

export const LINEUP_OVERRIDES: Record<string, LineupEntry[]> = {

  // ============== CAMPAIGN 1 — FOUNDING ERA (Episodes 1–30) ==============
  // The original four-PC lineup. Tim plays Tum Darkblade, who dies in ep 30.
  // Steven Strom plays Junpei Iori, who departs in ep 31.

  // Episode 1 — first appearance of all four characters
  // TODO: confirm exact slug once Acast title cleanup lands
  'c1-1-so-it-begins': C1_EPISODE_1,

  // Episodes 2–15 — standard founding lineup, slugs from RSS
  'c1-2-episode-2': [...C1_FOUNDING],
  'c1-3-episode-3': [...C1_FOUNDING],
  'c1-4-episode-4': [...C1_FOUNDING],
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
  // TODO: confirm episode 30's actual slug once title cleanup lands
  'c1-30-tum-final-episode': C1_EPISODE_30,

  // Episode 31 — Junpei Iori's final episode (departs with the githyanki).
  // Tim's row is open — needs his next character once confirmed.
  // TODO: confirm episode 31's actual slug
  'c1-31-junpei-final-episode': C1_EPISODE_31,

  // ============== CAMPAIGN 1 — POST-STEVEN ERA (Episodes 32+) ==============
  // TODO: pick up here once Tim's next-character details are confirmed.

};