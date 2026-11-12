/**
 * Função do Arquivo: Regras puras das relações (sem React): aparência de cada tipo (cor,
 * estilo de linha e ícone), texto da relação, vizinhança de um personagem e layout automático
 * do grafo (dagre).
 *
 * O que há aqui:
 * - KIND_ORDER / KIND_META: rótulo, cor, tracejado da linha e ícone de cada tipo. Cada tipo
 *   se distingue por cor + estilo de linha + ícone (nada só por cor).
 * - edgeText(): texto mostrado sobre a linha ("pai de / filho de" ou o nome do tipo).
 * - neighborhood(): ids do personagem em foco e dos ligados diretamente a ele.
 * - NODE_WIDTH / NODE_HEIGHT: tamanho dos nós do grafo.
 * - layoutGraph(): posição (x, y) de cada nó, calculada pelo dagre (de cima para baixo).
 */

import dagre from '@dagrejs/dagre';
import { GraduationCap, Handshake, Heart, House, Swords, type LucideIcon } from 'lucide-react';
import type { Relationship, RelationshipKind } from '../api/relationships';

export const KIND_ORDER: RelationshipKind[] = ['family', 'romance', 'alliance', 'rivalry', 'mentorship'];

interface KindMeta {
  label: string;
  color: string;
  /** Valor de stroke-dasharray (undefined = linha contínua). */
  dash?: string;
  Icon: LucideIcon;
}

export const KIND_META: Record<RelationshipKind, KindMeta> = {
  family: { label: 'Família', color: '#00f0ff', Icon: House },
  romance: { label: 'Romance', color: '#f472b6', dash: '2 6', Icon: Heart },
  alliance: { label: 'Aliança', color: '#4ade80', dash: '9 5', Icon: Handshake },
  rivalry: { label: 'Inimizade', color: '#f87171', dash: '12 4 2 4', Icon: Swords },
  mentorship: { label: 'Mentoria', color: '#dce305', dash: '16 6', Icon: GraduationCap },
};

export function edgeText(relationship: Relationship): string {
  return (
    [relationship.label, relationship.reverse_label].filter(Boolean).join(' / ') ||
    KIND_META[relationship.kind].label
  );
}

export function neighborhood(relationships: Relationship[], focusId: number): Set<number> {
  const ids = new Set<number>([focusId]);
  for (const relationship of relationships) {
    if (relationship.source === focusId) ids.add(relationship.target);
    if (relationship.target === focusId) ids.add(relationship.source);
  }
  return ids;
}

export const NODE_WIDTH = 190;
export const NODE_HEIGHT = 64;

export function layoutGraph(
  ids: number[],
  links: { source: number; target: number }[],
): Record<number, { x: number; y: number }> {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({ rankdir: 'TB', nodesep: 56, ranksep: 120 });
  graph.setDefaultEdgeLabel(() => ({}));
  ids.forEach((id) => graph.setNode(String(id), { width: NODE_WIDTH, height: NODE_HEIGHT }));
  links.forEach((link) => graph.setEdge(String(link.source), String(link.target)));
  dagre.layout(graph);

  const positions: Record<number, { x: number; y: number }> = {};
  ids.forEach((id) => {
    const node = graph.node(String(id));
    positions[id] = { x: node.x - NODE_WIDTH / 2, y: node.y - NODE_HEIGHT / 2 };
  });
  return positions;
}