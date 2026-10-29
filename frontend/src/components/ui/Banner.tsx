/**
 * Faixa de aviso para o topo da página (ex: modo convidado).
 * onDismiss: se informado, mostra o "x" para fechar; quem usa decide
 * onde guardar o estado (ex: sessionStorage).
 * action: link ou botão opcional à direita (ex: "Fazer login").
 */
import type { ReactNode } from 'react';
import { CircleCheck, Info, OctagonAlert, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../lib/cn';

type Tone = 'info' | 'warning' | 'success' | 'danger';

interface BannerProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const tones: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: 'border-rpg-secondary/30 bg-rpg-secondary/10', icon: 'text-rpg-secondary', Icon: Info },
  warning: { box: 'border-rpg-primary/30 bg-rpg-primary/10', icon: 'text-rpg-primary', Icon: TriangleAlert },
  success: { box: 'border-green-400/30 bg-green-400/10', icon: 'text-rpg-success', Icon: CircleCheck },
  danger: { box: 'border-red-400/30 bg-red-400/10', icon: 'text-rpg-danger', Icon: OctagonAlert },
};

export function Banner({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  className,
}: BannerProps) {
  const { box, icon, Icon } = tones[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex w-full items-center gap-3 border-b px-4 py-2.5 text-sm', box, className)}
    >
      <Icon size={18} className={cn('shrink-0', icon)} aria-hidden="true" />
      <p className="min-w-0 flex-1 text-gray-200">
        {title && <strong className="mr-1.5 font-bold text-white">{title}</strong>}
        {children}
      </p>
      {action}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="shrink-0 rounded p-1 text-rpg-muted transition-colors hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
