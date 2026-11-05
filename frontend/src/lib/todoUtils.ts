/** Ordenação, prazos e prioridades das tarefas. */
import type { Priority, Todo } from '../api/notebook';

export type TodoSort = 'priority' | 'manual' | 'due' | 'world';

export const TODO_SORT_OPTIONS: { value: TodoSort; label: string }[] = [
  { value: 'priority', label: 'Prioridade' },
  { value: 'manual', label: 'Manual (ranking)' },
  { value: 'due', label: 'Prazo' },
  { value: 'world', label: 'Mundo' },
];

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 2, label: 'Alta' },
  { value: 1, label: 'Média' },
  { value: 0, label: 'Baixa' },
];

export const priorityLabel = (priority: Priority) =>
  PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? 'Média';

/** Data de hoje em YYYY-MM-DD no fuso local. */
export function todayISO(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export const isOverdue = (todo: Todo, today: string = todayISO()) =>
  !todo.is_done && todo.due_date !== null && todo.due_date < today;

const toLocalDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** Texto curto do prazo: "Hoje", "Amanhã", "em 3 d", "Atrasada" é decidido por quem usa (isOverdue). */
export function formatDue(dueDate: string, now: Date = new Date()): string {
  const today = toLocalDate(todayISO(now));
  const days = Math.round((toLocalDate(dueDate).getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days > 1 && days <= 14) return `em ${days} d`;
  return toLocalDate(dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const byDueAsc = (a: Todo, b: Todo) => {
  if (a.due_date === b.due_date) return 0;
  if (a.due_date === null) return 1;
  if (b.due_date === null) return -1;
  return a.due_date < b.due_date ? -1 : 1;
};
const byPriorityDesc = (a: Todo, b: Todo) => b.priority - a.priority;
const byPosition = (a: Todo, b: Todo) => (a.position ?? Infinity) - (b.position ?? Infinity);

/** Pendentes primeiro (no critério escolhido), concluídas por último (as mais recentes antes). */
export function sortTodos(todos: Todo[], mode: TodoSort): Todo[] {
  const pending = todos.filter((todo) => !todo.is_done);
  const done = todos.filter((todo) => todo.is_done);

  const compare: Record<TodoSort, (a: Todo, b: Todo) => number> = {
    priority: (a, b) => byPriorityDesc(a, b) || byDueAsc(a, b) || byPosition(a, b) || a.id - b.id,
    manual: (a, b) => byPosition(a, b) || a.id - b.id,
    due: (a, b) => byDueAsc(a, b) || byPriorityDesc(a, b) || byPosition(a, b),
    world: (a, b) => {
      if (a.world_name !== b.world_name) {
        if (a.world_name === null) return 1;
        if (b.world_name === null) return -1;
        return a.world_name.localeCompare(b.world_name, 'pt-BR');
      }
      return byPriorityDesc(a, b) || byDueAsc(a, b);
    },
  };

  pending.sort(compare[mode]);
  done.sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''));
  return [...pending, ...done];
}
