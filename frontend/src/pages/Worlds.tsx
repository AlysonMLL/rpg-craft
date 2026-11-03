/**
 * O que há aqui:
 * - Página /mundos: a grade completa de mundos (sem limite), com ordenação,
 *   filtros e arrastar e soltar, reaproveitando a WorldsSection da Home.
 *
 * Função do arquivo: Destino do botão "Ver todos os mundos (N)" da Home.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../api/auth';
import { worldService, type World } from '../api/worlds';
import WorldsSection from '../components/world/WorldsSection';
import { toast } from '../components/ui';

export default function Worlds() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isGuest = authService.isGuest();

  useEffect(() => {
    worldService
      .getAllWorlds()
      .then(setWorlds)
      .catch(() => toast.error('Não foi possível carregar os mundos. Tente de novo.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8 text-gray-200">
      <nav aria-label="Você está em" className="text-sm text-rpg-muted">
        <Link to="/" className="transition-colors hover:text-white">
          Início
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-gray-200">Todos os mundos</span>
      </nav>
      <h1 className="sr-only">Todos os mundos</h1>

      <WorldsSection
        title={isGuest ? 'Mundos de exemplo' : 'Todos os mundos'}
        worlds={worlds}
        onWorldsChange={setWorlds}
        isLoading={isLoading}
        isGuest={isGuest}
      />
    </div>
  );
}