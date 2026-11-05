/**
 * O que há aqui:
 * - Estado dos mundos (worlds) e carregamento; useEffect busca no Django ao abrir a tela.
 * - Header superior com busca (visual por enquanto) e botão de Novo RPG.
 * - "Seus RPGs" (WorldsSection): ordenação, filtros, arrastar e favoritos.
 * - Coluna direita: NotesWidget e TodosWidget (dados reais do backend) e "Atividade Recente"
 *   (UI estática até existir o log de atividade).
 *
 * Função do arquivo: Ser o centro de comando do usuário logado ou convidado.
 * Consolida os mundos e oferece atalhos de produtividade; no modo convidado tudo é somente leitura.
 */

import { useState, useEffect } from 'react';
import { Search, Plus, Bell } from 'lucide-react';
import { worldService, type World } from '../api/worlds';
import CreateWorldModal from '../components/world/CreateWorldModal';
import WorldsSection from '../components/world/WorldsSection';
import NotesWidget from '../components/notebook/NotesWidget';
import TodosWidget from '../components/notebook/TodosWidget';
import { authService } from '../api/auth';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Button, Card } from '../components/ui';

export default function Home() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Modo convidado: somente leitura (o backend também bloqueia escrita)
  const isGuest = authService.isGuest();
  const user = useCurrentUser();

  const [isWorldModalOpen, setIsWorldModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen text-gray-200 p-8 flex flex-col gap-8">
      {/* 1. TOPO: Header e Ações */}
      <header className="flex items-center justify-between">
        <div className="relative w-full max-w-xl">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-rpg-subtle"
            size={20}
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Buscar"
            placeholder="Buscar personagens, locais, eventos..."
            className="w-full bg-rpg-card border border-gray-800 rounded-full py-2.5 pl-10 pr-4 text-sm placeholder:text-rpg-subtle focus:outline-none focus:border-rpg-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            glow
            leftIcon={<Plus size={18} />}
            disabled={isGuest}
            title={isGuest ? 'Disponível após fazer login' : undefined}
            onClick={() => setIsWorldModalOpen(true)} // <-- Abre o Modal
          >
            Novo RPG
          </Button>
          <button
            type="button"
            aria-label="Notificações"
            className="p-2.5 bg-rpg-card border border-gray-800 rounded-lg hover:border-gray-600 transition-colors text-gray-400"
          >
            <Bell size={20} />
          </button>
          {/* Avatar: inicial do usuário (V de visitante no modo convidado) */}
          <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center font-bold text-rpg-secondary">
            {(isGuest ? 'V' : (user?.username?.[0] ?? '·')).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Título de Boas Vindas */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">
          {isGuest ? 'Olá, visitante' : 'Olá, Mestre'}
        </h1>
        <p className="text-gray-400 text-sm">
          {isGuest
            ? 'Explore os mundos de exemplo do RPG.Craft.'
            : 'Bem-vindo de volta ao seu ateliê de mundos.'}
        </p>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL: Divisão em 2 colunas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* COLUNA ESQUERDA: Mundos (Ocupa 2/3 da tela em monitores grandes) */}
        <div className="xl:col-span-2 space-y-8">
          <WorldsSection
            title={isGuest ? 'Mundos de exemplo' : 'Seus RPGs'}
            worlds={worlds}
            onWorldsChange={setWorlds}
            isLoading={isLoading}
            isGuest={isGuest}
            limit={6}
          />
        </div>

        {/* COLUNA DIREITA: Widgets */}
        <div className="space-y-6">
          <NotesWidget isGuest={isGuest} />
          <TodosWidget isGuest={isGuest} />

          {/* Atividade Recente (estática até existir o log de atividade) */}
          <Card>
            <h3 className="text-white font-bold mb-4">Atividade Recente</h3>
            <ul className="space-y-4 text-sm relative before:absolute before:inset-y-2 before:left-1.5 before:w-px before:bg-gray-800">
              {[
                { text: 'Lyra Valerius atualizada', color: 'bg-rpg-secondary' },
                { text: 'Novo local: Torre de Cristal', color: 'bg-rpg-primary' },
                { text: 'Aethervania criado', color: 'bg-green-500' },
              ].map((act) => (
                <li key={act.text} className="pl-6 relative">
                  <span
                    className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${act.color} ring-4 ring-rpg-card`}
                  ></span>
                  <p className="text-gray-300">{act.text}</p>
                  <span className="text-[10px] text-rpg-subtle">Há algumas horas</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Montagem dos Modais na raiz da tela */}
      <CreateWorldModal
        isOpen={isWorldModalOpen}
        onClose={() => setIsWorldModalOpen(false)}
        onSuccess={fetchWorlds}
      />
    </div>
  );
}
