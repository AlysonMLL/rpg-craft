/**
 * Função do Arquivo: Navegação no celular. Abaixo de md a Sidebar some; no lugar entra esta barra
 * fixa no topo (botão de menu + logo) que abre uma gaveta à esquerda com os mesmos itens, o usuário
 * e o botão de sair (ou de fazer login, no modo convidado). A gaveta fecha ao navegar.
 *
 * O que há aqui:
 * - MobileNav (export default): barra + gaveta, visível só abaixo de md.
 */

import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Menu } from 'lucide-react';
import logoRpgCraft from '../../assets/logo_rpgcraft.png';
import { authService } from '../../api/auth';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { cn } from '../../lib/cn';
import { Badge, Drawer } from '../ui';
import { NAV_ITEMS } from './navItems';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isGuest = authService.isGuest();
  const user = useCurrentUser();

  const displayName = isGuest ? 'Convidado' : (user?.username ?? '…');
  const initial = (isGuest ? 'C' : (user?.username?.[0] ?? '·')).toUpperCase();
  const ExitIcon = isGuest ? LogIn : LogOut;
  const exitLabel = isGuest ? 'Fazer login' : 'Sair';

  const close = () => setOpen(false);

  const handleExit = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-800 bg-rpg-bg/90 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          className="rounded-md p-2 text-rpg-primary transition-colors hover:bg-rpg-card hover:text-white"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
        <img src={logoRpgCraft} alt="RPG.Craft" className="h-8 object-contain" />
      </header>

      <Drawer open={open} onClose={close} side="left" width="sm" title="Menu">
        <nav aria-label="Navegação principal" className="space-y-2">
          {NAV_ITEMS.map(({ to, label, Icon, soon, alsoActiveOn }) => {
            if (soon) {
              return (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg px-4 py-3 font-medium text-rpg-subtle"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={20} aria-hidden="true" />
                    {label}
                  </span>
                  <Badge variant="neutral">Em breve</Badge>
                </div>
              );
            }
            const alsoActive = alsoActiveOn?.some((prefix) => pathname.startsWith(prefix)) ?? false;
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-3 font-medium transition-colors',
                    isActive || alsoActive
                      ? 'border-rpg-primary/30 bg-rpg-card text-rpg-primary'
                      : 'border-transparent text-gray-400 hover:bg-rpg-card/50 hover:text-white',
                  )
                }
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-gray-800/60 bg-rpg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-600 bg-gray-700 font-bold text-rpg-secondary">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-rpg-subtle">{isGuest ? 'Modo convidado' : 'Mestre'}</p>
          </div>
          <button
            type="button"
            onClick={handleExit}
            aria-label={exitLabel}
            title={exitLabel}
            className="shrink-0 rounded-md p-2 text-rpg-muted transition-colors hover:bg-gray-800 hover:text-white"
          >
            <ExitIcon size={18} aria-hidden="true" />
          </button>
        </div>
      </Drawer>
    </>
  );
}