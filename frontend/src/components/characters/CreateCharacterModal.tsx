/**
 * Função do Arquivo: Modal "Novo personagem" com TODOS os campos da ficha, em seções
 * (Identificação, Identidade, Narrativa, Aparência e voz, Itens e habilidades, Segredos,
 * Ficha completa). Só o nome é obrigatório. O formulário fica num componente interno para
 * reiniciar a cada abertura; os botões ficam fixos no rodapé enquanto o formulário rola.
 *
 * O que há ali:
 * - CreateCharacterModal: o modal (props: open, worldId, characters, onClose, onCreated).
 *   `characters` serve só para sugerir raças, papéis, classes e organizações já usados.
 * - FormSection (interno): título de seção.
 * - CreateForm (interno): estado do formulário, validação (nome; URL http/https; nível
 *   inteiro de 0 a 999), envio e toast "Personagem criado".
 */

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { Users } from 'lucide-react';
import { characterService, type Character, type CharacterListItem, type CharacterStatus } from '../../api/characters';
import { STATUS_META, STATUS_ORDER, collectTags, collectValues } from '../../lib/characterUtils';
import { MarkdownEditor } from '../markdown/MarkdownEditor';
import { Button, Input, Modal, Select, TagInput, Textarea, toast } from '../ui';

interface CreateCharacterModalProps {
  open: boolean;
  worldId: number;
  characters: CharacterListItem[];
  onClose: () => void;
  onCreated: (character: Character) => void;
}

interface FormState {
  name: string;
  portrait_url: string;
  status: CharacterStatus;
  age: string;
  gender: string;
  race: string;
  level: string;
  height: string;
  classes: string[];
  role: string;
  origin: string;
  organizations: string[];
  appearance: string;
  voice: string;
  items: string[];
  skills: string[];
  secrets: string;
  sheet_markdown: string;
}

interface FormErrors {
  name?: string;
  portrait_url?: string;
  level?: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  portrait_url: '',
  status: 'alive',
  age: '',
  gender: '',
  race: '',
  level: '',
  height: '',
  classes: [],
  role: '',
  origin: '',
  organizations: [],
  appearance: '',
  voice: '',
  items: [],
  skills: [],
  secrets: '',
  sheet_markdown: '',
};

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="border-b border-gray-800 pb-2 text-sm font-bold text-white">{title}</h3>
      {children}
    </section>
  );
}

