/**
 * Função do Arquivo: Conteúdo da aba "Relações": carrega as relações do mundo (só ao abrir a
 * aba) e mostra, no grafo ou na tabela, os personagens e suas ligações. Tem a legenda que
 * também filtra por tipo, o foco numa vizinhança, criar/editar/excluir (excluir com
 * confirmação e "Desfazer") e os estados vazios. Convidado só lê.
 *
 * O que há aqui:
 * - RelationsTab: componente (props: worldId, characters, canEdit, onOpenCharacter).
 *   Estado: relações, visão (grafo/tabela), foco, tipos ocultos, modal de formulário e
 *   exclusão pendente. Relações de personagens que não existem mais são ignoradas.
 * - LineSample (interno): amostra da linha de cada tipo na legenda.
 * - MANY_NODES: a partir de quantos personagens no grafo o aviso sugere usar o foco.
 */

import { useEffect, useState } from 'react';
import { Network, Plus, Table as TableIcon, X } from 'lucide-react';
import type { CharacterListItem } from '../../api/characters';
import {
  relationshipService,
  type Relationship,
  type RelationshipKind,
} from '../../api/relationships';
import { KIND_META, KIND_ORDER, neighborhood } from '../../lib/relationshipUtils';
import { cn } from '../../lib/cn';
import { Button, ConfirmDialog, EmptyState, Select, Skeleton, TabPanel, Tabs, toast } from '../ui';
import { RelationshipFormModal } from './RelationshipFormModal';
import { RelationshipGraph } from './RelationshipGraph';
import { RelationshipTable } from './RelationshipTable';

const MANY_NODES = 25;

function LineSample({ kind }: { kind: RelationshipKind }) {
  const meta = KIND_META[kind];
  return (
    <svg width="28" height="8" aria-hidden="true">
      <line x1="0" y1="4" x2="28" y2="4" stroke={meta.color} strokeWidth="2" strokeDasharray={meta.dash} />
    </svg>
  );
}

interface RelationsTabProps {
  worldId: number;
  characters: CharacterListItem[];
  canEdit: boolean;
  onOpenCharacter: (id: number) => void;
}

