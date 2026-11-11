/**
 * Função do Arquivo: Grade de cards reordenáveis por arrastar e soltar (dnd-kit), no mesmo
 * padrão dos mundos da Home. Serve a qualquer lista com `id` numérico. O arraste fica no wrapper externo (<li>); a elevação e o
 * brilho do hover ficam no Card interno, para os dois transforms não brigarem.
 *
 * O que há aqui:
 * - SortableGrid: a grade. Props: items (já filtrados e ordenados), canDrag, getLabel
 *   (nome para o aria-label da alça), onReorder (recebe os ids na nova ordem), renderItem
 *   (recebe o item e { handle, dragging }), renderOverlay (cópia levantada durante o arraste)
 *   e className (as classes do grid).
 * - SortableItem (interno): o <li> sortable e a alça "Reorganizar X". A alça só aparece no
 *   hover/foco (sempre em telas de toque); o Card precisa ter a classe `group`.
 * - SortableCardState: o que renderItem recebe.
 * Quem usa decide quando `canDrag` vale (ex.: só sem filtros e na ordem personalizada).
 */

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export interface SortableCardState {
  /** Botão da alça (null quando não pode arrastar). Posicione-o dentro do card. */
  handle: ReactNode;
  /** True no item de origem enquanto outro está sendo arrastado. */
  dragging: boolean;
}

interface SortableGridProps<T extends { id: number }> {
  items: T[];
  canDrag: boolean;
  getLabel: (item: T) => string;
  onReorder: (orderedIds: number[]) => void;
  renderItem: (item: T, state: SortableCardState) => ReactNode;
  renderOverlay: (item: T) => ReactNode;
  className?: string;
}

interface SortableItemProps<T extends { id: number }> {
  item: T;
  canDrag: boolean;
  label: string;
  render: (item: T, state: SortableCardState) => ReactNode;
}

function SortableItem<T extends { id: number }>({ item, canDrag, label, render }: SortableItemProps<T>) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: !canDrag });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handle = canDrag ? (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={`Reorganizar ${label}`}
      className="touch-none cursor-grab rounded-md bg-black/60 p-2 text-gray-200 opacity-0 backdrop-blur-sm transition-opacity hover:text-rpg-primary focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
      {...attributes}
      {...listeners}
    >
      <GripVertical size={16} aria-hidden="true" />
    </button>
  ) : null;

  return (
    <li ref={setNodeRef} style={style} className="h-full">
      {render(item, { handle, dragging: isDragging })}
    </li>
  );
}

export function SortableGrid<T extends { id: number }>({
  items,
  canDrag,
  getLabel,
  onReorder,
  renderItem,
  renderOverlay,
  className,
}: SortableGridProps<T>) {
  const [activeItem, setActiveItem] = useState<T | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveItem(items.find((item) => item.id === active.id) ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItem(null);
    if (!over || active.id === over.id) return;
    const ids = items.map((item) => item.id);
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveItem(null)}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        <ul className={className}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} canDrag={canDrag} label={getLabel(item)} render={renderItem} />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>{activeItem && renderOverlay(activeItem)}</DragOverlay>
    </DndContext>
  );
}