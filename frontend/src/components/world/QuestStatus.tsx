/**
 * Visual do status das missões: cor + ícone + texto (nunca só cor).
 * - StatusBadge: selo de leitura.
 * - StatusSelect: o mesmo selo, mas é um <select> nativo (troca rápida de status na lista e no editor).
 */
import { ChevronDown, CircleCheck, CircleDot, CirclePause, type LucideIcon } from 'lucide-react';
import type { QuestStatus } from '../../api/quests';
import { cn } from '../../lib/cn';
import { STATUS_LABELS, STATUS_ORDER } from '../../lib/questUtils';

const STYLE: Record<QuestStatus, { Icon: LucideIcon; classes: string }> = {
  active: { Icon: CircleDot, classes: 'border-rpg-secondary/40 bg-rpg-secondary/10 text-rpg-secondary' },
  idle: { Icon: CirclePause, classes: 'border-gray-600 bg-gray-800/60 text-rpg-muted' },
  done: { Icon: CircleCheck, classes: 'border-green-400/30 bg-green-400/10 text-rpg-success' },
};

export function StatusBadge({ status }: { status: QuestStatus }) {
  const { Icon, classes } = STYLE[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', classes)}>
      <Icon size={13} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

interface StatusSelectProps {
  value: QuestStatus;
  onChange: (status: QuestStatus) => void;
  ariaLabel: string;
  disabled?: boolean;
}

export function StatusSelect({ value, onChange, ariaLabel, disabled = false }: StatusSelectProps) {
  const { Icon, classes } = STYLE[value];
  return (
    <span
      className={cn(
        'relative inline-flex items-center rounded-full border focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-rpg-secondary',
        classes,
        disabled && 'opacity-60',
      )}
    >
      <Icon size={13} aria-hidden="true" className="pointer-events-none absolute left-2.5" />
      <select
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as QuestStatus)}
        className="cursor-pointer appearance-none bg-transparent py-1 pl-7 pr-6 text-xs font-medium outline-none disabled:cursor-not-allowed [&>option]:bg-rpg-card [&>option]:text-gray-200"
      >
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <ChevronDown size={12} aria-hidden="true" className="pointer-events-none absolute right-2" />
    </span>
  );
}