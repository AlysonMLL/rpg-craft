/**
 * Editor de Markdown: barra de formatação (negrito, itálico, sublinhado, título, lista,
 * link, citação) + área de texto. Atalhos: Ctrl/Cmd+B, I, U e K (link).
 * Ocupa a altura do contêiner pai (use h-full).
 */
import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Bold, Heading2, Italic, Link2, List, Quote, Underline } from 'lucide-react';
import { applyMarkdownFormat, type MarkdownFormat } from '../../lib/markdownFormat';

const TOOLS: { kind: MarkdownFormat; label: string; shortcut?: string; Icon: typeof Bold }[] = [
  { kind: 'bold', label: 'Negrito', shortcut: 'Ctrl+B', Icon: Bold },
  { kind: 'italic', label: 'Itálico', shortcut: 'Ctrl+I', Icon: Italic },
  { kind: 'underline', label: 'Sublinhado', shortcut: 'Ctrl+U', Icon: Underline },
  { kind: 'heading', label: 'Título', Icon: Heading2 },
  { kind: 'list', label: 'Lista', Icon: List },
  { kind: 'link', label: 'Link', shortcut: 'Ctrl+K', Icon: Link2 },
  { kind: 'quote', label: 'Citação', Icon: Quote },
];

const SHORTCUTS: Record<string, MarkdownFormat> = {
  b: 'bold',
  i: 'italic',
  u: 'underline',
  k: 'link',
};

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escreva em Markdown (ex: **negrito**, ## título, - lista)…',
  ariaLabel = 'Conteúdo em Markdown',
}: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const apply = (kind: MarkdownFormat) => {
    const element = ref.current;
    if (!element) return;
    const result = applyMarkdownFormat(value, element.selectionStart, element.selectionEnd, kind);
    onChange(result.value);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const kind = SHORTCUTS[event.key.toLowerCase()];
    if (!kind) return;
    event.preventDefault();
    apply(kind);
  };

  return (
    <div className="flex h-full min-h-64 flex-col">
      <div
        role="toolbar"
        aria-label="Formatação"
        className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-gray-800 bg-rpg-card px-2 py-1.5"
      >
        {TOOLS.map(({ kind, label, shortcut, Icon }) => (
          <button
            key={kind}
            type="button"
            onClick={() => apply(kind)}
            title={shortcut ? `${label} (${shortcut})` : label}
            aria-label={label}
            className="flex h-8 w-8 items-center justify-center rounded-md text-rpg-muted transition-colors hover:bg-gray-800 hover:text-white"
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="min-h-0 w-full flex-1 resize-none rounded-b-lg border border-gray-800 bg-rpg-card/50 p-4 font-mono text-sm leading-relaxed text-gray-300 placeholder:text-rpg-subtle focus:border-gray-600 focus:outline-none"
      />
    </div>
  );
}
