/**
 * O que há aqui:
 * - Tipos TimelineEvent e Era (espelham lore/timeline_serializers.py) e timelineService.
 *
 * Função do arquivo: Camada de dados da Linha do Tempo. O calendário (nome da era e data
 * "Agora") fica no próprio mundo (World.calendar_era_name, now_year, now_month, now_day).
 */

import { apiClient } from './client';

export interface TimelineEvent {
  id: number;
  world: number;
  title: string;
  description: string;
  year: number;
  month: number | null;
  day: number | null;
  date_label: string;
  characters: string[];
  locations: string[];
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimelineEventCreateData {
  world: number;
  title: string;
  year: number;
  month?: number | null;
  day?: number | null;
  date_label?: string;
  description?: string;
  characters?: string[];
  locations?: string[];
  is_secret?: boolean;
}

export type TimelineEventUpdateData = Partial<Omit<TimelineEventCreateData, 'world'>>;

export interface Era {
  id: number;
  world: number;
  name: string;
  start_year: number;
  end_year: number;
}

export type EraData = Omit<Era, 'id'>;

export const timelineService = {
  listEvents: async (world: number): Promise<TimelineEvent[]> =>
    (await apiClient.get<TimelineEvent[]>('timeline-events/', { params: { world } })).data,
  createEvent: async (data: TimelineEventCreateData): Promise<TimelineEvent> =>
    (await apiClient.post<TimelineEvent>('timeline-events/', data)).data,
  updateEvent: async (id: number, data: TimelineEventUpdateData): Promise<TimelineEvent> =>
    (await apiClient.patch<TimelineEvent>(`timeline-events/${id}/`, data)).data,
  removeEvent: async (id: number): Promise<void> => {
    await apiClient.delete(`timeline-events/${id}/`);
  },

  listEras: async (world: number): Promise<Era[]> =>
    (await apiClient.get<Era[]>('eras/', { params: { world } })).data,
  createEra: async (data: EraData): Promise<Era> => (await apiClient.post<Era>('eras/', data)).data,
  updateEra: async (id: number, data: Partial<Omit<EraData, 'world'>>): Promise<Era> =>
    (await apiClient.patch<Era>(`eras/${id}/`, data)).data,
  removeEra: async (id: number): Promise<void> => {
    await apiClient.delete(`eras/${id}/`);
  },
};