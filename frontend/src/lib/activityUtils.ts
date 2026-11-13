/** Ícones, textos e links da atividade recente. */
import { CalendarClock, CheckSquare, FileText, ScrollText, Globe, StickyNote, Dna, PawPrint, Users, type LucideIcon } from 'lucide-react';
import type { Activity, ActivityTargetType, ActivityVerb } from '../api/activity';
import type { DocumentSection } from '../api/documents';

interface TargetMeta {
  label: string;
  Icon: LucideIcon;
  /** Cores do quadrado do ícone (cor por tipo de entidade, só no ícone) */
  tone: string;
  feminine: boolean;
}

export const TARGET_META: Record<ActivityTargetType, TargetMeta> = {
  world: { label: 'Mundo', Icon: Globe, tone: 'bg-rpg-secondary/10 text-rpg-secondary', feminine: false },
  note: { label: 'Nota', Icon: StickyNote, tone: 'bg-rpg-primary/10 text-rpg-primary', feminine: true },
  todo: { label: 'Tarefa', Icon: CheckSquare, tone: 'bg-orange-400/10 text-orange-400', feminine: true },
  document: { label: 'Documento', Icon: FileText, tone: 'bg-blue-400/10 text-blue-400', feminine: false },
  event: { label: 'Evento', Icon: CalendarClock, tone: 'bg-slate-400/10 text-slate-300', feminine: false },
  quest: { label: 'Missão', Icon: ScrollText, tone: 'bg-amber-400/10 text-amber-300', feminine: true },
  character: { label: 'Personagem', Icon: Users, tone: 'bg-rpg-secondary/10 text-rpg-secondary', feminine: false },
  race: { label: 'Raça', Icon: Dna, tone: 'bg-teal-400/10 text-teal-300', feminine: true },
  creature: { label: 'Criatura', Icon: PawPrint, tone: 'bg-rose-400/10 text-rose-300', feminine: true },
};

const VERBS: Record<ActivityVerb, [string, string]> = {
  created: ['Criado', 'Criada'],
  updated: ['Editado', 'Editada'],
  deleted: ['Excluído', 'Excluída'],
};

/** Página onde mora cada seção de documentos (História fica na Visão geral). */
const DOCUMENT_PATHS: Record<DocumentSection, string> = {
  lore: '',
  characters: '/personagens',
  maps: '/mapas',
  peoples: '/racas-criaturas',
};

/** "Editado" / "Editada", conforme o gênero do tipo. */
export function verbLabel(activity: Activity): string {
  const [masculine, feminine] = VERBS[activity.verb];
  return TARGET_META[activity.target_type].feminine ? feminine : masculine;
}

/** Destino do clique; null quando o item foi excluído (ou ainda não tem tela). */
export function activityLink(activity: Activity): string | null {
  if (activity.target_deleted) return null;
  switch (activity.target_type) {
    
    case 'world':
      return `/world/${activity.target_id}`;
    
    case 'note':
      return `/notebook?aba=notas&nota=${activity.target_id}`;
    
    case 'todo':
      return '/notebook?aba=tarefas';

    case 'event':
      return activity.world ? `/world/${activity.world}#linha-do-tempo` : null;
    
    case 'character':
      return activity.world ? `/world/${activity.world}/personagens?personagem=${activity.target_id}` : null;

    case 'document': {
      // Abre a gaveta do documento na página da seção (o mundo pode ter sido excluído)
      if (!activity.world) return null;
      const path = DOCUMENT_PATHS[activity.target_section ?? 'lore'];
      return `/world/${activity.world}${path}?documento=${activity.target_id}`;
    }

    case 'race':
      return activity.world ? `/world/${activity.world}/racas-criaturas?raca=${activity.target_id}` : null;

    case 'creature':
      return activity.world
        ? `/world/${activity.world}/racas-criaturas?aba=criaturas&criatura=${activity.target_id}`
        : null;
        
    default:
      return null;
  }
}