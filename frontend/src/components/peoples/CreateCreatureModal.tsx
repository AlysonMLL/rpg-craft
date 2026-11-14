/**
 * Função do Arquivo: Modal "Nova criatura" com todos os campos, em seções (Identificação, Visão
 * geral, Características). Só o nome é obrigatório. Valida a URL (http/https), os níveis
 * (inteiros de 0 a 999, mínimo não maior que o máximo) e envia. O formulário fica num componente
 * interno para reiniciar a cada abertura.
 *
 * O que há ali:
 * - CreateCreatureModal: o modal (props: open, worldId, creatures, onClose, onCreated).
 * - CreateForm (interno): estado, validação, envio e toast "Criatura criada".
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { PawPrint } from 'lucide-react';
import {
  creatureService,
  type Creature,
  type CreatureListItem,
  type DangerLevel,
} from '../../api/peoples';
import { DANGER_META, DANGER_ORDER, collectCommonIn } from '../../lib/peoplesUtils';
import { Button, Input, Modal, Select, TagInput, Textarea, toast } from '../ui';
import { FormSection } from './SheetBits';

interface CreateCreatureModalProps {
  open: boolean;
  worldId: number;
  creatures: CreatureListItem[];
  onClose: () => void;
  onCreated: (creature: Creature) => void;
}

interface FormState {
  name: string;
  image_url: string;
  summary: string;
  danger: string;
  level_min: string;
  level_max: string;
  common_in: string[];
  traits: string;
}

interface FormErrors {
  name?: string;
  image_url?: string;
  level_min?: string;
  level_max?: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  image_url: '',
  summary: '',
  danger: '0',
  level_min: '',
  level_max: '',
  common_in: [],
  traits: '',
};

const DANGER_OPTIONS = DANGER_ORDER.map((level) => ({ value: String(level), label: DANGER_META[level].label }));

function parseLevel(text: string): number | null {
  const trimmed = text.trim();
  return trimmed === '' ? null : Number(trimmed);
}

const validLevel = (level: number | null) =>
  level === null || (Number.isInteger(level) && level >= 0 && level <= 999);

function CreateForm({ worldId, creatures, onClose, onCreated }: Omit<CreateCreatureModalProps, 'open'>) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const imageUrl = form.image_url.trim();
    const levelMin = parseLevel(form.level_min);
    const levelMax = parseLevel(form.level_max);

    const found: FormErrors = {};
    if (!name) found.name = 'Informe o nome da criatura.';
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      found.image_url = 'Use um endereço que comece com http:// ou https://.';
    }
    if (!validLevel(levelMin)) found.level_min = 'Use um número inteiro de 0 a 999.';
    if (!validLevel(levelMax)) found.level_max = 'Use um número inteiro de 0 a 999.';
    if (!found.level_min && !found.level_max && levelMin !== null && levelMax !== null && levelMin > levelMax) {
      found.level_max = 'O nível máximo deve ser igual ou maior que o mínimo.';
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const created = await creatureService.create({
        world: worldId,
        name,
        image_url: imageUrl,
        summary: form.summary.trim(),
        danger_level: Number(form.danger) as DangerLevel,
        level_min: levelMin,
        level_max: levelMax,
        common_in: form.common_in,
        traits: form.traits.trim(),
      });
      toast.success('Criatura criada');
      onCreated(created);
      onClose();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.image_url) {
        setErrors({ image_url: 'Endereço de imagem inválido.' });
      } else {
        toast.error('Não foi possível criar a criatura. Tente de novo.');
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
          hint="Opcional. Funciona melhor com imagens largas (o card mostra um banner)."
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
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Perigo"
            value={form.danger}
            onChange={(e) => set('danger', e.target.value)}
            options={DANGER_OPTIONS}
          />
          <Input
            label="Nível mínimo"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={form.level_min}
            error={errors.level_min}
            onChange={(e) => set('level_min', e.target.value)}
          />
          <Input
            label="Nível máximo"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={form.level_max}
            error={errors.level_max}
            onChange={(e) => set('level_max', e.target.value)}
          />
        </div>
        <TagInput
          label="Comum em"
          value={form.common_in}
          onChange={(common_in) => set('common_in', common_in)}
          suggestions={collectCommonIn(creatures)}
          maxLength={60}
          maxTags={20}
        />
      </FormSection>

      <FormSection title="Características">
        <Textarea label="Descrição" rows={4} value={form.traits} onChange={(e) => set('traits', e.target.value)} />
      </FormSection>

      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-3 border-t border-gray-800 bg-rpg-card p-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Criar criatura
        </Button>
      </div>
    </form>
  );
}

export function CreateCreatureModal({ open, worldId, creatures, onClose, onCreated }: CreateCreatureModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Nova criatura"
      icon={<PawPrint size={20} className="text-rpg-primary" aria-hidden="true" />}
    >
      <CreateForm worldId={worldId} creatures={creatures} onClose={onClose} onCreated={onCreated} />
    </Modal>
  );
}