/**
 * Acesso ao mundo carregado pelo WorldLayout. Use dentro de qualquer página filha
 * (Visão geral, Personagens, Mapas, Raças e Criaturas):
 *   const world = useWorld();                          // só ler
 *   const { world, updateWorld } = useWorldContext();  // ler e atualizar depois de salvar
 */
import { useOutletContext } from 'react-router-dom';
import type { World } from '../api/worlds';

export interface WorldContext {
  world: World;
  /** Troca o mundo em memória (use com o retorno de uma edição já salva no backend) */
  updateWorld: (world: World) => void;
}

export function useWorldContext(): WorldContext {
  return useOutletContext<WorldContext>();
}

export function useWorld(): World {
  return useWorldContext().world;
}