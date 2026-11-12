/**
 * Função do Arquivo: Camada de dados das relações entre personagens. Fala com
 * /api/relationships/ e entrega objetos tipados.
 *
 * O que há aqui:
 * - RelationshipKind: 'family' | 'romance' | 'alliance' | 'rivalry' | 'mentorship'.
 * - Relationship: relação completa (espelha RelationshipSerializer).
 * - RelationshipWritable / RelationshipCreateData: campos que se enviam.
 * - relationshipService: list, create, update e remove.
 */

import { apiClient } from './client';

export type RelationshipKind = 'family' | 'romance' | 'alliance' | 'rivalry' | 'mentorship';

export interface Relationship {
  id: number;
  world: number;
  source: number;
  target: number;
  kind: RelationshipKind;
  label: string;
  reverse_label: string;
  is_mutual: boolean;
  created_at: string;
  updated_at: string;
}

export type RelationshipWritable = Pick<
  Relationship,
  'source' | 'target' | 'kind' | 'label' | 'reverse_label' | 'is_mutual'
>;

export type RelationshipCreateData = RelationshipWritable & { world: number };

export const relationshipService = {
  list: async (world: number): Promise<Relationship[]> =>
    (await apiClient.get<Relationship[]>('relationships/', { params: { world } })).data,
  create: async (data: RelationshipCreateData): Promise<Relationship> =>
    (await apiClient.post<Relationship>('relationships/', data)).data,
  update: async (id: number, data: Partial<RelationshipWritable>): Promise<Relationship> =>
    (await apiClient.patch<Relationship>(`relationships/${id}/`, data)).data,
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`relationships/${id}/`);
  },
};