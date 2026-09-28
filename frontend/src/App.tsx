/**
 * O que há aqui:
 * - Componente ProtectedRoute: Um "guarda de rota" que verifica se há token. Se não houver, chuta o usuário para /login.
 * - Definição das rotas públicas (Login).
 * - Definição das rotas privadas (Dashboard, Detalhes do RPG, etc).
 * 
 * Função do arquivo: Orquestrar a navegação e a segurança de acesso no frontend.
 * Ele garante que apenas usuários autenticados renderizem os componentes principais, 
 * centralizando a árvore de rotas da plataforma.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './api/auth';
// Importando as páginas a seguir
import Login from './pages/Login';
import Home from './pages/Home'; // Dashboard principal
import MainLayout from './components/layout/MainLayout';

// Guarda de Rota
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rotas Privadas agrupadas dentro do MainLayout */}
      <Route 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* O 'index' significa que a Home renderiza no path="/" */}
        <Route index element={<Home />} />
        
        {/* Futuras rotas entram aqui sem precisar importar a Sidebar nelas */}
        {/* <Route path="notebook" element={<Notebook />} /> */}
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}