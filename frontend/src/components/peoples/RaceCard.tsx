/**
 * Função do Arquivo: Card de uma raça na grade. Horizontal e compacto: miniatura quadrada de
 * 72px, nome, resumo e até 3 chips de "Comum em". Acento ciano na lateral (distingue de relance
 * dos personagens e das criaturas). Ações numa coluna à direita (alça de arrastar, favorito,
 * lixeira). O card inteiro abre a gaveta por um botão "esticado" no nome (foco por teclado).
 *
 * O que há ali:
 * - RaceCard: componente. Props: race; handle (alça do SortableGrid); dragging e lifted
 *   (estados do arraste); onOpen; onToggleFavorite e onDelete (só passe para o dono).
 */

import { GripVertical, Star, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RaceListItem } from '../../api/peoples';
import { cn } from '../../lib/cn';
import { Badge, Card, EntityImage } from '../ui';

const MAX_CHIPS = 3;

interface RaceCardProps {
  race: RaceListItem;
  handle?: ReactNode;
  /** O card de origem enquanto outro está sendo arrastado */
  dragging?: boolean;
  /** Cópia levantada exibida no DragOverlay */
  lifted?: boolean;
  onOpen?: (id: number) => void;
  onToggleFavorite?: (race: RaceListItem) => void;
  onDelete?: (race: RaceListItem) => void;
}

export function RaceCard({
  race,
  handle,
  dragging = false,
  lifted = false,
  onOpen,
  onToggleFavorite,
  onDelete,
}: RaceCardProps) {
  const chips = race.common_in.slice(0, MAX_CHIPS);
  const extra = race.common_in.length - chips.length;
  const hasActions = Boolean(handle) || Boolean(onToggleFavorite) || Boolean(onDelete) || lifted;

  return (
    <Card
      padded={false}
      className={cn(
        'group relative flex h-full items-start gap-3 overflow-hidden py-3 pl-4 pr-3 transition-colors hover:border-rpg-primary/50',
        'has-[.card-open:focus-visible]:outline-2 has-[.card-open:focus-visible]:outline-offset-2 has-[.card-open:focus-visible]:outline-rpg-secondary',
        dragging && 'opacity-40 outline-2 outline-dashed outline-rpg-primary/50',
        lifted && 'scale-[1.02] cursor-grabbing border-rpg-primary/60 shadow-neon',
      )}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-rpg-secondary/70" />

      <EntityImage
        name={race.name}
        url={race.image_url}
        crop={race.image_crop}
        initialsClassName="text-xl"
        className="aspect-square w-[72px] shrink-0 rounded-lg"
      />

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 font-bold text-white">
          <button
            type="button"
            onClick={() => onOpen?.(race.id)}
            className="card-open text-left after:absolute after:inset-0 focus-visible:outline-none"
          >
            {race.name}
          </button>
        </h3>
        {race.summary && <p className="mt-0.5 line-clamp-2 text-sm text-rpg-muted">{race.summary}</p>}
        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {chips.map((place) => (
              <Badge key={place} className="max-w-full truncate">
                {place}
              </Badge>
            ))}
            {extra > 0 && <Badge variant="neutral">+{extra}</Badge>}
          </div>
        )}
      </div>

      {hasActions && (
        <div className="relative z-10 flex shrink-0 flex-col items-center gap-1">
          {handle}
          {lifted && (
            <div className="rounded-md bg-black/60 p-2 text-rpg-primary">
              <GripVertical size={16} aria-hidden="true" />
            </div>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(race)}
              aria-pressed={race.is_favorite}
              aria-label={race.is_favorite ? `Remover ${race.name} dos favoritos` : `Favoritar ${race.name}`}
              className="rounded-md bg-black/60 p-1.5 text-gray-200 transition-colors hover:text-rpg-primary"
            >
              <Star
                size={14}
                aria-hidden="true"
                className={race.is_favorite ? 'fill-rpg-primary text-rpg-primary' : ''}
              />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(race)}
              aria-label={`Excluir ${race.name}`}
              className="rounded-md bg-black/60 p-1.5 text-gray-200 opacity-0 transition-[opacity,color] hover:text-rpg-danger focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}