export function RelationsTab({ worldId, characters, canEdit, onOpenCharacter }: RelationsTabProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('grafo');
  const [focusId, setFocusId] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<RelationshipKind>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Relationship | null>(null);
  const [toDelete, setToDelete] = useState<Relationship | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    relationshipService
      .list(worldId)
      .then((list) => {
        if (active) setRelationships(list);
      })
      .catch(() => toast.error('Não foi possível carregar as relações. Tente de novo.'))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [worldId]);

  const byId = new Map(characters.map((character) => [character.id, character]));
  const nameOf = (id: number) => byId.get(id)?.name ?? '—';

  // Só relações entre personagens que ainda existem
  const valid = relationships.filter((r) => byId.has(r.source) && byId.has(r.target));
  const byKind = valid.filter((r) => !hidden.has(r.kind));
  const scope = focusId !== null ? neighborhood(byKind, focusId) : null;
  const shown = scope ? byKind.filter((r) => scope.has(r.source) && scope.has(r.target)) : byKind;

  const connectedIds = [...new Set(valid.flatMap((r) => [r.source, r.target]))]
    .map((id) => byId.get(id))
    .filter((character): character is CharacterListItem => character !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const nodeCount = new Set(shown.flatMap((r) => [r.source, r.target])).size;

  const openForm = (relationship: Relationship | null) => {
    setEditing(relationship);
    setFormOpen(true);
  };

  const handleSaved = (saved: Relationship) =>
    setRelationships((previous) =>
      previous.some((r) => r.id === saved.id)
        ? previous.map((r) => (r.id === saved.id ? saved : r))
        : [...previous, saved],
    );

  const toggleKind = (kind: RelationshipKind) =>
    setHidden((previous) => {
      const next = new Set(previous);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  const deleteRelationship = async (target: Relationship) => {
    try {
      await relationshipService.remove(target.id);
    } catch {
      toast.error('Não foi possível excluir a relação. Tente de novo.');
      return;
    }
    setRelationships((previous) => previous.filter((r) => r.id !== target.id));
    setFormOpen(false);
    toast('Relação excluída', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            const restored = await relationshipService.create({
              world: worldId,
              source: target.source,
              target: target.target,
              kind: target.kind,
              label: target.label,
              reverse_label: target.reverse_label,
              is_mutual: target.is_mutual,
            });
            setRelationships((previous) => [...previous, restored]);
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  const newButton = canEdit && (
    <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => openForm(null)}>
      Nova relação
    </Button>
  );

  if (isLoading) {
    return <Skeleton className="h-96 w-full" aria-busy="true" />;
  }

  if (characters.length < 2) {
    return (
      <EmptyState
        icon={<Network size={28} aria-hidden="true" />}
        title="Cadastre ao menos dois personagens"
        description="As relações ligam personagens do mesmo mundo: família, romance, aliança, inimizade e mentoria."
      />
    );
  }

  if (valid.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Network size={28} aria-hidden="true" />}
          title="Nenhuma relação ainda"
          description={
            canEdit
              ? 'Ligue dois personagens e o grafo aparece aqui.'
              : 'Este mundo ainda não tem relações entre personagens.'
          }
          action={newButton}
        />
        <RelationshipFormModal
          open={formOpen}
          worldId={worldId}
          characters={characters}
          relationship={editing}
          defaultSource={focusId}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          onDelete={setToDelete}
        />
      </>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-60">
            <Select
              size="sm"
              aria-label="Foco do grafo"
              value={focusId ?? ''}
              onChange={(e) => setFocusId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Todos os personagens</option>
              {connectedIds.map((character) => (
                <option key={character.id} value={character.id}>
                  Vizinhança de {character.name}
                </option>
              ))}
            </Select>
          </div>
          {focusId !== null && (
            <>
              <Button variant="secondary" size="sm" onClick={() => onOpenCharacter(focusId)}>
                Ver ficha
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={() => setFocusId(null)}>
                Mostrar todos
              </Button>
            </>
          )}
        </div>
        {newButton}
      </div>

      <ul className="mb-4 flex flex-wrap gap-2" aria-label="Tipos de relação (clique para mostrar ou ocultar)">
        {KIND_ORDER.map((kind) => {
          const meta = KIND_META[kind];
          const off = hidden.has(kind);
          return (
            <li key={kind}>
              <button
                type="button"
                aria-pressed={!off}
                onClick={() => toggleKind(kind)}
                className={cn(
                  'inline-flex min-h-8 items-center gap-2 rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                  off
                    ? 'border-gray-700 text-rpg-muted line-through'
                    : 'border-gray-600 bg-rpg-card text-gray-200 hover:border-gray-400',
                )}
              >
                <LineSample kind={kind} />
                <meta.Icon size={12} aria-hidden="true" style={{ color: meta.color }} />
                {meta.label}
              </button>
            </li>
          );
        })}
      </ul>

      <Tabs
        idPrefix="rel-view"
        ariaLabel="Forma de ver as relações"
        className="mb-4"
        value={view}
        onChange={setView}
        items={[
          { value: 'grafo', label: 'Grafo', icon: <Network size={16} aria-hidden="true" /> },
          { value: 'tabela', label: 'Tabela', icon: <TableIcon size={16} aria-hidden="true" /> },
        ]}
      />

      {shown.length === 0 ? (
        <EmptyState
          title="Nenhuma relação para mostrar"
          description="Os tipos ocultos ou o foco escolhido não têm relações. Ajuste a legenda ou o foco."
        />
      ) : (
        <>
          <TabPanel idPrefix="rel-view" value="grafo" current={view}>
            {focusId === null && nodeCount > MANY_NODES && (
              <p className="mb-3 text-sm text-rpg-muted">
                O grafo tem muitos personagens. Escolha um foco para ver só a vizinhança dele.
              </p>
            )}
            <RelationshipGraph
              characters={characters}
              relationships={shown}
              focusId={focusId}
              onSelectCharacter={(id) => setFocusId((previous) => (previous === id ? null : id))}
              onEditRelationship={canEdit ? (relationship) => openForm(relationship) : undefined}
            />
            <p className="mt-2 text-xs text-rpg-subtle">
              Clique num personagem para focar na vizinhança dele. Prefere texto? Use a aba Tabela.
            </p>
          </TabPanel>

          <TabPanel idPrefix="rel-view" value="tabela" current={view}>
            <RelationshipTable
              relationships={shown}
              characters={characters}
              canEdit={canEdit}
              onEdit={(relationship) => openForm(relationship)}
              onDelete={setToDelete}
              onOpenCharacter={onOpenCharacter}
            />
          </TabPanel>
        </>
      )}

      <RelationshipFormModal
        open={formOpen}
        worldId={worldId}
        characters={characters}
        relationship={editing}
        defaultSource={focusId}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        onDelete={setToDelete}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir relação"
        description={
          toDelete ? (
            <>
              Deseja mesmo excluir essa relação entre{' '}
              <strong className="text-white">{nameOf(toDelete.source)}</strong> e{' '}
              <strong className="text-white">{nameOf(toDelete.target)}</strong>?
            </>
          ) : null
        }
        confirmLabel="Excluir"
        onClose={() => setToDelete(null)}
        onConfirm={() => (toDelete ? deleteRelationship(toDelete) : undefined)}
      />
    </div>
  );
}