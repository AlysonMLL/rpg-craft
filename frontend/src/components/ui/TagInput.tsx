/**
 * Campo de tags simples (texto livre, sem vínculo com fichas): digite e confirme com Enter ou
 * vírgula; Backspace com o campo vazio remove a última; sair do campo também confirma.
 * Sugere (datalist nativo) as tags já usadas, o que mantém a grafia consistente. Repetidas
 * (sem diferenciar maiúsculas) são ignoradas. Reutilizável: eventos, missões, "Comum em"...
 */
import { useId, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { FieldShell } from './FieldShell';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  hint?: string;
  maxTags?: number;
  maxLength?: number;
  disabled?: boolean;
}

export function TagInput({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = 'Digite e pressione Enter',
  hint,
  maxTags = 20,
  maxLength = 40,
  disabled = false,
}: TagInputProps) {
  const id = useId();
  const listId = `${id}-sugestoes`;
  const [draft, setDraft] = useState('');

  const addMany = (raws: string[]) => {
    let next = value;
    raws.forEach((raw) => {
      const tag = raw.replace(/\s+/g, ' ').trim().slice(0, maxLength);
      const repeated = next.some((existing) => existing.toLowerCase() === tag.toLowerCase());
      if (tag && !repeated && next.length < maxTags) next = [...next, tag];
    });
    if (next !== value) onChange(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    // Escolher uma sugestão da lista adiciona na hora (no Chrome e no Firefox)
    const inputType = (event.nativeEvent as InputEvent).inputType;
    if (inputType === 'insertReplacementText') {
      addMany([text]);
      setDraft('');
      return;
    }
    if (text.includes(',')) {
      const parts = text.split(',');
      addMany(parts.slice(0, -1));
      setDraft(parts[parts.length - 1]);
      return;
    }
    setDraft(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // não envia o formulário
      addMany([draft]);
      setDraft('');
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (draft.trim()) {
      addMany([draft]);
      setDraft('');
    }
  };

  const available = suggestions.filter(
    (tag) => !value.some((existing) => existing.toLowerCase() === tag.toLowerCase()),
  );

  return (
    <FieldShell id={id} label={label} hint={hint}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-lg border border-gray-700 bg-rpg-bg px-3 py-2 transition-colors',
          'focus-within:border-rpg-primary focus-within:ring-1 focus-within:ring-rpg-primary',
          disabled && 'opacity-50',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md border border-gray-600 bg-gray-800 px-2 py-0.5 text-xs text-gray-200"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(value.filter((existing) => existing !== tag))}
                aria-label={`Remover ${tag}`}
                className="rounded text-rpg-muted transition-colors hover:text-white"
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </span>
        ))}
        <input
          id={id}
          type="text"
          list={listId}
          value={draft}
          disabled={disabled || value.length >= maxTags}
          maxLength={maxLength}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-24 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-rpg-subtle"
        />
        <datalist id={listId}>
          {available.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      </div>
    </FieldShell>
  );
}