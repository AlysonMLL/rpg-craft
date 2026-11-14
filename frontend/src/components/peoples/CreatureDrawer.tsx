/**
 * Função do Arquivo: Gaveta da criatura (aberta por ?criatura=ID). Busca a versão completa ao
 * abrir. Topo: banner 3:1 em largura total (tela cheia e "Enquadrar"), nome, perigo e endereço
 * da imagem. Depois, as seções editáveis inline (Visão geral; Características). Dono edita
 * (otimista, com volta atrás); convidado só lê. Favoritar e excluir ficam no cabeçalho.
 *
 * O que há ali:
 * - CreatureDrawer: componente (props: creatureId, worldId, canEdit, creatures, onClose,
 *   onUpdated, onDelete). `creatures` serve só para sugerir lugares de "Comum em".
 */

import { useState } from 'react';
import { Crop, Star, Trash2 } from 'lucide-react';
import {
  creatureService,
  type Creature,
  type CreatureListItem,
  type CreatureUpdateData,
  type DangerLevel,
} from '../../api/peoples';
import { useEntityRecord } from '../../hooks/useEntityRecord';
import {
  CREATURE_IMAGE_ASPECT,
  DANGER_META,
  DANGER_ORDER,
  collectCommonIn,
  toCreatureItem,
} from '../../lib/peoplesUtils';
import {
  Button,
  Drawer,
  EmptyState,
  EntityImage,
  ImageCropModal,
  InlineNumber,
  InlineSelect,
  InlineTags,
  InlineText,
  InlineTextarea,
  Skeleton,
  toast,
} from '../ui';
import { DangerBadge } from './DangerBadge';
import { FIELD, Field, Section } from './SheetBits';

const DANGER_OPTIONS = DANGER_ORDER.map((level) => ({
  value: String(level),
  label: DANGER_META[level].label,
}));

interface CreatureDrawerProps {
  creatureId: number | null;
  worldId: number;
  canEdit: boolean;
  creatures: CreatureListItem[];
  onClose: () => void;
  onUpdated: (creature: Creature) => void;
  onDelete: (creature: CreatureListItem) => void;
}

export function CreatureDrawer({
  creatureId,
  worldId,
  canEdit,
  creatures,
  onClose,
  onUpdated,
  onDelete,
}: CreatureDrawerProps) {
  const { current, failed, save } = useEntityRecord<Creature, CreatureUpdateData>({
    id: creatureId,
    worldId,
    service: creatureService,
    onUpdated,
  });
  const [cropping, setCropping] = useState(false);
  if (creatureId === null && cropping) setCropping(false);

  const saveUrl = (value: string) => {
    if (value && !/^https?:\/\//i.test(value)) {
      toast.error('Use um endereço que comece com http:// ou https://.');
      return;
    }
    void save({ image_url: value, image_crop: null });
  };

  const headerActions = current && canEdit && (
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
        aria-label="Excluir criatura"
        onClick={() => onDelete(toCreatureItem(current))}
        className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-rpg-danger"
      >
        <Trash2 size={20} aria-hidden="true" />
      </button>
    </>
  );

  return (
    <>
      <Drawer
        open={creatureId !== null}
        onClose={onClose}
        title="Criatura"
        headerActions={headerActions}
        resizable={{ storageKey: 'rpgcraft:drawer-width:peoples' }}
      >
        {current ? (
          <div className="space-y-7">
            <div className="space-y-4">
              <EntityImage
                name={current.name}
                url={current.image_url}
                crop={current.image_crop}
                initialsClassName="text-5xl"
                className="aspect-[3/1] w-full rounded-xl"
                expandable
              />
              <div className="space-y-3">
                <InlineText
                  value={current.name}
                  ariaLabel="Nome"
                  maxLength={120}
                  disabled={!canEdit}
                  className="block break-words px-2 py-1 text-2xl font-bold text-white"
                  onSave={(name) => void save({ name })}
                />
                <div>
                  <InlineSelect<string>
                    value={String(current.danger_level)}
                    options={DANGER_OPTIONS}
                    ariaLabel="Perigo"
                    disabled={!canEdit}
                    renderValue={(option) => <DangerBadge level={Number(option.value) as DangerLevel} />}
                    onSave={(value) => void save({ danger_level: Number(value) as DangerLevel })}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="px-2 text-sm text-rpg-muted">Endereço da imagem</span>
                    <InlineText
                      value={current.image_url}
                      allowEmpty
                      ariaLabel="Endereço da imagem"
                      maxLength={500}
                      placeholder="Cole o endereço da imagem (https://…)"
                      disabled={!canEdit}
                      className="block truncate px-2 py-1 text-sm text-gray-200"
                      onSave={saveUrl}
                    />
                  </div>
                  {canEdit && current.image_url !== '' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Crop size={14} aria-hidden="true" />}
                      onClick={() => setCropping(true)}
                    >
                      Enquadrar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-7 text-base">
              <Section title="Visão geral">
                <Field label="Resumo">
                  <InlineText
                    value={current.summary}
                    allowEmpty
                    ariaLabel="Resumo"
                    maxLength={300}
                    placeholder="Não informado"
                    disabled={!canEdit}
                    className={FIELD}
                    onSave={(summary) => void save({ summary })}
                  />
                </Field>
                <Field label="Nível mínimo">
                  <InlineNumber
                    value={current.level_min}
                    ariaLabel="Nível mínimo"
                    disabled={!canEdit}
                    className={FIELD}
                    onSave={(level_min) => void save({ level_min })}
                  />
                </Field>
                <Field label="Nível máximo">
                  <InlineNumber
                    value={current.level_max}
                    ariaLabel="Nível máximo"
                    disabled={!canEdit}
                    className={FIELD}
                    onSave={(level_max) => void save({ level_max })}
                  />
                </Field>
                <Field label="Comum em">
                  <InlineTags
                    value={current.common_in}
                    ariaLabel="Comum em"
                    disabled={!canEdit}
                    suggestions={collectCommonIn(creatures)}
                    maxLength={60}
                    maxTags={20}
                    className="px-2 py-1 text-gray-200"
                    onSave={(common_in) => void save({ common_in })}
                  />
                </Field>
              </Section>

              <Section title="Características">
                <Field label="Descrição">
                  <InlineTextarea
                    value={current.traits}
                    ariaLabel="Características"
                    disabled={!canEdit}
                    className={FIELD}
                    onSave={(traits) => void save({ traits })}
                  />
                </Field>
              </Section>
            </div>
          </div>
        ) : failed ? (
          <EmptyState
            title="Criatura não encontrada"
            description="Ela pode ter sido excluída ou não pertence a este mundo."
          />
        ) : (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="aspect-[3/1] w-full" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
      </Drawer>

      <ImageCropModal
        open={cropping && current !== null && current.image_url !== ''}
        imageUrl={current?.image_url ?? ''}
        aspect={CREATURE_IMAGE_ASPECT}
        title="Enquadrar banner da criatura"
        initialCrop={current?.image_crop ?? null}
        onSave={(crop) => void save({ image_crop: crop })}
        onClose={() => setCropping(false)}
      />
    </>
  );
}