/**
 * Acesso ao mundo carregado pelo WorldLayout. Usar dentro de qualquer página filha
 * (Visão geral, Personagens, Mapas, Raças e Criaturas): `const world = useWorld();`
 */
import { useOutletContext } from 'react-router-dom';
import type { World } from '../api/worlds';

export interface WorldContext {
  world: World;
}

export function useWorld(): World {
  return useOutletContext<WorldContext>().world;
}