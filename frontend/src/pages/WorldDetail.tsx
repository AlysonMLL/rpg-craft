/**
 * O que há aqui:
 * - Hero Banner blindado com style={{ minHeight: '320px' }} para ignorar bugs de compilação de altura.
 * - Layout Flexbox rebaixado para 'md:flex-row', garantindo que a Sidebar da direita NUNCA suma no Desktop.
 * - Conteúdo do banner alinhado de forma natural com Flexbox (mt-auto) e não mais 'absolute', evitando cortes.
 * - Gradientes rigorosamente atualizados para a nova sintaxe v4 (bg-linear-to-*).
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
      
      {/* 1. HERO BANNER - Blindado com style inline para garantir altura */}
      <div 
        className="relative w-full bg-gray-900 shrink-0 flex flex-col justify-end"
        style={{ minHeight: '320px' }}
      >
        {/* Imagem ou Fundo Base */}
        {world.cover_image ? (
          <img src={world.cover_image} alt={world.name} className="absolute inset-0 w-full h-full object-cover z-0" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-linear-to-r from-gray-900 to-gray-800 z-0" />
        )}
        
        {/* Máscaras de Gradiente v4 */}
        <div className="absolute inset-0 bg-linear-to-t from-rpg-bg via-rpg-bg/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-linear-to-r from-rpg-bg via-rpg-bg/40 to-transparent z-10" />

        {/* Botão Voltar (Fixo na tela, acima do gradiente) */}
        <div className="absolute top-6 left-6 md:left-8 z-30">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 transition-all text-sm font-medium"
          >
            <ChevronLeft size={18} /> Voltar
          </button>
        </div>

        {/* Título e Tags (No fluxo flexível, impossível de ser cortado) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto p-6 md:p-8 flex flex-col justify-end mt-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">
            {world.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            {world.tags.map(tag => (
              <span key={tag.id} className="text-xs font-bold text-rpg-secondary bg-rpg-secondary/10 px-3 py-1.5 rounded border border-rpg-secondary/30 backdrop-blur-md">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL E SIDEBAR DIREITA */}
      {/* O md:flex-row garante que em monitores normais a tela será dividida em duas colunas */}
      <div className="w-full max-w-7xl mx-auto p-6 md:p-8 flex flex-col md:flex-row gap-8 lg:gap-12 items-start relative z-10">
        
        {/* COLUNA ESQUERDA: Grid de Módulos (min-w-0 impede que o flexbox quebre) */}
        <div className="flex-1 min-w-0 w-full space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-white">Início</h2>
            <p className="text-gray-400">Visão geral de {world.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod, idx) => (
              <button 
                key={idx}
                className="bg-rpg-card border border-gray-800 rounded-xl p-5 hover:border-rpg-primary/50 hover:bg-gray-800/50 transition-all group relative overflow-hidden flex flex-col items-start justify-between text-left w-full"
                style={{ minHeight: '140px' }} // Altura garantida
              >
                <div className="absolute inset-0 bg-linear-to-r from-rpg-primary/0 via-rpg-primary/0 to-rpg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between w-full mb-3 relative z-10">
                  <div className={`p-2 rounded-lg bg-gray-900 border border-gray-700/50 ${mod.color}`}>
                    <mod.icon size={22} />
                  </div>
                  <span className="text-3xl font-black text-gray-800 group-hover:text-gray-700 transition-colors">
                    {mod.count}
                  </span>
                </div>
                
                <div className="relative z-10 w-full mt-auto">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-rpg-primary transition-colors">{mod.title}</h3>
                  <p className="text-sm text-gray-500 leading-snug">{mod.desc}</p>
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

        {/* COLUNA DIREITA: Índice de Seções (Sidebar Interna) */}
        {/* Alterado para md:block para NUNCA sumir em monitores desktop */}
        <div className="hidden md:block w-56 lg:w-64 shrink-0 sticky top-8">
          <div className="bg-rpg-card border border-gray-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Seções</p>
            <nav className="space-y-1">
              {indexLinks.map((link, idx) => (
                <button 
                  key={idx}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    link.active 
                      ? 'bg-gray-800 text-rpg-primary font-bold' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.icon size={16} className={link.active ? 'text-rpg-primary' : 'text-gray-500'} />
                    {link.label}
                  </div>
                  {link.count !== undefined && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
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