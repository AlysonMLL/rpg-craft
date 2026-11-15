/**
 * Função do Arquivo: Rodapé global (área logada e modo convidado). Links internos (Início,
 * Mundos, Notebook), links externos (GitHub, repositório, LinkedIn; abrem em nova aba) e a nota
 * do projeto. Sem logo (a marca fica só no topo esquerdo, na Sidebar).
 *
 * O que há aqui:
 * - Footer: componente (sem props). Os endereços externos vêm de lib/siteLinks.ts.
 */

import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { SITE_LINKS } from '../../lib/siteLinks';
import logoRpgCraft from '../../assets/logo_rpgcraft.png';

const INTERNAL = [
  { to: '/', label: 'Início' },
  { to: '/mundos', label: 'Mundos' },
  { to: '/notebook', label: 'Notebook' },
];

const EXTERNAL = [
  { href: SITE_LINKS.github, label: 'GitHub' },
  { href: SITE_LINKS.repository, label: 'Repositório do projeto' },
  { href: SITE_LINKS.linkedin, label: 'LinkedIn' },
];

const LINK = 'text-sm text-rpg-muted transition-colors hover:text-white';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-rpg-bg/80 px-6 py-8 backdrop-blur md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-8">
        <div className="max-w-sm space-y-1">
          <img
              src={logoRpgCraft}
              alt="RPG.Craft"
              className="h-8 object-contain mb-4"
            />
          <p className="text-sm text-rpg-muted">
            {/* Projeto de portfólio para criar e organizar mundos de RPG. */}
            Feito com Django e React. Em desenvolvimento, com recursos novos planejados.
          </p>
          <p className="text-xs text-rpg-subtle mt-4">© {new Date().getFullYear()} · Os mundos de exemplo são fictícios.</p>
        </div>

        <nav aria-label="Rodapé: páginas">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-rpg-subtle">Navegação</p>
          <ul className="space-y-2">
            {INTERNAL.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Rodapé: links externos">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-rpg-subtle">Links</p>
          <ul className="space-y-2">
            {EXTERNAL.map(({ href, label }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex items-center gap-1.5`}>
                  {label}
                  <ExternalLink size={12} aria-hidden="true" />
                  <span className="sr-only">(abre em uma nova aba)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}