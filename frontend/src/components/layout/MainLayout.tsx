/**
 * O que há aqui:
 * - Componente MainLayout: Estrutura base de envoltório para a área autenticada.
 * - Renderiza a Sidebar na esquerda e a área de conteúdo (Outlet) na direita.
 * 
 * Função do arquivo: Servir como o esqueleto visual das rotas privadas.
 * Evita a repetição de código, garantindo que a Sidebar seja carregada apenas uma vez 
 * e permaneça fixa enquanto o usuário navega fluidamente pelas páginas do ateliê.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-rpg-bg text-gray-200 font-sans selection:bg-rpg-primary selection:text-black">
      {/* Navegação Lateral Fixa */}
      <Sidebar />
      
      {/* Área Principal de Conteúdo - Ocupa o restante da tela */}
      <main className="flex-1 overflow-y-auto relative">
        {/* O Outlet é substituído pelo componente da página atual (ex: Home) */}
        <Outlet />
      </main>
    </div>
  );
}