/**
 * O que há aqui:
 * - Estado local 'isExpanded' que controla se a barra está larga (256px) ou fina (80px).
 * - Botão de Toggle (Menu/PanelLeftClose) posicionado no topo da barra.
 * - Classes dinâmicas do Tailwind para animar a transição de largura (transition-all).
 * - Renderização condicional: textos e medidor de plano desaparecem quando retraída, centralizando os ícones.
 * 
 * Função do arquivo: Fornecer a navegação lateral responsiva e retrátil da aplicação.
 * Além de ditar a identidade visual global, permite que o usuário maximize o espaço de tela 
 * para focar no conteúdo principal (Home, Notebook, etc.) com um único clique.
*/

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Book, Image as ImageIcon, User, Sparkles, PanelLeftClose, Menu } from 'lucide-react';
import logoRpgCraft from '../../assets/logo_rpgcraft.png';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  // A função define o estilo do link dependendo se a rota está ativa E se a barra está expandida
  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    // Se expandida, alinha à esquerda com padding. Se retraída, cria um quadrado centralizado.
    const baseClass = `flex items-center rounded-lg transition-all duration-200 font-medium ${
      isExpanded ? 'justify-start px-4 py-3 gap-3' : 'justify-center w-12 h-12 mx-auto'
    }`;
    
    return isActive 
      ? `${baseClass} bg-rpg-card border border-rpg-primary/30 text-rpg-primary shadow-[0_0_10px_rgba(220,227,5,0.1)]`
      : `${baseClass} text-gray-400 hover:text-white hover:bg-rpg-card/50`;
  };

  return (
    <aside 
      className={`h-screen border-r border-gray-800 bg-rpg-bg flex flex-col justify-between sticky top-0 shrink-0 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      } hidden md:flex`}
    >
      
      {/* TOPO: Toggle e Logo */}
      <div>
        <div className={`flex items-center h-20 ${isExpanded ? 'justify-between px-6' : 'justify-center'}`}>
          {/* Se retraída, a logo some e fica apenas o botão de Menu centralizado */}
          {isExpanded && (
            <img 
              src={logoRpgCraft} 
              alt="RPG.Craft" 
              className="h-8 object-contain drop-shadow-md animate-in fade-in duration-300" 
            />
          )}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-rpg-primary hover:text-white p-2 rounded-md hover:bg-rpg-card transition-colors shrink-0"
            title={isExpanded ? "Recolher menu" : "Expandir menu"}
          >
            {isExpanded ? <PanelLeftClose size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* NAVEGAÇÃO: Ícones e Textos */}
        <nav className="space-y-2 px-2 mt-4">
          <NavLink to="/" className={getLinkClass} title="Início">
            <Home size={20} className="shrink-0" />
            {isExpanded && <span className="animate-in fade-in duration-200">Início</span>}
          </NavLink>
          
          <NavLink to="/notebook" className={getLinkClass} title="Notebook">
            <Book size={20} className="shrink-0" />
            {isExpanded && <span className="animate-in fade-in duration-200">Notebook</span>}
          </NavLink>
          
          <NavLink to="/galeria" className={getLinkClass} title="Galeria">
            <ImageIcon size={20} className="shrink-0" />
            {isExpanded && <span className="animate-in fade-in duration-200">Galeria</span>}
          </NavLink>
          
          <NavLink to="/perfil" className={getLinkClass} title="Perfil">
            <User size={20} className="shrink-0" />
            {isExpanded && <span className="animate-in fade-in duration-200">Perfil</span>}
          </NavLink>

          {/* Item Desabilitado: Mestre IA */}
          <div 
            className={`flex items-center rounded-lg text-gray-500 cursor-not-allowed opacity-60 bg-rpg-card/30 border border-transparent transition-all mt-6 ${
              isExpanded ? 'justify-between px-4 py-3' : 'justify-center w-12 h-12 mx-auto'
            }`}
            title="Mestre IA (Em breve)"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="shrink-0" />
              {isExpanded && <span className="animate-in fade-in duration-200">Mestre IA</span>}
            </div>
            {isExpanded && (
              <span className="text-[9px] uppercase font-bold tracking-widest border border-gray-700 px-2 py-1 rounded text-gray-400 bg-gray-800/50">
                Breve
              </span>
            )}
          </div>
        </nav>
      </div>

      {/* BASE: Status do Plano (Oculto se a barra estiver retraída) */}
      <div className="p-4 border-t border-gray-800/80 bg-rpg-bg min-h-25 flex items-center justify-center overflow-hidden">
        {isExpanded ? (
          <div className="bg-rpg-card p-4 rounded-xl border border-gray-800/60 shadow-sm w-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-rpg-secondary font-bold tracking-wide">Plano Grátis</span>
              <span className="text-gray-400 font-medium">3 / 5 RPGs</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-1.5 mb-1.5">
              <div 
                className="bg-rpg-primary h-1.5 rounded-full shadow-[0_0_8px_rgba(220,227,5,0.5)]" 
                style={{ width: '60%' }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Criados</p>
          </div>
        ) : (
          /* Quando retraído, exibe apenas uma bolinha de status para manter o design limpo */
          <div 
            className="w-10 h-10 rounded-full bg-rpg-card border border-gray-800/60 flex items-center justify-center cursor-help"
            title="Plano Grátis: 3 de 5 RPGs criados"
          >
            <div className="w-2 h-2 rounded-full bg-rpg-primary shadow-[0_0_8px_rgba(220,227,5,0.8)]"></div>
          </div>
        )}
      </div>

    </aside>
  );
}