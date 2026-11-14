/**
 * Função do Arquivo: Cliente HTTP (Axios) entre o React e o Django. Centraliza a URL da API
 * (VITE_API_URL; padrão: o Django local), injeta o token JWT e renova a sessão sozinho.
 *
 * O que há aqui:
 * - apiClient: instância do Axios com a URL base da API.
 * - Interceptor de requisição: anexa "Authorization: Bearer <access>" quando há token.
 * - Interceptor de resposta: num 401 (access expirado), usa o refresh token UMA vez (várias
 *   requisições simultâneas compartilham a mesma renovação), guarda os tokens novos (o refresh
 *   também gira) e repete a requisição. Se a renovação falhar, encerra a sessão e volta ao
 *   /login. Erros de login e de modo convidado (sem refresh token) passam direto.
 */

import axios, { type InternalAxiosRequestConfig } from 'axios';

const RAW_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api/';
const API_URL = RAW_URL.endsWith('/') ? RAW_URL : `${RAW_URL}/`;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('Sem refresh token');
  // Axios "puro" (sem os interceptors) para não entrar em loop
  const { data } = await axios.post<{ access: string; refresh?: string }>(
    `${API_URL}auth/token/refresh/`,
    { refresh },
  );
  localStorage.setItem('access_token', data.access);
  if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
  return data.access;
}

function endSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  if (window.location.pathname !== '/login') window.location.assign('/login');
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes('auth/token') ?? false;
    const canRetry =
      error.response?.status === 401 &&
      original !== undefined &&
      !original._retry &&
      !isAuthCall &&
      localStorage.getItem('refresh_token') !== null;

    if (!canRetry) return Promise.reject(error);

    original._retry = true;
    try {
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const access = await refreshing;
      original.headers.Authorization = `Bearer ${access}`;
      return apiClient(original);
    } catch {
      endSession();
      return Promise.reject(error);
    }
  },
);