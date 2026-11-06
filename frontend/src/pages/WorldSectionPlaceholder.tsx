/**
 * Página provisória das telas do mundo que ainda serão construídas
 * (Personagens, Mapas, Raças e Criaturas). Troque pela tela real quando existir.
 */
import type { LucideIcon } from 'lucide-react';
import { EmptyState } from '../components/ui';

interface WorldSectionPlaceholderProps {
  title: string;
  description: string;
  Icon: LucideIcon;
}

export default function WorldSectionPlaceholder({ title, description, Icon }: WorldSectionPlaceholderProps) {
  return (
    <section aria-label={title}>
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      <EmptyState icon={<Icon size={28} aria-hidden="true" />} title="Em breve" description={description} />
    </section>
  );
}