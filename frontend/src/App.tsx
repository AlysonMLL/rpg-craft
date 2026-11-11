/**
 * O que há aqui:
 * - ProtectedRoute: deixa passar quem tem token OU entrou como convidado;
 *   quem não tem nenhum dos dois vai para /login.
 * - Rota pública (Login) e rotas dentro do MainLayout (Home, WorldDetail).
 * - /dev/ui: página de estilo, só em desenvolvimento e só se o arquivo existir
 *   (hoje DevUI.tsx está no .gitignore). O import.meta.glob não quebra o build
 *   quando o arquivo está ausente, ao contrário de um import direto.
 * - Toaster: notificações globais.
 *
 * Função do arquivo: Orquestrar a navegação e o acesso no frontend.
 * No modo convidado a escrita é bloqueada pelo backend (somente leitura).
 */

import { lazy, Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './api/auth';
import Login from './pages/Login';
import Home from './pages/Home'; // Dashboard principal
import MainLayout from './components/layout/MainLayout';
import { Map as MapIcon, PawPrint } from 'lucide-react';
import WorldLayout from './components/world/WorldLayout';
import WorldOverview from './pages/WorldOverview';
import WorldSectionPlaceholder from './pages/WorldSectionPlaceholder';
import Worlds from './pages/Worlds';
import Notebook from './pages/Notebook';
import Characters from './pages/Characters';
import { Toaster } from './components/ui';

// Página de estilo (opcional, só em dev)
const devPages = import.meta.glob('./pages/DevUI.tsx');
const loadDevUI = devPages['./pages/DevUI.tsx'];
const DevUI =
  import.meta.env.DEV && loadDevUI
    ? lazy(loadDevUI as () => Promise<{ default: ComponentType }>)
    : null;

// Guarda de Rota
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  if (!authService.isAuthenticated() && !authService.isGuest()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rotas agrupadas dentro do MainLayout (logado ou convidado) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* O 'index' significa que a Home renderiza no path="/" */}
          <Route index element={<Home />} />

          {/* Espaço do mundo: layout compartilhado (hero + abas) com as páginas filhas */}
          <Route path="world/:id" element={<WorldLayout />}>
            <Route index element={<WorldOverview />} />
            <Route path="personagens" element={<Characters />} />
            <Route
              path="mapas"
              element={
                <WorldSectionPlaceholder
                  title="Mapas"
                  description="Mapas interativos, locais e organizações do mundo."
                  Icon={MapIcon}
                />
              }
            />
            <Route
              path="racas-criaturas"
              element={
                <WorldSectionPlaceholder
                  title="Raças e Criaturas"
                  description="Os povos e os seres do mundo, com perigo, nível e onde são comuns."
                  Icon={PawPrint}
                />
              }
            />
          </Route>
          <Route path="mundos" element={<Worlds />} />
          <Route path="notebook" element={<Notebook />} />
          {DevUI && (
            <Route
              path="dev/ui"
              element={
                <Suspense fallback={null}>
                  <DevUI />
                </Suspense>
              }
            />
          )}
          {/* Futuras rotas entram aqui sem precisar importar a Sidebar nelas */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}