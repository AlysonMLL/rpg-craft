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
import { Search, Plus, Bell, Clock, Users, MapPin, Book } from 'lucide-react';
import { worldService, type World } from '../api/worlds';

export default function Home() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorlds = async () => {
      try {
        const data = await worldService.getAllWorlds();
        setWorlds(data);
      } catch (error) {
        console.error("Erro ao buscar os mundos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorlds();
  }, []);

  return (
    <div className="min-h-screen bg-rpg-bg text-gray-200 p-8 flex flex-col gap-8">
      
      {/* 1. TOPO: Header e Ações */}
      <header className="flex items-center justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar personagens, locais, eventos..." 
            className="w-full bg-rpg-card border border-gray-800 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-rpg-primary transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-rpg-primary text-black font-bold px-4 py-2.5 rounded-lg hover:bg-[#c5cc04] transition-colors text-sm shadow-[0_0_15px_rgba(220,227,5,0.3)]">
            <Plus size={18} />
            Novo RPG
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
        <p className="text-gray-400 text-sm">Bem-vindo de volta ao seu ateliê de mundos.</p>
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
                Seus RPGs <span className="text-gray-500 text-sm font-normal">({worlds.length})</span>
              </h2>
            </div>

            {isLoading ? (
              <div className="text-gray-400 animate-pulse">Invocando dados do universo...</div>
            ) : worlds.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-700 rounded-xl text-center text-gray-500">
                Você ainda não criou nenhum mundo. Clique em "Novo RPG" para começar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {worlds.map((world) => (
                  /* Card do Mundo */
                  <div key={world.id} className="bg-rpg-card border border-gray-800/80 rounded-xl overflow-hidden hover:border-rpg-primary/50 hover:shadow-[0_0_20px_rgba(220,227,5,0.05)] transition-all cursor-pointer group flex flex-col h-full">
                    {/* Imagem de Capa (Placeholder escuro se não houver) */}
                    <div className="h-40 bg-gray-900 relative overflow-hidden">
                      {world.cover_image ? (
                        <img src={world.cover_image} alt={world.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                        <h3 className="text-lg font-bold text-white mb-2">{world.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {world.tags.map(tag => (
                            <span key={tag.id} className="text-xs font-medium text-rpg-secondary bg-rpg-secondary/10 px-2 py-0.5 rounded border border-rpg-secondary/20">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800/60 mt-auto">
                        <div className="flex items-center gap-3">
                          {/* Placeholder para contadores futuros */}
                          <span className="flex items-center gap-1" title="Personagens"><Users size={12} /> --</span>
                          <span className="flex items-center gap-1" title="Locais"><MapPin size={12} /> --</span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(world.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* COLUNA DIREITA: Widgets (Ocupa 1/3) */}
        <div className="space-y-6">
          {/* Widget de Notas Rápidas */}
          <div className="bg-rpg-card border border-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Book size={16} className="text-rpg-primary" />
              Notas Rápidas
            </h3>
            <div className="text-sm text-gray-400 space-y-3">
              <p className="font-medium text-gray-300">Ideias para a próxima sessão</p>
              <p>A seita dos Cinco Pilares está se movendo nas sombras. Preciso conectar o arco do Véu com a chegada da Lyra...</p>
              <div className="pt-3 border-t border-gray-800 mt-2">
                <p className="text-rpg-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <span className="w-4 h-4 rounded-full border-2 border-rpg-primary flex items-center justify-center">✓</span>
                  Escrever backstory
                </p>
              </div>
            </div>
          </div>

          {/* Widget de Atividade Recente */}
          <div className="bg-rpg-card border border-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-white font-bold mb-4">Atividade Recente</h3>
            <ul className="space-y-4 text-sm relative before:absolute before:inset-y-2 before:left-1.5 before:w-px before:bg-gray-800">
              {[
                { text: "Lyra Valerius atualizada", color: "bg-rpg-secondary" },
                { text: "Novo local: Torre de Cristal", color: "bg-rpg-primary" },
                { text: "Aethervania criado", color: "bg-green-500" }
              ].map((act, i) => (
                <li key={i} className="pl-6 relative">
                  <span className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${act.color} ring-4 ring-rpg-card`}></span>
                  <p className="text-gray-300">{act.text}</p>
                  <span className="text-[10px] text-gray-600">Há algumas horas</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  );
}