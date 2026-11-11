/**
 * Função do Arquivo: Texto editável no lugar: parece texto; ao clicar vira um campo. Enter ou
 * sair do campo salva (se mudou), Esc cancela (sem fechar a gaveta/modal em volta). Base da
 * edição inline da ficha de personagem e das tarefas.
 *
 * O que há ali:
 * - InlineText: componente (props: value, onSave, ariaLabel, disabled, placeholder, maxLength,
 *   allowEmpty, className).
 *   - allowEmpty: permite salvar o texto vazio (campos opcionais). Por padrão, vazio é ignorado
 *     (nomes e títulos não podem ficar sem texto).
 *   - disabled: mostra só o texto (modo leitura / convidado).
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
  allowEmpty?: boolean;
  className?: string;
}

export function InlineText({
  value,
  onSave,
  ariaLabel,
  disabled = false,
  placeholder = 'Sem texto',
  maxLength,
  allowEmpty = false,
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
    if (!cancelled.current && (next || allowEmpty) && next !== value) onSave(next);
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
            e.preventDefault(); // não fecha a gaveta/modal junto
            e.stopPropagation();
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
      aria-label={`${ariaLabel}: ${value || 'vazio'}. Clique para editar`}
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