/**
 * Função do Arquivo: Variantes do InlineText para a ficha rápida: cada uma "parece texto" e,
 * ao clicar, vira o campo do tipo certo. Salvam ao sair do campo (ou Enter) e cancelam com Esc
 * (sem fechar a gaveta/modal em volta). Todas aceitam `disabled` (só leitura, para convidado).
 *
 * O que há ali:
 * - InlineNumber: número inteiro opcional (vazio = null); valores fora de min/max são ajustados.
 * - InlineSelect: lista de opções; abre o seletor ao clicar e salva ao escolher. renderValue
 *   permite mostrar a opção de outro jeito (ex.: Badge).
 * - InlineTextarea: texto longo (várias linhas). Ctrl+Enter ou sair do campo salva; aceita vazio.
 * - InlineTags: lista de textos (chips). Edita com o TagInput e salva com o botão "Salvar".
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';
import { TagInput } from './TagInput';

const EDIT_FIELD =
  'w-full rounded-md border border-rpg-primary bg-rpg-bg px-2 py-1 text-sm text-white focus:outline-none';
const READ_BUTTON = 'w-full rounded-md px-2 py-1 text-left transition-colors hover:bg-gray-800/70';
const CHIP =
  'inline-flex items-center rounded-md border border-gray-600 bg-gray-800 px-2 py-0.5 text-xs text-gray-200';

/* ------------------------------ InlineNumber ------------------------------ */

interface InlineNumberProps {
  value: number | null;
  onSave: (value: number | null) => void;
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

export function InlineNumber({
  value,
  onSave,
  ariaLabel,
  disabled = false,
  placeholder = 'Não informado',
  min = 0,
  max = 999,
  className,
}: InlineNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const cancelled = useRef(false);

  if (disabled) {
    return <span className={className}>{value === null ? placeholder : value}</span>;
  }

  const commit = () => {
    setEditing(false);
    const text = draft.trim();
    const parsed = text === '' ? null : Math.round(Number(text));
    if (!cancelled.current && (parsed === null || !Number.isNaN(parsed))) {
      const next = parsed === null ? null : Math.min(max, Math.max(min, parsed));
      if (next !== value) onSave(next);
    }
    cancelled.current = false;
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        aria-label={ariaLabel}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
        className={cn(EDIT_FIELD, 'max-w-32')}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`${ariaLabel}: ${value ?? 'vazio'}. Clique para editar`}
      onClick={() => {
        setDraft(value === null ? '' : String(value));
        setEditing(true);
      }}
      className={cn(READ_BUTTON, className)}
    >
      {value === null ? <span className="text-rpg-subtle">{placeholder}</span> : value}
    </button>
  );
}

/* ------------------------------ InlineSelect ------------------------------ */

interface InlineSelectOption<T extends string> {
  value: T;
  label: string;
}

interface InlineSelectProps<T extends string> {
  value: T;
  options: InlineSelectOption<T>[];
  onSave: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  renderValue?: (option: InlineSelectOption<T>) => ReactNode;
  className?: string;
}

export function InlineSelect<T extends string>({
  value,
  options,
  onSave,
  ariaLabel,
  disabled = false,
  renderValue,
  className,
}: InlineSelectProps<T>) {
  const [editing, setEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const current = options.find((option) => option.value === value) ?? options[0];
  const content = renderValue ? renderValue(current) : current.label;

  useEffect(() => {
    if (!editing) return;
    selectRef.current?.focus();
    try {
      (selectRef.current as (HTMLSelectElement & { showPicker?: () => void }) | null)?.showPicker?.();
    } catch {
      // Sem suporte (ou sem gesto do usuário): o clique no campo abre a lista
    }
  }, [editing]);

  if (disabled) return <span className={className}>{content}</span>;

  if (editing) {
    return (
      <select
        ref={selectRef}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => {
          setEditing(false);
          if (e.target.value !== value) onSave(e.target.value as T);
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            setEditing(false);
          }
        }}
        className={cn(EDIT_FIELD, 'w-auto')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${ariaLabel}: ${current.label}. Clique para editar`}
      onClick={() => setEditing(true)}
      className={cn('rounded-md px-1 py-1 text-left transition-colors hover:bg-gray-800/70', className)}
    >
      {content}
    </button>
  );
}

/* ----------------------------- InlineTextarea ----------------------------- */

interface InlineTextareaProps {
  value: string;
  onSave: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
}

export function InlineTextarea({
  value,
  onSave,
  ariaLabel,
  disabled = false,
  placeholder = 'Não informado',
  maxLength,
  rows = 4,
  className,
}: InlineTextareaProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);

  if (disabled) {
    return <p className={cn('whitespace-pre-wrap', className)}>{value || placeholder}</p>;
  }

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (!cancelled.current && next !== value) onSave(next);
    cancelled.current = false;
  };

  if (editing) {
    return (
      <div>
        <textarea
          autoFocus
          aria-label={ariaLabel}
          rows={rows}
          value={draft}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) e.currentTarget.blur();
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              cancelled.current = true;
              e.currentTarget.blur();
            }
          }}
          className={cn(EDIT_FIELD, 'resize-y')}
        />
        <p className="mt-1 px-1 text-xs text-rpg-subtle">Ctrl+Enter salva, Esc cancela.</p>
      </div>
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
      className={cn(READ_BUTTON, 'whitespace-pre-wrap', className)}
    >
      {value || <span className="text-rpg-subtle">{placeholder}</span>}
    </button>
  );
}

/* ------------------------------- InlineTags ------------------------------- */

interface InlineTagsProps {
  value: string[];
  onSave: (value: string[]) => void;
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  maxLength?: number;
  className?: string;
}

export function InlineTags({
  value,
  onSave,
  ariaLabel,
  disabled = false,
  placeholder = 'Não informado',
  suggestions,
  maxTags,
  maxLength,
  className,
}: InlineTagsProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) wrapperRef.current?.querySelector('input')?.focus();
  }, [editing]);

  const chips =
    value.length > 0 ? (
      <span className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span key={tag} className={CHIP}>
            {tag}
          </span>
        ))}
      </span>
    ) : (
      <span className="text-rpg-subtle">{placeholder}</span>
    );

  if (disabled) return <div className={className}>{chips}</div>;

  const cancel = () => setEditing(false);
  const commit = () => {
    setEditing(false);
    if (JSON.stringify(draft) !== JSON.stringify(value)) onSave(draft);
  };

  if (editing) {
    return (
      <div
        ref={wrapperRef}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            cancel();
          }
        }}
      >
        <TagInput
          value={draft}
          onChange={setDraft}
          suggestions={suggestions}
          maxTags={maxTags}
          maxLength={maxLength}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={cancel}>
            Cancelar
          </Button>
          <Button size="sm" onClick={commit}>
            Salvar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${ariaLabel}: ${value.join(', ') || 'vazio'}. Clique para editar`}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn(READ_BUTTON, className)}
    >
      {chips}
    </button>
  );
}