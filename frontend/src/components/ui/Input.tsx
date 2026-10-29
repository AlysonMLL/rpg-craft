/**
 * Input e Textarea com label, dica e erro acessíveis.
 * - leftIcon / rightSlot: ícone à esquerda e área à direita (ex: botão de
 *   mostrar senha) dentro do campo.
 * - error: mensagem de erro; marca o campo como inválido.
 */
import { useId } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

const base =
  'w-full rounded-lg border bg-rpg-bg px-4 py-2.5 text-sm text-white transition-colors ' +
  'placeholder:text-rpg-subtle focus:outline-none focus:ring-1 disabled:opacity-50';
const okState = 'border-gray-700 focus:border-rpg-primary focus:ring-rpg-primary';
const badState = 'border-red-400/60 focus:border-red-400 focus:ring-red-400';

interface FieldShellProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, required, children }: FieldShellProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-rpg-muted">
          {label}
          {required && <span className="text-rpg-primary"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rpg-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-rpg-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

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
            base,
            error ? badState : okState,
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
        className={cn(base, 'resize-none', error ? badState : okState, className)}
        {...rest}
      />
    </FieldShell>
  );
}
