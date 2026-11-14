/**
 * Função do Arquivo: Card de uma criatura na grade. Vertical: banner baixo 3:1 no topo (com alça,
 * favorito e lixeira por cima), selo de Perigo com texto, faixa de nível ("Nível 15–40"), nome,
 * resumo e chips de "Comum em". A borda ganha a cor do perigo (nada só por cor: o selo diz o
 * nível). O card inteiro abre a gaveta por um botão "esticado" no nome.
 *
 * O que há ali:
 * - CreatureCard: componente. Props: creature; handle; dragging e lifted; onOpen;
 *   onToggleFavorite e onDelete (só passe para o dono).
 */

import { GripVertical, Star, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CreatureListItem } from '../../api/peoples';
import { cn } from '../../lib/cn';
import { DANGER_META, formatLevelRange } from '../../lib/peoplesUtils';
import { Badge, Card, EntityImage } from '../ui';
import { DangerBadge } from './DangerBadge';

const MAX_CHIPS = 2;

interface CreatureCardProps {
  creature: CreatureListItem;
  handle?: ReactNode;
  dragging?: boolean;
  lifted?: boolean;
  onOpen?: (id: number) => void;
  onToggleFavorite?: (creature: CreatureListItem) => void;
  onDelete?: (creature: CreatureListItem) => void;
}

export function CreatureCard({
  creature,
  handle,
  dragging = false,
  lifted = false,
  onOpen,
  onToggleFavorite,
  onDelete,
}: CreatureCardProps) {
  const range = formatLevelRange(creature.level_min, creature.level_max);
  const chips = creature.common_in.slice(0, MAX_CHIPS);
  const extra = creature.common_in.length - chips.length;

  return (
    <Card
      padded={false}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lift',
        DANGER_META[creature.danger_level].border,
        'has-[.card-open:focus-visible]:outline-2 has-[.card-open:focus-visible]:outline-offset-2 has-[.card-open:focus-visible]:outline-rpg-secondary',
        dragging && 'opacity-40 outline-2 outline-dashed outline-rpg-primary/50',
        lifted && 'scale-[1.02] cursor-grabbing shadow-neon',
      )}
    >
      <div className="relative">
        <EntityImage
          name={creature.name}
          url={creature.image_url}
          crop={creature.image_crop}
          initialsClassName="text-3xl"
          className="aspect-[3/1] w-full"
        />

        {handle && <div className="absolute left-2 top-2 z-10">{handle}</div>}

        {(onToggleFavorite || onDelete) && (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(creature)}
                aria-label={`Excluir ${creature.name}`}
                className="rounded-md bg-black/60 p-2 text-gray-200 opacity-0 backdrop-blur-sm transition-[opacity,color] hover:text-rpg-danger focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(creature)}
                aria-pressed={creature.is_favorite}
                aria-label={
                  creature.is_favorite
                    ? `Remover ${creature.name} dos favoritos`
                    : `Favoritar ${creature.name}`
                }
                className="rounded-md bg-black/60 p-2 text-gray-200 backdrop-blur-sm transition-colors hover:text-rpg-primary"
              >
                <Star
                  size={16}
                  aria-hidden="true"
                  className={creature.is_favorite ? 'fill-rpg-primary text-rpg-primary' : ''}
                />
              </button>
            )}
          </div>
        )}

        {lifted && (
          <div className="absolute left-2 top-2 z-10 rounded-md bg-black/60 p-2 text-rpg-primary backdrop-blur-sm">
            <GripVertical size={16} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DangerBadge level={creature.danger_level} />
          {range && <span className="text-xs text-rpg-subtle">{range}</span>}
        </div>
        <h3 className="line-clamp-2 font-bold text-white">
          <button
            type="button"
            onClick={() => onOpen?.(creature.id)}
            className="card-open text-left after:absolute after:inset-0 focus-visible:outline-none"
          >
            {creature.name}
          </button>
        </h3>
        {creature.summary && <p className="line-clamp-2 text-sm text-rpg-muted">{creature.summary}</p>}
        {chips.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1 pt-1">
            {chips.map((place) => (
              <Badge key={place} className="max-w-full truncate">
                {place}
              </Badge>
            ))}
            {extra > 0 && <Badge variant="neutral">+{extra}</Badge>}
          </div>
        )}
      </div>
    </Card>
  );
}