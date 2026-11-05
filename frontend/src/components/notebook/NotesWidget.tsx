/**
 * Widget "Notas rápidas" da Home: as 5 primeiras notas (fixadas primeiro), "+ Nova",
 * excluir com "Desfazer" e "Exibir tudo (N)" que leva a /notebook. Edição rápida no NoteModal.
 * Modo convidado: só leitura.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Book, Pin, Plus, Trash2 } from 'lucide-react';
import { noteService, type Note } from '../../api/notebook';
import { formatRelative } from '../../lib/time';
import { Button, Card, Skeleton, toast } from '../ui';
import NoteModal, { type NoteData } from './NoteModal';

const VISIBLE = 5;

export default function NotesWidget({ isGuest }: { isGuest: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState<NoteData | null>(null);

  const load = useCallback(async () => {
    try {
      setNotes(await noteService.list());
    } catch {
      toast.error('Não foi possível carregar as notas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setCurrent(null);
    setModalOpen(true);
  };

  const openNote = (note: Note) => {
    setCurrent({ id: note.id, title: note.title, content: note.content });
    setModalOpen(true);
  };

  const handleSave = async (data: NoteData) => {
    if (isGuest) return;
    try {
      if (data.id) {
        await noteService.update(data.id, { title: data.title, content: data.content });
      } else {
        await noteService.create({ title: data.title, content: data.content });
      }
      toast.success('Anotação salva');
      setModalOpen(false);
      await load();
    } catch {
      toast.error('Não foi possível salvar a anotação. Tente de novo.');
    }
  };

  const handleDelete = async (note: Note) => {
    if (isGuest) return;
    setNotes((previous) => previous.filter((n) => n.id !== note.id));
    try {
      await noteService.remove(note.id);
    } catch {
      toast.error('Não foi possível excluir a nota. Tente de novo.');
      await load();
      return;
    }
    toast('Nota excluída', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            await noteService.create({
              title: note.title,
              content: note.content,
              is_pinned: note.is_pinned,
              world: note.world,
            });
            await load();
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <Book size={16} className="text-rpg-primary" aria-hidden="true" />
          Notas rápidas
        </h3>
        {!isGuest && (
          <Button size="sm" variant="ghost" leftIcon={<Plus size={14} />} onClick={openNew}>
            Nova
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      ) : notes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-sm text-rpg-muted">
          Nenhuma anotação ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.slice(0, VISIBLE).map((note) => (
            <li
              key={note.id}
              className="group flex items-center rounded-lg border border-gray-800/60 bg-rpg-bg transition-colors hover:border-rpg-primary/50"
            >
              <button
                type="button"
                onClick={() => openNote(note)}
                className="flex min-w-0 flex-1 items-center gap-2 p-2.5 text-left"
              >
                {note.is_pinned && (
                  <Pin size={13} aria-label="Fixada" className="shrink-0 text-rpg-primary" />
                )}
                <span className="truncate text-sm font-medium text-gray-300">{note.title}</span>
                <span className="ml-auto shrink-0 pl-2 text-xs text-rpg-subtle">
                  {formatRelative(note.updated_at)}
                </span>
              </button>
              {!isGuest && (
                <button
                  type="button"
                  onClick={() => handleDelete(note)}
                  aria-label={`Excluir nota ${note.title}`}
                  className="mr-1 rounded-md p-1.5 text-rpg-subtle opacity-0 transition-all hover:text-rpg-danger focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {notes.length > 0 && (
        <Link
          to="/notebook?aba=notas"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-rpg-bg hover:text-white"
        >
          Exibir tudo ({notes.length})
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}

      <NoteModal
        isOpen={modalOpen}
        initialData={current}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        readOnly={isGuest}
      />
    </Card>
  );
}
