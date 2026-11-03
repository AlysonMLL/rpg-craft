/**
 * Input e Textarea com label, dica e erro acessíveis.
 * - leftIcon / rightSlot: ícone à esquerda e área à direita (ex: botão de
 *   mostrar senha) dentro do campo.
 * - error: mensagem de erro; marca o campo como inválido.
 */
import { useId } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { fieldBad, fieldBase, fieldOk } from '../../lib/fieldStyles';
import { FieldShell } from './FieldShell';

interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  className,
  id,
  required,
  ...rest
}: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rpg-subtle">
            {leftIcon}
          </span>
        )}
        <input
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            fieldBase,
            error ? fieldBad : fieldOk,
            leftIcon && 'pl-10',
            rightSlot && 'pr-11',
            className,
          )}
          {...rest}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            {rightSlot}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

interface TextareaProps extends ComponentProps<'textarea'> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, required, ...rest }: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldBase, 'resize-none', error ? fieldBad : fieldOk, className)}
        {...rest}
      />
    </FieldShell>
  );
}
