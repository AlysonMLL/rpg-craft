/** Tempo relativo curto em pt-BR ("agora", "há 5 min", "há 2 h", "há 3 d"); passado de 30 dias mostra a data. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days <= 30) return `há ${days} d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}
