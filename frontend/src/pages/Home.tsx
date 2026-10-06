/**
 * O que há aqui:
 * - Estado para armazenar os mundos (worlds), carregamento (isLoading) e pesquisa.
 * - Hook useEffect que dispara a busca no Django assim que a tela abre.
 * - Header superior com input de busca e botão de Novo RPG (Neon).
 * - Grid responsivo de "Seus RPGs", mapeando os dados reais do banco.
 * - Painel lateral de "Notas Rápidas" e "Atividade Recente" (UI estática por enquanto).
 *
 * Função do arquivo: Ser o centro de comando do usuário logado.
 * Consolida todas as instâncias de mundos criadas e oferece atalhos de produtividade,
 * replicando fielmente a identidade cyberpunk/dark-mode aprovada no design system.
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Clock,
  Users,
  MapPin,
  Book,
  CheckSquare,
  Square,
  Trash2,
} from 'lucide-react';
import { worldService, type World } from '../api/worlds';
import CreateWorldModal from '../components/world/CreateWorldModal';
import NoteModal, { type NoteData } from '../components/notebook/NoteModal';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Controles de Modais
  const [isWorldModalOpen, setIsWorldModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<NoteData | null>(null);

  const [todos, setTodos] = useState([
    { id: 1, text: 'Escrever backstory da Lyra', isDone: true },
    { id: 2, text: 'Mapear região sul de Oakhaven', isDone: false },
  ]);
  const [newTodo, setNewTodo] = useState('');

  const [notes, setNotes] = useState<NoteData[]>([
    {
      id: 1,
      title: 'Lore da Seita dos Cinco Pilares',
      content: 'A seita se move pelas sombras, atuando...',
    },
  ]);

  const fetchWorlds = async () => {
    setIsLoading(true);
    try {
      const data = await worldService.getAllWorlds();
      setWorlds(data);
    } catch (error) {
      console.error('Erro ao buscar os mundos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorlds();
  }, []);

  // Funções de TO-DO
  const toggleTodo = (id: number) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, isDone: !t.isDone } : t)));
  const deleteTodo = (id: number) => setTodos(todos.filter((t) => t.id !== id));
  const addTodo = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, isDone: false }]);
      setNewTodo('');
    }
  };

  // Funções de NOTAS
  const deleteNote = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Evita que clicar na lixeira abra o modal
    setNotes(notes.filter((n) => n.id !== id));
  };
  const handleSaveNote = (note: NoteData) => {
    if (note.id) {
      setNotes(notes.map((n) => (n.id === note.id ? note : n)));
    } else {
      setNotes([{ ...note, id: Date.now() }, ...notes]);
    }
    setIsNoteModalOpen(false);
  };
  const openNewNote = () => {
    setCurrentNote(null); // Passar null sinaliza que é uma nota nova
    setIsNoteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-rpg-bg text-gray-200 p-8 flex flex-col gap-8">
      {/* 1. TOPO: Header e Ações */}
      <header className="flex items-center justify-between">
        <div className="relative w-full max-w-xl">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar personagens, locais, eventos..."
            className="w-full bg-rpg-card border border-gray-800 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-rpg-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsWorldModalOpen(true)} // <-- Abre o Modal
            className="flex items-center gap-2 bg-rpg-primary text-black font-bold px-4 py-2.5 rounded-lg hover:bg-[#c5cc04] transition-colors text-sm shadow-[0_0_15px_rgba(220,227,5,0.3)]"
          >
            <Plus size={18} /> Novo RPG
          </button>
          <button className="p-2.5 bg-rpg-card border border-gray-800 rounded-lg hover:border-gray-600 transition-colors text-gray-400">
            <Bell size={20} />
          </button>
          {/* Avatar mockado */}
          <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center font-bold text-rpg-secondary">
            M
          </div>
        </div>
      </header>

      {/* Título de Boas Vindas */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Olá, Mestre</h1>
        <p className="text-gray-400 text-sm">
          Bem-vindo de volta ao seu ateliê de mundos.
        </p>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL: Divisão em 2 colunas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* COLUNA ESQUERDA: Mundos (Ocupa 2/3 da tela em monitores grandes) */}
        <div className="xl:col-span-2 space-y-8">
          {/* Seção: Seus RPGs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-rpg-secondary" />
                Seus RPGs{' '}
                <span className="text-gray-500 text-sm font-normal">
                  ({worlds.length})
                </span>
              </h2>
            </div>

            {isLoading ? (
              <div className="text-gray-400 animate-pulse">
                Invocando dados do universo...
              </div>
            ) : worlds.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-700 rounded-xl text-center text-gray-500">
                Você ainda não criou nenhum mundo. Clique em "Novo RPG" para
                começar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {worlds.map((world) => (
                  /* Card do Mundo */
                  <div
                    key={world.id}
                    onClick={() => navigate(`/world/${world.id}`)}
                    className="bg-rpg-card border border-gray-800/80 rounded-xl overflow-hidden hover:border-rpg-primary/50 hover:shadow-[0_0_20px_rgba(220,227,5,0.05)] transition-all cursor-pointer group flex flex-col h-full"
                  >
                    {/* Imagem de Capa (Placeholder escuro se não houver) */}
                    <div className="h-40 bg-gray-900 relative overflow-hidden">
                      {world.cover_image ? (
                        <img
                          src={world.cover_image}
                          alt={world.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 bg-linear-to-br from-gray-800 to-gray-900">
                          <MapPin size={40} className="opacity-30" />
                        </div>
                      )}
                      {/* Flag de Demo */}
                      {world.is_demo && (
                        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-rpg-primary text-[10px] font-bold px-2 py-1 rounded uppercase border border-rpg-primary/30">
                          Público
                        </span>
                      )}
                    </div>

                    {/* Informações do Card */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          {world.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {world.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="text-xs font-medium text-rpg-secondary bg-rpg-secondary/10 px-2 py-0.5 rounded border border-rpg-secondary/20"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800/60 mt-auto">
                        <div className="flex items-center gap-3">
                          {/* Placeholder para contadores futuros */}
                          <span
                            className="flex items-center gap-1"
                            title="Personagens"
                          >
                            <Users size={12} /> --
                          </span>
                          <span
                            className="flex items-center gap-1"
                            title="Locais"
                          >
                            <MapPin size={12} /> --
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />{' '}
                          {new Date(world.created_at).toLocaleDateString(
                            'pt-BR',
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* COLUNA DIREITA: Widgets Interativos */}
        <div className="space-y-6">
          {/* 1. Widget de NOTAS RÁPIDAS */}
          <div className="bg-rpg-card border border-gray-800 rounded-xl p-5 shadow-sm flex flex-col max-h-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Book size={16} className="text-rpg-primary" />
                Notas Rápidas
              </h3>
              <button
                onClick={openNewNote}
                className="text-xs text-rpg-primary hover:text-white transition-colors font-bold"
              >
                + Nova
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Nenhuma anotação.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setCurrentNote(note);
                      setIsNoteModalOpen(true);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-800/60 bg-rpg-bg hover:border-rpg-primary/50 cursor-pointer group transition-all"
                  >
                    <p className="text-sm font-medium text-gray-300 truncate pr-4">
                      {note.title}
                    </p>
                    <button
                      onClick={(e) => deleteNote(e, note.id!)}
                      className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                      title="Deletar Nota"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Widget de TO-DOS */}
          <div className="bg-rpg-card border border-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <CheckSquare size={16} className="text-rpg-primary" /> Lista de
              Tarefas
            </h3>
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between group p-1"
                >
                  <div
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    {todo.isDone ? (
                      <CheckSquare
                        size={16}
                        className="text-rpg-primary shrink-0"
                      />
                    ) : (
                      <Square
                        size={16}
                        className="text-gray-500 group-hover:text-gray-400 shrink-0"
                      />
                    )}
                    <span
                      className={`text-sm transition-colors truncate ${todo.isDone ? 'text-gray-500 line-through' : 'text-gray-300'}`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={addTodo}
              placeholder="+ Adicionar tarefa (Enter)"
              className="w-full bg-rpg-bg border border-gray-800 rounded px-3 py-2 text-sm text-white focus:border-rpg-primary focus:outline-none mt-3"
            />
          </div>

          {/* Widget de Atividade Recente */}
        <div className="bg-rpg-card border border-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-white font-bold mb-4">Atividade Recente</h3>
            <ul className="space-y-4 text-sm relative before:absolute before:inset-y-2 before:left-1.5 before:w-px before:bg-gray-800">
            {[
                { text: 'Lyra Valerius atualizada', color: 'bg-rpg-secondary' },
                { text: 'Novo local: Torre de Cristal', color: 'bg-rpg-primary' },
                { text: 'Aethervania criado', color: 'bg-green-500' },
            ].map((act, i) => (
                <li key={i} className="pl-6 relative">
                <span
                    className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${act.color} ring-4 ring-rpg-card`}
                ></span>
                <p className="text-gray-300">{act.text}</p>
                <span className="text-[10px] text-gray-600">
                    Há algumas horas
                </span>
                </li>
            ))}
            </ul>
        </div>
        </div>
      </div>

      

      {/* Montagem dos Modais na raiz da tela */}
      <CreateWorldModal
        isOpen={isWorldModalOpen}
        onClose={() => setIsWorldModalOpen(false)}
        onSuccess={fetchWorlds}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        initialData={currentNote}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
      />
    </div>
  );
}
