/**
 * Função do Arquivo: Visão em tabela das relações: a alternativa acessível (e a mais prática no
 * teclado) ao grafo. Mostra personagem, tipo e texto da relação, personagem, sentido e, para o
 * dono, os botões de editar e excluir. Os nomes abrem a ficha.
 *
 * O que há aqui:
 * - RelationshipTable: componente (props: relationships, characters, canEdit, onEdit, onDelete,
 *   onOpenCharacter).
 */

import { ArrowLeftRight, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import type { CharacterListItem } from '../../api/characters';
import type { Relationship } from '../../api/relationships';
import { RelationKindBadge } from './RelationKindBadge';

interface RelationshipTableProps {
  relationships: Relationship[];
  characters: CharacterListItem[];
  canEdit: boolean;
  onEdit: (relationship: Relationship) => void;
  onDelete: (relationship: Relationship) => void;
  onOpenCharacter: (id: number) => void;
}

export function RelationshipTable({
  relationships,
  characters,
  canEdit,
  onEdit,
  onDelete,
  onOpenCharacter,
}: RelationshipTableProps) {
  const byId = new Map(characters.map((character) => [character.id, character]));
  const nameOf = (id: number) => byId.get(id)?.name ?? '—';

  const rows = [...relationships].sort(
    (a, b) =>
      nameOf(a.source).localeCompare(nameOf(b.source), 'pt-BR') ||
      nameOf(a.target).localeCompare(nameOf(b.target), 'pt-BR'),
  );

  const nameButton = (id: number) => (
    <button
      type="button"
      onClick={() => onOpenCharacter(id)}
      className="text-left font-medium text-white underline-offset-2 hover:underline"
    >
      {nameOf(id)}
    </button>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">Relações entre personagens</caption>
        <thead className="bg-rpg-card text-xs text-rpg-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Personagem</th>
            <th scope="col" className="px-4 py-3 font-medium">Relação</th>
            <th scope="col" className="px-4 py-3 font-medium">Personagem</th>
            <th scope="col" className="px-4 py-3 font-medium">Sentido</th>
            {canEdit && (
              <th scope="col" className="px-4 py-3 text-right font-medium">
                <span className="sr-only">Ações</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((relationship) => {
            const text = [relationship.label, relationship.reverse_label].filter(Boolean).join(' / ');
            return (
              <tr key={relationship.id} className="border-t border-gray-800">
                <td className="px-4 py-3">{nameButton(relationship.source)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <RelationKindBadge kind={relationship.kind} />
                    {text && <span className="text-rpg-muted">{text}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">{nameButton(relationship.target)}</td>
                <td className="px-4 py-3 text-rpg-muted">
                  <span className="inline-flex items-center gap-1.5">
                    {relationship.is_mutual ? (
                      <ArrowLeftRight size={14} aria-hidden="true" />
                    ) : (
                      <ArrowRight size={14} aria-hidden="true" />
                    )}
                    {relationship.is_mutual ? 'Nos dois sentidos' : 'Um sentido'}
                  </span>
                </td>
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(relationship)}
                        aria-label={`Editar relação entre ${nameOf(relationship.source)} e ${nameOf(relationship.target)}`}
                        className="rounded-md p-2 text-rpg-muted transition-colors hover:text-white"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(relationship)}
                        aria-label={`Excluir relação entre ${nameOf(relationship.source)} e ${nameOf(relationship.target)}`}
                        className="rounded-md p-2 text-rpg-muted transition-colors hover:text-rpg-danger"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}