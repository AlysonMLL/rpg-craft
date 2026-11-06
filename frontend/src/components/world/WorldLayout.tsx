/**
 * O que há aqui:
 * - WorldLayout: layout compartilhado das páginas de um mundo (rota /world/:id/*).
 *   Carrega o mundo uma vez e o entrega às páginas filhas pelo Outlet (hook useWorld).
 * - Hero com capa (ou gradiente do nome): altura cheia na Visão geral, compacto nas outras.
 * - Barra de abas fixa: Visão geral | Personagens | Mapas | Raças e Criaturas.
 * - Breadcrumb discreto nas páginas internas.
 *
 * Função do arquivo: Dar a todas as telas de um mundo a mesma moldura e navegação.
 */
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, LayoutGrid, Map as MapIcon, PawPrint, Users } from 'lucide-react';
import { worldService, type World } from '../../api/worlds';
import type { WorldContext } from '../../hooks/useWorld';
import { coverGradient } from '../../lib/worldUtils';
import { cn } from '../../lib/cn';
import { Badge, Skeleton, toast } from '../ui';

const TABS = [
  { path: '', label: 'Visão geral', Icon: LayoutGrid },
  { path: 'personagens', label: 'Personagens', Icon: Users },
  { path: 'mapas', label: 'Mapas', Icon: MapIcon },
  { path: 'racas-criaturas', label: 'Raças e Criaturas', Icon: PawPrint },
];

export default function WorldLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [world, setWorld] = useState<World | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    worldService
      .getWorldById(id)
      .then(setWorld)
      .catch(() => {
        toast.error('Não encontramos esse mundo.');
        navigate('/', { replace: true });
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  if (isLoading || !world) {
    return (
      <div aria-busy="true">
        <Skeleton className="h-80 w-full rounded-none" />
        <div className="mx-auto max-w-7xl space-y-4 px-6 py-6 md:px-8">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  const base = `/world/${world.id}`;
  const isOverview = pathname.replace(/\/$/, '') === base;
  const currentTab = TABS.find((tab) => tab.path && pathname.startsWith(`${base}/${tab.path}`));
  const context: WorldContext = { world, updateWorld: setWorld };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <header
        className={cn(
          'relative flex w-full shrink-0 flex-col justify-end bg-gray-900 motion-safe:transition-[min-height] motion-safe:duration-300',
          isOverview ? 'min-h-80' : 'min-h-40',
        )}
      >
        {world.cover_image ? (
          <img src={world.cover_image} alt="" className="absolute inset-0 z-0 h-full w-full object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0"
            style={{ background: coverGradient(world.name) }}
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-linear-to-t from-rpg-bg via-rpg-bg/60 to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-linear-to-r from-rpg-bg via-rpg-bg/40 to-transparent" />

        <div className="absolute left-6 top-5 z-30 md:left-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-black/40 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:border-gray-500 hover:text-white"
          >
            <ChevronLeft size={18} aria-hidden="true" />
            Voltar
          </Link>
        </div>

        <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-5 pt-20 md:px-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {world.is_demo && <Badge variant="highlight">Público</Badge>}
            {world.tags.map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
          </div>
          <h1
            className={cn(
              'font-extrabold tracking-tight text-white drop-shadow-lg motion-safe:transition-all',
              isOverview ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-3xl',
            )}
          >
            {world.name}
          </h1>
        </div>
      </header>

      {/* Barra de abas fixa */}
      <nav
        aria-label="Seções do mundo"
        className="sticky top-0 z-30 border-b border-gray-800 bg-rpg-bg/90 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-x-6 px-6 md:px-8">
          {TABS.map(({ path, label, Icon }) => (
            <NavLink
              key={label}
              to={path ? `${base}/${path}` : base}
              end={!path}
              className={({ isActive }) =>
                cn(
                  'inline-flex shrink-0 items-center gap-2 border-b-2 px-1 py-3.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-rpg-primary text-white'
                    : 'border-transparent text-rpg-muted hover:text-white',
                )
              }
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Conteúdo da página */}
      <div className="mx-auto w-full max-w-7xl px-6 py-6 md:px-8">
        {currentTab && (
          <nav aria-label="Você está em" className="mb-5 text-sm text-rpg-muted">
            <Link to="/" className="transition-colors hover:text-white">
              Início
            </Link>
            <span aria-hidden="true"> / </span>
            <Link to={base} className="transition-colors hover:text-white">
              {world.name}
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-gray-200">{currentTab.label}</span>
          </nav>
        )}
        <Outlet context={context} />
      </div>
    </div>
  );
}