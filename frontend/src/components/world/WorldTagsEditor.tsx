/**
 * Função do Arquivo: Botão "+ Tag" da capa do mundo e o modal "Tags do mundo". No modal o
 * dono marca/desmarca as tags existentes e cria tags novas (se o nome já existir, o backend
 * devolve a existente). Nada é gravado até "Salvar tags", que envia a lista final de uma vez.
 * Só renderize para o dono (a capa decide).
 *
 * O que há ali:
 * - WorldTagsEditor: botão + modal (props: world, onSaved). onSaved recebe o mundo atualizado.
 * - TagsForm (interno): carrega todas as tags, controla a seleção, a criação e o salvamento.
 *   Fica dentro do Modal, então reinicia a cada abertura.
 */

import { useEffect, useState } from 'react';
import { Check, Plus, Tags as TagsIcon } from 'lucide-react';
import { worldService, type Tag, type World } from '../../api/worlds';
import { cn } from '../../lib/cn';
import { Button, Input, Modal, Skeleton, toast } from '../ui';

interface WorldTagsEditorProps {
  world: World;
  onSaved: (world: World) => void;
}

interface TagsFormProps extends WorldTagsEditorProps {
  onClose: () => void;
}

const byName = (a: Tag, b: Tag) => a.name.localeCompare(b.name, 'pt-BR');

function TagsForm({ world, onSaved, onClose }: TagsFormProps) {
  const [available, setAvailable] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>(world.tags.map((tag) => tag.id));
  const [draft, setDraft] = useState('');
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    worldService
      .getAllTags()
      .then((list) => {
        if (active) setAvailable(list);
      })
      .catch(() => toast.error('Não foi possível carregar as tags. Tente de novo.'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = (id: number) =>
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );

  const createTag = async () => {
    const name = draft.replace(/\s+/g, ' ').trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const tag = await worldService.createTag(name);
      setAvailable((previous) => (previous.some((item) => item.id === tag.id) ? previous : [...previous, tag]));
      setSelected((previous) => (previous.includes(tag.id) ? previous : [...previous, tag.id]));
      setDraft('');
    } catch {
      toast.error('Não foi possível criar a tag. Use até 50 caracteres, com letras ou números.');
    } finally {
      setCreating(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await worldService.updateWorld(world.id, { tag_ids: selected });
      onSaved(updated);
      toast.success('Tags salvas');
      onClose();
    } catch {
      toast.error('Não foi possível salvar as tags. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...available].sort(byName);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-rpg-muted">Marque as tags deste mundo</p>
        {loading ? (
          <div className="flex flex-wrap gap-2" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-rpg-subtle">Ainda não há tags. Crie a primeira abaixo.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sorted.map((tag) => {
              const on = selected.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(tag.id)}
                  className={cn(
                    'inline-flex min-h-8 items-center gap-1.5 rounded border px-3 py-1 text-xs font-bold transition-colors',
                    on
                      ? 'border-rpg-secondary bg-rpg-secondary/20 text-rpg-secondary'
                      : 'border-gray-700 bg-rpg-bg text-rpg-muted hover:border-gray-500',
                  )}
                >
                  {on && <Check size={12} aria-hidden="true" />}
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Nova tag"
            maxLength={50}
            placeholder="Ex.: Fantasia sombria"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void createTag();
              }
            }}
          />
        </div>
        <Button
          variant="secondary"
          loading={creating}
          disabled={!draft.trim()}
          leftIcon={<Plus size={14} aria-hidden="true" />}
          onClick={() => void createTag()}
        >
          Adicionar
        </Button>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button loading={saving} onClick={() => void save()}>
          Salvar tags
        </Button>
      </div>
    </div>
  );
}

export function WorldTagsEditor({ world, onSaved }: WorldTagsEditorProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="min-h-8"
        aria-label="Adicionar ou remover tags do mundo"
        leftIcon={<Plus size={14} aria-hidden="true" />}
        onClick={() => setOpen(true)}
      >
        Tag
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tags do mundo"
        icon={<TagsIcon size={20} className="text-rpg-primary" aria-hidden="true" />}
      >
        <TagsForm world={world} onSaved={onSaved} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}