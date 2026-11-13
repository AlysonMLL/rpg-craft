/**
 * Função do Arquivo: Regras puras da tela de Personagens (sem React): textos e cores de
 * status, iniciais do retrato, ordenação, opções e aplicação dos filtros.
 *
 * O que há aqui:
 * - STATUS_ORDER / STATUS_META: ordem, rótulo e variante de Badge de cada status.
 * - getInitials(): iniciais usadas quando o personagem não tem retrato.
 * - toListItem() / toCreateData(): converte a ficha completa para o formato leve da grade
 *   ou para o corpo de um novo POST (usado no "Desfazer" da exclusão).
 * - CharacterSort / CHARACTER_SORT_OPTIONS / sortCharacters(): ordenação (personalizada,
 *   nome, editados recentemente).
 * - CharacterFilters / EMPTY_FILTERS / hasActiveFilters(): estado dos filtros.
 * - collectValues() / collectTags(): opções dos selects e sugestões dos campos de tags
 *   (sem repetir, ignorando maiúsculas e acentos).
 * - filterCharacters(): aplica busca por nome e os filtros.
 */

import type {
  Character,
  CharacterCreateData,
  CharacterListItem,
  CharacterStatus,
} from '../api/characters';

import { distinctValues as distinct, getInitials, normalizeText as normalize } from './entityUtils';

export { getInitials }; // quem já importa daqui continua funcionando

type BadgeVariant = 'success' | 'danger' | 'highlight' | 'neutral';

export const STATUS_ORDER: CharacterStatus[] = ['alive', 'dead', 'missing', 'unknown'];
/** Proporção do retrato (largura / altura). As classes aspect-[3/4] das telas precisam bater com ela. */
export const PORTRAIT_ASPECT = 3 / 4;

export const STATUS_META: Record<CharacterStatus, { label: string; variant: BadgeVariant }> = {
  alive: { label: 'Vivo', variant: 'success' },
  dead: { label: 'Morto', variant: 'danger' },
  missing: { label: 'Desaparecido', variant: 'highlight' },
  unknown: { label: 'Desconhecido', variant: 'neutral' },
};


export function toListItem(character: Character): CharacterListItem {
  return {
    id: character.id,
    world: character.world,
    name: character.name,
    portrait_url: character.portrait_url,
    portrait_crop: character.portrait_crop,
    status: character.status,
    is_favorite: character.is_favorite,
    display_order: character.display_order,
    role: character.role,
    race: character.race,
    classes: character.classes,
    level: character.level,
    organizations: character.organizations,
    updated_at: character.updated_at,
  };
}

/** Corpo para recriar o personagem (Desfazer). A posição na ordem volta a ser o fim da lista. */
export function toCreateData(character: Character): CharacterCreateData {
  return {
    world: character.world,
    name: character.name,
    portrait_url: character.portrait_url,
    portrait_crop: character.portrait_crop,
    status: character.status,
    is_favorite: character.is_favorite,
    age: character.age,
    gender: character.gender,
    race: character.race,
    classes: character.classes,
    level: character.level,
    height: character.height,
    appearance: character.appearance,
    voice: character.voice,
    role: character.role,
    origin: character.origin,
    organizations: character.organizations,
    items: character.items,
    skills: character.skills,
    secrets: character.secrets,
    sheet_markdown: character.sheet_markdown,
  };
}

export type CharacterSort = 'custom' | 'name' | 'recent';

export const CHARACTER_SORT_OPTIONS: { value: CharacterSort; label: string }[] = [
  { value: 'custom', label: 'Personalizada' },
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'recent', label: 'Editados recentemente' },
];

const time = (iso: string) => new Date(iso).getTime();
const byName = (a: CharacterListItem, b: CharacterListItem) => a.name.localeCompare(b.name, 'pt-BR');

/** Devolve uma cópia ordenada. 'custom' repete a ordem do servidor (display_order, depois nome). */
export function sortCharacters(list: CharacterListItem[], mode: CharacterSort): CharacterListItem[] {
  const copy = [...list];
  if (mode === 'name') return copy.sort(byName);
  if (mode === 'recent') return copy.sort((a, b) => time(b.updated_at) - time(a.updated_at));
  return copy.sort((a, b) => a.display_order - b.display_order || byName(a, b));
}

export interface CharacterFilters {
  query: string;
  status: CharacterStatus | '';
  race: string;
  role: string;
  organization: string;
  favoritesOnly: boolean;
}

export const EMPTY_FILTERS: CharacterFilters = {
  query: '',
  status: '',
  race: '',
  role: '',
  organization: '',
  favoritesOnly: false,
};

export function hasActiveFilters(filters: CharacterFilters): boolean {
  return (
    filters.favoritesOnly ||
    [filters.query, filters.status, filters.race, filters.role, filters.organization].some(
      (value) => value.trim() !== '',
    )
  );
}


export function collectValues(list: CharacterListItem[], field: 'race' | 'role'): string[] {
  return distinct(list.map((character) => character[field]));
}

export function collectTags(list: CharacterListItem[], field: 'classes' | 'organizations'): string[] {
  return distinct(list.flatMap((character) => character[field]));
}

export function filterCharacters(
  list: CharacterListItem[],
  filters: CharacterFilters,
): CharacterListItem[] {
  const query = normalize(filters.query);
  const race = normalize(filters.race);
  const role = normalize(filters.role);
  const organization = normalize(filters.organization);

  return list.filter(
    (character) =>
      (!filters.favoritesOnly || character.is_favorite) &&
      (!query || normalize(character.name).includes(query)) &&
      (!filters.status || character.status === filters.status) &&
      (!race || normalize(character.race) === race) &&
      (!role || normalize(character.role) === role) &&
      (!organization || character.organizations.some((org) => normalize(org) === organization)),
  );
}