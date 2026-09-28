/**
 * O que há aqui:
 * - LoginCredentials: Interface TypeScript definindo o formato esperado para login.
 * - AuthTokens: Interface TypeScript definindo o retorno esperado do Django (access e refresh).
 * - login(): Dispara a requisição POST para a rota de JWT do backend.
 * - logout(): Limpa os rastros do usuário no navegador.
 * 
 * Função do arquivo: Isolar os serviços de rede referentes à identidade do usuário.
 * Traduz os comandos de interface (clicar em "Entrar") em ações de persistência de sessão 
 * (guardar tokens no localStorage), operando como a camada de Serviços do domínio de Contas.
*/

import { apiClient } from './client';

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    // Acessa diretamente a URL completa pois o client tem baseURL até /api/
    const response = await apiClient.post<AuthTokens>('auth/token/', credentials);
    
    // Se deu certo, armazena os tokens no cofre do navegador
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    return response.data;
  },

  logout: () => {
    // Limpa a sessão
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated: (): boolean => {
    // Checagem rápida se existe um token (não garante que é válido, mas serve para UI)
    return !!localStorage.getItem('access_token');
  }
};