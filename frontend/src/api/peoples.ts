/**
 * Função do Arquivo: Camada de dados de raças e criaturas de um mundo. Fala com /api/races/ e
 * /api/creatures/ e entrega objetos tipados para as telas.
 *
 * O que há aqui:
 * - DangerLevel: perigo da criatura, de 0 (Nenhum) a 4 (Máximo).
 * - RaceListItem / Race (+ RaceWritable, RaceCreateData, RaceUpdateData): versão leve da grade e
 *   versão completa da gaveta (espelham RaceListSerializer / RaceSerializer).
 * - CreatureListItem / Creature (+ CreatureWritable, CreatureCreateData, CreatureUpdateData).
 * - raceService e creatureService: list, get, create, update, remove e reorder (mesma forma).
 */

import { apiClient } from './client';
import type { ImageCrop } from './common';

export type DangerLevel = 0 | 1 | 2 | 3 | 4;

export interface RaceListItem {
  id: number;
  world: number;
  name: string;
  image_url: string;
  image_crop: ImageCrop | null;
  is_favorite: boolean;
  display_order: number;
  summary: string;
  common_in: string[];
  updated_at: string;
}

export interface Race extends RaceListItem {
  traits: string;
  culture: string;
  life_expectancy: string;
  origin: string;
  created_at: string;
}

export type RaceWritable = Omit<Race, 'id' | 'world' | 'display_order' | 'created_at' | 'updated_at'>;
export type RaceCreateData = Partial<RaceWritable> & { world: number; name: string };
export type RaceUpdateData = Partial<RaceWritable>;

export interface CreatureListItem {
  id: number;
  world: number;
  name: string;
  image_url: string;
  image_crop: ImageCrop | null;
  is_favorite: boolean;
  display_order: number;
  summary: string;
  danger_level: DangerLevel;
  level_min: number | null;
  level_max: number | null;
  common_in: string[];
  updated_at: string;
}

export interface Creature extends CreatureListItem {
  traits: string;
  created_at: string;
}

export type CreatureWritable = Omit<Creature, 'id' | 'world' | 'display_order' | 'created_at' | 'updated_at'>;
export type CreatureCreateData = Partial<CreatureWritable> & { world: number; name: string };
export type CreatureUpdateData = Partial<CreatureWritable>;

/** Mesmas rotas e comportamento para os dois recursos (padrão do OrderedWorldViewSet). */
function makeService<TItem, TFull, TCreate, TUpdate>(path: string) {
  return {
    /** Lista leve (sem os textos longos) para a grade. */
    list: async (world: number): Promise<TItem[]> =>
      (await apiClient.get<TItem[]>(`${path}/`, { params: { world } })).data,
    /** Versão completa, para a gaveta. */
    get: async (id: number): Promise<TFull> => (await apiClient.get<TFull>(`${path}/${id}/`)).data,
    create: async (data: TCreate): Promise<TFull> => (await apiClient.post<TFull>(`${path}/`, data)).data,
    update: async (id: number, data: TUpdate): Promise<TFull> =>
      (await apiClient.patch<TFull>(`${path}/${id}/`, data)).data,
    remove: async (id: number): Promise<void> => {
      await apiClient.delete(`${path}/${id}/`);
    },
    /** Ordem personalizada: ids do mundo na ordem desejada. */
    reorder: async (world: number, ids: number[]): Promise<void> => {
      await apiClient.post(`${path}/reorder/`, { world, ids });
    },
  };
}

export const raceService = makeService<RaceListItem, Race, RaceCreateData, RaceUpdateData>('races');
export const creatureService = makeService<
  CreatureListItem,
  Creature,
  CreatureCreateData,
  CreatureUpdateData
>('creatures');