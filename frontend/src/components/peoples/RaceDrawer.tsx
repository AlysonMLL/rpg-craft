/**
 * Função do Arquivo: Gaveta da raça (aberta por ?raca=ID). Busca a versão completa ao abrir.
 * Topo: imagem quadrada (tela cheia e "Enquadrar"), nome e endereço da imagem. Depois, as seções
 * editáveis inline (Visão geral; Características e cultura). Dono edita (otimista, com volta
 * atrás); convidado só lê. Favoritar e excluir ficam no cabeçalho.
 *
 * O que há ali:
 * - RaceDrawer: componente (props: raceId, worldId, canEdit, races, onClose, onUpdated, onDelete).
 *   `races` serve só para sugerir os lugares de "Comum em" já usados no mundo.
 */

import { useState } from 'react';
import { Crop, Star, Trash2 } from 'lucide-react';
import {
  raceService,
  type Race,
  type RaceListItem,
  type RaceUpdateData,
} from '../../api/peoples';
import { useEntityRecord } from '../../hooks/useEntityRecord';
import {
  RACE_IMAGE_ASPECT,
  collectCommonIn,
  toRaceItem,
} from '../../lib/peoplesUtils';
import {
  Button,
  Drawer,
  EmptyState,
  EntityImage,
  ImageCropModal,
  InlineTags,
  InlineText,
  InlineTextarea,
  Skeleton,
  toast,
} from '../ui';
import { FIELD, Field, Section } from './SheetBits';

interface RaceDrawerProps {
  raceId: number | null;
  worldId: number;
  canEdit: boolean;
  races: RaceListItem[];
  onClose: () => void;
  onUpdated: (race: Race) => void;
  onDelete: (race: RaceListItem) => void;
}

export function RaceDrawer({ raceId, worldId, canEdit, races, onClose, onUpdated, onDelete }: RaceDrawerProps) {
  const { current, failed, save } = useEntityRecord<Race, RaceUpdateData>({
    id: raceId,
    worldId,
    service: raceService,
    onUpdated,
  });
  const [cropping, setCropping] = useState(false);
  if (raceId === null && cropping) setCropping(false);

  const saveUrl = (value: string) => {
    if (value && !/^https?:\/\//i.test(value)) {
      toast.error('Use um endereço que comece com http:// ou https://.');
      return;
    }
    // Outra imagem pede outro enquadramento (o servidor também zera, por garantia)
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
        aria-label="Excluir raça"
        onClick={() => onDelete(toRaceItem(current))}
        className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-rpg-danger"
      >
        <Trash2 size={20} aria-hidden="true" />
      </button>
    </>
  );

  return (
    <>
      <Drawer
        open={raceId !== null}
        onClose={onClose}
        title="Raça"
        headerActions={headerActions}
        resizable={{ storageKey: 'rpgcraft:drawer-width:peoples' }}
      >
        {current ? (
          <div className="space-y-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <EntityImage
                name={current.name}
                url={current.image_url}
                crop={current.image_crop}
                initialsClassName="text-4xl"
                className="aspect-square w-36 shrink-0 rounded-xl"
                expandable
              />
              <div className="min-w-0 flex-1 space-y-3">
                <InlineText
                  value={current.name}
                  ariaLabel="Nome"
                  maxLength={120}
                  disabled={!canEdit}
                  className="block break-words px-2 py-1 text-2xl font-bold text-white"
                  onSave={(name) => void save({ name })}
                />
                <div>
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
                <Field label="Origem">
                  <InlineText
                    value={current.origin}
                    allowEmpty
                    ariaLabel="Origem"
                    maxLength={160}
                    placeholder="Não informado"
                    disabled={!canEdit}
                    className={FIELD}
                    onSave={(origin) => void save({ origin })}
                  />
                </Field>
                <Field label="Expectativa de vida">
                  <InlineText
                    value={current.life_expectancy}
                    allowEmpty
                    ariaLabel="Expectativa de vida"
                    maxLength={60}
                    placeholder="Não informado"
                    disabled={!canEdit}
                    className={FIELD}
                    onSave={(life_expectancy) => void save({ life_expectancy })}
                  />
                </Field>
                <Field label="Comum em">
                  <InlineTags
                    value={current.common_in}
                    ariaLabel="Comum em"
                    disabled={!canEdit}
                    suggestions={collectCommonIn(races)}
                    maxLength={60}
                    maxTags={20}
                    className="px-2 py-1 text-gray-200"
                    onSave={(common_in) => void save({ common_in })}
                  />
                </Field>
              </Section>

              <Section title="Características e cultura">
                <Field label="Características">
                  <InlineTextarea
                    value={current.traits}
                    ariaLabel="Características"
                    disabled={!canEdit}
                    className={FIELD}
                    onSave={(traits) => void save({ traits })}
                  />
                </Field>
                <Field label="Cultura">
                  <InlineTextarea
                    value={current.culture}
                    ariaLabel="Cultura"
                    disabled={!canEdit}
                    className={FIELD}
                    onSave={(culture) => void save({ culture })}
                  />
                </Field>
              </Section>
            </div>
          </div>
        ) : failed ? (
          <EmptyState
            title="Raça não encontrada"
            description="Ela pode ter sido excluída ou não pertence a este mundo."
          />
        ) : (
          <div className="space-y-4" aria-busy="true">
            <div className="flex gap-5">
              <Skeleton className="h-36 w-36 shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        )}
      </Drawer>

      <ImageCropModal
        open={cropping && current !== null && current.image_url !== ''}
        imageUrl={current?.image_url ?? ''}
        aspect={RACE_IMAGE_ASPECT}
        title="Enquadrar imagem da raça"
        initialCrop={current?.image_crop ?? null}
        onSave={(crop) => void save({ image_crop: crop })}
        onClose={() => setCropping(false)}
      />
    </>
  );
}