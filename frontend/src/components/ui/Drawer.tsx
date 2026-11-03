/**
 * Gaveta lateral animada, sobre <dialog> (foco preso, Esc e camada acima de tudo).
 * Usos: ficha de personagem, detalhes de raça/criatura/evento, menu no celular
 * (side="left"). Fecha com Esc, clique fora e botão X.
 * A animação dura ~200ms; o conteúdo só fica montado enquanto a gaveta existe.
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

type Side = 'left' | 'right';
type Width = 'sm' | 'md' | 'lg' | 'xl';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  side?: Side;
  width?: Width;
  children: ReactNode;
}

const widths: Record<Width, string> = {
  sm: 'max-w-sm',
  md: 'max-w-[480px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[720px]',
};

const CLOSE_DELAY_MS = 220;

export function Drawer({
  open,
  onClose,
  title,
  headerActions,
  footer,
  side = 'right',
  width = 'md',
  children,
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [rendered, setRendered] = useState(false); // conteúdo montado
  const [entered, setEntered] = useState(false); // painel na posição final

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    let frame: number | undefined;
    let timer: number | undefined;

    if (open) {
      setRendered(true);
      if (!dialog.open) dialog.showModal();
      frame = requestAnimationFrame(() => setEntered(true));
    } else {
      setEntered(false);
      timer = window.setTimeout(() => {
        setRendered(false);
        if (dialog.open) dialog.close();
      }, CLOSE_DELAY_MS);
    }

    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [open]);

  const isRight = side === 'right';

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-inherit backdrop:bg-transparent"
    >
      {rendered && (
        <>
          <div
            aria-hidden="true"
            className={cn(
              'fixed inset-0 bg-black/60 transition-opacity duration-200',
              entered ? 'opacity-100' : 'opacity-0',
            )}
            onClick={onClose}
          />
          <div
            className={cn(
              'absolute inset-y-0 flex w-full flex-col bg-rpg-card shadow-2xl transition-transform duration-200 ease-out',
              widths[width],
              isRight ? 'right-0 border-l border-gray-700' : 'left-0 border-r border-gray-700',
              entered ? 'translate-x-0' : isRight ? 'translate-x-full' : '-translate-x-full',
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-800 p-5">
              <h2 id={titleId} className="min-w-0 truncate text-lg font-bold text-white">
                {title}
              </h2>
              <div className="flex shrink-0 items-center gap-1">
                {headerActions}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
            {footer && (
              <div className="flex shrink-0 justify-end gap-3 border-t border-gray-800 p-4">
                {footer}
              </div>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}
