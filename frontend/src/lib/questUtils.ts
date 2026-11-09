/** Regras das missões (funções puras): grupos por status, busca e tags. */
import type { Quest, QuestStatus } from '../api/quests';

export const STATUS_ORDER: QuestStatus[] = ['active', 'idle', 'done'];

export const STATUS_LABELS: Record<QuestStatus, string> = {
  active: 'Em andamento',
  idle: 'Ociosa',
  done: 'Concluída',
};

/** Só "Em andamento" começa aberto; as outras começam recolhidas. */
export const DEFAULT_OPEN: QuestStatus[] = ['active'];

/** Mais de N missões: aparecem a busca e o filtro por tag. */
export const FILTER_THRESHOLD = 10;
/** Quantas missões cada grupo mostra antes do "Ver todas". */
export const GROUP_LIMIT = 5;

export function groupByStatus(quests: Quest[]): Record<QuestStatus, Quest[]> {
  const groups: Record<QuestStatus, Quest[]> = { active: [], idle: [], done: [] };
  quests.forEach((quest) => groups[quest.status].push(quest));
  return groups;
}

export function collectTags(quests: Quest[], field: 'characters' | 'locations'): string[] {
  const byKey = new Map<string, string>();
  quests.forEach((quest) =>
    quest[field].forEach((tag) => {
      const key = tag.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, tag);
    }),
  );
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Todas as tags (personagens e locais) para o filtro, sem repetir. */
export function collectAllTags(quests: Quest[]): string[] {
  const byKey = new Map<string, string>();
  [...collectTags(quests, 'characters'), ...collectTags(quests, 'locations')].forEach((tag) => {
    if (!byKey.has(tag.toLowerCase())) byKey.set(tag.toLowerCase(), tag);
  });
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Filtra por texto (título, descrição e tags) e por uma tag. Vazio = sem filtro. */
export function filterQuests(quests: Quest[], query: string, tag: string): Quest[] {
  const text = query.trim().toLowerCase();
  const wanted = tag.toLowerCase();
  return quests.filter((quest) => {
    const tags = [...quest.characters, ...quest.locations].map((t) => t.toLowerCase());
    if (wanted && !tags.includes(wanted)) return false;
    if (!text) return true;
    return (
      quest.title.toLowerCase().includes(text) ||
      quest.description_markdown.toLowerCase().includes(text) ||
      tags.some((t) => t.includes(text))
    );
  });
}