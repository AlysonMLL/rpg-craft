/**
 * Função do Arquivo: Gaveta da ficha do personagem (aberta por ?personagem=ID). Busca a ficha
 * completa ao abrir e mostra: retrato no topo com o campo da URL logo abaixo, nome e status,
 * e as abas Ficha rápida | Ficha completa (a completa chega na parte 3; a gaveta alarga nela).
 * A ficha rápida é editável inline para o dono (atualização otimista, com volta atrás e toast
 * se a API falhar); convidado só lê. Favoritar e excluir ficam no cabeçalho.
 *
 * O que há ali:
 * - CharacterDrawer: componente (props: characterId, worldId, canEdit, characters, onClose,
 *   onUpdated, onDelete). Mantém o último id para o conteúdo não sumir durante a animação de
 *   fechar, e trata carregando / erro / personagem de outro mundo.
 * - QuickSheet (interno): seções Identidade, Aparência e voz, Narrativa, Itens e habilidades,
 *   Segredos.
 * - Section / Field (internos): título de seção e linha "rótulo + valor".
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Star, Trash2 } from 'lucide-react';
import {
  characterService,
  type Character,
  type CharacterListItem,
  type CharacterStatus,
  type CharacterUpdateData,
} from '../../api/characters';
import { STATUS_META, STATUS_ORDER, collectTags, toListItem } from '../../lib/characterUtils';
import {
  Badge,
  Drawer,
  EmptyState,
  InlineNumber,
  InlineSelect,
  InlineTags,
  InlineText,
  InlineTextarea,
  Skeleton,
  TabPanel,
  Tabs,
  toast,
} from '../ui';
import { CharacterPortrait } from './CharacterPortrait';
import { CharacterSecrets } from './CharacterSecrets';

const FIELD = 'block px-2 py-1 text-sm text-gray-200';
const STATUS_OPTIONS = STATUS_ORDER.map((value) => ({ value, label: STATUS_META[value].label }));

type TextField = 'age' | 'gender' | 'race' | 'height' | 'role' | 'origin';
type TextareaField = 'appearance' | 'voice';
type TagField = 'classes' | 'organizations' | 'items' | 'skills';

// Monta o corpo do PATCH para um campo escolhido por nome (o TS não infere chave dinâmica)
const patchOf = (field: string, value: unknown) => ({ [field]: value }) as CharacterUpdateData;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 border-b border-gray-800 pb-2 text-sm font-bold text-white">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-start gap-x-3">
      <span className="pt-1 text-xs text-rpg-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

interface QuickSheetProps {
  character: Character;
  canEdit: boolean;
  characters: CharacterListItem[];
  save: (patch: CharacterUpdateData) => void;
}

function QuickSheet({ character, canEdit, characters, save }: QuickSheetProps) {
  const textField = (field: TextField, label: string, maxLength: number) => (
    <Field label={label}>
      <InlineText
        value={character[field]}
        allowEmpty
        ariaLabel={label}
        maxLength={maxLength}
        placeholder="Não informado"
        disabled={!canEdit}
        className={FIELD}
        onSave={(value) => save(patchOf(field, value))}
      />
    </Field>
  );

  const textareaField = (field: TextareaField, label: string) => (
    <Field label={label}>
      <InlineTextarea
        value={character[field]}
        ariaLabel={label}
        disabled={!canEdit}
        className={FIELD}
        onSave={(value) => save(patchOf(field, value))}
      />
    </Field>
  );

  const tagField = (
    field: TagField,
    label: string,
    limits: { maxLength: number; maxTags: number },
    suggestions?: string[],
  ) => (
    <Field label={label}>
      <InlineTags
        value={character[field]}
        ariaLabel={label}
        disabled={!canEdit}
        suggestions={suggestions}
        maxLength={limits.maxLength}
        maxTags={limits.maxTags}
        className="px-2 py-1 text-sm text-gray-200"
        onSave={(value) => save(patchOf(field, value))}
      />
    </Field>
  );

  return (
    <div className="space-y-6">
      <Section title="Identidade">
        {textField('age', 'Idade', 40)}
        {textField('gender', 'Gênero', 40)}
        {textField('race', 'Raça', 60)}
        <Field label="Nível">
          <InlineNumber
            value={character.level}
            ariaLabel="Nível"
            disabled={!canEdit}
            className={FIELD}
            onSave={(level) => save({ level })}
          />
        </Field>
        {textField('height', 'Altura', 40)}
        {tagField('classes', 'Classes', { maxLength: 40, maxTags: 20 }, collectTags(characters, 'classes'))}
      </Section>

      <Section title="Aparência e voz">
        {textareaField('appearance', 'Aparência')}
        {textareaField('voice', 'Voz')}
      </Section>

      <Section title="Narrativa">
        {textField('role', 'Papel', 60)}
        {textField('origin', 'Origem', 160)}
        {tagField(
          'organizations',
          'Organizações',
          { maxLength: 60, maxTags: 20 },
          collectTags(characters, 'organizations'),
        )}
      </Section>

      <Section title="Itens e habilidades">
        {tagField('items', 'Itens', { maxLength: 80, maxTags: 60 })}
        {tagField('skills', 'Habilidades', { maxLength: 80, maxTags: 60 })}
      </Section>

      <Section title="Segredos">
        <CharacterSecrets
          value={character.secrets}
          canEdit={canEdit}
          onSave={(secrets) => save({ secrets })}
        />
      </Section>
    </div>
  );
}

interface CharacterDrawerProps {
  characterId: number | null;
  worldId: number;
  canEdit: boolean;
  /** Lista leve do mundo: só para sugerir classes e organizações já usadas. */
  characters: CharacterListItem[];
  onClose: () => void;
  onUpdated: (character: Character) => void;
  onDelete: (character: CharacterListItem) => void;
}

