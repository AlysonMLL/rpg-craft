/**
 * Função do Arquivo: Selo de um tipo de relação (ícone + nome, na cor do tipo). Usado na
 * tabela. A cor vem de KIND_META, por isso o estilo é inline.
 *
 * O que há aqui:
 * - RelationKindBadge: componente (prop: kind).
 */

import type { RelationshipKind } from '../../api/relationships';
import { KIND_META } from '../../lib/relationshipUtils';

export function RelationKindBadge({ kind }: { kind: RelationshipKind }) {
  const meta = KIND_META[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium"
      style={{ color: meta.color, borderColor: `${meta.color}66`, backgroundColor: `${meta.color}1a` }}
    >
      <meta.Icon size={12} aria-hidden="true" />
      {meta.label}
    </span>
  );
}