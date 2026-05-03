// scripts/assemblyai-word-boost.mjs
//
// Reusable word-boost list for AssemblyAI transcription.
// Pass this array as the `word_boost` parameter when submitting an audio file
// to AssemblyAI. The model biases toward these spellings, dramatically reducing
// proper-noun errors.
//
// Usage in your transcription script:
//
//   import { WORD_BOOST } from './assemblyai-word-boost.mjs';
//
//   const transcript = await assemblyAI.transcripts.create({
//     audio_url: episodeAudioUrl,
//     speaker_labels: true,
//     word_boost: WORD_BOOST,
//   });
//
// AssemblyAI accepts up to ~1000 boost words. We're far under that.
// When a new persistent error shows up in a transcript (e.g., "Damaro" instead
// of "DiMauro"), add it to CLEANUP below and add the correct spelling to WORD_BOOST.

export const WORD_BOOST = [
  // === The world ===
  'Drunkeros',
  'Farholde',

  // === Cast (real names) ===
  'DiMauro',           // commonly rendered as "Damaro" — most frequent error
  'Bachmann',
  'Lanning',
  'Cheek',

  // === Campaign 2 player characters ===
  "T'Chuck",           // Tim
  'Selene',            // Jennifer
  'Von Esper',         // Selene's surname; commonly mangled as "Vanesper"
  'Screech Echo',      // Bachmann (one E in "Screech")
  "R'Oarc",            // Nika; commonly mangled as "Roar Q" or "orc"

  // === Campaign 1 player characters ===
  'Titus Harper',      // Tim
  'Aludra Wyrmsbane',  // Jennifer
  'Thom Vidalis',      // Bachmann (also played Steve, Marendithas, others)
  'Jaela',             // Nika
  'Marendithas',
  'Bananas Foster',
  'Jett Razor',
  'Skud Derringer',

  // === Notable NPCs ===
  'Steve Meloncamp',   // the gnoll
  'Oldman Breadbasket', // one word "Oldman"
  'Maris Womple',
  'Ratma',
  "J'Michael",
  'Theonite',

  // === Show vocabulary ===
  'Geekly',            // GeeklyInc — the network
  'Tankard',           // Tales from the Foaming Tankard, the Patreon show
  'Drakona',           // Drakona Arita dice set from Diehard Dice
  'Diehard',           // Diehard Dice
];

// Find-and-replace dictionary for cleaning up persistent errors that survive
// the word_boost. Applied to the transcript text after AssemblyAI returns.
//
// Before adding here, try adding the correct spelling to WORD_BOOST first —
// that's a more elegant fix. Use CLEANUP for cases where word_boost alone
// doesn't work (e.g., the model keeps splitting a name in a particular way).
export const CLEANUP = {
  Damaro: 'DiMauro',
  drunkers: 'Drunkeros',
  Vanesper: 'Von Esper',
  'Roar Q': "R'Oarc",
  // Add more as they show up
};

// Helper: apply the cleanup dictionary to a string of text
export function applyCleanup(text) {
  let result = text;
  for (const [bad, good] of Object.entries(CLEANUP)) {
    // Word-boundary match so "Damaro" doesn't replace inside "Damaroville" etc.
    const re = new RegExp(`\\b${bad}\\b`, 'g');
    result = result.replace(re, good);
  }
  return result;
}
