/**
 * Checkbox no padrão do RPG.Craft: fundo #121214, borda gray-600; marcado,
 * fundo #dce305 com check preto. Usa o <input type="checkbox"> nativo
 * (teclado e leitores de tela funcionam), só esconde o visual padrão.
 */
import { useId } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'size'> {
  label?: ReactNode;
}

export function Checkbox({ label, className, id, disabled, ...rest }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex items-center gap-2.5 text-sm text-gray-200',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0">
        <input
          id={inputId}
          type="checkbox"
          disabled={disabled}
          className={cn(
            'peer h-full w-full cursor-[inherit] appearance-none rounded border border-gray-600 bg-rpg-bg transition-colors',
            'enabled:hover:border-gray-400 checked:border-rpg-primary checked:bg-rpg-primary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rpg-secondary',
          )}
          {...rest}
        />
        <Check
          size={14}
          strokeWidth={3}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto text-black opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
