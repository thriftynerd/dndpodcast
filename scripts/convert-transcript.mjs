// scripts/convert-transcript.mjs
//
// Converts AssemblyAI word-level timestamps (with named speakers) into the
// speaker-grouped format the Transcript.astro component expects.
//
// Usage:
//   node scripts/convert-transcript.mjs <input.json> <slug>
//
// Example:
//   node scripts/convert-transcript.mjs ~/Downloads/timestamps.json c2-182-big-bad-bread-wars
//
// Writes the output to:  src/data/transcripts/<slug>.json
//
// Expected input shape: array of { text, start, speaker } where `speaker` is
// already mapped to a real name like "Michael" / "Tim" / "Jennifer" /
// "Michael Bachmann" / "Nika".

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SPEAKER_CLASS = {
  Michael: 'speaker-michael',
  Tim: 'speaker-tim',
  Jennifer: 'speaker-jennifer',
  'Michael Bachmann': 'speaker-bach',
  Nika: 'speaker-nika',
};

const SPEAKER_DISPLAY = {
  Michael: 'Michael',
  Tim: 'Tim',
  Jennifer: 'Jennifer',
  'Michael Bachmann': 'Bachmann',
  Nika: 'Nika',
};

function fmtTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function convert(words) {
  const segments = [];
  let current = null;

  for (const w of words) {
    const speaker = w.speaker || '?';
    const text = w.text || '';
    const startMs = w.start ?? 0;

    if (!current || current._speaker !== speaker) {
      if (current) segments.push(current);
      current = {
        _speaker: speaker,
        _startMs: startMs,
        time: fmtTime(startMs),
        speaker: SPEAKER_DISPLAY[speaker] || speaker,
        speakerClass: SPEAKER_CLASS[speaker] || 'speaker-michael',
        text: text,
      };
    } else {
      current.text += ' ' + text;
    }
  }
  if (current) segments.push(current);

  return segments.map(({ _speaker, _startMs, ...keep }) => ({
    time: keep.time,
    speaker: keep.speaker,
    speakerClass: keep.speakerClass,
    text: keep.text.replace(/\s+/g, ' ').trim(),
  }));
}

// ---- main ----
const [, , inputPath, slug] = process.argv;

if (!inputPath || !slug) {
  console.error('Usage: node scripts/convert-transcript.mjs <input.json> <slug>');
  console.error('Example: node scripts/convert-transcript.mjs ~/Downloads/timestamps.json c2-182-big-bad-bread-wars');
  process.exit(1);
}

const raw = readFileSync(inputPath, 'utf-8');
const words = JSON.parse(raw);

if (!Array.isArray(words)) {
  console.error('Expected input to be a JSON array of words. Got:', typeof words);
  process.exit(1);
}

const segments = convert(words);

const outPath = resolve(process.cwd(), `src/data/transcripts/${slug}.json`);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(segments, null, 2));

// Summary
const counts = {};
for (const s of segments) {
  counts[s.speaker] = (counts[s.speaker] || 0) + 1;
}

console.log(`✓ Converted ${words.length} words into ${segments.length} segments`);
console.log(`✓ Wrote ${outPath}`);
console.log('');
console.log('Speaker distribution:');
for (const [sp, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${sp.padEnd(12)} ${n}`);
}
console.log('');
console.log('Reminder: hand-check the first 30-60 seconds for intro overlap diarization issues.');
