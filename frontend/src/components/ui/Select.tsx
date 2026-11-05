/**
 * Select baseado no <select> nativo, estilizado no padrão dos campos.
 * Escolha deliberada: o nativo é acessível, funciona bem no celular e, com
 * color-scheme escuro (index.css), a lista de opções também fica escura.
 * Passe as opções por `options` ou como <option> em children.
 * size: "md" (padrão) ou "sm" (compacto, para tabelas).
 * Se um dia precisar de ícones ou cores dentro das opções, criar um Listbox à parte.
 */
import { useId } from 'react';
import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { fieldBad, fieldBase, fieldOk, fieldSizes, type FieldSize } from '../../lib/fieldStyles';
import { FieldShell } from './FieldShell';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<ComponentProps<'select'>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  size?: FieldSize;
}

export function Select({
  label,
  hint,
  error,
  options,
  size = 'md',
  className,
  id,
  required,
  children,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            fieldBase,
            fieldSizes[size],
            'appearance-none',
            size === 'sm' ? 'pr-8' : 'pr-10',
            error ? fieldBad : fieldOk,
            className,
          )}
          {...rest}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown
          size={size === 'sm' ? 14 : 16}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-rpg-subtle',
            size === 'sm' ? 'right-2.5' : 'right-3',
          )}
        />
      </div>
    </FieldShell>
  );
}
