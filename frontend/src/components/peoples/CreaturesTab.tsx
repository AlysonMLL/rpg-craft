/**
 * Função do Arquivo: Aba "Criaturas": grade de cards com busca, ordenação, filtros (perigo e
 * "Comum em"), favoritos, arrastar para reordenar (só na ordem "Personalizada" e sem filtros) e
 * excluir com confirmação e "Desfazer". Clicar num card grava ?criatura=ID na URL e abre a
 * gaveta. A lista vive na página (para o contador da aba).
 *
 * O que há aqui:
 * - CreaturesTab: componente (props: list, worldId, canEdit).
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PawPrint, Plus } from 'lucide-react';
import type { Creature, CreatureListItem, DangerLevel } from '../../api/peoples';
import type { EntityListState } from '../../hooks/useEntityList';
import {
  DANGER_META,
  DANGER_ORDER,
  EMPTY_PEOPLE_FILTERS,
  collectCommonIn,
  filterCreatures,
  hasActivePeopleFilters,
  sortEntities,
  type EntitySort,
  type PeopleFilters,
} from '../../lib/peoplesUtils';
import { Button, ConfirmDialog, EmptyState, Skeleton, SortableGrid } from '../ui';
import { CreateCreatureModal } from './CreateCreatureModal';
import { CreatureCard } from './CreatureCard';
import { CreatureDrawer } from './CreatureDrawer';
import { PeopleFiltersBar } from './PeoplesFilters';

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4';

const DANGER_FILTER_OPTIONS = DANGER_ORDER.map((level) => ({
  value: String(level),
  label: DANGER_META[level].label,
}));

interface CreaturesTabProps {
  list: EntityListState<CreatureListItem, Creature>;
  worldId: number;
  canEdit: boolean;
}

export function CreaturesTab({ list, worldId, canEdit }: CreaturesTabProps) {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<PeopleFilters>(EMPTY_PEOPLE_FILTERS);
  const [sort, setSort] = useState<EntitySort>('custom');
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<CreatureListItem | null>(null);

  const selectedId = Number(params.get('criatura')) || null;
  const filtersActive = hasActivePeopleFilters(filters);
  const visible = sortEntities(filterCreatures(list.items, filters), sort);
  const canDrag = canEdit && sort === 'custom' && !filtersActive;

  const openCreature = (id: number) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('criatura', String(id));
      return next;
    });

  const closeCreature = () =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('criatura');
        return next;
      },
      { replace: true },
    );

  const deleteCreature = async (target: CreatureListItem) => {
    const removed = await list.remove(target);
    if (removed && selectedId === target.id) closeCreature();
  };

  const createButton = canEdit && (
    <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
      Nova criatura
    </Button>
  );

  return (
    <>
      {list.isLoading ? (
        <div className={GRID} aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : list.items.length === 0 ? (
        <EmptyState
          icon={<PawPrint size={28} aria-hidden="true" />}
          title="Nenhuma criatura ainda"
          description={
            canEdit
              ? 'Monte o bestiário: perigo, faixa de nível, características e onde cada criatura aparece.'
              : 'Este mundo ainda não tem criaturas.'
          }
          action={createButton}
        />
      ) : (
        <>
          <div className="mb-5">
            <PeopleFiltersBar
              noun="criaturas"
              query={filters.query}
              onQueryChange={(query) => setFilters({ ...filters, query })}
              sort={sort}
              onSortChange={setSort}
              selects={[
                {
                  id: 'danger',
                  label: 'Filtrar por perigo',
                  allLabel: 'Todos os perigos',
                  value: String(filters.danger),
                  options: DANGER_FILTER_OPTIONS,
                  widthClass: 'w-40',
                  onChange: (value) =>
                    setFilters({ ...filters, danger: value === '' ? '' : (Number(value) as DangerLevel) }),
                },
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
              title="Nenhuma criatura com esses filtros"
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
              getLabel={(creature) => creature.name}
              onReorder={(ids) => void list.reorder(ids)}
              renderItem={(creature, { handle, dragging }) => (
                <CreatureCard
                  creature={creature}
                  handle={handle}
                  dragging={dragging}
                  onOpen={openCreature}
                  onToggleFavorite={canEdit ? (item) => void list.toggleFavorite(item) : undefined}
                  onDelete={canEdit ? setToDelete : undefined}
                />
              )}
              renderOverlay={(creature) => <CreatureCard creature={creature} lifted />}
            />
          )}
        </>
      )}

      <CreateCreatureModal
        open={creating}
        worldId={worldId}
        creatures={list.items}
        onClose={() => setCreating(false)}
        onCreated={list.add}
      />

      <CreatureDrawer
        creatureId={selectedId}
        worldId={worldId}
        canEdit={canEdit}
        creatures={list.items}
        onClose={closeCreature}
        onUpdated={list.replace}
        onDelete={setToDelete}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir criatura"
        description={
          <>
            Deseja mesmo excluir essa criatura? <strong className="text-white">{toDelete?.name}</strong> e
            todos os dados dela serão removidos.
          </>
        }
        confirmLabel="Excluir"
        onClose={() => setToDelete(null)}
        onConfirm={() => (toDelete ? deleteCreature(toDelete) : undefined)}
      />
    </>
  );
}