function CreateForm({
  worldId,
  characters,
  onClose,
  onCreated,
}: Omit<CreateCharacterModalProps, 'open'>) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const portraitUrl = form.portrait_url.trim();
    const levelText = form.level.trim();
    const level = levelText === '' ? null : Number(levelText);

    const found: FormErrors = {};
    if (!name) found.name = 'Informe o nome do personagem.';
    if (portraitUrl && !/^https?:\/\//i.test(portraitUrl)) {
      found.portrait_url = 'Use um endereço que comece com http:// ou https://.';
    }
    if (level !== null && (!Number.isInteger(level) || level < 0 || level > 999)) {
      found.level = 'Use um número inteiro de 0 a 999.';
    }
    setErrors(found);
    if (found.name || found.portrait_url || found.level) return;

    setSaving(true);
    try {
      const created = await characterService.create({
        world: worldId,
        name,
        portrait_url: portraitUrl,
        status: form.status,
        age: form.age.trim(),
        gender: form.gender.trim(),
        race: form.race.trim(),
        level,
        height: form.height.trim(),
        classes: form.classes,
        role: form.role.trim(),
        origin: form.origin.trim(),
        organizations: form.organizations,
        appearance: form.appearance.trim(),
        voice: form.voice.trim(),
        items: form.items,
        skills: form.skills,
        secrets: form.secrets.trim(),
        sheet_markdown: form.sheet_markdown,
      });
      toast.success('Personagem criado');
      onCreated(created);
      onClose();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.portrait_url) {
        setErrors({ portrait_url: 'Endereço de imagem inválido.' });
      } else {
        toast.error('Não foi possível criar o personagem. Tente de novo.');
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
          label="Retrato (endereço da imagem)"
          type="url"
          maxLength={500}
          placeholder="https://…"
          hint="Opcional. Sem imagem, o card mostra as iniciais."
          value={form.portrait_url}
          error={errors.portrait_url}
          onChange={(e) => set('portrait_url', e.target.value)}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => set('status', e.target.value as CharacterStatus)}
          options={STATUS_ORDER.map((value) => ({ value, label: STATUS_META[value].label }))}
        />
      </FormSection>

      <FormSection title="Identidade">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Idade" maxLength={40} value={form.age} onChange={(e) => set('age', e.target.value)} />
          <Input label="Gênero" maxLength={40} value={form.gender} onChange={(e) => set('gender', e.target.value)} />
          <Input
            label="Raça"
            maxLength={60}
            list="character-races"
            value={form.race}
            onChange={(e) => set('race', e.target.value)}
          />
          <Input
            label="Nível"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={form.level}
            error={errors.level}
            onChange={(e) => set('level', e.target.value)}
          />
          <Input
            label="Altura"
            maxLength={40}
            placeholder="Ex.: 1,80 m"
            value={form.height}
            onChange={(e) => set('height', e.target.value)}
          />
        </div>
        <datalist id="character-races">
          {collectValues(characters, 'race').map((race) => (
            <option key={race} value={race} />
          ))}
        </datalist>
        <TagInput
          label="Classes"
          value={form.classes}
          onChange={(classes) => set('classes', classes)}
          suggestions={collectTags(characters, 'classes')}
          maxLength={40}
          maxTags={20}
        />
      </FormSection>

      <FormSection title="Narrativa">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Papel"
            maxLength={60}
            list="character-roles"
            placeholder="Ex.: Mentor, Vilã principal"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
          />
          <Input
            label="Origem"
            maxLength={160}
            value={form.origin}
            onChange={(e) => set('origin', e.target.value)}
          />
        </div>
        <datalist id="character-roles">
          {collectValues(characters, 'role').map((role) => (
            <option key={role} value={role} />
          ))}
        </datalist>
        <TagInput
          label="Organizações"
          value={form.organizations}
          onChange={(organizations) => set('organizations', organizations)}
          suggestions={collectTags(characters, 'organizations')}
          maxLength={60}
          maxTags={20}
        />
      </FormSection>

      <FormSection title="Aparência e voz">
        <Textarea
          label="Aparência"
          rows={3}
          value={form.appearance}
          onChange={(e) => set('appearance', e.target.value)}
        />
        <Textarea label="Voz" rows={2} value={form.voice} onChange={(e) => set('voice', e.target.value)} />
      </FormSection>

      <FormSection title="Itens e habilidades">
        <TagInput
          label="Itens"
          value={form.items}
          onChange={(items) => set('items', items)}
          maxLength={80}
          maxTags={60}
        />
        <TagInput
          label="Habilidades"
          value={form.skills}
          onChange={(skills) => set('skills', skills)}
          maxLength={80}
          maxTags={60}
        />
      </FormSection>

      <FormSection title="Segredos">
        <Textarea
          label="Segredos (só do mestre)"
          rows={3}
          hint="Na ficha, este campo fica borrado até você revelar."
          value={form.secrets}
          onChange={(e) => set('secrets', e.target.value)}
        />
      </FormSection>

      <FormSection title="Ficha completa">
        <div>
          <p className="mb-1.5 text-sm font-medium text-rpg-muted">Ficha em Markdown</p>
          <div className="h-72">
            <MarkdownEditor
              value={form.sheet_markdown}
              onChange={(value) => set('sheet_markdown', value)}
              ariaLabel="Ficha completa em Markdown"
              placeholder="História, personalidade, anotações de campanha… (Markdown)"
            />
          </div>
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-3 border-t border-gray-800 bg-rpg-card p-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Criar personagem
        </Button>
      </div>
    </form>
  );
}

export function CreateCharacterModal({
  open,
  worldId,
  characters,
  onClose,
  onCreated,
}: CreateCharacterModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Novo personagem"
      icon={<Users size={20} className="text-rpg-primary" aria-hidden="true" />}
    >
      <CreateForm worldId={worldId} characters={characters} onClose={onClose} onCreated={onCreated} />
    </Modal>
  );
}