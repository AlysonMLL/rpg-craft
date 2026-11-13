/**
 * Função do Arquivo: Botão "Alterar capa" no canto superior direito da capa do mundo e o modal
 * "Capa do mundo". O dono cola o endereço (URL) de uma imagem, confere a prévia no formato da
 * capa (com o nome do mundo) e salva. "Remover capa" volta ao gradiente do nome e mostra o
 * toast "Desfazer". O upload de arquivo entra depois, nos extras. Só renderize para o dono
 * (a capa decide).
 *
 * O que há aqui:
 * - WorldCoverEditor: botão + modal (props: world, onSaved). onSaved recebe o mundo atualizado.
 * - CoverForm (interno): campo de URL, prévia, validação, salvar e remover. Fica dentro do
 *   Modal, então reinicia a cada abertura.
 */

import { useState } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { worldService, type World } from '../../api/worlds';
import { coverGradient } from '../../lib/worldUtils';
import { Button, Input, Modal, toast } from '../ui';

interface WorldCoverEditorProps {
  world: World;
  onSaved: (world: World) => void;
}

interface CoverFormProps extends WorldCoverEditorProps {
  onClose: () => void;
}

function CoverForm({ world, onSaved, onClose }: CoverFormProps) {
  const [url, setUrl] = useState(world.cover_image ?? '');
  const [failedUrl, setFailedUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const trimmed = url.trim();
  const invalid = trimmed !== '' && !/^https?:\/\/\S+$/i.test(trimmed);
  const previewUrl = trimmed !== '' && !invalid ? trimmed : '';
  const previewFailed = previewUrl !== '' && failedUrl === previewUrl;
  const unchanged = trimmed === (world.cover_image ?? '');

  const save = async () => {
    setSaving(true);
    try {
      const updated = await worldService.updateWorld(world.id, { cover_image: trimmed });
      onSaved(updated);
      toast.success('Capa salva');
      onClose();
    } catch {
      toast.error('Não foi possível salvar a capa. Confira o endereço e tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const previous = world.cover_image;
    setSaving(true);
    try {
      const updated = await worldService.updateWorld(world.id, { cover_image: null });
      onSaved(updated);
      onClose();
      toast('Capa removida', {
        action: {
          label: 'Desfazer',
          onClick: async () => {
            try {
              onSaved(await worldService.updateWorld(world.id, { cover_image: previous }));
            } catch {
              toast.error('Não foi possível desfazer.');
            }
          },
        },
      });
    } catch {
      toast.error('Não foi possível remover a capa. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Input
        label="Endereço da imagem (URL)"
        type="url"
        inputMode="url"
        maxLength={500}
        placeholder="https://…"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        error={invalid ? 'Use um endereço que comece com http:// ou https://.' : undefined}
        hint="Use o link direto da imagem (.jpg, .png, .webp…). Imagens largas ficam melhores: a capa ocupa a largura toda."
      />

      <div>
        <p className="mb-2 text-sm font-medium text-rpg-muted">Prévia</p>
        <div className="relative h-36 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
          {previewUrl !== '' && !previewFailed ? (
            <img
              src={previewUrl}
              alt=""
              onError={() => setFailedUrl(previewUrl)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: coverGradient(world.name) }}
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-rpg-bg via-rpg-bg/60 to-transparent"
          />
          <p className="absolute bottom-3 left-4 right-4 truncate text-2xl font-extrabold text-white drop-shadow-lg">
            {world.name}
          </p>
        </div>
        {previewFailed && (
          <p role="alert" className="mt-2 text-sm text-rpg-danger">
            Não foi possível carregar essa imagem. Confira o link ou tente outro site.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-4">
        {world.cover_image ? (
          <Button
            variant="ghost"
            disabled={saving}
            leftIcon={<Trash2 size={14} aria-hidden="true" />}
            onClick={() => void remove()}
          >
            Remover capa
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            loading={saving}
            disabled={trimmed === '' || invalid || previewFailed || unchanged}
            onClick={() => void save()}
          >
            Salvar capa
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WorldCoverEditor({ world, onSaved }: WorldCoverEditorProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mesmo visual do "Voltar" (sobre a imagem, precisa de fundo escuro para ler) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-black/40 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:border-gray-500 hover:text-white"
      >
        <ImageIcon size={16} aria-hidden="true" />
        {world.cover_image ? 'Alterar capa' : 'Adicionar capa'}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Capa do mundo"
        icon={<ImageIcon size={20} className="text-rpg-primary" aria-hidden="true" />}
      >
        <CoverForm world={world} onSaved={onSaved} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}