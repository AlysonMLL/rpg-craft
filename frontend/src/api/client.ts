/**
 * O que há aqui:
 * - apiClient: Instância pré-configurada do Axios apontando para a base da API do Django.
 * - Interceptor de Requisição: Vasculha o localStorage em busca do token 'access' e o injeta no cabeçalho HTTP antes da requisição sair.
 * - Interceptor de Resposta: Ponto de interceptação para erros globais (ex: token expirado gerando erro 401).
 * 
 * Função do arquivo: Atuar como o mensageiro oficial e blindado entre o React e o Django.
 * Ele centraliza a URL base e a lógica de injeção de JWT, garantindo que nenhum componente 
 * do frontend precise lidar com os detalhes de "como" a autenticação é enviada.
*/

import axios from 'axios';

// Cria a instância base apontando para o Django local
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Antes de enviar, anexa o token se ele existir
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: Lida com respostas do backend (espaço para lógica de refresh token no futuro)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for 401 (Não autorizado), o token provavelmente expirou
    if (error.response && error.response.status === 401) {
      console.error('Sessão expirada ou token inválido. É necessário fazer login novamente.');
    }
    return Promise.reject(error);
  }
);