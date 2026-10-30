/**
 * O que há aqui:
 * - login(): POST na rota JWT do backend e guarda os tokens no localStorage.
 * - logout(): limpa tokens, modo convidado e cache do usuário.
 * - enterAsGuest() / isGuest(): modo convidado (somente leitura). Não usa token;
 *   a flag fica em sessionStorage, então fechar a aba encerra o modo convidado.
 * - getMe(): dados do usuário logado (rota auth/me/), com cache em memória.
 *
 * Função do arquivo: Isolar os serviços de rede e de sessão da identidade do usuário.
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

export interface CurrentUser {
  id: number;
  username: string;
  first_name: string;
  email: string;
}

const GUEST_KEY = 'guest_mode';
const GUEST_BANNER_KEY = 'guest_banner_dismissed';

let meCache: Promise<CurrentUser> | null = null;

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    // Acessa diretamente a URL completa pois o client tem baseURL até /api/
    const response = await apiClient.post<AuthTokens>('auth/token/', credentials);

    // Se deu certo, armazena os tokens no cofre do navegador
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    sessionStorage.removeItem(GUEST_KEY);
    meCache = null;

    return response.data;
  },

  logout: () => {
    clearTokens();
    sessionStorage.removeItem(GUEST_KEY);
    sessionStorage.removeItem(GUEST_BANNER_KEY);
    meCache = null;
  },

  isAuthenticated: (): boolean => {
    // Checagem rápida se existe um token (não garante que é válido, mas serve para UI)
    return !!localStorage.getItem('access_token');
  },

  /**
   * Entra como visitante. Os tokens são apagados de propósito: com
   * JWTAuthentication, um token expirado no header gera 401 até em rotas públicas.
   */
  enterAsGuest: () => {
    clearTokens();
    meCache = null;
    sessionStorage.setItem(GUEST_KEY, '1');
    sessionStorage.removeItem(GUEST_BANNER_KEY);
  },

  isGuest: (): boolean => {
    return !authService.isAuthenticated() && sessionStorage.getItem(GUEST_KEY) === '1';
  },

  getMe: (): Promise<CurrentUser> => {
    if (!meCache) {
      meCache = apiClient
        .get<CurrentUser>('auth/me/')
        .then((response) => response.data)
        .catch((error) => {
          meCache = null; // permite tentar de novo depois
          throw error;
        });
    }
    return meCache;
  },
};
