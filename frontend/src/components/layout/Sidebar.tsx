/**
 * O que há aqui:
 * - Estado local 'isExpanded' que controla se a barra está larga (256px) ou fina (80px).
 * - Botão de Toggle (Menu/PanelLeftClose) posicionado no topo da barra.
 * - Navegação principal; "Início" também fica ativo dentro de um mundo (/world/:id).
 * - Rodapé com o usuário e o botão de sair (ou de fazer login, no modo convidado).
 *
 * Função do arquivo: Fornecer a navegação lateral responsiva e retrátil da aplicação.
 * Além de ditar a identidade visual global, permite que o usuário maximize o espaço de tela
 * para focar no conteúdo principal (Home, Notebook, etc.) com um único clique.
 */

import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Book,
  Image as ImageIcon,
  User,
  Sparkles,
  PanelLeftClose,
  Menu,
  LogOut,
  LogIn,
} from 'lucide-react';
import logoRpgCraft from '../../assets/logo_rpgcraft.png';
import { authService } from '../../api/auth';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isGuest = authService.isGuest();
  const user = useCurrentUser();

  const displayName = isGuest ? 'Convidado' : (user?.username ?? '…');
  const initial = (isGuest ? 'C' : (user?.username?.[0] ?? '·')).toUpperCase();
  const ExitIcon = isGuest ? LogIn : LogOut;
  const exitLabel = isGuest ? 'Fazer login' : 'Sair';

  // Sair (ou, no modo convidado, ir para o login) limpa a sessão e volta ao /login
  const handleExit = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  // A função define o estilo do link dependendo se a rota está ativa E se a barra está expandida
  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    // Se expandida, alinha à esquerda com padding. Se retraída, cria um quadrado centralizado.
    const baseClass = `flex items-center rounded-lg transition-all duration-200 font-medium ${
      isExpanded ? 'justify-start px-4 py-3 gap-3' : 'justify-center w-12 h-12 mx-auto'
    }`;

    return isActive
      ? `${baseClass} bg-rpg-card border border-rpg-primary/30 text-rpg-primary shadow-neon-soft`
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
              className="h-12 object-contain drop-shadow-md animate-fade-in"
            />
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-rpg-primary hover:text-white p-2 rounded-md hover:bg-rpg-card transition-colors shrink-0"
            title={isExpanded ? 'Recolher menu' : 'Expandir menu'}
            aria-label={isExpanded ? 'Recolher menu' : 'Expandir menu'}
          >
            {isExpanded ? <PanelLeftClose size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* NAVEGAÇÃO: Ícones e Textos */}
        <nav className="space-y-2 px-2 mt-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              getLinkClass({ isActive: isActive || pathname.startsWith('/world') })
            }
            title="Início"
          >
            <Home size={20} className="shrink-0" />
            {isExpanded && <span className="animate-fade-in">Início</span>}
          </NavLink>

          <NavLink to="/notebook" className={getLinkClass} title="Notebook">
            <Book size={20} className="shrink-0" />
            {isExpanded && <span className="animate-fade-in">Notebook</span>}
          </NavLink>

          <NavLink to="/galeria" className={getLinkClass} title="Galeria">
            <ImageIcon size={20} className="shrink-0" />
            {isExpanded && <span className="animate-fade-in">Galeria</span>}
          </NavLink>

          <NavLink to="/perfil" className={getLinkClass} title="Perfil">
            <User size={20} className="shrink-0" />
            {isExpanded && <span className="animate-fade-in">Perfil</span>}
          </NavLink>

          {/* Item Desabilitado: Mestre IA */}
          <div
            className={`flex items-center rounded-lg text-rpg-subtle cursor-not-allowed opacity-60 bg-rpg-card/30 border border-transparent transition-all mt-6 ${
              isExpanded ? 'justify-between px-4 py-3' : 'justify-center w-12 h-12 mx-auto'
            }`}
            title="Mestre IA (Em breve)"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="shrink-0" />
              {isExpanded && <span className="animate-fade-in">Mestre IA</span>}
            </div>
            {isExpanded && (
              <span className="text-xs font-medium border border-gray-700 px-2 py-0.5 rounded text-rpg-muted bg-gray-800/50">
                Em breve
              </span>
            )}
          </div>
        </nav>
      </div>

      {/* BASE: usuário e saída */}
      <div className="p-4 border-t border-gray-800/80 bg-rpg-bg">
        {isExpanded ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-800/60 bg-rpg-card p-3 animate-fade-in">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-600 bg-gray-700 font-bold text-rpg-secondary">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-rpg-subtle">{isGuest ? 'Modo convidado' : 'Mestre'}</p>
            </div>
            <button
              onClick={handleExit}
              title={exitLabel}
              aria-label={exitLabel}
              className="shrink-0 rounded-md p-2 text-rpg-muted transition-colors hover:bg-gray-800 hover:text-white"
            >
              <ExitIcon size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleExit}
            title={exitLabel}
            aria-label={exitLabel}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg text-rpg-muted transition-colors hover:bg-rpg-card hover:text-white"
          >
            <ExitIcon size={20} />
          </button>
        )}
      </div>
    </aside>
  );
}
