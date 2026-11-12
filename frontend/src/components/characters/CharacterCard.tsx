/**
 * Função do Arquivo: Card de um personagem na grade: retrato quadrado no topo (com alça de
 * arrastar, estrela de favorito e lixeira por cima), badge de status, nome, papel e
 * "raça · nível". O card inteiro abre a ficha por um botão "esticado" no nome (foco por
 * teclado). Segue o padrão do WorldCard.
 *
 * O que há ali:
 * - CharacterCard: componente. Props: character; handle (alça do SortableGrid); dragging e
 *   lifted (estados do arraste); onOpen; onToggleFavorite e onDelete (só passe para o dono;
 *   sem elas, os botões não aparecem).
 */

import { GripVertical, Star, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CharacterListItem } from '../../api/characters';
import { STATUS_META } from '../../lib/characterUtils';
import { cn } from '../../lib/cn';
import { Badge, Card } from '../ui';
import { CharacterPortrait } from './CharacterPortrait';

interface CharacterCardProps {
  character: CharacterListItem;
  handle?: ReactNode;
  /** O card de origem enquanto outro está sendo arrastado */
  dragging?: boolean;
  /** Cópia levantada exibida no DragOverlay */
  lifted?: boolean;
  onOpen?: (id: number) => void;
  onToggleFavorite?: (character: CharacterListItem) => void;
  onDelete?: (character: CharacterListItem) => void;
}

export function CharacterCard({
  character,
  handle,
  dragging = false,
  lifted = false,
  onOpen,
  onToggleFavorite,
  onDelete,
}: CharacterCardProps) {
  const status = STATUS_META[character.status];
  const details = [character.race, character.level !== null ? `Nível ${character.level}` : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <Card
      interactive={!lifted && !dragging}
      padded={false}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden',
        'has-[.card-open:focus-visible]:outline-2 has-[.card-open:focus-visible]:outline-offset-2 has-[.card-open:focus-visible]:outline-rpg-secondary',
        dragging && 'opacity-40 outline-2 outline-dashed outline-rpg-primary/50',
        lifted && 'scale-[1.02] cursor-grabbing border-rpg-primary/60 shadow-neon',
      )}
    >
      <div className="relative">
        <CharacterPortrait
          name={character.name}
          url={character.portrait_url}
          crop={character.portrait_crop}
          className="aspect-[3/4] w-full"
        />

        {handle && <div className="absolute left-3 top-3 z-10">{handle}</div>}

        {(onToggleFavorite || onDelete) && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(character)}
                aria-label={`Excluir ${character.name}`}
                className="rounded-md bg-black/60 p-2 text-gray-200 opacity-0 backdrop-blur-sm transition-[opacity,color] hover:text-rpg-danger focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
            
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(character)}
                aria-pressed={character.is_favorite}
                aria-label={
                  character.is_favorite
                    ? `Remover ${character.name} dos favoritos`
                    : `Favoritar ${character.name}`
                }
                className="rounded-md bg-black/60 p-2 text-gray-200 backdrop-blur-sm transition-colors hover:text-rpg-primary"
              >
                <Star
                  size={16}
                  aria-hidden="true"
                  className={character.is_favorite ? 'fill-rpg-primary text-rpg-primary' : ''}
                />
              </button>
            )}
            
          </div>
        )}

        {/* Cópia levantada não tem alça real; mostra o ícone só para manter o visual */}
        {lifted && (
          <div className="absolute left-3 top-3 z-10 rounded-md bg-black/60 p-2 text-rpg-primary backdrop-blur-sm">
            <GripVertical size={16} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <h3 className="line-clamp-2 font-bold text-white">
          <button
            type="button"
            onClick={() => onOpen?.(character.id)}
            className="card-open text-left after:absolute after:inset-0 focus-visible:outline-none"
          >
            {character.name}
          </button>
        </h3>
        {character.role && <p className="truncate text-sm text-rpg-muted">{character.role}</p>}
        {details && <p className="mt-auto truncate pt-1 text-xs text-rpg-subtle">{details}</p>}
      </div>
    </Card>
  );
}