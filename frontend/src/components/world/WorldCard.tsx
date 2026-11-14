/**
 * O que há aqui:
 * - WorldCard: card de um mundo (capa ou gradiente com inicial, selo "Público",
 *   estrela de favorito, tags, contadores e data). O card inteiro é clicável por um
 *   link "esticado" no título (acessível por teclado); estrela e alça ficam por cima.
 * - SortableWorldCard: o mesmo card dentro do dnd-kit. O arraste é aplicado no
 *   wrapper externo; a elevação e o brilho do hover ficam no Card interno, para os
 *   dois transforms não brigarem.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { LucideIcon } from 'lucide-react';
import { Clock, GripVertical, MapPin, Star, Users, Dna, PawPrint } from 'lucide-react';
import type { World } from '../../api/worlds';
import { coverGradient } from '../../lib/worldUtils';
import { cn } from '../../lib/cn';
import { Badge, Card } from '../ui';

interface WorldCardProps {
  world: World;
  handle?: ReactNode;
  onToggleFavorite?: (world: World) => void;
  /** Cópia levantada exibida no DragOverlay */
  lifted?: boolean;
  /** O card de origem enquanto outro está sendo arrastado */
  dragging?: boolean;
}

/** Contador do rodapé do card: ícone + número, com o nome para leitores de tela. */
function Stat({ Icon, label, value }: { Icon: LucideIcon; label: string; value: number }) {
  return (
    <span className="flex items-center gap-1" title={`${label}: ${value}`}>
      <Icon size={12} aria-hidden="true" />
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  );
}

export default function WorldCard({
  world,
  handle,
  onToggleFavorite,
  lifted = false,
  dragging = false,
}: WorldCardProps) {
  const canFavorite = Boolean(onToggleFavorite) && world.is_owner;

  return (
    <Card
      interactive={!lifted && !dragging}
      padded={false}
      className={cn(
        'group flex h-full flex-col',
        'has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-rpg-secondary',
        dragging && 'opacity-40 outline-2 outline-dashed outline-rpg-primary/50',
        lifted && 'scale-[1.02] cursor-grabbing border-rpg-primary/60 shadow-neon',
      )}
    >
      {/* Capa (sem capa: gradiente pelo nome + inicial) */}
      <div className="relative h-40 shrink-0 overflow-hidden bg-gray-900">
        {world.cover_image ? (
          <img
            src={world.cover_image}
            alt=""
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center"
            style={{ background: coverGradient(world.name) }}
          >
            <span className="select-none text-6xl font-extrabold text-white/15">
              {world.name.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {handle && <div className="absolute left-3 top-3 z-10">{handle}</div>}

        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {world.is_demo && <Badge variant="highlight">Público</Badge>}
          {canFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite?.(world)}
              aria-pressed={world.is_favorite}
              aria-label={
                world.is_favorite
                  ? `Remover ${world.name} dos favoritos`
                  : `Favoritar ${world.name}`
              }
              className="rounded-md bg-black/60 p-2 text-gray-200 backdrop-blur-sm transition-colors hover:text-rpg-primary"
            >
              <Star
                size={16}
                aria-hidden="true"
                className={world.is_favorite ? 'fill-rpg-primary text-rpg-primary' : ''}
              />
            </button>
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="mb-2 text-lg font-bold text-white">
            <Link
              to={`/world/${world.id}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {world.name}
            </Link>
          </h3>
          {world.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {world.tags.map((tag) => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-800/60 pt-4 text-xs text-rpg-subtle">
          <div className="flex items-center gap-3">
            {/* Contadores reais virão com os apps de personagens e locais */}
            <Stat Icon={Users} label="Personagens" value={world.characters_count} />
            <Stat Icon={Dna} label="Raças" value={world.races_count} />
            <Stat Icon={PawPrint} label="Criaturas" value={world.creatures_count} />
            {/* <Stat Icon={MapPin} label="Locais" value={world.locations_count} /> */}

          </div>
          <span className="flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {new Date(world.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </Card>
  );
}

interface SortableWorldCardProps {
  world: World;
  canDrag: boolean;
  onToggleFavorite?: (world: World) => void;
}

export function SortableWorldCard({ world, canDrag, onToggleFavorite }: SortableWorldCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: world.id, disabled: !canDrag });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handle = canDrag ? (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={`Reorganizar ${world.name}`}
      className="touch-none cursor-grab rounded-md bg-black/60 p-2 text-gray-200 opacity-0 backdrop-blur-sm transition-opacity hover:text-rpg-primary focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
      {...attributes}
      {...listeners}
    >
      <GripVertical size={16} aria-hidden="true" />
    </button>
  ) : null;

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <WorldCard
        world={world}
        handle={handle}
        onToggleFavorite={onToggleFavorite}
        dragging={isDragging}
      />
    </div>
  );
}