/**
 * Função do Arquivo: Gaveta lateral animada, sobre <dialog> (foco preso, Esc e camada acima de
 * tudo). Usos: ficha de personagem, detalhes de raça/criatura/evento, menu no celular
 * (side="left"). Fecha com Esc, clique fora e botão X. A animação dura ~200ms; o conteúdo só
 * fica montado enquanto a gaveta existe.
 *
 * Cabeçalho: por padrão mostra o `title`. Com `headerContent` (ex.: abas) ele ocupa o lugar do
 * título; nesse caso passe `ariaLabel` para dar nome à gaveta.
 *
 * Redimensionável (`resizable`): em telas >= 1024px aparece uma alça na borda; dá para arrastar,
 * usar as setas/Home/End do teclado ou clicar duas vezes para voltar ao padrão. Vai de
 * `minWidth` (420px) até 50% da tela e a largura escolhida fica no localStorage. Abaixo de
 * 1024px (ou sem `resizable`) vale a largura fixa de `width`.
 *
 * O que há aqui:
 * - Drawer: componente (props: open, onClose, title, ariaLabel, headerContent, headerActions,
 *   footer, side, width, resizable, children).
 * - DrawerResizable: configuração do redimensionamento (storageKey, defaultWidth, minWidth).
 * - useViewportWidth (interno): largura da janela, atualizada ao redimensionar.
 * - readStoredWidth / writeStoredWidth (internos): largura salva, com try/catch.
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

type Side = 'left' | 'right';
type Width = 'sm' | 'md' | 'lg' | 'xl';

export interface DrawerResizable {
  /** Chave do localStorage onde a largura escolhida fica guardada. */
  storageKey: string;
  /** Largura inicial em px (padrão 640). */
  defaultWidth?: number;
  /** Largura mínima em px (padrão 420). */
  minWidth?: number;
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Nome acessível da gaveta quando não há `title`. */
  ariaLabel?: string;
  /** Ocupa o lugar do título no cabeçalho (ex.: abas). */
  headerContent?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  side?: Side;
  width?: Width;
  resizable?: DrawerResizable;
  children: ReactNode;
}

const widths: Record<Width, string> = {
  sm: 'max-w-sm',
  md: 'max-w-[480px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[720px]',
};

const CLOSE_DELAY_MS = 220;
const RESIZE_MIN_VIEWPORT = 1024; // abaixo disso a gaveta usa a largura fixa (width)
const RESIZE_MAX_RATIO = 0.5; // teto: metade da tela
const RESIZE_DEFAULT = 640;
const RESIZE_MIN = 420;
const KEY_STEP = 24;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function readStoredWidth(key: string): number | null {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeStoredWidth(key: string, value: number | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(Math.round(value)));
  } catch {
    // Sem armazenamento (modo privado, cota): a largura só não fica salva
  }
}

function useViewportWidth() {
  const [viewport, setViewport] = useState(() => window.innerWidth);
  useEffect(() => {
    const update = () => setViewport(window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return viewport;
}

export function Drawer({
  open,
  onClose,
  title,
  ariaLabel,
  headerContent,
  headerActions,
  footer,
  side = 'right',
  width = 'md',
  resizable,
  children,
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [rendered, setRendered] = useState(false); // conteúdo montado
  const [entered, setEntered] = useState(false); // painel na posição final

  const isRight = side === 'right';
  const viewport = useViewportWidth();
  const storageKey = resizable?.storageKey;
  const minPx = resizable?.minWidth ?? RESIZE_MIN;
  const defaultPx = resizable?.defaultWidth ?? RESIZE_DEFAULT;
  const maxPx = Math.max(minPx, Math.floor(viewport * RESIZE_MAX_RATIO));
  const canResize = resizable !== undefined && viewport >= RESIZE_MIN_VIEWPORT;

  const [stored, setStored] = useState<number | null>(() =>
    resizable ? readStoredWidth(resizable.storageKey) : null,
  );
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number; moved: boolean } | null>(null);
  const justResized = useRef(false); // evita que o "soltar" do arraste conte como clique fora

  // Largura em px quando redimensionável; null = usa a largura fixa (width)
  const panelPx = canResize ? clamp(stored ?? defaultPx, minPx, maxPx) : null;

  useEffect(() => {
    if (storageKey && !dragging) writeStoredWidth(storageKey, stored);
  }, [storageKey, stored, dragging]);

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

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (panelPx === null || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startWidth: panelPx, moved: false };
    setDragging(true);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = isRight ? drag.startX - event.clientX : event.clientX - drag.startX;
    if (Math.abs(delta) > 3) drag.moved = true;
    setStored(clamp(drag.startWidth + delta, minPx, maxPx));
  };

  const endDrag = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    if (drag.moved) {
      justResized.current = true;
      window.setTimeout(() => {
        justResized.current = false;
      }, 80);
    }
  };

  const keyResize = (event: KeyboardEvent<HTMLDivElement>) => {
    if (panelPx === null) return;
    const grow = isRight ? 'ArrowLeft' : 'ArrowRight';
    const shrink = isRight ? 'ArrowRight' : 'ArrowLeft';
    let next: number;
    if (event.key === grow) next = panelPx + KEY_STEP;
    else if (event.key === shrink) next = panelPx - KEY_STEP;
    else if (event.key === 'Home') next = minPx;
    else if (event.key === 'End') next = maxPx;
    else return;
    event.preventDefault();
    setStored(clamp(next, minPx, maxPx));
  };

  const closeFromOutside = () => {
    if (!justResized.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeFromOutside();
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
            onClick={closeFromOutside}
          />
          <div
            style={panelPx !== null ? { width: panelPx } : undefined}
            className={cn(
              'absolute inset-y-0 flex flex-col bg-rpg-card shadow-2xl transition-transform duration-200 ease-out',
              panelPx === null ? `w-full ${widths[width]}` : 'max-w-full',
              isRight ? 'right-0 border-l border-gray-700' : 'left-0 border-r border-gray-700',
              entered ? 'translate-x-0' : isRight ? 'translate-x-full' : '-translate-x-full',
              dragging && 'select-none',
            )}
          >
            {panelPx !== null && (
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Redimensionar painel"
                aria-valuemin={minPx}
                aria-valuemax={maxPx}
                aria-valuenow={panelPx}
                tabIndex={0}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={keyResize}
                onDoubleClick={() => setStored(null)}
                className={cn(
                  'group absolute inset-y-0 z-20 w-3 cursor-col-resize touch-none',
                  isRight ? '-left-1.5' : '-right-1.5',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 transition-colors',
                    dragging
                      ? 'bg-rpg-primary'
                      : 'bg-transparent group-hover:bg-rpg-primary/60 group-focus-visible:bg-rpg-secondary',
                  )}
                />
              </div>
            )}

            <div
              className={cn(
                'flex shrink-0 justify-between gap-3 border-b border-gray-800',
                Boolean(headerContent) ? 'items-stretch pl-5 pr-3' : 'items-center p-5',
              )}
            >
              {headerContent ? (
                <div className="flex min-w-0 flex-1 items-end">{headerContent}</div>
              ) : (
                <h2 id={titleId} className="min-w-0 truncate text-lg font-bold text-white">
                  {title}
                </h2>
              )}
              <div className={cn('flex shrink-0 items-center gap-1', Boolean(headerContent) && 'py-2')}>
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