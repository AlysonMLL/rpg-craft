/**
 * Função do Arquivo: Aba "Raças": grade de cards com busca, ordenação, filtro "Comum em",
 * favoritos, arrastar para reordenar (só na ordem "Personalizada" e sem filtros) e excluir com
 * confirmação e "Desfazer". Clicar num card grava ?raca=ID na URL e abre a gaveta. A lista vive
 * na página (para o contador da aba); aqui mora a interface.
 *
 * O que há aqui:
 * - RacesTab: componente (props: list, worldId, canEdit).
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dna, Plus } from 'lucide-react';
import type { Race, RaceListItem } from '../../api/peoples';
import type { EntityListState } from '../../hooks/useEntityList';
import {
  EMPTY_PEOPLE_FILTERS,
  collectCommonIn,
  filterPeople,
  hasActivePeopleFilters,
  sortEntities,
  type EntitySort,
  type PeopleFilters,
} from '../../lib/peoplesUtils';
import { Button, ConfirmDialog, EmptyState, Skeleton, SortableGrid } from '../ui';
import { CreateRaceModal } from './CreateRaceModal';
import { PeopleFiltersBar } from './PeoplesFilters';
import { RaceCard } from './RaceCard';
import { RaceDrawer } from './RaceDrawer';

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-3';

interface RacesTabProps {
  list: EntityListState<RaceListItem, Race>;
  worldId: number;
  canEdit: boolean;
}

export function RacesTab({ list, worldId, canEdit }: RacesTabProps) {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<PeopleFilters>(EMPTY_PEOPLE_FILTERS);
  const [sort, setSort] = useState<EntitySort>('custom');
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<RaceListItem | null>(null);

  const selectedId = Number(params.get('raca')) || null;
  const filtersActive = hasActivePeopleFilters(filters);
  const visible = sortEntities(filterPeople(list.items, filters), sort);
  const canDrag = canEdit && sort === 'custom' && !filtersActive;

  const openRace = (id: number) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('raca', String(id));
      return next;
    });

  const closeRace = () =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('raca');
        return next;
      },
      { replace: true },
    );

  const deleteRace = async (target: RaceListItem) => {
    const removed = await list.remove(target);
    if (removed && selectedId === target.id) closeRace();
  };

  const createButton = canEdit && (
    <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
      Nova raça
    </Button>
  );

  return (
    <>
      {list.isLoading ? (
        <div className={GRID} aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : list.items.length === 0 ? (
        <EmptyState
          icon={<Dna size={28} aria-hidden="true" />}
          title="Nenhuma raça ainda"
          description={
            canEdit
              ? 'Cadastre os povos do mundo: características, cultura, expectativa de vida e onde vivem.'
              : 'Este mundo ainda não tem raças.'
          }
          action={createButton}
        />
      ) : (
        <>
          <div className="mb-5">
            <PeopleFiltersBar
              noun="raças"
              query={filters.query}
              onQueryChange={(query) => setFilters({ ...filters, query })}
              sort={sort}
              onSortChange={setSort}
              selects={[
                {
                  id: 'common-in',
                  label: 'Filtrar por onde é comum',
                  allLabel: 'Comum em: todos',
                  value: filters.commonIn,
                  options: collectCommonIn(list.items).map((place) => ({ value: place, label: place })),
                  onChange: (commonIn) => setFilters({ ...filters, commonIn }),
                },
              ]}
              favoritesOnly={filters.favoritesOnly}
              onFavoritesChange={(favoritesOnly) => setFilters({ ...filters, favoritesOnly })}
              createButton={createButton}
              active={filtersActive}
              onClear={() => setFilters(EMPTY_PEOPLE_FILTERS)}
              shown={visible.length}
              total={list.items.length}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title="Nenhuma raça com esses filtros"
              description="Tente outro termo ou limpe os filtros."
              action={
                <Button variant="secondary" onClick={() => setFilters(EMPTY_PEOPLE_FILTERS)}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <SortableGrid
              items={visible}
              canDrag={canDrag}
              className={GRID}
              getLabel={(race) => race.name}
              onReorder={(ids) => void list.reorder(ids)}
              renderItem={(race, { handle, dragging }) => (
                <RaceCard
                  race={race}
                  handle={handle}
                  dragging={dragging}
                  onOpen={openRace}
                  onToggleFavorite={canEdit ? (item) => void list.toggleFavorite(item) : undefined}
                  onDelete={canEdit ? setToDelete : undefined}
                />
              )}
              renderOverlay={(race) => <RaceCard race={race} lifted />}
            />
          )}
        </>
      )}

      <CreateRaceModal
        open={creating}
        worldId={worldId}
        races={list.items}
        onClose={() => setCreating(false)}
        onCreated={list.add}
      />

      <RaceDrawer
        raceId={selectedId}
        worldId={worldId}
        canEdit={canEdit}
        races={list.items}
        onClose={closeRace}
        onUpdated={list.replace}
        onDelete={setToDelete}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir raça"
        description={
          <>
            Deseja mesmo excluir essa raça? <strong className="text-white">{toDelete?.name}</strong> e todos
            os dados dela serão removidos.
          </>
        }
        confirmLabel="Excluir"
        onClose={() => setToDelete(null)}
        onConfirm={() => (toDelete ? deleteRace(toDelete) : undefined)}
      />
    </>
  );
}