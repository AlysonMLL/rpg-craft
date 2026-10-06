/**
 * O que há aqui:
 * - Captura de parâmetros da URL (useParams) para identificar qual mundo carregar.
 * - Header imersivo (Hero Banner) blindado com posicionamento absoluto para evitar colapso.
 * - Layout Principal reescrito usando CSS Grid (grid-cols-12) para garantir a exibição da Sidebar.
 * - Grid de Módulos ajustado para 'md:grid-cols-2' para não ocupar a tela toda em monitores médios.
 * - Atualização sintática total para o Tailwind CSS v4 (bg-linear-*).
 * 
 * Função do arquivo: Atuar como o "Menu Principal" de uma campanha específica.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Clock, Map as MapIcon, Compass, Users, Flag, BookOpen, Skull, Users2 } from 'lucide-react';
import { worldService, type World } from '../api/worlds';

export default function WorldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [world, setWorld] = useState<World | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      worldService.getWorldById(id)
        .then(setWorld)
        .catch(err => {
          console.error(err);
          navigate('/');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, navigate]);

  if (isLoading) {
    return <div className="w-full min-h-screen bg-rpg-bg flex items-center justify-center text-rpg-primary animate-pulse">Carregando universo...</div>;
  }

  if (!world) return null;

  const modules = [
    { title: 'Resumo / Introdução', desc: 'Visão geral do mundo e premissa', icon: FileText, count: 1, color: 'text-rpg-secondary' },
    { title: 'Linha do Tempo', desc: 'Eventos cronológicos do mundo', icon: Clock, count: 8, color: 'text-blue-400' },
    { title: 'Mapas', desc: 'Geografia e regiões mapeadas', icon: MapIcon, count: 4, color: 'text-green-400' },
    { title: 'Missões / Arcos', desc: 'Campanhas e arcos narrativos ativos', icon: Compass, count: 3, color: 'text-purple-400' },
    { title: 'Personagens', desc: 'Fichas e perfis de personagens', icon: Users, count: 12, color: 'text-rpg-primary' },
    { title: 'Países / Reinos', desc: 'Nações, facções e organizações', icon: Flag, count: 6, color: 'text-red-400' },
  ];

  const indexLinks = [
    { label: 'Início', icon: FileText, active: true },
    { label: 'Resumo / Introdução', icon: FileText, count: 1 },
    { label: 'História (Lore)', icon: BookOpen, count: 3 },
    { label: 'Linha do Tempo', icon: Clock, count: 8 },
    { label: 'Mapas', icon: MapIcon, count: 4 },
    { label: 'Personagens', icon: Users, count: 12 },
    { label: 'Raças', icon: Users2, count: 5 },
    { label: 'Criaturas', icon: Skull, count: 7 },
  ];

  return (
    <div className="w-full flex flex-col relative overflow-x-hidden min-h-screen bg-rpg-bg">
      
      {/* 1. HERO BANNER (Topo) - Blindado com Altura Fixa e Posicionamento Absoluto */}
      <div className="relative w-full shrink-0 bg-gray-900 h-64 md:h-80 overflow-hidden">
        
        {/* Imagem ou Fundo Base */}
        {world.cover_image ? (
          <img src={world.cover_image} alt={world.name} className="absolute inset-0 w-full h-full object-cover z-0" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-linear-to-r from-gray-900 to-gray-800 z-0" />
        )}
        
        {/* Máscaras de Gradiente v4 */}
        <div className="absolute inset-0 bg-linear-to-t from-rpg-bg via-rpg-bg/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-linear-to-r from-rpg-bg via-rpg-bg/40 to-transparent z-10" />

        {/* Botão Voltar (Fixo no topo-esquerdo) */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 md:left-8 z-20 flex items-center gap-2 text-gray-300 hover:text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-all text-sm font-medium"
        >
          <ChevronLeft size={18} /> Voltar
        </button>

        {/* Título e Tags (Fixo na base do banner) */}
        <div className="absolute bottom-6 left-6 md:left-8 lg:left-12 z-20 max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 drop-shadow-lg tracking-tight">
            {world.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            {world.tags.map(tag => (
              <span key={tag.id} className="text-xs font-bold text-rpg-secondary bg-rpg-secondary/10 px-2.5 py-1 rounded border border-rpg-secondary/30 backdrop-blur-md">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL - Usando CSS Grid (12 Colunas) para blindar a Sidebar */}
      <div className="w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
        
        {/* COLUNA ESQUERDA: Grid de Módulos (Ocupa 8 colunas) */}
        <div className="lg:col-span-8 xl:col-span-9 w-full space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-white">Início</h2>
            <p className="text-gray-400">Visão geral de {world.name}</p>
          </div>

          {/* Cards quebram em 2 colunas logo a partir do 'md' */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod, idx) => (
              <button 
                key={idx}
                // Adicionado: items-start, text-left e w-full para evitar o comportamento padrão de botão
                className="bg-rpg-card border border-gray-800 rounded-xl p-5 hover:border-rpg-primary/50 hover:bg-gray-800/50 transition-all group relative overflow-hidden flex flex-col items-start text-left justify-between min-h-35 w-full"
              >
                <div className="absolute inset-0 bg-linear-to-r from-rpg-primary/0 via-rpg-primary/0 to-rpg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between w-full mb-3 relative z-10">
                  <div className={`p-2 rounded-lg bg-gray-900 border border-gray-700/50 ${mod.color}`}>
                    <mod.icon size={20} />
                  </div>
                  <span className="text-3xl font-black text-gray-800 group-hover:text-gray-700 transition-colors">
                    {mod.count}
                  </span>
                </div>
                
                <div className="relative z-10 w-full mt-auto">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-rpg-primary transition-colors">{mod.title}</h3>
                  <p className="text-sm text-gray-500">{mod.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800/80">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-rpg-secondary" /> Sinopse
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {world.synopsis}
            </p>
          </div>

        </div>

        {/* COLUNA DIREITA: Índice de Seções (Ocupa 4 colunas) */}
        {/* A classe lg:block esconde no celular e mostra no Desktop, garantindo espaço com o CSS Grid */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 w-full sticky top-8">
          <div className="bg-rpg-card border border-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">Seções</p>
            <nav className="space-y-1">
              {indexLinks.map((link, idx) => (
                <button 
                  key={idx}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    link.active 
                      ? 'bg-gray-800 text-rpg-primary font-bold' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <link.icon size={16} className={link.active ? 'text-rpg-primary' : 'text-gray-500'} />
                    {link.label}
                  </div>
                  {link.count !== undefined && (
                    <span className="text-xs font-bold text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded">
                      {link.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

      </div>
    </div>
  );
}