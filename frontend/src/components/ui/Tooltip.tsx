/**
 * Dica curta ao passar o mouse ou focar o elemento. Envolve UM elemento filho
 * (botão, link, ícone) e liga a dica a ele por aria-describedby.
 * Funciona também em botões desabilitados, porque o hover é do wrapper.
 */
import { cloneElement, useId } from 'react';
import type { ReactElement } from 'react';
import { cn } from '../../lib/cn';

type Side = 'top' | 'bottom';

interface TooltipProps {
  content: string;
  side?: Side;
  children: ReactElement<{ 'aria-describedby'?: string }>;
}

const sides: Record<Side, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
};

export function Tooltip({ content, side = 'top', children }: TooltipProps) {
  const id = useId();

  return (
    <span className="group/tip relative inline-flex">
      {cloneElement(children, { 'aria-describedby': id })}
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-gray-700 bg-black px-2.5 py-1.5 text-xs text-gray-200 opacity-0 shadow-lg transition-opacity duration-150',
          'group-hover/tip:opacity-100 group-focus-within/tip:opacity-100',
          sides[side],
        )}
      >
        {content}
      </span>
    </span>
  );
}
