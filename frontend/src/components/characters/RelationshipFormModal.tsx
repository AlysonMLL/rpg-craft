/**
 * Função do Arquivo: Modal para criar ou editar uma relação: personagem de origem e de destino,
 * tipo, texto nos dois sentidos ("pai de" / "filho de") e se vale nos dois sentidos. Ao editar,
 * mostra também o botão "Excluir relação" (a confirmação é do RelationsTab). O formulário fica
 * num componente interno para reiniciar a cada abertura.
 *
 * O que há aqui:
 * - RelationshipFormModal: o modal (props: open, worldId, characters, relationship, defaultSource,
 *   onClose, onSaved, onDelete). relationship = null cria; com valor, edita.
 * - RelationshipForm (interno): estado, validação, envio e toast ("Relação criada/atualizada").
 * - apiMessage() (interno): pega a primeira mensagem de erro que a API devolveu.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Network } from 'lucide-react';
import type { CharacterListItem } from '../../api/characters';
import {
  relationshipService,
  type Relationship,
  type RelationshipKind,
} from '../../api/relationships';
import { KIND_META, KIND_ORDER } from '../../lib/relationshipUtils';
import { Button, Input, Modal, Select, Toggle, toast } from '../ui';

interface RelationshipFormModalProps {
  open: boolean;
  worldId: number;
  characters: CharacterListItem[];
  relationship: Relationship | null;
  /** Origem pré-selecionada ao criar (ex.: o personagem em foco). */
  defaultSource: number | null;
  onClose: () => void;
  onSaved: (relationship: Relationship) => void;
  onDelete: (relationship: Relationship) => void;
}

const KIND_OPTIONS = KIND_ORDER.map((value) => ({ value, label: KIND_META[value].label }));

function apiMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const data: unknown = error.response?.data;
  if (!data || typeof data !== 'object') return null;
  for (const key of ['kind', 'target', 'source', 'non_field_errors', 'detail']) {
    const value = (data as Record<string, unknown>)[key];
    const text = Array.isArray(value) ? value[0] : value;
    if (typeof text === 'string') return text;
  }
  return null;
}

function RelationshipForm({
  worldId,
  characters,
  relationship,
  defaultSource,
  onClose,
  onSaved,
  onDelete,
}: Omit<RelationshipFormModalProps, 'open'>) {
  const [source, setSource] = useState(String(relationship?.source ?? defaultSource ?? ''));
  const [target, setTarget] = useState(relationship ? String(relationship.target) : '');
  const [kind, setKind] = useState<RelationshipKind>(relationship?.kind ?? 'family');
  const [label, setLabel] = useState(relationship?.label ?? '');
  const [reverseLabel, setReverseLabel] = useState(relationship?.reverse_label ?? '');
  const [isMutual, setIsMutual] = useState(relationship?.is_mutual ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const options = [
    { value: '', label: 'Escolha um personagem…' },
    ...[...characters]
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .map((character) => ({ value: character.id, label: character.name })),
  ];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!source || !target) {
      setError('Escolha os dois personagens.');
      return;
    }
    if (source === target) {
      setError('Escolha dois personagens diferentes.');
      return;
    }
    setError('');
    setSaving(true);
    const data = {
      source: Number(source),
      target: Number(target),
      kind,
      label: label.trim(),
      reverse_label: reverseLabel.trim(),
      is_mutual: isMutual,
    };
    try {
      const saved = relationship
        ? await relationshipService.update(relationship.id, data)
        : await relationshipService.create({ ...data, world: worldId });
      toast.success(relationship ? 'Relação atualizada' : 'Relação criada');
      onSaved(saved);
      onClose();
    } catch (failure) {
      setError(apiMessage(failure) ?? 'Não foi possível salvar a relação. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Personagem de origem" required value={source} onChange={(e) => setSource(e.target.value)} options={options} />
        <Select label="Personagem de destino" required value={target} onChange={(e) => setTarget(e.target.value)} options={options} />
      </div>

      <Select
        label="Tipo"
        value={kind}
        onChange={(e) => setKind(e.target.value as RelationshipKind)}
        options={KIND_OPTIONS}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Da origem para o destino"
          maxLength={60}
          placeholder="Ex.: pai de"
          hint="Opcional. Sem texto, mostra o nome do tipo."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Input
          label="Do destino para a origem"
          maxLength={60}
          placeholder="Ex.: filho de"
          value={reverseLabel}
          onChange={(e) => setReverseLabel(e.target.value)}
        />
      </div>

      <div>
        <Toggle checked={isMutual} onChange={setIsMutual} label="Vale nos dois sentidos" />
        <p className="mt-1.5 text-xs text-rpg-muted">
          Desligado, o grafo desenha uma seta da origem para o destino.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rpg-danger">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-gray-800 pt-4">
        <div>
          {relationship && (
            <Button variant="ghost" onClick={() => onDelete(relationship)}>
              Excluir relação
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {relationship ? 'Salvar relação' : 'Criar relação'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function RelationshipFormModal({ open, onClose, ...rest }: RelationshipFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={rest.relationship ? 'Editar relação' : 'Nova relação'}
      icon={<Network size={20} className="text-rpg-primary" aria-hidden="true" />}
    >
      <RelationshipForm onClose={onClose} {...rest} />
    </Modal>
  );
}