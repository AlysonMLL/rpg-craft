/**
 * Aba "Notas" da página /notebook: lista à esquerda (busca, ordenação, filtro de mundo,
 * "Nova nota") e painel à direita com Ler / Editar.
 * - Editar salva sozinho (800ms depois de parar de digitar e ao trocar de nota) e mostra "Salvo agora".
 * - Fixar e excluir (com "Desfazer"). Modo convidado: só leitura.
 */
import { useEffect, useState } from 'react';
import { Maximize2, Minimize2, Pin, PinOff, Plus, Search, Trash2 } from 'lucide-react';
import { noteService, type Note } from '../../api/notebook';
import type { World } from '../../api/worlds';
import { useAutosave, type SaveStatus } from '../../hooks/useAutosave';
import { formatRelative } from '../../lib/time';
import { cn } from '../../lib/cn';
import { Badge, Button, EmptyState, Input, Select, TabPanel, Tabs, toast } from '../ui';
import { MarkdownEditor } from '../markdown/MarkdownEditor';
import { MarkdownView } from '../markdown/MarkdownView';

type NoteSort = 'pinned' | 'recent' | 'az';
type Mode = 'ler' | 'editar';

const SORT_OPTIONS = [
  { value: 'pinned', label: 'Fixadas primeiro' },
  { value: 'recent', label: 'Mais recentes' },
  { value: 'az', label: 'A–Z' },
];

const MODE_ITEMS = [
  { value: 'ler', label: 'Ler' },
  { value: 'editar', label: 'Editar' },
];

