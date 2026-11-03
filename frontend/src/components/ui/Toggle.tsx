/**
 * Interruptor (liga/desliga) com role="switch".
 * Controlado: passe `checked` e `onChange`. Sem label visível, informe `ariaLabel`.
 */
import { useId } from 'react';
import { cn } from '../../lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, ariaLabel, disabled, className }: ToggleProps) {
  const labelId = useId();

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'border-rpg-primary bg-rpg-primary' : 'border-gray-600 bg-rpg-bg',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block h-4 w-4 rounded-full transition-transform duration-200',
            checked ? 'translate-x-[23px] bg-black' : 'translate-x-[3px] bg-gray-300',
          )}
        />
      </button>
      {label && (
        <span id={labelId} className="text-sm text-gray-200">
          {label}
        </span>
      )}
    </div>
  );
}
