/**
 * Função do Arquivo: Lista de navegação principal (usada pelo menu mobile em gaveta).
 * O que há aqui: NavItem e NAV_ITEMS (Início, Notebook, Galeria, Perfil, Mestre IA). Itens com
 * soon=true ainda não existem e aparecem sem link, com o selo "Em breve".
 */

import { Book, Home, Image as ImageIcon, Sparkles, User, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
  soon: boolean;
  /** Prefixos de rota que também marcam o item como ativo (o Início vale dentro de um mundo). */
  alsoActiveOn?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Início', Icon: Home, soon: false, alsoActiveOn: ['/world', '/mundos'] },
  { to: '/notebook', label: 'Notebook', Icon: Book, soon: false },
  { to: '/galeria', label: 'Galeria', Icon: ImageIcon, soon: true },
  { to: '/perfil', label: 'Perfil', Icon: User, soon: true },
  { to: '/mestre-ia', label: 'Mestre IA', Icon: Sparkles, soon: true },
];