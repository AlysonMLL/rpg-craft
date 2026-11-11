/**
 * Superfície padrão (cards de mundo, widgets, módulos).
 * interactive: card clicável com elevação de 4px, sombra e borda destacada no hover,
 * mais o brilho metálico (classe card-shine, em index.css). Em telas de toque e com
 * "reduzir movimento" o brilho e a elevação não animam.
 * Se o card inteiro é clicável, use um link "esticado" no título
 * (after:absolute after:inset-0) para ter foco por teclado.
 * Cards estáticos (widgets) e compactos (linhas de lista) não usam interactive.
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
          'card-shine cursor-pointer transition-[translate,box-shadow,border-color] duration-300 ease-out motion hover:border-rpg-primary/50 hover:shadow-lift hover:-translate-y-1',        className,
      )}
      {...rest}
    />
  );
}