/** Rótulo, dica e mensagem de erro em volta de um campo (uso interno do kit). */
import type { ReactNode } from 'react';

interface FieldShellProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldShell({ id, label, hint, error, required, children }: FieldShellProps) {
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
