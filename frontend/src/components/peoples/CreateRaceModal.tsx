/**
 * Função do Arquivo: Modal "Nova raça" com todos os campos, em seções (Identificação, Visão
 * geral, Características e cultura). Só o nome é obrigatório. O formulário fica num componente
 * interno para reiniciar a cada abertura; os botões ficam fixos no rodapé enquanto rola.
 *
 * O que há ali:
 * - CreateRaceModal: o modal (props: open, worldId, races, onClose, onCreated). `races` serve só
 *   para sugerir lugares de "Comum em".
 * - CreateForm (interno): estado, validação (nome; URL http/https), envio e toast "Raça criada".
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Dna } from 'lucide-react';
import { raceService, type Race, type RaceListItem } from '../../api/peoples';
import { collectCommonIn } from '../../lib/peoplesUtils';
import { Button, Input, Modal, TagInput, Textarea, toast } from '../ui';
import { FormSection } from './SheetBits';

interface CreateRaceModalProps {
  open: boolean;
  worldId: number;
  races: RaceListItem[];
  onClose: () => void;
  onCreated: (race: Race) => void;
}

interface FormState {
  name: string;
  image_url: string;
  summary: string;
  origin: string;
  life_expectancy: string;
  common_in: string[];
  traits: string;
  culture: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  image_url: '',
  summary: '',
  origin: '',
  life_expectancy: '',
  common_in: [],
  traits: '',
  culture: '',
};

function CreateForm({ worldId, races, onClose, onCreated }: Omit<CreateRaceModalProps, 'open'>) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<{ name?: string; image_url?: string }>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const imageUrl = form.image_url.trim();

    const found: { name?: string; image_url?: string } = {};
    if (!name) found.name = 'Informe o nome da raça.';
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      found.image_url = 'Use um endereço que comece com http:// ou https://.';
    }
    setErrors(found);
    if (found.name || found.image_url) return;

    setSaving(true);
    try {
      const created = await raceService.create({
        world: worldId,
        name,
        image_url: imageUrl,
        summary: form.summary.trim(),
        origin: form.origin.trim(),
        life_expectancy: form.life_expectancy.trim(),
        common_in: form.common_in,
        traits: form.traits.trim(),
        culture: form.culture.trim(),
      });
      toast.success('Raça criada');
      onCreated(created);
      onClose();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.image_url) {
        setErrors({ image_url: 'Endereço de imagem inválido.' });
      } else {
        toast.error('Não foi possível criar a raça. Tente de novo.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <FormSection title="Identificação">
        <Input
          label="Nome"
          required
          maxLength={120}
          autoFocus
          value={form.name}
          error={errors.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <Input
          label="Imagem (endereço)"
          type="url"
          maxLength={500}
          placeholder="https://…"
          hint="Opcional. Sem imagem, o card mostra as iniciais."
          value={form.image_url}
          error={errors.image_url}
          onChange={(e) => set('image_url', e.target.value)}
        />
      </FormSection>

      <FormSection title="Visão geral">
        <Input
          label="Resumo"
          maxLength={300}
          hint="Uma frase; aparece no card."
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Origem" maxLength={160} value={form.origin} onChange={(e) => set('origin', e.target.value)} />
          <Input
            label="Expectativa de vida"
            maxLength={60}
            placeholder="Ex.: ~300 anos"
            value={form.life_expectancy}
            onChange={(e) => set('life_expectancy', e.target.value)}
          />
        </div>
        <TagInput
          label="Comum em"
          value={form.common_in}
          onChange={(common_in) => set('common_in', common_in)}
          suggestions={collectCommonIn(races)}
          maxLength={60}
          maxTags={20}
        />
      </FormSection>

      <FormSection title="Características e cultura">
        <Textarea label="Características" rows={3} value={form.traits} onChange={(e) => set('traits', e.target.value)} />
        <Textarea label="Cultura" rows={3} value={form.culture} onChange={(e) => set('culture', e.target.value)} />
      </FormSection>

      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-3 border-t border-gray-800 bg-rpg-card p-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Criar raça
        </Button>
      </div>
    </form>
  );
}

export function CreateRaceModal({ open, worldId, races, onClose, onCreated }: CreateRaceModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Nova raça"
      icon={<Dna size={20} className="text-rpg-primary" aria-hidden="true" />}
    >
      <CreateForm worldId={worldId} races={races} onClose={onClose} onCreated={onCreated} />
    </Modal>
  );
}