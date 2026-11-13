/**
 * Função do Arquivo: Regras de texto compartilhadas pelas telas de entidades do mundo
 * (personagens, raças, criaturas), sem React.
 *
 * O que há aqui:
 * - normalizeText(): minúsculas e sem acentos, para comparar textos.
 * - getInitials(): iniciais usadas quando a entidade não tem imagem ("Aria de Valoria" → "AV").
 * - distinctValues(): valores distintos (sem repetir "Elfo"/"elfo"), em ordem alfabética.
 */

export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters =
    words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0];
  return letters.toLocaleUpperCase('pt-BR');
}

export function distinctValues(values: string[]): string[] {
  const seen = new Map<string, string>();
  for (const value of values) {
    const key = normalizeText(value);
    if (key && !seen.has(key)) seen.set(key, value.trim());
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}