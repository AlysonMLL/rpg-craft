/**
 * Importar e exportar .md como texto (sem upload binário).
 * - splitMarkdown: separa título e conteúdo de um arquivo importado. Se o texto começa com
 *   "# Título", ele vira o título do documento e sai do conteúdo (a tela já mostra o título).
 * - downloadMarkdown: baixa o documento como .md, com o título de volta como "# Título".
 * - excerptFromMarkdown: resumo em texto simples para os cards.
 */

export const MAX_IMPORT_BYTES = 500 * 1024;

export const stripExtension = (filename: string) => filename.replace(/\.(md|markdown|txt)$/i, '');

export function splitMarkdown(text: string, fallbackTitle: string): { title: string; content: string } {
  const match = text.match(/^\s*#[ \t]+(.+?)[ \t]*(?:\r?\n+|$)/);
  if (match) {
    return {
      title: match[1].slice(0, 160),
      content: text.slice(match[0].length).replace(/^\s+/, ''),
    };
  }
  return { title: (fallbackTitle || 'Documento importado').slice(0, 160), content: text };
}

export function slugify(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'documento';
}

export function downloadMarkdown(title: string, content: string): void {
  const body = `# ${title}\n\n${content}`;
  const url = URL.createObjectURL(new Blob([body], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(title)}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

export function excerptFromMarkdown(content: string, max = 160): string {
  return content
    .replace(/<[^>]+>/g, '')
    .replace(/[#*_>`~-]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}