/**
 * O que há aqui:
 * - Tipo Quest (espelha lore/quest_serializers.py) e questService.
 *
 * Função do arquivo: Camada de dados das missões do mundo ("Resumo & Missões").
 */

import { apiClient } from './client';

export type QuestStatus = 'active' | 'idle' | 'done';

export interface Quest {
  id: number;
  world: number;
  title: string;
  description_markdown: string;
  status: QuestStatus;
  characters: string[];
  locations: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuestCreateData {
  world: number;
  title: string;
  status?: QuestStatus;
  description_markdown?: string;
  characters?: string[];
  locations?: string[];
}

export type QuestUpdateData = Partial<Omit<QuestCreateData, 'world'>>;

export const questService = {
  list: async (world: number): Promise<Quest[]> =>
    (await apiClient.get<Quest[]>('quests/', { params: { world } })).data,
  create: async (data: QuestCreateData): Promise<Quest> =>
    (await apiClient.post<Quest>('quests/', data)).data,
  update: async (id: number, data: QuestUpdateData): Promise<Quest> =>
    (await apiClient.patch<Quest>(`quests/${id}/`, data)).data,
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`quests/${id}/`);
  },
};