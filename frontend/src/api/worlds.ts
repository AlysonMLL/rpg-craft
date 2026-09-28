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
  display_order: number;
  created_at: string;
  owner_name: string;
  tags: Tag[];
}

export const worldService = {
  getAllWorlds: async (): Promise<World[]> => {
    const response = await apiClient.get<World[]>('worlds/');
    return response.data;
  }
};