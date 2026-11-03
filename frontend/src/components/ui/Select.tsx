/**
 * Select baseado no <select> nativo, estilizado no padrão dos campos.
 * Escolha deliberada: o nativo é acessível, funciona bem no celular e, com
 * color-scheme escuro (index.css), a lista de opções também fica escura.
 * Passe as opções por `options` ou como <option> em children.
 * Se um dia precisar de ícones ou cores dentro das opções, criar um Listbox à parte.
 */
import { useId } from 'react';
import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { fieldBad, fieldBase, fieldOk } from '../../lib/fieldStyles';
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
}

export function Select({
  label,
  hint,
  error,
  options,
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
            'appearance-none pr-10',
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
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-rpg-subtle"
        />
      </div>
    </FieldShell>
  );
}
