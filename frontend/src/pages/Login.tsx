/**
 * O que há aqui:
 * - Estado local (useState) para username, password, erro e loading.
 * - Importação da logo (logo_rpgcraft.png).
 * - Função handleLogin: Previne o recarregamento da página, chama o serviço de auth e redireciona.
 * - Formulário estilizado com a paleta neon e dark.
 * 
 * Função do arquivo: Apresentar a interface de autenticação do usuário.
 * Captura as credenciais, envia para a camada de serviços da API e reage 
 * aos retornos (exibindo mensagens de erro ou enviando o Mestre para o Dashboard).
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import logoRpgCraft from '../assets/logo_rpgcraft.png'; // Usando a logo enviada

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login({ username, password });
      navigate('/'); // Vai para a Home (Dashboard) se der certo
    } catch (err) {
      setError('Credenciais inválidas ou erro no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rpg-bg flex items-center justify-center p-4">
      <div className="bg-rpg-card w-full max-w-md p-8 rounded-xl shadow-lg border border-gray-800">
        
        {/* Renderização da Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logoRpgCraft} 
            alt="RPG.Craft Logo" 
            className="h-16 object-contain" 
          />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Acesse o site
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-rpg-bg text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-rpg-primary focus:ring-1 focus:ring-rpg-primary transition-colors"
              placeholder="Digite seu usuário..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-rpg-bg text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-rpg-primary focus:ring-1 focus:ring-rpg-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rpg-primary text-black font-bold py-3 px-4 rounded-lg hover:bg-[#c5cc04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}