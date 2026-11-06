/** Cabeçalho de uma seção do mundo: título com ícone e área de ações à direita (+ Adicionar, Editar...). */
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  id: string;
  title: string;
  Icon: LucideIcon;
  actions?: ReactNode;
}

export function SectionHeader({ id, title, Icon, actions }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
      <h2 id={id} className="flex items-center gap-2 text-xl font-bold text-white">
        <Icon size={20} className="text-rpg-primary" aria-hidden="true" />
        {title}
      </h2>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}