/**
 * Função do Arquivo: Barra de filtros da grade de personagens: busca por nome, ordenação,
 * status, raça, papel, organização e "Favoritos". Os selects de raça, papel e organização
 * só aparecem se houver valores no mundo. As opções saem da própria lista (texto livre),
 * sem enum fixo.
 *
 * O que há ali:
 * - CharacterFiltersBar: componente (props: characters, filters, shown, sort, onChange,
 *   onSortChange).
 */

import { Search, Star, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CharacterListItem } from '../../api/characters';
import {
  CHARACTER_SORT_OPTIONS,
  EMPTY_FILTERS,
  STATUS_META,
  STATUS_ORDER,
  collectTags,
  collectValues,
  hasActiveFilters,
  type CharacterFilters,
  type CharacterSort,
} from '../../lib/characterUtils';
import { Button, Input, Select } from '../ui';

interface CharacterFiltersBarProps {
  characters: CharacterListItem[];
  filters: CharacterFilters;
  createButton?: ReactNode;
  /** Quantos personagens passam pelos filtros (para o contador). */
  shown: number;
  sort: CharacterSort;
  onChange: (filters: CharacterFilters) => void;
  onSortChange: (sort: CharacterSort) => void;
}

export function CharacterFiltersBar({
  characters,
  filters,
  createButton,
  shown,
  sort,
  onChange,
  onSortChange,
}: CharacterFiltersBarProps) {
  const races = collectValues(characters, 'race');
  const roles = collectValues(characters, 'role');
  const organizations = collectTags(characters, 'organizations');
  const active = hasActiveFilters(filters);

  const set = <K extends keyof CharacterFilters>(key: K, value: CharacterFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-56">
        <Input
          size="sm"
          aria-label="Buscar personagens"
          placeholder="Buscar por nome…"
          leftIcon={<Search size={14} />}
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
        />
      </div>

      <div className="w-48">
        <Select
          size="sm"
          aria-label="Ordenar personagens"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as CharacterSort)}
          options={CHARACTER_SORT_OPTIONS}
        />
      </div>

      <div className="w-40">
        <Select
          size="sm"
          aria-label="Filtrar por status"
          value={filters.status}
          onChange={(e) => set('status', e.target.value as CharacterFilters['status'])}
        >
          <option value="">Todos os status</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </Select>
      </div>

      {races.length > 0 && (
        <div className="w-40">
          <Select
            size="sm"
            aria-label="Filtrar por raça"
            value={filters.race}
            onChange={(e) => set('race', e.target.value)}
          >
            <option value="">Todas as raças</option>
            {races.map((race) => (
              <option key={race} value={race}>
                {race}
              </option>
            ))}
          </Select>
        </div>
      )}

      {roles.length > 0 && (
        <div className="w-40">
          <Select
            size="sm"
            aria-label="Filtrar por papel"
            value={filters.role}
            onChange={(e) => set('role', e.target.value)}
          >
            <option value="">Todos os papéis</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </div>
      )}

      {organizations.length > 0 && (
        <div className="w-44">
          <Select
            size="sm"
            aria-label="Filtrar por organização"
            value={filters.organization}
            onChange={(e) => set('organization', e.target.value)}
          >
            <option value="">Todas as organizações</option>
            {organizations.map((organization) => (
              <option key={organization} value={organization}>
                {organization}
              </option>
            ))}
          </Select>
        </div>
      )}

      <Button
        size="sm"
        variant={filters.favoritesOnly ? 'outline' : 'secondary'}
        aria-pressed={filters.favoritesOnly}
        leftIcon={<Star size={14} aria-hidden="true" />}
        onClick={() => set('favoritesOnly', !filters.favoritesOnly)}
      >
        Favoritos
      </Button>

      {createButton}

      {active && (
        <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={() => onChange(EMPTY_FILTERS)}>
          Limpar filtros
        </Button>
      )}
      <span role="status" className="text-xs text-rpg-subtle">
        {active ? `${shown} de ${characters.length}` : ''}
      </span>
    </div>
  );
}