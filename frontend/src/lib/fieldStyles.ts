/** Classes compartilhadas por Input, Textarea e Select (mesmo visual de campo). */
export const fieldBase =
  'w-full rounded-lg border bg-rpg-bg text-white transition-colors ' +
  'placeholder:text-rpg-subtle focus:outline-none focus:ring-1 disabled:opacity-50';
export const fieldOk = 'border-gray-700 focus:border-rpg-primary focus:ring-rpg-primary';
export const fieldBad = 'border-red-400/60 focus:border-red-400 focus:ring-red-400';

export type FieldSize = 'md' | 'sm';
/** md: formulários; sm: dentro de tabelas e barras compactas. */
export const fieldSizes: Record<FieldSize, string> = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-xs',
};
