/**
 * O que há aqui:
 * - Visão geral do mundo (/world/:id): página única de rolagem com 4 seções, na ordem do índice
 *   fixo à direita: Início, Resumo / Introdução, História (Lore) e Linha do Tempo.
 * - Índice sticky com destaque da seção visível (scroll-spy) e, abaixo, links para as páginas
 *   Personagens, Mapas e Raças e Criaturas.
 * - Início: metadados, sinopse, cards-portal para as páginas e a atividade recente do mundo.
 *   (Missões, documentos de História e Linha do Tempo entram nas próximas etapas.)
 */
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  History,
  Map as MapIcon,
  PawPrint,
  Users,
  type LucideIcon,
} from 'lucide-react';
import ActivityStrip from '../components/activity/ActivityStrip';
import { MarkdownView } from '../components/markdown/MarkdownView';
import { Badge, Card, EmptyState } from '../components/ui';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useWorld } from '../hooks/useWorld';
import { formatRelative } from '../lib/time';
import { cn } from '../lib/cn';

const SECTIONS = [
  { id: 'inicio', label: 'Início', Icon: FileText },
  { id: 'resumo', label: 'Resumo / Introdução', Icon: BookOpen },
  { id: 'historia', label: 'História (Lore)', Icon: History },
  { id: 'linha-do-tempo', label: 'Linha do Tempo', Icon: Clock },
] as const;

const SECTION_IDS = SECTIONS.map((section) => section.id);

interface Portal {
  path: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  tone: string;
}

const PORTALS: Portal[] = [
  {
    path: 'personagens',
    title: 'Personagens',
    description: 'Fichas, relações e documentos dos personagens.',
    Icon: Users,
    tone: 'text-rpg-secondary',
  },
  {
    path: 'mapas',
    title: 'Mapas',
    description: 'Mapas interativos, locais e organizações.',
    Icon: MapIcon,
    tone: 'text-green-400',
  },
  {
    path: 'racas-criaturas',
    title: 'Raças e Criaturas',
    description: 'Povos e seres do mundo, com perigo e nível.',
    Icon: PawPrint,
    tone: 'text-purple-400',
  },
];

function SectionHeader({ id, title, Icon }: { id: string; title: string; Icon: LucideIcon }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-3">
      <h2 id={id} className="flex items-center gap-2 text-xl font-bold text-white">
        <Icon size={20} className="text-rpg-primary" aria-hidden="true" />
        {title}
      </h2>
    </div>
  );
}

export default function WorldOverview() {
  const world = useWorld();
  const active = useScrollSpy(SECTION_IDS);
  const base = `/world/${world.id}`;

  const goToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className="flex items-start gap-8 lg:gap-12">
      <div className="min-w-0 flex-1 space-y-14">
        {/* Início */}
        <section id="inicio" aria-labelledby="inicio-titulo" className="scroll-mt-24 space-y-6">
          <div className="border-b border-gray-800 pb-3">
            <h2 id="inicio-titulo" className="flex items-center gap-2 text-xl font-bold text-white">
              <FileText size={20} className="text-rpg-primary" aria-hidden="true" />
              Início
            </h2>
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-rpg-subtle" aria-hidden="true" />
              <dt className="text-rpg-muted">Criado em</dt>
              <dd className="font-medium text-white">
                {new Date(world.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-rpg-subtle" aria-hidden="true" />
              <dt className="text-rpg-muted">Última atividade</dt>
              <dd className="font-medium text-white">
                {formatRelative(world.last_activity_at ?? world.updated_at)}
              </dd>
            </div>
          </dl>

          {world.synopsis && (
            <p className="max-w-[70ch] leading-relaxed text-gray-300">{world.synopsis}</p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PORTALS.map(({ path, title, description, Icon, tone }) => (
              <Card
                key={path}
                interactive
                padded={false}
                className="group flex flex-col has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-rpg-secondary"
              >
                <div
                  aria-hidden="true"
                  className="flex h-24 items-center justify-center bg-linear-to-br from-gray-800/70 to-rpg-bg"
                >
                  <Icon size={40} className={cn('opacity-60', tone)} />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-white">
                      <Link
                        to={`${base}/${path}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {title}
                      </Link>
                    </h3>
                    <Badge variant="neutral">Em breve</Badge>
                  </div>
                  <p className="text-sm text-rpg-muted">{description}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-bold text-rpg-primary">
                    Abrir
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                      className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <ActivityStrip worldId={world.id} title="Atividade recente deste mundo" headingAs="h3" hideWorld />
        </section>

        {/* Resumo / Introdução */}
        <section id="resumo" aria-labelledby="resumo-titulo" className="scroll-mt-24">
          <SectionHeader id="resumo-titulo" title="Resumo / Introdução" Icon={BookOpen} />
          {world.introduction_markdown ? (
            <MarkdownView content={world.introduction_markdown} className="max-w-[70ch]" />
          ) : (
            <EmptyState
              title="Sem introdução ainda"
              description="O resumo do mundo e a premissa da campanha aparecerão aqui."
            />
          )}
        </section>

        {/* História (Lore) */}
        <section id="historia" aria-labelledby="historia-titulo" className="scroll-mt-24">
          <SectionHeader id="historia-titulo" title="História (Lore)" Icon={History} />
          <EmptyState
            title="Em breve"
            description="Aqui ficarão os documentos de lore do mundo, em Markdown."
          />
        </section>

        {/* Linha do Tempo */}
        <section id="linha-do-tempo" aria-labelledby="linha-titulo" className="scroll-mt-24">
          <SectionHeader id="linha-titulo" title="Linha do Tempo" Icon={Clock} />
          <EmptyState
            title="Em breve"
            description="Os eventos do mundo no calendário da campanha aparecerão aqui."
          />
        </section>
      </div>

      {/* Índice fixo à direita */}
      <aside aria-label="Nesta página" className="sticky top-20 hidden w-60 shrink-0 lg:block">
        <div className="rounded-xl border border-gray-800 bg-rpg-card p-4">
          <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-rpg-subtle">Nesta página</p>
          <ul className="space-y-1">
            {SECTIONS.map(({ id, label, Icon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(event) => goToSection(event, id)}
                  aria-current={active === id ? 'location' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    active === id
                      ? 'bg-rpg-primary/10 font-bold text-rpg-primary'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white',
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <p className="mb-3 mt-5 border-t border-gray-800 px-2 pt-4 text-xs font-bold uppercase tracking-wider text-rpg-subtle">
            Páginas
          </p>
          <ul className="space-y-1">
            {PORTALS.map(({ path, title, Icon }) => (
              <li key={path}>
                <Link
                  to={`${base}/${path}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} aria-hidden="true" />
                    {title}
                  </span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}