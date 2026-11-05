/**
 * Renderiza Markdown com suporte a algumas tags HTML (<u>, <mark>, <b>...), com
 * sanitização (rehype-sanitize) para impedir scripts e atributos perigosos. Links abrem
 * em nova aba. Compartilhado por notas, lore, fichas e introduções de mundo.
 * Dependências: npm i rehype-raw rehype-sanitize
 */
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { cn } from '../../lib/cn';

// O schema padrão não inclui <u> nem <mark>
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'u', 'mark'],
};

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className }: MarkdownViewProps) {
  return (
    <div
      className={cn(
        'prose prose-invert max-w-none text-gray-300 prose-headings:text-white prose-p:leading-relaxed prose-a:text-rpg-primary',
        className,
      )}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
