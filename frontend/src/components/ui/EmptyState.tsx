/** Área vazia que convida a agir: diga o que falta e ofereça a ação. */
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-700 p-8 text-center">
      {icon && <div className="text-rpg-subtle">{icon}</div>}
      <h3 className="font-bold text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-rpg-muted">{description}</p>}
      {action}
    </div>
  );
}
