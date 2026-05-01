// src/data/episodes-archive.ts
import { loadEpisodes, type Episode } from '../lib/rss';

// Re-export under the old name for compatibility with existing components
export type ArchiveEpisode = Episode;
export type EpisodeKind = Episode['kind'];

export const episodes: ArchiveEpisode[] = await loadEpisodes();

// Keep the helpers your components already import
export function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${M[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function getYear(iso: string): string {
  return iso.slice(0, 4);
}

export interface YearGroup {
  year: string;
  episodes: ArchiveEpisode[];
}

export function groupByYear(eps: ArchiveEpisode[]): YearGroup[] {
  const byYear: Record<string, ArchiveEpisode[]> = {};
  for (const ep of eps) {
    const y = getYear(ep.date);
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(ep);
  }
  return Object.keys(byYear)
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({ year, episodes: byYear[year] }));
}