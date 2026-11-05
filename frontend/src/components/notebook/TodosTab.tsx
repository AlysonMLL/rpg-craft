/**
 * Aba "Tarefas" da página /notebook: barra para adicionar, ordenação (Manual com ranking,
 * Prioridade, Prazo, Mundo), filtros e a tabela com edição direta.
 * - Ranking: digitar um número em "Rank" move a tarefa para essa posição; o backend desloca
 *   as outras (sem repetição). Só editável no modo Manual; concluídas mostram "—".
 * - Excluir com "Desfazer". Modo convidado: só leitura.
 */
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { todoService, type Priority, type Todo, type TodoInput } from '../../api/notebook';
import type { World } from '../../api/worlds';
import {
  PRIORITY_OPTIONS,
  TODO_SORT_OPTIONS,
  isOverdue,
  priorityLabel,
  sortTodos,
  type TodoSort,
} from '../../lib/todoUtils';
import { cn } from '../../lib/cn';
import { Button, Checkbox, EmptyState, InlineText, Input, Select, Toggle, toast } from '../ui';
import { PriorityFlag } from './TodoBits';

function RankInput({
  value,
  max,
  onCommit,
}: {
  value: number;
  max: number;
  onCommit: (position: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const next = Math.min(max, Math.round(Number(draft)));
    if (!Number.isFinite(next) || next < 1) {
      setDraft(String(value));
      return;
    }
    setDraft(String(next));
    if (next !== value) onCommit(next);
  };

  return (
    <Input
      type="number"
      size="sm"
      min={1}
      max={max}
      aria-label="Posição no ranking"
      className="w-16 text-center"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setDraft(String(value));
          e.currentTarget.blur();
        }
      }}
    />
  );
}

interface TodosTabProps {
  todos: Todo[];
  onTodosChange: (todos: Todo[]) => void;
  worlds: World[];
  isGuest: boolean;
}