export function CharacterDrawer({
  characterId,
  worldId,
  canEdit,
  characters,
  onClose,
  onUpdated,
  onDelete,
}: CharacterDrawerProps) {
  // Guarda o último id aberto: durante a animação de fechar o conteúdo continua montado
  const [lastId, setLastId] = useState<number | null>(characterId);
  const [character, setCharacter] = useState<Character | null>(null);
  const [failedId, setFailedId] = useState<number | null>(null);
  const [tab, setTab] = useState('rapida');

  if (characterId !== null && characterId !== lastId) {
    setLastId(characterId);
    setTab('rapida');
  }

  useEffect(() => {
    if (characterId === null) return;
    let active = true;
    setFailedId(null);
    characterService
      .get(characterId)
      .then((loaded) => {
        if (!active) return;
        if (loaded.world !== worldId) setFailedId(characterId);
        else setCharacter(loaded);
      })
      .catch(() => {
        if (active) setFailedId(characterId);
      });
    return () => {
      active = false;
    };
  }, [characterId, worldId]);

  const current = character && character.id === lastId ? character : null;

  const save = async (patch: CharacterUpdateData) => {
    if (!current) return;
    const previous = current;
    setCharacter({ ...current, ...patch });
    try {
      const updated = await characterService.update(current.id, patch);
      setCharacter(updated);
      onUpdated(updated);
    } catch {
      setCharacter(previous);
      toast.error('Não foi possível salvar. Tente de novo.');
    }
  };

  const saveUrl = (value: string) => {
    if (value && !/^https?:\/\//i.test(value)) {
      toast.error('Use um endereço que comece com http:// ou https://.');
      return;
    }
    void save({ portrait_url: value });
  };

  const headerActions = canEdit && current && (
    <>
      <button
        type="button"
        aria-pressed={current.is_favorite}
        aria-label={current.is_favorite ? 'Remover dos favoritos' : 'Favoritar'}
        onClick={() => void save({ is_favorite: !current.is_favorite })}
        className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-rpg-primary"
      >
        <Star
          size={20}
          aria-hidden="true"
          className={current.is_favorite ? 'fill-rpg-primary text-rpg-primary' : ''}
        />
      </button>
      <button
        type="button"
        aria-label="Excluir personagem"
        onClick={() => onDelete(toListItem(current))}
        className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-rpg-danger"
      >
        <Trash2 size={20} aria-hidden="true" />
      </button>
    </>
  );

  return (
    <Drawer
      open={characterId !== null}
      onClose={onClose}
      title="Ficha do personagem"
      headerActions={headerActions}
      width={tab === 'completa' ? 'xl' : 'lg'}
    >
      {current ? (
        <div className="space-y-6">
          <div>
            <CharacterPortrait name={current.name} url={current.portrait_url} className="h-72 w-full rounded-xl" />
            <div className="mt-2">
              <span className="px-2 text-xs text-rpg-muted">Endereço do retrato</span>
              <InlineText
                value={current.portrait_url}
                allowEmpty
                ariaLabel="Endereço do retrato"
                maxLength={500}
                placeholder="Cole o endereço da imagem (https://…)"
                disabled={!canEdit}
                className="block truncate px-2 py-1 text-xs text-gray-200"
                onSave={saveUrl}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <InlineText
                value={current.name}
                ariaLabel="Nome"
                maxLength={120}
                disabled={!canEdit}
                className="block break-words px-2 py-1 text-2xl font-bold text-white"
                onSave={(name) => void save({ name })}
              />
            </div>
            <InlineSelect<CharacterStatus>
              value={current.status}
              options={STATUS_OPTIONS}
              ariaLabel="Status"
              disabled={!canEdit}
              renderValue={(option) => (
                <Badge variant={STATUS_META[option.value].variant}>{option.label}</Badge>
              )}
              onSave={(status) => void save({ status })}
            />
          </div>

          <Tabs
            idPrefix="char-sheet"
            ariaLabel="Seções da ficha"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'rapida', label: 'Ficha rápida' },
              { value: 'completa', label: 'Ficha completa' },
            ]}
          />

          <TabPanel idPrefix="char-sheet" value="rapida" current={tab}>
            <QuickSheet
              character={current}
              canEdit={canEdit}
              characters={characters}
              save={(patch) => void save(patch)}
            />
          </TabPanel>

          <TabPanel idPrefix="char-sheet" value="completa" current={tab}>
            <EmptyState
              title="Ficha completa em breve"
              description="Aqui ficará a ficha em Markdown, com editor, e os documentos do personagem."
            />
          </TabPanel>
        </div>
      ) : failedId === lastId && lastId !== null ? (
        <EmptyState
          title="Personagem não encontrado"
          description="Ele pode ter sido excluído ou não pertence a este mundo."
        />
      ) : (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}
    </Drawer>
  );
}