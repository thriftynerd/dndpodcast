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
//
// Common reasons to add an override:
//   - The description doesn't list characters (most C2 episodes)
//   - The description lists wrong/incomplete cast
//   - You want to flag who's absent that week
//   - Bonus episodes with non-standard lineups (Tim DMs, etc.)

export interface LineupEntry {
  player: string;        // "Tim Lanning"
  character?: string;    // "T'Chuck" — omit for DM
  role?: 'dm' | 'pc';    // defaults to 'pc' if character is set
  absent?: boolean;      // someone normally on the show but missing this week
  guest?: boolean;       // a guest player not part of the regular cast
  note?: string;         // optional editorial note ("substituting for...")
}

// Slug-keyed override map. Slugs match what rss.ts builds, e.g.
// 'c1-1-so-it-begins' or 'c2-182-big-bad-bread-wars'.
//
// Start small — only add entries where the parser is wrong or empty.
// Don't try to fill in 686 episodes here; that's a forever job.
export const LINEUP_OVERRIDES: Record<string, LineupEntry[]> = {

  // ============== EXAMPLES ==============
  // Replace these with real data when you're ready. The parser will catch
  // many C1 episodes automatically, so you mainly need this for:
  //   - C2 episodes (descriptions don't follow the parser pattern)
  //   - Bonus episodes with weird lineups
  //   - Specific episodes where someone was absent

  /*
  // EXAMPLE: a normal C2 episode
  'c2-1-some-title': [
    { player: 'Michael DiMauro', role: 'dm' },
    { player: 'Tim Lanning', character: "T'Chuck" },
    { player: 'Jennifer Cheek', character: 'Selene Von Esper' },
    { player: 'Mike Bachmann', character: 'Screetch Echo' },
    { player: 'Nika Howard', character: "R'Oarc" },
  ],

  // EXAMPLE: an episode where someone is absent
  'c1-100-some-title': [
    { player: 'Michael DiMauro', role: 'dm' },
    { player: 'Tim Lanning', character: 'Titus Harper' },
    { player: 'Jennifer Cheek', character: 'Aludra Wyrmsbane' },
    { player: 'Mike Bachmann', character: 'Thom Vidalis', absent: true, note: 'Family emergency' },
  ],

  // EXAMPLE: a guest episode
  'bonus-some-special': [
    { player: 'Michael DiMauro', role: 'dm' },
    { player: 'Tim Lanning', character: 'Titus Harper' },
    { player: 'Some Guest', character: 'Their PC', guest: true },
  ],
  */

};

// Default lineup presets. Useful for the override file when you want to
// declare "this episode uses the standard C2 lineup" without typing it out.
//
// Spread one of these into an override entry to start from a preset:
//   'c2-some-slug': [...C2_STANDARD],

export const C2_STANDARD: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  { player: 'Tim Lanning', character: "T'Chuck" },
  { player: 'Jennifer Cheek', character: 'Selene Von Esper' },
  { player: 'Mike Bachmann', character: 'Screetch Echo' },
  { player: 'Nika Howard', character: "R'Oarc" },
];

// Original C1 lineup, before Steven Strom's departure
export const C1_FOUNDING: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  { player: 'Tim Lanning', character: 'Tum Darkblade' },
  { player: 'Jennifer Cheek', character: 'Aludra the Dwarf' },
  { player: 'Mike Bachmann', character: 'Thom the Dragonborn' },
  { player: 'Steven Strom', character: 'Junpei Iori' },
];

// C1 quartet after Steven left, before Nika joined
export const C1_QUARTET: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  { player: 'Tim Lanning', character: 'Titus Harper' },
  { player: 'Jennifer Cheek', character: 'Aludra Wyrmsbane' },
  { player: 'Mike Bachmann', character: 'Thom Vidalis' },
];

// C1 quintet from Nika's arrival (around ep 81) onward
export const C1_QUINTET: LineupEntry[] = [
  { player: 'Michael DiMauro', role: 'dm' },
  { player: 'Tim Lanning', character: 'Titus Harper' },
  { player: 'Jennifer Cheek', character: 'Aludra Wyrmsbane' },
  { player: 'Mike Bachmann', character: 'Thom Vidalis' },
  { player: 'Nika Howard', character: 'Jaela' },
];