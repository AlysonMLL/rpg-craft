import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { worldService } from '../../api/worlds';
import type { World } from '../../api/worlds';
import { sortWorlds, WORLD_SORT_OPTIONS, type WorldSort } from '../../lib/worldUtils';
import { Button, EmptyState, Select, Skeleton, toast } from '../ui';
import WorldCard, { SortableWorldCard } from './WorldCard';

interface WorldsSectionProps {
  title: string;
  worlds: World[];
  onWorldsChange: (worlds: World[] | ((current: World[]) => World[])) => void;
  isLoading: boolean;
  isGuest: boolean;
  limit?: number;
  onCreate?: () => void;
}

export default function WorldsSection({
  title,
  worlds,
  onWorldsChange,
  isLoading,
  isGuest,
  limit,
  onCreate,
}: WorldsSectionProps) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<WorldSort>('custom');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeWorld, setActiveWorld] = useState<World | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredWorlds = sortWorlds(worlds, sortMode).filter((world) => {
    if (favoritesOnly && !world.is_favorite) return false;
    if (!normalizedQuery) return true;
    return [world.name, world.synopsis, world.owner_name, ...world.tags.map((tag) => tag.name)]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
  const visibleWorlds = limit ? filteredWorlds.slice(0, limit) : filteredWorlds;
  const canReorder = sortMode === 'custom' && !normalizedQuery && !favoritesOnly && !isGuest;
  const sortableWorlds = visibleWorlds.filter((world) => canReorder && world.is_owner);

  const handleFavorite = async (world: World) => {
    try {
      const updatedWorld = await worldService.setFavorite(world.id, !world.is_favorite);
      onWorldsChange((current) =>
        current.map((item) => (item.id === updatedWorld.id ? updatedWorld : item)),
      );
    } catch {
      toast.error('Não foi possível atualizar o favorito. Tente de novo.');
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveWorld(worlds.find((world) => world.id === active.id) ?? null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveWorld(null);
    if (!over || active.id === over.id) return;

    const visibleOwnerIds = sortableWorlds.map((world) => world.id);
    const oldIndex = visibleOwnerIds.indexOf(Number(active.id));
    const newIndex = visibleOwnerIds.indexOf(Number(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const allOwnerIds = sortWorlds(worlds.filter((world) => world.is_owner), 'custom').map(
      (world) => world.id,
    );
    const reorderedVisibleIds = arrayMove(visibleOwnerIds, oldIndex, newIndex);
    const reorderedOwnerIds = [
      ...reorderedVisibleIds,
      ...allOwnerIds.slice(visibleOwnerIds.length),
    ];
    const previousWorlds = worlds;
    const nextWorlds = worlds.map((world) => {
      const position = reorderedOwnerIds.indexOf(world.id);
      return world.is_owner && position >= 0 ? { ...world, display_order: position } : world;
    });

    onWorldsChange(nextWorlds);
    try {
      await worldService.reorder(reorderedOwnerIds);
    } catch {
      onWorldsChange(previousWorlds);
      toast.error('Não foi possível salvar a ordem dos mundos. Tente de novo.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {!isLoading && (
            <p className="mt-1 text-sm text-rpg-muted">
              {filteredWorlds.length} {filteredWorlds.length === 1 ? 'mundo' : 'mundos'}
            </p>
          )}
        </div>
        
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-48 flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-rpg-subtle"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar mundos..."
            aria-label="Buscar mundos"
            className="w-full rounded-lg border border-gray-800 bg-rpg-card py-2 pl-9 pr-3 text-sm text-white placeholder:text-rpg-subtle focus:border-rpg-primary focus:outline-none"
          />
        </label>
        <Select
          aria-label="Ordenar mundos"
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as WorldSort)}
          className="min-w-48"
          options={WORLD_SORT_OPTIONS}
        />
        <Button
          type="button"
          size="sm"
          variant={favoritesOnly ? 'outline' : 'secondary'}
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly((value) => !value)}
          leftIcon={<Star size={15} aria-hidden="true" />}
        >
          Favoritos
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: limit ?? 6 }, (_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : visibleWorlds.length === 0 ? (
        <EmptyState
          icon={<Search size={24} aria-hidden="true" />}
          title={worlds.length === 0 ? 'Nenhum mundo por aqui ainda' : 'Nenhum mundo encontrado'}
          description={
            worlds.length === 0
              ? 'Crie seu primeiro mundo de RPG para começar.'
              : 'Tente ajustar a busca ou os filtros.'
          }
          action={
            worlds.length === 0 && onCreate ? (
              <Button onClick={onCreate}>Criar mundo</Button>
            ) : undefined
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveWorld(null)}
        >
          <SortableContext
            items={sortableWorlds.map((world) => world.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleWorlds.map((world) =>
                canReorder && world.is_owner ? (
                  <SortableWorldCard
                    key={world.id}
                    world={world}
                    canDrag
                    onToggleFavorite={handleFavorite}
                  />
                ) : (
                  <WorldCard
                    key={world.id}
                    world={world}
                    onToggleFavorite={isGuest ? undefined : handleFavorite}
                  />
                ),
              )}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeWorld && <WorldCard world={activeWorld} lifted />}
          </DragOverlay>
        </DndContext>
      )}

      {limit && filteredWorlds.length > limit && (
        <div className="text-center">
          <Link
            to="/mundos"
            className="text-sm font-semibold text-rpg-secondary transition-colors hover:text-white"
          >
            Ver todos os mundos ({filteredWorlds.length})
          </Link>
        </div>
      )}
    </section>
  );
}
