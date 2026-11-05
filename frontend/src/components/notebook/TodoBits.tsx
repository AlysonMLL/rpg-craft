/** Pecinhas visuais das tarefas: bandeira de prioridade e chip de prazo. */
import { CalendarDays, Flag } from 'lucide-react';
import type { Priority, Todo } from '../../api/notebook';
import { cn } from '../../lib/cn';
import { formatDue, isOverdue, priorityLabel } from '../../lib/todoUtils';

const PRIORITY_COLOR: Record<Priority, string> = {
  2: 'text-rpg-danger',
  1: 'text-rpg-primary',
  0: 'text-blue-400',
};

/** Bandeira colorida com nome acessível (a cor nunca é a única informação). */
export function PriorityFlag({ priority }: { priority: Priority }) {
  const label = `Prioridade ${priorityLabel(priority).toLowerCase()}`;
  return (
    <span title={label} className={cn('inline-flex', PRIORITY_COLOR[priority])}>
      <Flag size={14} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function DueChip({ todo }: { todo: Todo }) {
  if (!todo.due_date) return null;
  const overdue = isOverdue(todo);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-xs',
        overdue
          ? 'border-red-400/30 bg-red-400/10 text-rpg-danger'
          : 'border-gray-700 text-rpg-muted',
      )}
    >
      <CalendarDays size={12} aria-hidden="true" />
      {overdue ? `Atrasada · ${formatDue(todo.due_date)}` : formatDue(todo.due_date)}
    </span>
  );
}
