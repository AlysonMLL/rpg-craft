/**
 * Função do Arquivo: Barra de filtros das grades de Raças e Criaturas: busca por nome,
 * ordenação, selects extras (cada tela define os seus: "Comum em", "Perigo"), "Favoritos",
 * botão de criar, "Limpar filtros" e contador quando há filtro ativo.
 *
 * O que há aqui:
 * - FilterSelect: descrição de um select extra (some se não houver opções).
 * - PeopleFiltersBar: componente. `noun` é o plural usado nos rótulos ("raças").
 */

import { Search, Star, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { ENTITY_SORT_OPTIONS, type EntitySort } from '../../lib/peoplesUtils';
import { Button, Input, Select } from '../ui';

export interface FilterSelect {
  id: string;
  label: string;
  allLabel: string;
  value: string;
  options: { value: string; label: string }[];
  widthClass?: string;
  onChange: (value: string) => void;
}

interface PeopleFiltersBarProps {
  noun: string;
  query: string;
  onQueryChange: (query: string) => void;
  sort: EntitySort;
  onSortChange: (sort: EntitySort) => void;
  selects: FilterSelect[];
  favoritesOnly: boolean;
  onFavoritesChange: (value: boolean) => void;
  createButton?: ReactNode;
  active: boolean;
  onClear: () => void;
  shown: number;
  total: number;
}

export function PeopleFiltersBar({
  noun,
  query,
  onQueryChange,
  sort,
  onSortChange,
  selects,
  favoritesOnly,
  onFavoritesChange,
  createButton,
  active,
  onClear,
  shown,
  total,
}: PeopleFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-56">
        <Input
          size="sm"
          aria-label={`Buscar ${noun}`}
          placeholder="Buscar por nome…"
          leftIcon={<Search size={14} />}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="w-48">
        <Select
          size="sm"
          aria-label={`Ordenar ${noun}`}
          value={sort}
          onChange={(event) => onSortChange(event.target.value as EntitySort)}
          options={ENTITY_SORT_OPTIONS}
        />
      </div>

      {selects.map(
        (select) =>
          select.options.length > 0 && (
            <div key={select.id} className={select.widthClass ?? 'w-44'}>
              <Select
                size="sm"
                aria-label={select.label}
                value={select.value}
                onChange={(event) => select.onChange(event.target.value)}
              >
                <option value="">{select.allLabel}</option>
                {select.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          ),
      )}

      <Button
        size="sm"
        variant={favoritesOnly ? 'outline' : 'secondary'}
        aria-pressed={favoritesOnly}
        leftIcon={<Star size={14} aria-hidden="true" />}
        onClick={() => onFavoritesChange(!favoritesOnly)}
      >
        Favoritos
      </Button>

      {createButton}

      {active && (
        <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={onClear}>
          Limpar filtros
        </Button>
      )}
      <span role="status" className="text-xs text-rpg-subtle">
        {active ? `${shown} de ${total}` : ''}
      </span>
    </div>
  );
}