/**
 * Texto editável no lugar: parece texto; ao clicar vira um campo. Enter ou sair do
 * campo salva (se mudou e não ficou vazio), Esc cancela. Base para a edição inline
 * da ficha de personagem e das tarefas.
 */
import { useRef, useState } from 'react';
import { cn } from '../../lib/cn';

interface InlineTextProps {
  value: string;
  onSave: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function InlineText({
  value,
  onSave,
  ariaLabel,
  disabled = false,
  placeholder = 'Sem texto',
  maxLength,
  className,
}: InlineTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);

  if (disabled) {
    return <span className={className}>{value || placeholder}</span>;
  }

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (!cancelled.current && next && next !== value) onSave(next);
    cancelled.current = false;
  };

  if (editing) {
    return (
      <input
        autoFocus
        aria-label={ariaLabel}
        value={draft}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
        className="w-full rounded-md border border-rpg-primary bg-rpg-bg px-2 py-1 text-sm text-white focus:outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`${ariaLabel}: ${value}. Clique para editar`}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn(
        'w-full rounded-md px-2 py-1 text-left transition-colors hover:bg-gray-800/70',
        className,
      )}
    >
      {value || <span className="text-rpg-subtle">{placeholder}</span>}
    </button>
  );
}
