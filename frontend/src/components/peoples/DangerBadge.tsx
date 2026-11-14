/**
 * Função do Arquivo: Selo de perigo da criatura ("Perigo: Alto"), sempre com texto além da cor.
 * O que há aqui: DangerBadge (props: level, className).
 */

import type { DangerLevel } from '../../api/peoples';
import { cn } from '../../lib/cn';
import { DANGER_META } from '../../lib/peoplesUtils';

export function DangerBadge({ level, className }: { level: DangerLevel; className?: string }) {
  const meta = DANGER_META[level];
  return (
    <span
      className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium', meta.badge, className)}
    >
      Perigo: {meta.label}
    </span>
  );
}