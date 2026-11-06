/**
 * O que há aqui:
 * - Tipo WorldDocument (espelha lore/serializers.py) e documentService.
 *
 * Função do arquivo: Camada de dados dos documentos .md de um mundo (História e, depois,
 * os blocos "Documentos .md" das outras telas). O campo `section` separa onde cada um aparece.
 */

import { apiClient } from './client';

export type DocumentSection = 'lore' | 'characters' | 'maps' | 'peoples';

export interface WorldDocument {
  id: number;
  world: number;
  section: DocumentSection;
  title: string;
  content_markdown: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreateData {
  world: number;
  section: DocumentSection;
  title: string;
  content_markdown?: string;
}

export type DocumentUpdateData = Partial<Pick<WorldDocument, 'title' | 'content_markdown'>>;

export const documentService = {
  list: async (world: number, section: DocumentSection): Promise<WorldDocument[]> =>
    (await apiClient.get<WorldDocument[]>('documents/', { params: { world, section } })).data,
  create: async (data: DocumentCreateData): Promise<WorldDocument> =>
    (await apiClient.post<WorldDocument>('documents/', data)).data,
  update: async (id: number, data: DocumentUpdateData): Promise<WorldDocument> =>
    (await apiClient.patch<WorldDocument>(`documents/${id}/`, data)).data,
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`documents/${id}/`);
  },
};