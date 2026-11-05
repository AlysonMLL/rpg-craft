/**
 * O que há aqui:
 * - Tipos Note e Todo (espelham notebook/serializers.py).
 * - noteService e todoService: chamadas às rotas /notes/ e /todos/.
 *
 * Função do arquivo: Camada de dados do Notebook (notas e tarefas).
 * `Todo.position` é o ranking entre as tarefas pendentes (null quando concluída);
 * só muda por todoService.move().
 */

import { apiClient } from './client';

export interface Note {
  id: number;
  world: number | null;
  world_name: string | null;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export type NoteInput = Partial<Pick<Note, 'title' | 'content' | 'is_pinned' | 'world'>>;

export type Priority = 0 | 1 | 2; // 0 baixa, 1 média, 2 alta

export interface Todo {
  id: number;
  world: number | null;
  world_name: string | null;
  text: string;
  is_done: boolean;
  priority: Priority;
  due_date: string | null; // YYYY-MM-DD
  position: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TodoInput = Partial<Pick<Todo, 'text' | 'is_done' | 'priority' | 'due_date' | 'world'>>;

export const noteService = {
  list: async (): Promise<Note[]> => (await apiClient.get<Note[]>('notes/')).data,
  create: async (data: NoteInput): Promise<Note> => (await apiClient.post<Note>('notes/', data)).data,
  update: async (id: number, data: NoteInput): Promise<Note> =>
    (await apiClient.patch<Note>(`notes/${id}/`, data)).data,
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`notes/${id}/`);
  },
};

export const todoService = {
  list: async (): Promise<Todo[]> => (await apiClient.get<Todo[]>('todos/')).data,
  create: async (data: TodoInput): Promise<Todo> => (await apiClient.post<Todo>('todos/', data)).data,
  update: async (id: number, data: TodoInput): Promise<Todo> =>
    (await apiClient.patch<Todo>(`todos/${id}/`, data)).data,
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`todos/${id}/`);
  },
  /** Move para a posição N entre as pendentes (o backend desloca as demais). */
  move: async (id: number, position: number): Promise<Todo> =>
    (await apiClient.post<Todo>(`todos/${id}/move/`, { position })).data,
};