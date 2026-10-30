/**
 * O que há aqui:
 * - Tela dividida: à esquerda a mensagem da marca sobre o mapa (BG-Login.png, em /public);
 *   à direita o cartão de acesso.
 * - Login com usuário e senha (com botão de mostrar/ocultar senha).
 * - "Entrar como convidado": modo somente leitura com mundos de exemplo.
 * - Logo só no topo esquerdo (não se repete no cartão). No mobile some a coluna
 *   da esquerda e o mapa fica escurecido atrás do cartão.
 *
 * Função do arquivo: Apresentar a interface de autenticação do usuário e
 * decidir o tipo de sessão (logado ou convidado) antes de ir ao Dashboard.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { ArrowRight, BookOpen, Eye, EyeOff, Globe, Lock, User } from 'lucide-react';
import { authService } from '../api/auth';
import { Button, Input } from '../components/ui';
import logoRpgCraft from '../assets/logo_rpgcraft.png';

const highlights = [
  { label: 'Mundos', Icon: Globe },
  { label: 'Personagens', Icon: User },
  { label: 'Histórias', Icon: BookOpen },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Quem já está logado não precisa ver o login de novo
  if (authService.isAuthenticated()) return <Navigate to="/" replace />;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login({ username, password });
      navigate('/'); // Vai para a Home (Dashboard) se der certo
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Usuário ou senha incorretos.');
      } else {
        setError('Não foi possível conectar ao servidor. Tente novamente em instantes.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    authService.enterAsGuest();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-rpg-bg">
      {/* Fundo: mapa + camadas de escurecimento para manter o texto legível */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/BG-Login.png')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-rpg-bg/70 lg:bg-transparent" />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-linear-to-r from-rpg-bg/90 via-rpg-bg/30 to-transparent lg:block"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-rpg-bg/70 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-12">
        <header>
          <img src={logoRpgCraft} alt="RPG.Craft" className="h-12 object-contain" />
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-2">
          {/* Mensagem da marca (desktop) */}
          <section className="hidden max-w-lg lg:block">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-rpg-primary">
              Sua próxima grande aventura
            </p>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
              Todo grande RPG começa com um <span className="text-rpg-primary">mundo</span>.
            </h1>
            <p className="mt-5 max-w-sm text-lg text-gray-300">
              Crie universos, desenvolva personagens e construa histórias que merecem ser contadas.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {highlights.map(({ label, Icon }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-gray-300 backdrop-blur-sm"
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </section>

          {/* Cartão de acesso */}
          <section className="mx-auto w-full max-w-md lg:ml-auto">
            <div className="relative rounded-2xl border border-gray-800 bg-rpg-card/85 p-8 shadow-2xl backdrop-blur-md">
              <span
                aria-hidden="true"
                className="absolute -left-px -top-px h-5 w-5 rounded-tl-2xl border-l-2 border-t-2 border-rpg-primary/50"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -right-px h-5 w-5 rounded-br-2xl border-b-2 border-r-2 border-rpg-primary/50"
              />

              <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
              <p className="mb-6 mt-1 text-sm text-rpg-muted">
                Entre para continuar criando seus mundos.
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                <Input
                  label="Nome de usuário"
                  leftIcon={<User size={18} />}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome de usuário"
                  autoComplete="username"
                  autoFocus
                  required
                />

                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={<Lock size={18} />}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={showPassword}
                      className="rounded-md p-2 text-rpg-muted transition-colors hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                />

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-400/10 px-3 py-2 text-center text-sm font-medium text-rpg-danger"
                  >
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" fullWidth glow loading={isLoading}>
                  {isLoading ? (
                    'Entrando...'
                  ) : (
                    <>
                      Entrar no RPG.Craft <ArrowRight size={18} aria-hidden="true" />
                    </>
                  )}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-rpg-subtle">
                <span className="h-px flex-1 bg-gray-800" />
                ou
                <span className="h-px flex-1 bg-gray-800" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                disabled={isLoading}
                onClick={handleGuest}
              >
                Entrar como convidado
              </Button>
              <p className="mt-3 text-center text-xs text-rpg-subtle">
                Explore mundos de exemplo sem criar conta. Somente leitura.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
