/**
 * Etiqueta pequena.
 * - tag: gêneros e tags de mundo (ciano)
 * - highlight: destaque, ex: "Público", "Principal" (amarelo)
 * - neutral / success / danger: status
 */
import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'tag' | 'highlight' | 'neutral' | 'success' | 'danger';

interface BadgeProps extends ComponentProps<'span'> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  tag: 'border-rpg-secondary/20 bg-rpg-secondary/10 text-rpg-secondary',
  highlight: 'border-rpg-primary/30 bg-black/60 text-rpg-primary backdrop-blur-sm',
  neutral: 'border-gray-700 bg-gray-800/60 text-rpg-muted',
  success: 'border-green-400/30 bg-green-400/10 text-rpg-success',
  danger: 'border-red-400/30 bg-red-400/10 text-rpg-danger',
};

export function Badge({ variant = 'tag', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
