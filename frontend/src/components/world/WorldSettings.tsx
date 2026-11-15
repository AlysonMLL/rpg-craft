/**
 * Função do Arquivo: Botão "Configurações" no canto superior direito da capa do mundo e o modal
 * "Configurações do mundo": renomear (nome e sinopse) e a "zona de perigo" para excluir o mundo.
 * Excluir apaga TUDO que está dentro (personagens, raças, criaturas, documentos, linha do tempo,
 * missões) e não tem "Desfazer"; por isso exige digitar o nome do mundo.
 *
 * O que há aqui:
 * - WorldSettings: botão + modal (props: world, onSaved). onSaved recebe o mundo atualizado.
 * - SettingsForm (interno): formulário de nome/sinopse e a confirmação de exclusão. Fica dentro
 *   do Modal, então reinicia a cada abertura. Depois de excluir, volta para a Home.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Trash2 } from 'lucide-react';
import { worldService, type World } from '../../api/worlds';
import { normalizeText } from '../../lib/entityUtils';
import { Button, Input, Modal, Textarea, toast } from '../ui';

interface WorldSettingsProps {
  world: World;
  onSaved: (world: World) => void;
}

interface SettingsFormProps extends WorldSettingsProps {
  onClose: () => void;
}

function SettingsForm({ world, onSaved, onClose }: SettingsFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(world.name);
  const [synopsis, setSynopsis] = useState(world.synopsis ?? '');
  const [nameError, setNameError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const cleanName = name.replace(/\s+/g, ' ').trim();
  const unchanged = cleanName === world.name && synopsis.trim() === (world.synopsis ?? '').trim();
  const canDelete = normalizeText(confirmation) === normalizeText(world.name);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!cleanName) {
      setNameError('Informe o nome do mundo.');
      return;
    }
    setNameError(undefined);
    setSaving(true);
    try {
      const updated = await worldService.updateWorld(world.id, { name: cleanName, synopsis: synopsis.trim() });
      onSaved(updated);
      toast.success('Mundo salvo');
      onClose();
    } catch {
      toast.error('Não foi possível salvar o mundo. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await worldService.deleteWorld(world.id);
      toast.success('Mundo excluído');
      navigate('/', { replace: true });
    } catch {
      toast.error('Não foi possível excluir o mundo. Tente de novo.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} noValidate className="space-y-4">
        <Input
          label="Nome do mundo"
          required
          maxLength={100}
          value={name}
          error={nameError}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          label="Sinopse breve"
          rows={3}
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} disabled={unchanged}>
            Salvar mundo
          </Button>
        </div>
      </form>

      <section aria-labelledby="zona-perigo" className="space-y-3 rounded-lg border border-red-400/30 bg-red-400/5 p-4">
        <h3 id="zona-perigo" className="text-sm font-bold text-rpg-danger">
          Zona de perigo
        </h3>
        <p className="text-sm text-gray-300">
          Excluir este mundo apaga <strong className="text-white">para sempre</strong> todos os personagens,
          raças, criaturas, documentos, a linha do tempo e as missões dele. Não há como desfazer.
          {world.is_demo && ' Como o mundo é público, os visitantes também perdem o acesso a ele.'}
        </p>
        <Input
          label={`Digite "${world.name}" para confirmar`}
          value={confirmation}
          autoComplete="off"
          onChange={(e) => setConfirmation(e.target.value)}
        />
        <Button
          variant="danger"
          loading={deleting}
          disabled={!canDelete}
          leftIcon={<Trash2 size={14} aria-hidden="true" />}
          onClick={() => void handleDelete()}
        >
          Excluir mundo
        </Button>
      </section>
    </div>
  );
}

export function WorldSettings({ world, onSaved }: WorldSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mesmo visual do "Voltar" e do "Alterar capa" (sobre a imagem) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-black/40 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:border-gray-500 hover:text-white"
      >
        <Settings size={16} aria-hidden="true" />
        Configurações
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Configurações do mundo"
        icon={<Settings size={20} className="text-rpg-primary" aria-hidden="true" />}
      >
        <SettingsForm world={world} onSaved={onSaved} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}