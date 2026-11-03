/** Utilidades dos cards e da lista de mundos. */
import type { World } from '../api/worlds';

export type WorldSort = 'custom' | 'activity' | 'created';

export const WORLD_SORT_OPTIONS: { value: WorldSort; label: string }[] = [
  { value: 'custom', label: 'Personalizada' },
  { value: 'activity', label: 'Última atividade' },
  { value: 'created', label: 'Criados recentemente' },
];

const time = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);

/** Devolve uma cópia ordenada. 'custom' repete a ordem do servidor (display_order, depois mais novo). */
export function sortWorlds(worlds: World[], mode: WorldSort): World[] {
  const copy = [...worlds];
  if (mode === 'created') {
    return copy.sort((a, b) => time(b.created_at) - time(a.created_at));
  }
  if (mode === 'activity') {
    return copy.sort(
      (a, b) =>
        time(b.last_activity_at ?? b.updated_at) - time(a.last_activity_at ?? a.updated_at) ||
        time(b.created_at) - time(a.created_at),
    );
  }
  return copy.sort(
    (a, b) => a.display_order - b.display_order || time(b.created_at) - time(a.created_at),
  );
}

/** Gradiente estável gerado pelo nome, para mundos sem capa. */
export function coverGradient(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  const hue = hash % 360;
  return `linear-gradient(135deg, hsl(${hue} 32% 26%), hsl(${(hue + 40) % 360} 38% 12%))`;
}