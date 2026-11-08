/**
 * Regras da Linha do Tempo (funções puras, testáveis):
 * - ordenação por ano, mês e dia (mês/dia vazios contam como 0, vêm antes); empate, pela criação;
 * - formatação da data no calendário do mundo ("Ano 201 da Queda");
 * - agrupamento em eras e posição do marcador "Agora".
 */
import type { Era, TimelineEvent } from '../api/timeline';

export interface DateParts {
  year: number;
  month: number | null;
  day: number | null;
}

export type NowDate = DateParts;

export function compareDates(a: DateParts, b: DateParts): number {
  return a.year - b.year || (a.month ?? 0) - (b.month ?? 0) || (a.day ?? 0) - (b.day ?? 0);
}

export const compareEvents = (a: TimelineEvent, b: TimelineEvent) =>
  compareDates(a, b) || a.id - b.id;

/** Posição, na lista ordenada, do primeiro evento DEPOIS de "agora" (ou o tamanho da lista). */
export function firstAfterNowIndex(sorted: TimelineEvent[], now: NowDate): number {
  const index = sorted.findIndex((event) => compareDates(event, now) > 0);
  return index === -1 ? sorted.length : index;
}

const withEra = (year: number, eraName: string) => `Ano ${year}${eraName ? ` ${eraName}` : ''}`;

const detailOf = (date: DateParts) =>
  [date.month !== null ? `mês ${date.month}` : null, date.day !== null ? `dia ${date.day}` : null]
    .filter(Boolean)
    .join(', ');

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Texto principal e secundário da data de um evento. O rótulo livre, se houver, vira o principal. */
export function formatEventDate(
  event: DateParts & { date_label: string },
  eraName: string,
): { primary: string; secondary: string } {
  const detail = detailOf(event);
  if (event.date_label) {
    return {
      primary: event.date_label,
      secondary: withEra(event.year, eraName) + (detail ? ` · ${detail}` : ''),
    };
  }
  return { primary: withEra(event.year, eraName), secondary: detail ? capitalize(detail) : '' };
}

export function formatNow(now: NowDate, eraName: string): string {
  const detail = detailOf(now);
  return `Agora (${withEra(now.year, eraName)}${detail ? `, ${detail}` : ''})`;
}

/** Tags já usadas nos eventos (sem repetir, sem diferenciar maiúsculas), em ordem alfabética. */
export function collectTags(events: TimelineEvent[], field: 'characters' | 'locations'): string[] {
  const byKey = new Map<string, string>();
  events.forEach((event) =>
    event[field].forEach((tag) => {
      const key = tag.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, tag);
    }),
  );
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export const hasTag = (tags: string[], wanted: string) =>
  tags.some((tag) => tag.toLowerCase() === wanted.toLowerCase());

export type TimelineRow = { kind: 'event'; event: TimelineEvent } | { kind: 'now' };

export interface TimelineGroup {
  id: string;
  /** null = sem era (lista única quando o mundo não tem eras, ou o grupo "Sem era") */
  era: Era | null;
  /** true só no grupo "Sem era" de um mundo que tem eras */
  isLoose: boolean;
  rows: TimelineRow[];
}

function makeRows(events: TimelineEvent[], now: NowDate | null): TimelineRow[] {
  const rows: TimelineRow[] = events.map((event) => ({ kind: 'event', event }));
  if (now) {
    const index = events.findIndex((event) => compareDates(event, now) > 0);
    rows.splice(index === -1 ? rows.length : index, 0, { kind: 'now' });
  }
  return rows;
}

/**
 * Monta os grupos de exibição a partir dos eventos visíveis (já ordenados).
 * - Sem eras: um grupo só.
 * - Com eras: um grupo por era com eventos (as vazias não aparecem), mais "Sem era" para o resto.
 * - O marcador "Agora" entra no grupo da era que contém o ano atual (ou em "Sem era"),
 *   antes do primeiro evento posterior a ele. `showNow` decide se ele aparece.
 */
export function buildGroups(
  events: TimelineEvent[],
  eras: Era[],
  now: NowDate | null,
  showNow: boolean,
): TimelineGroup[] {
  const activeNow = showNow ? now : null;

  if (eras.length === 0) {
    return events.length > 0 || activeNow
      ? [{ id: 'all', era: null, isLoose: false, rows: makeRows(events, activeNow) }]
      : [];
  }

  const sortedEras = [...eras].sort((a, b) => a.start_year - b.start_year || a.id - b.id);
  const eraOf = (year: number) =>
    sortedEras.find((era) => year >= era.start_year && year <= era.end_year) ?? null;

  const byEra = new Map<number, TimelineEvent[]>();
  const loose: TimelineEvent[] = [];
  events.forEach((event) => {
    const era = eraOf(event.year);
    if (era) byEra.set(era.id, [...(byEra.get(era.id) ?? []), event]);
    else loose.push(event);
  });

  const nowEra = activeNow ? eraOf(activeNow.year) : null;
  const groups: { start: number; group: TimelineGroup }[] = [];

  sortedEras.forEach((era) => {
    const list = byEra.get(era.id) ?? [];
    const markerHere = activeNow !== null && nowEra?.id === era.id;
    if (list.length > 0 || markerHere) {
      groups.push({
        start: era.start_year,
        group: {
          id: `era-${era.id}`,
          era,
          isLoose: false,
          rows: makeRows(list, markerHere ? activeNow : null),
        },
      });
    }
  });

  const markerLoose = activeNow !== null && nowEra === null;
  if (loose.length > 0 || markerLoose) {
    groups.push({
      start: loose[0]?.year ?? activeNow?.year ?? 0,
      group: {
        id: 'loose',
        era: null,
        isLoose: true,
        rows: makeRows(loose, markerLoose ? activeNow : null),
      },
    });
  }

  return groups.sort((a, b) => a.start - b.start).map((entry) => entry.group);
}