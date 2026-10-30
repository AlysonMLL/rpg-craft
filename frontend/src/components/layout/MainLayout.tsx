/**
 * O que há aqui:
 * - Componente MainLayout: Estrutura base de envoltório para a área logada ou de convidado.
 * - Renderiza a Sidebar na esquerda e, na direita, o aviso de convidado (se for o caso)
 *   acima da área de conteúdo (Outlet).
 *
 * Função do arquivo: Servir como o esqueleto visual das rotas internas.
 * Evita a repetição de código, garantindo que a Sidebar seja carregada apenas uma vez
 * e permaneça fixa enquanto o usuário navega fluidamente pelas páginas do ateliê.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import GuestBanner from './GuestBanner';
import { authService } from '../../api/auth';

export default function MainLayout() {
  const isGuest = authService.isGuest();

  return (
    <div className="flex min-h-screen bg-rpg-bg text-gray-200 font-sans selection:bg-rpg-primary selection:text-black">
      {/* Navegação Lateral Fixa */}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {isGuest && <GuestBanner />}

        {/* Área Principal de Conteúdo - Ocupa o restante da tela */}
        <main className="relative flex-1 overflow-y-auto">
          {/* O Outlet é substituído pelo componente da página atual (ex: Home) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