export default function TodosTab({ todos, onTodosChange, worlds, isGuest }: TodosTabProps) {
  const ownedWorlds = worlds.filter((world) => world.is_owner);
  const worldName = (id: number | null) => worlds.find((w) => w.id === id)?.name ?? null;

  // Nova tarefa
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>(1);
  const [due, setDue] = useState('');
  const [world, setWorld] = useState('');

  // Ordenação e filtros
  const [sort, setSort] = useState<TodoSort>('priority');
  const [worldFilter, setWorldFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showDone, setShowDone] = useState(false);

  const reload = async () => {
    try {
      onTodosChange(await todoService.list());
    } catch {
      toast.error('Não foi possível atualizar a lista de tarefas.');
    }
  };

  const pendingCount = todos.filter((todo) => !todo.is_done).length;
  const doneCount = todos.length - pendingCount;

  const visible = sortTodos(todos, sort).filter((todo) => {
    if (todo.is_done && !showDone) return false;
    if (priorityFilter !== 'all' && todo.priority !== Number(priorityFilter)) return false;
    if (worldFilter === 'none') return todo.world === null;
    if (worldFilter !== 'all') return todo.world === Number(worldFilter);
    return true;
  });
  const hasFilters = worldFilter !== 'all' || priorityFilter !== 'all';

  const addTodo = async (event: FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || isGuest) return;
    try {
      await todoService.create({
        text: value,
        priority,
        due_date: due || null,
        world: world ? Number(world) : null,
      });
      setText('');
      setDue('');
      await reload();
    } catch {
      toast.error('Não foi possível adicionar a tarefa. Tente de novo.');
    }
  };

  const patch = async (todo: Todo, data: TodoInput) => {
    if (isGuest) return;
    const previous = todos;
    onTodosChange(
      todos.map((t) =>
        t.id === todo.id
          ? {
              ...t,
              ...data,
              world_name: data.world !== undefined ? worldName(data.world) : t.world_name,
            }
          : t,
      ),
    );
    try {
      await todoService.update(todo.id, data);
      if (data.is_done !== undefined) await reload();
    } catch {
      onTodosChange(previous);
      toast.error('Não foi possível atualizar a tarefa. Tente de novo.');
    }
  };

  const move = async (todo: Todo, position: number) => {
    try {
      await todoService.move(todo.id, position);
      await reload();
    } catch {
      toast.error('Não foi possível mover a tarefa. Tente de novo.');
    }
  };

  const remove = async (todo: Todo) => {
    onTodosChange(todos.filter((t) => t.id !== todo.id));
    try {
      await todoService.remove(todo.id);
    } catch {
      toast.error('Não foi possível excluir a tarefa. Tente de novo.');
      await reload();
      return;
    }
    await reload();
    toast('Tarefa excluída', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            await todoService.create({
              text: todo.text,
              priority: todo.priority,
              due_date: todo.due_date,
              world: todo.world,
              is_done: todo.is_done,
            });
            await reload();
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Nova tarefa */}
      {!isGuest && (
        <form
          onSubmit={addTodo}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-800 bg-rpg-card p-4"
        >
          <div className="min-w-56 flex-1">
            <Input
              label="Nova tarefa"
              maxLength={200}
              placeholder="Ex: Escrever backstory da Lyra"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="w-32">
            <Select
              label="Prioridade"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as Priority)}
              options={PRIORITY_OPTIONS}
            />
          </div>
          <div className="w-44">
            <Input label="Prazo" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="w-48">
            <Select label="Mundo" value={world} onChange={(e) => setWorld(e.target.value)}>
              <option value="">Sem mundo</option>
              {ownedWorlds.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" leftIcon={<Plus size={16} />} disabled={!text.trim()}>
            Adicionar
          </Button>
        </form>
      )}

      {/* Ordenação e filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-rpg-muted">Ordenar por</span>
          <div className="w-44">
            <Select
              aria-label="Ordenar tarefas"
              size="sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as TodoSort)}
              options={TODO_SORT_OPTIONS}
            />
          </div>
        </div>
        <div className="w-44">
          <Select
            aria-label="Filtrar por mundo"
            size="sm"
            value={worldFilter}
            onChange={(e) => setWorldFilter(e.target.value)}
          >
            <option value="all">Todos os mundos</option>
            <option value="none">Sem mundo</option>
            {ownedWorlds.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select
            aria-label="Filtrar por prioridade"
            size="sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">Todas as prioridades</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Toggle label="Mostrar concluídas" checked={showDone} onChange={setShowDone} className="ml-auto" />
      </div>
      {sort === 'manual' && !isGuest && (
        <p className="text-xs text-rpg-subtle">
          Digite um número em Rank para mover a tarefa para essa posição; as outras se ajustam.
        </p>
      )}

      {/* Tabela */}
      {todos.length === 0 ? (
        <EmptyState
          title="Sem tarefas"
          description={isGuest ? 'Não há tarefas de exemplo.' : 'Adicione a primeira tarefa acima.'}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nenhuma tarefa nesta visão"
          description={
            hasFilters
              ? 'Tente outros filtros.'
              : 'Todas as tarefas estão concluídas. Ative "Mostrar concluídas" para vê-las.'
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-rpg-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-gray-800 text-xs text-rpg-muted">
              <tr>
                <th scope="col" className="w-24 px-4 py-3 font-medium">Rank</th>
                <th scope="col" className="px-2 py-3 font-medium">Tarefa</th>
                <th scope="col" className="w-36 px-2 py-3 font-medium">Prioridade</th>
                <th scope="col" className="w-48 px-2 py-3 font-medium">Prazo</th>
                <th scope="col" className="w-48 px-2 py-3 font-medium">Mundo</th>
                <th scope="col" className="w-12 px-2 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((todo) => {
                const overdue = isOverdue(todo);
                return (
                  <tr key={todo.id} className="group border-b border-gray-800/60 last:border-0 hover:bg-rpg-bg/50">
                    <td className="px-4 py-2.5">
                      {todo.is_done || todo.position === null ? (
                        <span className="text-rpg-subtle" aria-label="Sem ranking">—</span>
                      ) : sort === 'manual' && !isGuest ? (
                        <RankInput value={todo.position} max={pendingCount} onCommit={(n) => move(todo, n)} />
                      ) : (
                        <span className="text-rpg-muted">{todo.position}</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          aria-label={`Concluir ${todo.text}`}
                          checked={todo.is_done}
                          disabled={isGuest}
                          onChange={() => patch(todo, { is_done: !todo.is_done })}
                        />
                        <InlineText
                          value={todo.text}
                          ariaLabel="Texto da tarefa"
                          disabled={isGuest}
                          maxLength={200}
                          onSave={(value) => patch(todo, { text: value })}
                          className={cn(todo.is_done && 'text-rpg-subtle line-through')}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      {isGuest ? (
                        <span className="inline-flex items-center gap-1.5">
                          <PriorityFlag priority={todo.priority} />
                          {priorityLabel(todo.priority)}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <PriorityFlag priority={todo.priority} />
                          <Select
                            aria-label="Prioridade"
                            size="sm"
                            value={todo.priority}
                            onChange={(e) => patch(todo, { priority: Number(e.target.value) as Priority })}
                            options={PRIORITY_OPTIONS}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      {isGuest ? (
                        <span className="text-rpg-muted">{todo.due_date ?? '—'}</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            type="date"
                            size="sm"
                            aria-label="Prazo"
                            value={todo.due_date ?? ''}
                            onChange={(e) => patch(todo, { due_date: e.target.value || null })}
                          />
                          {overdue && (
                            <span className="text-xs font-medium text-rpg-danger">Atrasada</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      {isGuest ? (
                        <span className="text-rpg-muted">{todo.world_name ?? 'Sem mundo'}</span>
                      ) : (
                        <Select
                          aria-label="Mundo"
                          size="sm"
                          value={todo.world ?? ''}
                          onChange={(e) =>
                            patch(todo, { world: e.target.value ? Number(e.target.value) : null })
                          }
                        >
                          <option value="">Sem mundo</option>
                          {ownedWorlds.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </Select>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      {!isGuest && (
                        <button
                          type="button"
                          onClick={() => remove(todo)}
                          aria-label={`Excluir tarefa ${todo.text}`}
                          className="rounded-md p-1.5 text-rpg-subtle opacity-0 transition-all hover:text-rpg-danger focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-rpg-subtle">
        {pendingCount} pendentes · {doneCount} concluídas
      </p>
    </div>
  );
}
