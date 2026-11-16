/**
 * Função do Arquivo: Modal "Novo mundo" (Home e /mundos). Pede nome e sinopse (obrigatórios),
 * tags e se o mundo é público (demo). As tags são carregadas ao abrir. O formulário fica
 * dentro do Modal, então reinicia a cada abertura. Mantém as props antigas (isOpen, onClose,
 * onSuccess) para quem o usa não precisar mudar.
 *
 * O que há aqui:
 * - CreateWorldModal (export default): o modal.
 * - CreateForm (interno): estado, validação, envio e toast "Mundo criado".
 */

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Sparkles, Tag as TagIcon } from 'lucide-react';
import { worldService, type Tag } from '../../api/worlds';
import { cn } from '../../lib/cn';
import { Button, Input, Modal, Textarea, toast } from '../ui';

interface CreateWorldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateForm({ onClose, onSuccess }: Omit<CreateWorldModalProps, 'isOpen'>) {
  const [name, setName] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ name?: string; synopsis?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    worldService
      .getAllTags()
      .then((list) => {
        if (active) setTags([...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
      })
      .catch(() => toast.error('Não foi possível carregar as tags.'));
    return () => {
      active = false;
    };
  }, []);

  const toggleTag = (id: number) =>
    setTagIds((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.replace(/\s+/g, ' ').trim();
    const cleanSynopsis = synopsis.trim();

    const found: { name?: string; synopsis?: string } = {};
    if (!cleanName) found.name = 'Informe o nome do mundo.';
    if (!cleanSynopsis) found.synopsis = 'Escreva uma sinopse breve.';
    setErrors(found);
    if (found.name || found.synopsis) return;

    setSaving(true);
    try {
      await worldService.createWorld({ name: cleanName, synopsis: cleanSynopsis, is_demo: isPublic, tag_ids: tagIds });
      toast.success('Mundo criado');
      onSuccess();
      onClose();
    } catch {
      toast.error('Não foi possível criar o mundo. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        label="Nome do mundo"
        required
        maxLength={100}
        autoFocus
        value={name}
        error={errors.name}
        onChange={(e) => setName(e.target.value)}
      />
      <Textarea
        label="Sinopse breve"
        required
        rows={3}
        value={synopsis}
        error={errors.synopsis}
        onChange={(e) => setSynopsis(e.target.value)}
      />

      {tags.length > 0 && (
        <fieldset>
          <legend className="mb-2 flex items-center gap-1.5 text-sm font-medium text-rpg-muted">
            <TagIcon size={14} aria-hidden="true" /> Gêneros e tags
          </legend>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const on = tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'min-h-8 rounded border px-3 py-1 text-xs font-bold transition-colors',
                    on
                      ? 'border-rpg-secondary bg-rpg-secondary/20 text-rpg-secondary'
                      : 'border-gray-700 bg-rpg-bg text-rpg-muted hover:border-gray-500',
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-800 p-3 transition-colors hover:bg-gray-800/50">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-rpg-primary"
        />
        <span>
          <span className="block text-sm font-medium text-white">Mundo público (demo)</span>
          <span className="block text-xs text-rpg-subtle">
            Visitantes poderão ver este mundo sem fazer login. Os segredos do mestre ficam ocultos para eles.
          </span>
        </span>
      </label>

      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Criar mundo
        </Button>
      </div>
    </form>
  );
}

export default function CreateWorldModal({ isOpen, onClose, onSuccess }: CreateWorldModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Novo mundo"
      icon={<Sparkles size={20} className="text-rpg-primary" aria-hidden="true" />}
    >
      <CreateForm onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}