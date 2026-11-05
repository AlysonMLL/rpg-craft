/**
 * Formatação de Markdown sobre o texto selecionado (barra do editor).
 * Função pura: recebe o texto e a seleção, devolve o novo texto e a nova seleção.
 * - bold (**), italic (*), underline (<u>) e link: envolvem a seleção (clicar de novo desfaz).
 * - heading (## ), list (- ) e quote (> ): prefixam cada linha da seleção (clicar de novo desfaz).
 */

export type MarkdownFormat = 'bold' | 'italic' | 'underline' | 'heading' | 'list' | 'link' | 'quote';

export interface FormatResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const WRAPS: Record<'bold' | 'italic' | 'underline', [string, string]> = {
  bold: ['**', '**'],
  italic: ['*', '*'],
  underline: ['<u>', '</u>'],
};

const PREFIXES: Record<'heading' | 'list' | 'quote', string> = {
  heading: '## ',
  list: '- ',
  quote: '> ',
};

function wrap(value: string, start: number, end: number, open: string, close: string): FormatResult {
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);

  // Já está envolvido: desfaz
  if (before.endsWith(open) && after.startsWith(close)) {
    return {
      value: before.slice(0, before.length - open.length) + selected + after.slice(close.length),
      selectionStart: start - open.length,
      selectionEnd: end - open.length,
    };
  }

  const text = selected || 'texto';
  return {
    value: before + open + text + close + after,
    selectionStart: start + open.length,
    selectionEnd: start + open.length + text.length,
  };
}

function prefixLines(value: string, start: number, end: number, prefix: string): FormatResult {
  const blockStart = value.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = value.indexOf('\n', end);
  const blockEnd = nextBreak === -1 ? value.length : nextBreak;

  const lines = value.slice(blockStart, blockEnd).split('\n');
  const allPrefixed = lines.every((line) => line.startsWith(prefix));
  const changed = lines
    .map((line) => (allPrefixed ? line.slice(prefix.length) : prefix + line))
    .join('\n');

  return {
    value: value.slice(0, blockStart) + changed + value.slice(blockEnd),
    selectionStart: blockStart,
    selectionEnd: blockStart + changed.length,
  };
}

function link(value: string, start: number, end: number): FormatResult {
  const before = value.slice(0, start);
  const selected = value.slice(start, end) || 'texto';
  const after = value.slice(end);
  const url = 'https://';
  const text = `[${selected}](${url})`;
  const urlStart = start + selected.length + 3; // depois de "[texto]("
  return {
    value: before + text + after,
    selectionStart: urlStart,
    selectionEnd: urlStart + url.length,
  };
}

export function applyMarkdownFormat(
  value: string,
  start: number,
  end: number,
  kind: MarkdownFormat,
): FormatResult {
  if (kind === 'bold' || kind === 'italic' || kind === 'underline') {
    const [open, close] = WRAPS[kind];
    return wrap(value, start, end, open, close);
  }
  if (kind === 'link') return link(value, start, end);
  return prefixLines(value, start, end, PREFIXES[kind]);
}
