/**
 * O que há aqui:
 * - ProtectedRoute: deixa passar quem tem token OU entrou como convidado;
 *   quem não tem nenhum dos dois vai para /login.
 * - Rota pública (Login) e rotas dentro do MainLayout (Home, WorldDetail).
 * - /dev/ui: página de estilo, registrada só em desenvolvimento.
 * - Toaster: notificações globais.
 *
 * Função do arquivo: Orquestrar a navegação e o acesso no frontend.
 * No modo convidado a escrita é bloqueada pelo backend (somente leitura).
 */

import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './api/auth';
import Login from './pages/Login';
import Home from './pages/Home'; // Dashboard principal
import MainLayout from './components/layout/MainLayout';
import WorldDetail from './pages/WorldDetail';
import DevUI from './pages/DevUI';
import { Toaster } from './components/ui';

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

          <Route path="world/:id" element={<WorldDetail />} />
          {import.meta.env.DEV && <Route path="dev/ui" element={<DevUI />} />}
          {/* Futuras rotas entram aqui sem precisar importar a Sidebar nelas */}
          {/* <Route path="notebook" element={<Notebook />} /> */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
