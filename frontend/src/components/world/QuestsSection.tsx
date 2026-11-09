/**
 * Missões do mundo (subseção de "Resumo & Missões"): linhas agrupadas por status.
 * - "Em andamento" começa aberto; "Ociosa" e "Concluída" começam recolhidas. Cada grupo mostra 5
 *   e "Ver todas (N)". Sem paginação nem limite. Com mais de 10 missões, aparecem busca e filtro por tag.
 * - Troca rápida de status no selo da linha. Clicar na missão abre a gaveta (Ler / Editar, com
 *   salvamento automático); o estado vai na URL (?missao=ID).
 * - Dono: "Adicionar missão", editar e excluir (com "Desfazer"). Convidado: só leitura.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Pencil, Plus, ScrollText, Search, Trash2 } from 'lucide-react';
import { questService, type Quest, type QuestStatus } from '../../api/quests';
import { useAutosave, type SaveStatus } from '../../hooks/useAutosave';
import { excerptFromMarkdown } from '../../lib/markdownFile';
import {
  DEFAULT_OPEN,
  FILTER_THRESHOLD,
  GROUP_LIMIT,
  STATUS_LABELS,
  STATUS_ORDER,
  collectAllTags,
  collectTags,
  filterQuests,
  groupByStatus,
} from '../../lib/questUtils';
import { formatRelative } from '../../lib/time';
import { cn } from '../../lib/cn';
import { Button, Drawer, EmptyState, Input, Select, Skeleton, TabPanel, Tabs, TagInput, toast } from '../ui';
import { MarkdownEditor } from '../markdown/MarkdownEditor';
import { MarkdownView } from '../markdown/MarkdownView';
import { useWorldContext } from '../../hooks/useWorld';
import { StatusBadge, StatusSelect } from './QuestStatus';
import { TagChips } from './TagChips';

const MODE_ITEMS = [
  { value: 'ler', label: 'Ler' },
  { value: 'editar', label: 'Editar' },
];

function SaveLabel({ status }: { status: SaveStatus }) {
  const text =
    status === 'saving' ? 'Salvando…' : status === 'saved' ? 'Salvo agora' : status === 'error' ? 'Erro ao salvar' : '';
  return (
    <span role="status" className={cn('text-xs', status === 'error' ? 'text-rpg-danger' : 'text-rpg-subtle')}>
      {text}
    </span>
  );
}

interface QuestEditorProps {
  quest: Quest;
  characterSuggestions: string[];
  locationSuggestions: string[];
  onUpdated: (quest: Quest) => void;
}

function QuestEditor({ quest, characterSuggestions, locationSuggestions, onUpdated }: QuestEditorProps) {
  const [draft, setDraft] = useState({
    title: quest.title,
    status: quest.status,
    description: quest.description_markdown,
    characters: quest.characters,
    locations: quest.locations,
  });

  const { status } = useAutosave(draft, async (value) => {
    onUpdated(
      await questService.update(quest.id, {
        title: value.title.trim() || 'Sem título',
        status: value.status,
        description_markdown: value.description,
        characters: value.characters,
        locations: value.locations,
      }),
    );
  });

  return (
    <div className="flex h-full min-h-[28rem] flex-col gap-4">
      <Input
        label="Título"
        maxLength={160}
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      />
      <Select
        label="Status"
        value={draft.status}
        onChange={(e) => setDraft({ ...draft, status: e.target.value as QuestStatus })}
        options={STATUS_ORDER.map((value) => ({ value, label: STATUS_LABELS[value] }))}
      />
      <TagInput
        label="Personagens"
        value={draft.characters}
        onChange={(characters) => setDraft({ ...draft, characters })}
        suggestions={characterSuggestions}
        placeholder="Nome e Enter"
      />
      <TagInput
        label="Locais"
        value={draft.locations}
        onChange={(locations) => setDraft({ ...draft, locations })}
        suggestions={locationSuggestions}
        placeholder="Nome e Enter"
      />
      <div className="min-h-64 flex-1">
        <MarkdownEditor
          value={draft.description}
          onChange={(description) => setDraft({ ...draft, description })}
          ariaLabel="Descrição da missão em Markdown"
          placeholder="Objetivo, pistas, recompensas… (Markdown)"
        />
      </div>
      <div className="flex justify-end">
        <SaveLabel status={status} />
      </div>
    </div>
  );
}

interface QuestPanelProps extends Omit<QuestEditorProps, 'quest'> {
  quest: Quest;
  canEdit: boolean;
  startInEdit: boolean;
}

function QuestPanel({ quest, canEdit, startInEdit, ...editorProps }: QuestPanelProps) {
  const [mode, setMode] = useState(startInEdit && canEdit ? 'editar' : 'ler');
  const current = canEdit ? mode : 'ler';

  return (
    <div className="flex h-full flex-col gap-4">
      {canEdit && (
        <Tabs idPrefix="quest" ariaLabel="Modo da missão" items={MODE_ITEMS} value={mode} onChange={setMode} />
      )}
      <TabPanel idPrefix="quest" value="ler" current={current} className="space-y-4">
        <div>
          <h3 className="mb-2 text-2xl font-bold text-white">{quest.title}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={quest.status} />
            <span className="text-xs text-rpg-subtle">Atualizada {formatRelative(quest.updated_at)}</span>
          </div>
        </div>
        <TagChips characters={quest.characters} locations={quest.locations} />
        {quest.description_markdown ? (
          <MarkdownView content={quest.description_markdown} />
        ) : (
          <p className="italic text-rpg-subtle">Esta missão ainda não tem descrição…</p>
        )}
      </TabPanel>
      <TabPanel idPrefix="quest" value="editar" current={current} className="min-h-0 flex-1">
        <QuestEditor quest={quest} {...editorProps} />
      </TabPanel>
    </div>
  );
}

interface QuestRowProps {
  quest: Quest;
  canEdit: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: QuestStatus) => void;
}

function QuestRow({ quest, canEdit, onOpen, onEdit, onDelete, onStatusChange }: QuestRowProps) {
  const excerpt = excerptFromMarkdown(quest.description_markdown, 140);
  return (
    <li className="group/quest relative flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-800 bg-rpg-card px-4 py-3 transition-colors hover:border-rpg-primary/50 has-[button.stretch:focus-visible]:outline-2 has-[button.stretch:focus-visible]:outline-offset-2 has-[button.stretch:focus-visible]:outline-rpg-secondary">
      <div className="min-w-0 flex-1 space-y-1.5">
        <h4 className="font-bold text-white">
          <button
            type="button"
            onClick={onOpen}
            className="stretch text-left after:absolute after:inset-0 focus-visible:outline-none"
          >
            {quest.title}
          </button>
        </h4>
        {excerpt && <p className="line-clamp-2 text-sm text-rpg-muted">{excerpt}</p>}
        <TagChips characters={quest.characters} locations={quest.locations} />
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-2">
        {canEdit ? (
          <>
            <StatusSelect
              value={quest.status}
              ariaLabel={`Status da missão ${quest.title}`}
              onChange={onStatusChange}
            />
            <div className="flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/quest:opacity-100 pointer-coarse:opacity-100">
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Editar missão ${quest.title}`}
                className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-white"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Excluir missão ${quest.title}`}
                className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-rpg-danger"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <StatusBadge status={quest.status} />
        )}
      </div>
    </li>
  );
}

export default function QuestsSection({ canEdit }: { canEdit: boolean }) {
  const { world } = useWorldContext();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [openGroups, setOpenGroups] = useState<Set<QuestStatus>>(new Set(DEFAULT_OPEN));
  const [fullGroups, setFullGroups] = useState<Set<QuestStatus>>(new Set());
  const [editOnOpen, setEditOnOpen] = useState<number | null>(null);
  const [lastQuest, setLastQuest] = useState<Quest | null>(null);
  const [params, setParams] = useSearchParams();

  const selectedId = Number(params.get('missao')) || null;
  const selected = quests.find((quest) => quest.id === selectedId) ?? null;
  const shownQuest = selected ?? lastQuest; // mantém o conteúdo durante a animação de fechar

  useEffect(() => {
    if (selected) setLastQuest(selected);
  }, [selected]);

  useEffect(() => {
    setIsLoading(true);
    questService
      .list(world.id)
      .then(setQuests)
      .catch(() => toast.error('Não foi possível carregar as missões. Tente de novo.'))
      .finally(() => setIsLoading(false));
  }, [world.id]);

  const showFilters = quests.length > FILTER_THRESHOLD;
  const hasFilter = showFilters && (query.trim() !== '' || tagFilter !== '');
  const filtered = showFilters ? filterQuests(quests, query, tagFilter) : quests;
  const groups = groupByStatus(filtered);
  const allTags = collectAllTags(quests);

  const toggle = <T,>(setter: (updater: (previous: Set<T>) => Set<T>) => void, value: T) =>
    setter((previous) => {
      const next = new Set(previous);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const openQuest = (id: number) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('missao', String(id));
      return next;
    });

  const closeQuest = () => {
    setEditOnOpen(null);
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('missao');
        return next;
      },
      { replace: true },
    );
  };

  const replaceQuest = (updated: Quest) =>
    setQuests((previous) => previous.map((quest) => (quest.id === updated.id ? updated : quest)));

  const createQuest = async () => {
    try {
      const created = await questService.create({ world: world.id, title: 'Nova missão', status: 'active' });
      setQuests((previous) => [...previous, created]);
      setOpenGroups((previous) => new Set(previous).add('active'));
      setFullGroups((previous) => new Set(previous).add('active'));
      setEditOnOpen(created.id);
      openQuest(created.id);
    } catch {
      toast.error('Não foi possível criar a missão. Tente de novo.');
    }
  };

  const changeStatus = async (quest: Quest, status: QuestStatus) => {
    if (status === quest.status) return;
    const previous = quests;
    replaceQuest({ ...quest, status });
    // Abre o grupo de destino para a missão não "sumir" da tela
    setOpenGroups((open) => new Set(open).add(status));
    setFullGroups((full) => new Set(full).add(status));
    try {
      replaceQuest(await questService.update(quest.id, { status }));
    } catch {
      setQuests(previous);
      toast.error('Não foi possível mudar o status. Tente de novo.');
    }
  };

  const deleteQuest = async (quest: Quest) => {
    try {
      await questService.remove(quest.id);
    } catch {
      toast.error('Não foi possível excluir a missão. Tente de novo.');
      return;
    }
    setQuests((previous) => previous.filter((q) => q.id !== quest.id));
    if (selectedId === quest.id) closeQuest();
    toast('Missão excluída', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            const restored = await questService.create({
              world: world.id,
              title: quest.title,
              status: quest.status,
              description_markdown: quest.description_markdown,
              characters: quest.characters,
              locations: quest.locations,
            });
            setQuests((previous) => [...previous, restored]);
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  return (
    <section aria-labelledby="missoes-titulo">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 id="missoes-titulo" className="flex items-center gap-2 text-lg font-bold text-white">
          <ScrollText size={18} className="text-rpg-primary" aria-hidden="true" />
          Missões
          <span className="text-sm font-normal text-rpg-subtle">({quests.length})</span>
        </h3>
        {canEdit && (
          <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={createQuest}>
            Adicionar missão
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input
              size="sm"
              aria-label="Buscar missões"
              placeholder="Buscar missões…"
              leftIcon={<Search size={14} />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {allTags.length > 0 && (
            <div className="w-48">
              <Select
                size="sm"
                aria-label="Filtrar por tag"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="">Todas as tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : quests.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={28} aria-hidden="true" />}
          title="Nenhuma missão ainda"
          description="Registre as missões da campanha: objetivos, pistas, personagens e locais envolvidos."
          action={
            canEdit && (
              <Button variant="outline" leftIcon={<Plus size={16} />} onClick={createQuest}>
                Adicionar missão
              </Button>
            )
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma missão com esses filtros"
          description="Tente outro termo ou outra tag."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setTagFilter('');
              }}
            >
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {STATUS_ORDER.map((status) => {
            const list = groups[status];
            if (list.length === 0) return null;
            const isOpen = hasFilter || openGroups.has(status);
            const isFull = hasFilter || fullGroups.has(status);
            const shown = isFull ? list : list.slice(0, GROUP_LIMIT);

            return (
              <div key={status}>
                <button
                  type="button"
                  onClick={() => toggle(setOpenGroups, status)}
                  aria-expanded={isOpen}
                  className="mb-2 flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left transition-colors hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-sm text-rpg-muted">{list.length}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={cn('text-rpg-muted transition-transform', !isOpen && '-rotate-90')}
                  />
                </button>

                {isOpen && (
                  <>
                    <ul className="space-y-2">
                      {shown.map((quest) => (
                        <QuestRow
                          key={quest.id}
                          quest={quest}
                          canEdit={canEdit}
                          onOpen={() => openQuest(quest.id)}
                          onEdit={() => {
                            setEditOnOpen(quest.id);
                            openQuest(quest.id);
                          }}
                          onDelete={() => void deleteQuest(quest)}
                          onStatusChange={(next) => void changeStatus(quest, next)}
                        />
                      ))}
                    </ul>
                    {list.length > GROUP_LIMIT && !hasFilter && (
                      <div className="mt-2 flex justify-center">
                        <Button variant="ghost" size="sm" onClick={() => toggle(setFullGroups, status)}>
                          {isFull ? 'Mostrar menos' : `Ver todas (${list.length})`}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Drawer open={selected !== null} onClose={closeQuest} width="lg" title={shownQuest?.title ?? ''}>
        {shownQuest && (
          <QuestPanel
            key={shownQuest.id}
            quest={shownQuest}
            canEdit={canEdit}
            startInEdit={editOnOpen === shownQuest.id}
            characterSuggestions={collectTags(quests, 'characters')}
            locationSuggestions={collectTags(quests, 'locations')}
            onUpdated={replaceQuest}
          />
        )}
      </Drawer>
    </section>
  );
}