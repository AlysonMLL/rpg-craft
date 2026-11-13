/**
 * Função do Arquivo: Grafo de relações entre personagens (React Flow). Os nós são os
 * personagens que têm alguma relação; o layout é automático (dagre) e não dá para arrastar.
 * Linhas na cor e no estilo de cada tipo, seta de origem para destino nas relações que não
 * são mútuas, e o texto da relação sobre a linha (clicável para o dono editar).
 *
 * O que há ali:
 * - RelationshipGraph: componente (props: characters, relationships, focusId,
 *   onSelectCharacter, onEditRelationship). `relationships` já vem filtrada pela legenda e
 *   pelo foco. O grafo se reencaixa na tela quando muda o conjunto de nós e ligações.
 * - CharacterNode (interno): nó com retrato, nome e papel.
 * - RelationEdge (interno): linha curva + etiqueta com ícone e texto.
 * - Tipos CharacterNodeType / RelationEdgeType (aliases `type`, não `interface`, porque o React
 *   Flow exige dados compatíveis com Record<string, unknown>).
 */

import { useMemo } from 'react';
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { CharacterListItem } from '../../api/characters';
import type { Relationship } from '../../api/relationships';
import { cn } from '../../lib/cn';
import { KIND_META, NODE_HEIGHT, NODE_WIDTH, edgeText, layoutGraph } from '../../lib/relationshipUtils';
import { EntityImage } from '../ui'

type CharacterNodeType = Node<{ character: CharacterListItem; focused: boolean }, 'character'>;

type RelationEdgeData = {
  relationship: Relationship;
  /** Deslocamento vertical da etiqueta quando há mais de uma relação entre o mesmo par. */
  offset: number;
  onEdit?: (relationship: Relationship) => void;
};
type RelationEdgeType = Edge<RelationEdgeData, 'relation'>;

const HIDDEN_HANDLE = { opacity: 0, pointerEvents: 'none' as const };

function CharacterNode({ data }: NodeProps<CharacterNodeType>) {
  const { character, focused } = data;
  return (
    <div
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-rpg-card px-3 shadow-lg',
        focused ? 'border-rpg-primary' : 'border-gray-700',
      )}
    >
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE} />
      <EntityImage
        name={character.name}
        url={character.portrait_url}
        initialsClassName="text-sm"
        className="h-10 w-10 shrink-0 rounded-full"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{character.name}</p>
        {character.role && <p className="truncate text-xs text-rpg-muted">{character.role}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE} />
    </div>
  );
}

function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<RelationEdgeType>) {
  if (!data) return null;
  const { relationship, offset, onEdit } = data;
  const meta = KIND_META[relationship.kind];
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const chipClass =
    'nodrag nopan absolute flex items-center gap-1 whitespace-nowrap rounded-full border bg-rpg-bg px-2 py-0.5 text-xs text-gray-200';
  const chipStyle = {
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + offset}px)`,
    pointerEvents: 'all' as const,
    borderColor: meta.color,
  };
  const text = edgeText(relationship);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ stroke: meta.color, strokeWidth: 2, strokeDasharray: meta.dash }}
      />
      <EdgeLabelRenderer>
        {onEdit ? (
          <button
            type="button"
            onClick={() => onEdit(relationship)}
            aria-label={`Editar relação: ${text}`}
            className={cn(chipClass, 'transition-colors hover:bg-gray-800')}
            style={chipStyle}
          >
            <meta.Icon size={12} aria-hidden="true" />
            {text}
          </button>
        ) : (
          <div className={chipClass} style={chipStyle}>
            <meta.Icon size={12} aria-hidden="true" />
            {text}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { character: CharacterNode };
const edgeTypes = { relation: RelationEdge };

interface RelationshipGraphProps {
  characters: CharacterListItem[];
  relationships: Relationship[];
  focusId: number | null;
  onSelectCharacter: (id: number) => void;
  /** Só passe para o dono: sem isso as etiquetas não são clicáveis. */
  onEditRelationship?: (relationship: Relationship) => void;
}

export function RelationshipGraph({
  characters,
  relationships,
  focusId,
  onSelectCharacter,
  onEditRelationship,
}: RelationshipGraphProps) {
  const { nodes, edges, layoutKey } = useMemo(() => {
    const byId = new Map(characters.map((character) => [character.id, character]));
    const ids = [...new Set(relationships.flatMap((r) => [r.source, r.target]))].filter((id) => byId.has(id));
    const positions = layoutGraph(ids, relationships);

    const builtNodes: CharacterNodeType[] = ids.map((id) => ({
      id: String(id),
      type: 'character',
      position: positions[id],
      data: { character: byId.get(id) as CharacterListItem, focused: id === focusId },
    }));

    // Várias relações entre o mesmo par: espalha as etiquetas para não se sobreporem
    const groups = new Map<string, Relationship[]>();
    for (const relationship of relationships) {
      const key = [relationship.source, relationship.target].sort((a, b) => a - b).join('-');
      groups.set(key, [...(groups.get(key) ?? []), relationship]);
    }

    const builtEdges: RelationEdgeType[] = relationships.map((relationship) => {
      const key = [relationship.source, relationship.target].sort((a, b) => a - b).join('-');
      const group = groups.get(key) ?? [relationship];
      const index = group.indexOf(relationship);
      const meta = KIND_META[relationship.kind];
      return {
        id: String(relationship.id),
        type: 'relation',
        source: String(relationship.source),
        target: String(relationship.target),
        markerEnd: relationship.is_mutual
          ? undefined
          : { type: MarkerType.ArrowClosed, color: meta.color, width: 18, height: 18 },
        data: { relationship, offset: (index - (group.length - 1) / 2) * 26, onEdit: onEditRelationship },
      };
    });

    const key = `${ids.join(',')}|${relationships.map((r) => `${r.source}>${r.target}`).join(',')}`;
    return { nodes: builtNodes, edges: builtEdges, layoutKey: key };
  }, [characters, relationships, focusId, onEditRelationship]);

  return (
    <div className="h-[70vh] min-h-[28rem] overflow-hidden rounded-xl border border-gray-800 bg-rpg-bg">
      <ReactFlow
        key={layoutKey}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, node) => onSelectCharacter(Number(node.id))}
        onEdgeClick={(_, edge) => {
          if (edge.data) onEditRelationship?.(edge.data.relationship);
        }}
      >
        <Background gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}