const excerpt = (content: string) =>
  content.replace(/<[^>]+>/g, '').replace(/[#*_>`~-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 140);

function SaveLabel({ status }: { status: SaveStatus }) {
  const text =
    status === 'saving' ? 'Salvando…' : status === 'saved' ? 'Salvo agora' : status === 'error' ? 'Erro ao salvar' : '';
  return (
    <span
      role="status"
      className={cn('text-xs', status === 'error' ? 'text-rpg-danger' : 'text-rpg-subtle')}
    >
      {text}
    </span>
  );
}

interface NoteEditorProps {
  note: Note;
  worlds: World[];
  onUpdated: (note: Note) => void;
}

function NoteEditor({ note, worlds, onUpdated }: NoteEditorProps) {
  const [draft, setDraft] = useState({
    title: note.title,
    content: note.content,
    world: note.world,
  });

  const { status } = useAutosave(draft, async (value) => {
    const updated = await noteService.update(note.id, {
      title: value.title.trim() || 'Sem título',
      content: value.content,
      world: value.world,
    });
    onUpdated(updated);
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <Input
          label="Título"
          maxLength={120}
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <Select
          label="Mundo (opcional)"
          value={draft.world ?? ''}
          onChange={(e) => setDraft({ ...draft, world: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">Sem mundo</option>
          {worlds.map((world) => (
            <option key={world.id} value={world.id}>
              {world.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-h-0 flex-1">
        <MarkdownEditor value={draft.content} onChange={(content) => setDraft({ ...draft, content })} />
      </div>
      <div className="flex justify-end">
        <SaveLabel status={status} />
      </div>
    </div>
  );
}

interface NotesTabProps {
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
  worlds: World[];
  isGuest: boolean;
  /** Nota aberta ao entrar (?nota=ID) */
  initialNoteId?: number | null;
}

export default function NotesTab({
  notes,
  onNotesChange,
  worlds,
  isGuest,
  initialNoteId = null,
}: NotesTabProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<NoteSort>('pinned');
  const [worldFilter, setWorldFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<number | null>(initialNoteId);
  const [mode, setMode] = useState<Mode>('ler');
  const [fullscreen, setFullscreen] = useState(false);

  const ownedWorlds = worlds.filter((world) => world.is_owner);
  const selected = notes.find((note) => note.id === selectedId) ?? null;

  // Tela cheia: Esc sai, a página atrás não rola e, sem nota selecionada, volta ao normal
  useEffect(() => {
    if (!fullscreen) return;
    if (!selected) {
      setFullscreen(false);
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen, selected]);

  const visible = notes
    .filter((note) => {
      const text = query.trim().toLowerCase();
      const matchesQuery =
        !text || note.title.toLowerCase().includes(text) || note.content.toLowerCase().includes(text);
      const matchesWorld =
        worldFilter === 'all' ||
        (worldFilter === 'none' ? note.world === null : note.world === Number(worldFilter));
      return matchesQuery && matchesWorld;
    })
    .sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title, 'pt-BR');
      const byDate = b.updated_at.localeCompare(a.updated_at);
      if (sort === 'recent') return byDate;
      return Number(b.is_pinned) - Number(a.is_pinned) || byDate;
    });

  const replaceNote = (updated: Note) =>
    onNotesChange(notes.map((note) => (note.id === updated.id ? updated : note)));

  const createNote = async () => {
    try {
      const created = await noteService.create({ title: 'Nova nota' });
      onNotesChange([created, ...notes]);
      setSelectedId(created.id);
      setMode('editar');
    } catch {
      toast.error('Não foi possível criar a nota. Tente de novo.');
    }
  };

  const togglePin = async (note: Note) => {
    try {
      replaceNote(await noteService.update(note.id, { is_pinned: !note.is_pinned }));
    } catch {
      toast.error('Não foi possível fixar a nota. Tente de novo.');
    }
  };

  const deleteNote = async (note: Note) => {
    try {
      await noteService.remove(note.id);
    } catch {
      toast.error('Não foi possível excluir a nota. Tente de novo.');
      return;
    }
    onNotesChange(notes.filter((n) => n.id !== note.id));
    if (selectedId === note.id) setSelectedId(null);
    toast('Nota excluída', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            const restored = await noteService.create({
              title: note.title,
              content: note.content,
              is_pinned: note.is_pinned,
              world: note.world,
            });
            onNotesChange([restored, ...notes.filter((n) => n.id !== note.id)]);
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  return (
    <div className="grid gap-4 lg:h-[calc(100vh-17rem)] lg:min-h-[28rem] lg:grid-cols-[340px_1fr]">
      {/* Lista */}
      <div className="flex min-h-0 flex-col gap-3">
        <Input
          aria-label="Buscar notas"
          placeholder="Buscar notas…"
          leftIcon={<Search size={16} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            aria-label="Ordenar notas"
            size="sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as NoteSort)}
            options={SORT_OPTIONS}
          />
          <Select
            aria-label="Filtrar por mundo"
            size="sm"
            value={worldFilter}
            onChange={(e) => setWorldFilter(e.target.value)}
          >
            <option value="all">Todos os mundos</option>
            <option value="none">Sem mundo</option>
            {ownedWorlds.map((world) => (
              <option key={world.id} value={world.id}>
                {world.name}
              </option>
            ))}
          </Select>
        </div>
        {!isGuest && (
          <Button variant="outline" leftIcon={<Plus size={16} />} onClick={createNote}>
            Nova nota
          </Button>
        )}

        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {visible.length === 0 ? (
            <li className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-sm text-rpg-muted">
              {notes.length === 0 ? 'Nenhuma anotação ainda.' : 'Nenhuma nota com esses filtros.'}
            </li>
          ) : (
            visible.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  aria-current={note.id === selectedId}
                  onClick={() => {
                    setSelectedId(note.id);
                    setMode('ler');
                  }}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    note.id === selectedId
                      ? 'border-rpg-primary/50 bg-rpg-primary/5'
                      : 'border-transparent hover:bg-rpg-card',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {note.is_pinned && (
                      <Pin size={13} aria-label="Fixada" className="shrink-0 text-rpg-primary" />
                    )}
                    <span className="truncate font-medium text-white">{note.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-rpg-subtle">
                      {formatRelative(note.updated_at)}
                    </span>
                  </div>
                  {excerpt(note.content) && (
                    <p className="mt-1 line-clamp-2 text-sm text-rpg-muted">{excerpt(note.content)}</p>
                  )}
                  {note.world_name && (
                    <Badge variant="neutral" className="mt-2">
                      {note.world_name}
                    </Badge>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Painel (em tela cheia ocupa a janela inteira; o editor continua o mesmo) */}
      <section
        aria-label={fullscreen ? 'Nota em tela cheia' : 'Anotação selecionada'}
        role={fullscreen ? 'dialog' : undefined}
        aria-modal={fullscreen ? true : undefined}
        className={cn(
          'flex min-w-0 flex-col',
          fullscreen
            ? 'fixed inset-0 z-50 bg-rpg-bg'
            : 'min-h-[24rem] rounded-xl border border-gray-800 bg-rpg-card',
        )}
      >
        {!selected ? (
          <div className="m-auto p-6">
            <EmptyState
              title="Nenhuma nota selecionada"
              description={
                isGuest
                  ? 'Escolha uma nota na lista para ler.'
                  : 'Escolha uma nota na lista ou crie uma nova.'
              }
            />
          </div>
        ) : (
          <>
            <div className="border-b border-gray-800">
              <div
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 px-5 pt-1',
                  fullscreen && 'mx-auto w-full max-w-4xl',
                )}
              >
                {isGuest ? (
                  <span className="py-3 text-sm font-medium text-white">Leitura</span>
                ) : (
                  <Tabs
                    idPrefix="note"
                    ariaLabel="Modo da nota"
                    items={MODE_ITEMS}
                    value={mode}
                    onChange={(value) => setMode(value as Mode)}
                    bordered={false}
                  />
                )}
                <div className="flex items-center gap-1 py-2">
                  {!isGuest && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(selected)}
                        leftIcon={selected.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                      >
                        {selected.is_pinned ? 'Desafixar' : 'Fixar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(selected)}
                        leftIcon={<Trash2 size={14} />}
                      >
                        Excluir
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-pressed={fullscreen}
                    onClick={() => setFullscreen((value) => !value)}
                    leftIcon={fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  >
                    {fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className={cn('h-full p-5', fullscreen && 'mx-auto max-w-4xl')}>
                <TabPanel idPrefix="note" value="ler" current={isGuest ? 'ler' : mode}>
                  <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
                  <div className="mb-4 mt-2 flex flex-wrap items-center gap-2 text-xs text-rpg-subtle">
                    {selected.world_name && <Badge variant="neutral">{selected.world_name}</Badge>}
                    <span>Atualizada {formatRelative(selected.updated_at)}</span>
                  </div>
                  {selected.content ? (
                    <MarkdownView content={selected.content} />
                  ) : (
                    <p className="italic text-rpg-subtle">Esta anotação está vazia…</p>
                  )}
                </TabPanel>

                <TabPanel idPrefix="note" value="editar" current={isGuest ? 'ler' : mode} className="h-full">
                  <NoteEditor key={selected.id} note={selected} worlds={ownedWorlds} onUpdated={replaceNote} />
                </TabPanel>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}