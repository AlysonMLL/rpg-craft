/**
 * Modal sobre o elemento nativo <dialog>: o navegador cuida de foco preso,
 * tecla Esc e camada acima de tudo. Fecha com Esc, clique fora e botão X.
 * O conteúdo só é montado enquanto aberto, então formulários reiniciam
 * ao reabrir (mesmo comportamento dos modais atuais).
 */
import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  size?: Size;
  /** Altura fixa de 85vh (ex: editor de notas) */
  tall?: boolean;
  children: ReactNode;
}

const sizes: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  icon,
  footer,
  size = 'md',
  tall = false,
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      onCancel={(e) => {
        e.preventDefault(); // deixa o estado do pai decidir o fechamento
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        'm-auto w-full overflow-visible border-0 bg-transparent p-4 text-inherit',
        'backdrop:bg-black/80 backdrop:backdrop-blur-sm',
        sizes[size],
      )}
    >
      {open && (
        <div
          className={cn(
            'flex animate-pop-in flex-col overflow-hidden rounded-xl border border-gray-700 bg-rpg-card shadow-2xl',
            tall ? 'h-[85vh]' : 'max-h-[85vh]',
          )}
        >
          {(title || icon) && (
            <div className="flex items-center justify-between border-b border-gray-800 p-5">
              <h2 id={titleId} className="flex items-center gap-2 text-xl font-bold text-white">
                {icon}
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-md p-1 text-rpg-muted transition-colors hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
          {footer && (
            <div className="flex justify-end gap-3 border-t border-gray-800 p-4">{footer}</div>
          )}
        </div>
      )}
    </dialog>
  );
}
