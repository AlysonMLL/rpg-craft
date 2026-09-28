/**
 * O que há aqui:
 * - Importação do React e ReactDOM.
 * - Envolvimento do componente raiz <App /> no <BrowserRouter>.
 * - Importação do CSS global com as variáveis do Tailwind v4.
 * 
 * Função do arquivo: Atuar como o ponto de inicialização (bootstrap) da aplicação React.
 * Ele injeta o contexto de roteamento necessário para que os links e as transições de 
 * página funcionem sem recarregar o navegador (Single Page Application).
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);