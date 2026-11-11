/**
 * O que há aqui:
 * - Interfaces TypeScript (Tag, World) que espelham exatamente o serializers.py do Django.
 * - worldService: Objeto que contém os métodos de comunicação com a rota /worlds/ da API.
 * 
 * Função do arquivo: Atuar como o repositório de dados do domínio de Mundos no frontend.
 * Ele traduz o JSON que vem do backend em objetos tipados, garantindo que o autocompletar 
 * da IDE funcione perfeitamente na hora de montar os cards na interface.
 */

import { apiClient } from './client';

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface World {
  id: number;
  name: string;
  cover_image: string | null;
  synopsis: string;
  introduction_markdown: string | null;
  is_demo: boolean;
  is_favorite: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
  calendar_era_name: string;
  now_year: number | null;
  now_month: number | null;
  now_day: number | null;
  owner_name: string;
  is_owner: boolean;
  tags: Tag[];
}

export interface WorldCreateData {
  name: string;
  synopsis: string;
  is_demo: boolean;
  tag_ids: number[];
}

export type WorldUpdateData = Partial<
  Pick<
    World,
    | 'name'
    | 'synopsis'
    | 'introduction_markdown'
    | 'cover_image'
    | 'is_demo'
    | 'calendar_era_name'
    | 'now_year'
    | 'now_month'
    | 'now_day'
  >
> & { tag_ids?: number[] };

export const worldService = {
  getAllWorlds: async (): Promise<World[]> => {
    const response = await apiClient.get<World[]>('worlds/');
    return response.data;
  },

  getAllTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>('tags/');
    return response.data;
  },

  // Cria uma tag global (se o nome já existir, o backend devolve a existente)
  createTag: async (name: string): Promise<Tag> => {
    const response = await apiClient.post<Tag>('tags/', { name });
    return response.data;
  },

  getWorldById: async (id: string | number): Promise<World> => {
    const response = await apiClient.get<World>(`worlds/${id}/`);
    return response.data;
  },
  
  // método para o POST
  createWorld: async (data: WorldCreateData): Promise<World> => {
    const response = await apiClient.post<World>('worlds/', data);
    return response.data;
  },

  // Edição parcial do mundo (ex.: o Resumo / Introdução em Markdown)
  updateWorld: async (id: number, data: WorldUpdateData): Promise<World> => {
    const response = await apiClient.patch<World>(`worlds/${id}/`, data);
    return response.data;
  },

  // Favoritar/desfavoritar (a estrela só marca; não altera a ordem)
  setFavorite: async (id: number, isFavorite: boolean): Promise<World> => {
    const response = await apiClient.patch<World>(`worlds/${id}/`, { is_favorite: isFavorite });
    return response.data;
  },

  // Ordem personalizada: envia os ids dos SEUS mundos na ordem desejada
  reorder: async (ids: number[]): Promise<void> => {
    await apiClient.post('worlds/reorder/', { ids });
  },
};