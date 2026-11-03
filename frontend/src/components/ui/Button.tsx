/**
 * Botão base do RPG.Craft.
 * - variant: primary (ação principal), outline (ação secundária de destaque,
 *   ex: "Novo mapa"), secondary, ghost, danger.
 * - Hover do primary e do outline = INVERSÃO de cores (primary: fundo preto,
 *   texto e borda #dce305; outline: preenche de amarelo com texto preto), com
 *   leve elevação só quando o sistema permite movimento (motion-safe).
 * - loading: mostra spinner e desabilita. glow: brilho neon (só no primary).
 * type padrão é "button"; use type="submit" em formulários.
 */
import type { ComponentProps, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'outline' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  glow?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

const lift =
  'motion-safe:enabled:hover:-translate-y-0.5 motion-safe:enabled:active:translate-y-0';

const variants: Record<Variant, string> = {
  primary: cn(
    'border-rpg-primary bg-rpg-primary text-black',
    'enabled:hover:bg-black enabled:hover:text-rpg-primary',
    lift,
  ),
  outline: cn(
    'border-rpg-primary/40 text-rpg-primary',
    'enabled:hover:border-rpg-primary enabled:hover:bg-rpg-primary enabled:hover:text-black',
    lift,
  ),
  secondary: 'border-transparent bg-gray-800 text-white enabled:hover:bg-gray-700',
  ghost: 'border-transparent text-gray-300 enabled:hover:bg-rpg-card enabled:hover:text-white',
  danger:
    'border-red-400/30 bg-red-400/10 text-rpg-danger enabled:hover:bg-red-400/20',
};

const sizes: Record<Size, string> = {
  sm: 'gap-1.5 px-3 py-1.5 text-xs',
  md: 'gap-2 px-4 py-2.5 text-sm',
  lg: 'gap-2 px-5 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  glow = false,
  fullWidth = false,
  leftIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border font-bold transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        variants[variant],
        sizes[size],
        glow && variant === 'primary' && 'shadow-neon',
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
}
