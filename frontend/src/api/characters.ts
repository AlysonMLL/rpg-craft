/**
 * Função do Arquivo: Camada de dados dos personagens de um mundo. Fala com /api/characters/
 * e entrega objetos tipados para as telas.
 *
 * O que há aqui:
 * - CharacterStatus: 'alive' | 'dead' | 'missing' | 'unknown'.
 * - CharacterListItem: versão leve que a grade recebe (espelha CharacterListSerializer).
 * - Character: ficha completa, usada pela gaveta (espelha CharacterSerializer).
 * - CharacterWritable: campos que podem ser enviados (tudo, menos id, mundo, ordem e datas).
 * - CharacterCreateData / CharacterUpdateData: o que se envia ao criar e ao editar.
 * - characterService: list, get, create, update, remove e reorder.
 */

import { apiClient } from './client';

export type CharacterStatus = 'alive' | 'dead' | 'missing' | 'unknown';

import type { ImageCrop } from './common';

/** Mantido para o código de Personagens; é o mesmo ImageCrop. */
export type PortraitCrop = ImageCrop;

export interface CharacterListItem {
  id: number;
  world: number;
  name: string;
  portrait_url: string;
  portrait_crop: PortraitCrop | null;
  status: CharacterStatus;
  is_favorite: boolean;
  display_order: number;
  role: string;
  race: string;
  classes: string[];
  level: number | null;
  organizations: string[];
  updated_at: string;
}

export interface Character extends CharacterListItem {
  age: string;
  gender: string;
  height: string;
  appearance: string;
  voice: string;
  origin: string;
  items: string[];
  skills: string[];
  secrets: string;
  sheet_markdown: string;
  created_at: string;
}

export type CharacterWritable = Omit<Character, 'id' | 'world' | 'display_order' | 'created_at' | 'updated_at'>;

export type CharacterCreateData = Partial<CharacterWritable> & { world: number; name: string };

export type CharacterUpdateData = Partial<CharacterWritable>;

export const characterService = {
  /** Lista leve (sem os textos longos) para a grade. */
  list: async (world: number): Promise<CharacterListItem[]> =>
    (await apiClient.get<CharacterListItem[]>('characters/', { params: { world } })).data,
  /** Ficha completa, para a gaveta. */
  get: async (id: number): Promise<Character> =>
    (await apiClient.get<Character>(`characters/${id}/`)).data,
  create: async (data: CharacterCreateData): Promise<Character> =>
    (await apiClient.post<Character>('characters/', data)).data,
  update: async (id: number, data: CharacterUpdateData): Promise<Character> =>
    (await apiClient.patch<Character>(`characters/${id}/`, data)).data,
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`characters/${id}/`);
  },
  /** Ordem personalizada: ids do mundo na ordem desejada. */
  reorder: async (world: number, ids: number[]): Promise<void> => {
    await apiClient.post('characters/reorder/', { world, ids });
  },
};