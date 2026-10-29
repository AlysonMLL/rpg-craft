/**
 * Superfície padrão (cards de mundo, widgets, módulos).
 * interactive: borda e brilho no hover. Se o card inteiro é clicável,
 * prefira renderizar um <button> ou <Link> dentro dele para ter foco por teclado.
 */
import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends ComponentProps<'div'> {
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ interactive = false, padded = true, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-800 bg-rpg-card',
        padded && 'p-5',
        interactive &&
          'cursor-pointer transition-colors hover:border-rpg-primary/50 hover:shadow-neon-soft',
        className,
      )}
      {...rest}
    />
  );
}
