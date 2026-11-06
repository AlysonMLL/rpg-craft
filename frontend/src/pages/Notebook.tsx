/**
 * O que há aqui:
 * - Página /notebook com as abas Notas e Tarefas (?aba=notas | ?aba=tarefas).
 * - Carrega notas, tarefas e mundos uma vez; as abas editam a mesma lista.
 *
 * Função do arquivo: Central de produtividade do Mestre. É o destino dos botões
 * "Exibir tudo (N)" dos widgets da Home.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../api/auth';
import { noteService, todoService, type Note, type Todo } from '../api/notebook';
import { worldService, type World } from '../api/worlds';
import NotesTab from '../components/notebook/NotesTab';
import TodosTab from '../components/notebook/TodosTab';
import { Skeleton, TabPanel, Tabs, toast } from '../components/ui';

export default function Notebook() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('aba') === 'tarefas' ? 'tarefas' : 'notas';
  const isGuest = authService.isGuest();
  // ?nota=ID abre a nota direto (links da atividade recente)
  const noteParam = Number(params.get('nota')) || null;

  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([noteService.list(), todoService.list(), worldService.getAllWorlds()])
      .then(([loadedNotes, loadedTodos, loadedWorlds]) => {
        setNotes(loadedNotes);
        setTodos(loadedTodos);
        setWorlds(loadedWorlds);
      })
      .catch(() => toast.error('Não foi possível carregar o Notebook. Tente de novo.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8 text-gray-200">
      <header>
        <h1 className="text-3xl font-bold text-white">Notebook</h1>
        <p className="text-sm text-rpg-muted">
          {isGuest
            ? 'Veja as anotações e tarefas dos mundos de exemplo.'
            : 'Suas anotações e tarefas, de todos os mundos.'}
        </p>
      </header>

      <Tabs
        idPrefix="notebook"
        ariaLabel="Seções do Notebook"
        value={tab}
        onChange={(value) => setParams({ aba: value }, { replace: true })}
        items={[
          { value: 'notas', label: 'Notas', count: notes.length },
          { value: 'tarefas', label: 'Tarefas', count: todos.length },
        ]}
      />

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-12" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          <TabPanel idPrefix="notebook" value="notas" current={tab}>
            <NotesTab
              notes={notes}
              onNotesChange={setNotes}
              worlds={worlds}
              isGuest={isGuest}
              initialNoteId={noteParam}
            />
          </TabPanel>
          <TabPanel idPrefix="notebook" value="tarefas" current={tab}>
            <TodosTab todos={todos} onTodosChange={setTodos} worlds={worlds} isGuest={isGuest} />
          </TabPanel>
        </>
      )}
    </div>
  );
}