/**
 * Função do Arquivo: Regras puras das telas de Raças e Criaturas (sem React): perigo, nível,
 * ordenação, filtros e conversões da ficha completa para o item leve ou para um novo POST.
 *
 * O que há aqui:
 * - RACE_IMAGE_ASPECT / CREATURE_IMAGE_ASPECT: proporção das imagens (1:1 e 3:1). As classes
 *   aspect-square / aspect-[3/1] das telas precisam bater com elas.
 * - DANGER_ORDER / DANGER_META: rótulo e cores (selo e borda) de cada perigo.
 * - formatLevelRange(): "Nível 15–40", "Nível 15+", "Até o nível 40".
 * - EntitySort / ENTITY_SORT_OPTIONS / sortEntities(): ordenação (personalizada, nome, recentes).
 * - PeopleFilters / EMPTY_PEOPLE_FILTERS / hasActivePeopleFilters(): estado dos filtros.
 * - collectCommonIn(): opções do filtro e sugestões de "Comum em".
 * - filterPeople() / filterCreatures(): aplicam busca e filtros.
 * - toRaceItem / toRaceCreateData / toCreatureItem / toCreatureCreateData.
 */

import type {
  Creature,
  CreatureCreateData,
  CreatureListItem,
  DangerLevel,
  Race,
  RaceCreateData,
  RaceListItem,
} from '../api/peoples';
import { distinctValues, normalizeText } from './entityUtils';

export const RACE_IMAGE_ASPECT = 1;
export const CREATURE_IMAGE_ASPECT = 3;

export const DANGER_ORDER: DangerLevel[] = [0, 1, 2, 3, 4];

/**
 * badge: classes do selo (com texto, nunca só cor). border: borda do card; o "!" no fim vence a
 * borda padrão do Card. Strings completas para o Tailwind enxergá-las.
 */
export const DANGER_META: Record<DangerLevel, { label: string; badge: string; border: string }> = {
  0: { label: 'Nenhum', badge: 'border-gray-700 bg-gray-800/60 text-rpg-muted', border: '' },
  1: { label: 'Baixo', badge: 'border-green-400/30 bg-green-400/10 text-rpg-success', border: 'border-green-400/40!' },
  2: { label: 'Moderado', badge: 'border-rpg-primary/30 bg-rpg-primary/10 text-rpg-primary', border: 'border-rpg-primary/40!' },
  3: { label: 'Alto', badge: 'border-orange-400/30 bg-orange-400/10 text-orange-400', border: 'border-orange-400/40!' },
  4: { label: 'Máximo', badge: 'border-red-400/30 bg-red-400/10 text-rpg-danger', border: 'border-red-400/50!' },
};

export function formatLevelRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return min === max ? `Nível ${min}` : `Nível ${min}–${max}`;
  if (min !== null) return `Nível ${min}+`;
  if (max !== null) return `Até o nível ${max}`;
  return '';
}

export type EntitySort = 'custom' | 'name' | 'recent';

export const ENTITY_SORT_OPTIONS: { value: EntitySort; label: string }[] = [
  { value: 'custom', label: 'Personalizada' },
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'recent', label: 'Editados recentemente' },
];

interface Sortable {
  name: string;
  display_order: number;
  updated_at: string;
}

const time = (iso: string) => new Date(iso).getTime();
const byName = (a: Sortable, b: Sortable) => a.name.localeCompare(b.name, 'pt-BR');

/** Devolve uma cópia ordenada. 'custom' repete a ordem do servidor (display_order, depois nome). */
export function sortEntities<T extends Sortable>(list: T[], mode: EntitySort): T[] {
  const copy = [...list];
  if (mode === 'name') return copy.sort(byName);
  if (mode === 'recent') return copy.sort((a, b) => time(b.updated_at) - time(a.updated_at));
  return copy.sort((a, b) => a.display_order - b.display_order || byName(a, b));
}

export interface PeopleFilters {
  query: string;
  commonIn: string;
  /** Só vale para criaturas. */
  danger: DangerLevel | '';
  favoritesOnly: boolean;
}

export const EMPTY_PEOPLE_FILTERS: PeopleFilters = {
  query: '',
  commonIn: '',
  danger: '',
  favoritesOnly: false,
};

export function hasActivePeopleFilters(filters: PeopleFilters): boolean {
  return (
    filters.favoritesOnly ||
    filters.danger !== '' ||
    [filters.query, filters.commonIn].some((value) => value.trim() !== '')
  );
}

export function collectCommonIn(list: { common_in: string[] }[]): string[] {
  return distinctValues(list.flatMap((item) => item.common_in));
}

interface Filterable {
  name: string;
  is_favorite: boolean;
  common_in: string[];
}

export function filterPeople<T extends Filterable>(list: T[], filters: PeopleFilters): T[] {
  const query = normalizeText(filters.query);
  const place = normalizeText(filters.commonIn);
  return list.filter(
    (item) =>
      (!filters.favoritesOnly || item.is_favorite) &&
      (!query || normalizeText(item.name).includes(query)) &&
      (!place || item.common_in.some((tag) => normalizeText(tag) === place)),
  );
}

export function filterCreatures(list: CreatureListItem[], filters: PeopleFilters): CreatureListItem[] {
  return filterPeople(list, filters).filter(
    (creature) => filters.danger === '' || creature.danger_level === filters.danger,
  );
}

export function toRaceItem(race: Race): RaceListItem {
  return {
    id: race.id,
    world: race.world,
    name: race.name,
    image_url: race.image_url,
    image_crop: race.image_crop,
    is_favorite: race.is_favorite,
    display_order: race.display_order,
    summary: race.summary,
    common_in: race.common_in,
    updated_at: race.updated_at,
  };
}

/** Corpo para recriar a raça (Desfazer). A posição na ordem volta a ser o fim da lista. */
export function toRaceCreateData(race: Race): RaceCreateData {
  return {
    world: race.world,
    name: race.name,
    image_url: race.image_url,
    image_crop: race.image_crop,
    is_favorite: race.is_favorite,
    summary: race.summary,
    traits: race.traits,
    culture: race.culture,
    life_expectancy: race.life_expectancy,
    origin: race.origin,
    common_in: race.common_in,
  };
}

export function toCreatureItem(creature: Creature): CreatureListItem {
  return {
    id: creature.id,
    world: creature.world,
    name: creature.name,
    image_url: creature.image_url,
    image_crop: creature.image_crop,
    is_favorite: creature.is_favorite,
    display_order: creature.display_order,
    summary: creature.summary,
    danger_level: creature.danger_level,
    level_min: creature.level_min,
    level_max: creature.level_max,
    common_in: creature.common_in,
    updated_at: creature.updated_at,
  };
}

export function toCreatureCreateData(creature: Creature): CreatureCreateData {
  return {
    world: creature.world,
    name: creature.name,
    image_url: creature.image_url,
    image_crop: creature.image_crop,
    is_favorite: creature.is_favorite,
    summary: creature.summary,
    traits: creature.traits,
    danger_level: creature.danger_level,
    level_min: creature.level_min,
    level_max: creature.level_max,
    common_in: creature.common_in,
  };
}