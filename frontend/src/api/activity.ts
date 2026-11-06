/**
 * O que há aqui:
 * - Tipo Activity (espelha activity/serializers.py) e activityService.list().
 *
 * Função do arquivo: Camada de dados do log de atividade (faixa "Atividade recente").
 */

import { apiClient } from './client';

export type ActivityVerb = 'created' | 'updated' | 'deleted';
export type ActivityTargetType = 'world' | 'note' | 'todo' | 'document';

export interface Activity {
  id: number;
  verb: ActivityVerb;
  target_type: ActivityTargetType;
  target_id: number;
  target_label: string;
  target_deleted: boolean;
  world: number | null;
  world_name: string | null;
  created_at: string;
}

export const activityService = {
  list: async (limit = 10, worldId?: number): Promise<Activity[]> => {
    const response = await apiClient.get<Activity[]>('activity/', {
      params: { limit, ...(worldId ? { world: worldId } : {}) },
    });
    return response.data;
  },
};