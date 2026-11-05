/**
 * Widget "Lista de tarefas" da Home: progresso, as 5 primeiras pendentes na ordem padrão
 * (prioridade, depois prazo), campo para adicionar (Enter) e "Exibir tudo (N)" que leva a
 * /notebook. Edição completa (ranking, prazo, mundo) fica na tela /notebook.
 * Modo convidado: só leitura.
 */
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckSquare } from 'lucide-react';
import { todoService, type Todo } from '../../api/notebook';
import { sortTodos } from '../../lib/todoUtils';
import { Card, Checkbox, Skeleton, toast } from '../ui';
import { DueChip, PriorityFlag } from './TodoBits';

const VISIBLE = 5;

export default function TodosWidget({ isGuest }: { isGuest: boolean }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState('');

  const load = useCallback(async () => {
    try {
      setTodos(await todoService.list());
    } catch {
      toast.error('Não foi possível carregar as tarefas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const doneCount = todos.filter((todo) => todo.is_done).length;
  const pending = sortTodos(todos, 'priority').filter((todo) => !todo.is_done);
  const progress = todos.length === 0 ? 0 : Math.round((doneCount / todos.length) * 100);

  const toggle = async (todo: Todo) => {
    if (isGuest) return;
    const previous = todos;
    setTodos((list) =>
      list.map((t) => (t.id === todo.id ? { ...t, is_done: !t.is_done, position: null } : t)),
    );
    try {
      await todoService.update(todo.id, { is_done: !todo.is_done });
      await load();
    } catch {
      setTodos(previous);
      toast.error('Não foi possível atualizar a tarefa. Tente de novo.');
    }
  };

  const add = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isGuest) return;
    setDraft('');
    try {
      await todoService.create({ text });
      await load();
    } catch {
      setDraft(text);
      toast.error('Não foi possível adicionar a tarefa. Tente de novo.');
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <CheckSquare size={16} className="text-rpg-primary" aria-hidden="true" />
          Lista de tarefas
        </h3>
        {todos.length > 0 && (
          <span className="text-xs text-rpg-muted">
            {doneCount}/{todos.length} concluídas
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-label="Tarefas concluídas"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-800"
      >
        <div className="h-full rounded-full bg-rpg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      ) : todos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-sm text-rpg-muted">
          Sem tarefas. {isGuest ? '' : 'Adicione a primeira abaixo.'}
        </p>
      ) : pending.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-sm text-rpg-muted">
          Tudo concluído por aqui.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {pending.slice(0, VISIBLE).map((todo) => (
            <li key={todo.id} className="flex items-start justify-between gap-2 rounded-lg p-1.5">
              <div className="min-w-0">
                <Checkbox
                  checked={todo.is_done}
                  disabled={isGuest}
                  onChange={() => toggle(todo)}
                  label={<span className="truncate">{todo.text}</span>}
                />
                {todo.world_name && (
                  <p className="ml-7 truncate text-xs text-rpg-subtle">{todo.world_name}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <DueChip todo={todo} />
                <PriorityFlag priority={todo.priority} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isGuest && (
        <form onSubmit={add} className="mt-3">
          <input
            type="text"
            value={draft}
            maxLength={200}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Adicionar tarefa"
            placeholder="+ Adicionar tarefa (Enter)"
            className="w-full rounded-lg border border-gray-800 bg-rpg-bg px-3 py-2 text-sm text-white placeholder:text-rpg-subtle focus:border-rpg-primary focus:outline-none"
          />
        </form>
      )}

      {todos.length > 0 && (
        <Link
          to="/notebook?aba=tarefas"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-rpg-bg hover:text-white"
        >
          Exibir tudo ({todos.length})
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </Card>
  );
}
