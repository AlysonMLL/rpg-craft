/**
 * Função do Arquivo: Página /world/:id/racas-criaturas. Abas Raças | Criaturas (aba na URL:
 * ?aba=criaturas) e o bloco "Documentos .md" no fim (section=peoples). As duas listas vivem
 * aqui, para os contadores das abas aparecerem sempre; cada aba cuida da própria grade,
 * filtros, gaveta e exclusão. Dono edita; convidado só lê.
 *
 * O que há aqui:
 * - Peoples (export default): carrega raças e criaturas pelo hook useEntityList e monta as abas.
 * - RACE_MESSAGES / CREATURE_MESSAGES: textos de erro e de exclusão (constantes do módulo).
 */

import { useSearchParams } from 'react-router-dom';
import { Dna, PawPrint } from 'lucide-react';
import { authService } from '../api/auth';
import {
  creatureService,
  raceService,
  type Creature,
  type CreatureCreateData,
  type CreatureListItem,
  type CreatureUpdateData,
  type Race,
  type RaceCreateData,
  type RaceListItem,
  type RaceUpdateData,
} from '../api/peoples';
import { CreaturesTab } from '../components/peoples/CreaturesTab';
import { RacesTab } from '../components/peoples/RacesTab';
import { TabPanel, Tabs } from '../components/ui';
import DocumentsSection from '../components/world/DocumentsSection';
import { useEntityList, type EntityMessages } from '../hooks/useEntityList';
import { useWorldContext } from '../hooks/useWorld';
import {
  toCreatureCreateData,
  toCreatureItem,
  toRaceCreateData,
  toRaceItem,
} from '../lib/peoplesUtils';

const RACE_MESSAGES: EntityMessages = {
  load: 'Não foi possível carregar as raças. Tente de novo.',
  favorite: 'Não foi possível atualizar o favorito. Tente de novo.',
  reorder: 'Não foi possível salvar a ordem das raças. Tente de novo.',
  remove: 'Não foi possível excluir a raça. Tente de novo.',
  removed: 'Raça excluída',
};

const CREATURE_MESSAGES: EntityMessages = {
  load: 'Não foi possível carregar as criaturas. Tente de novo.',
  favorite: 'Não foi possível atualizar o favorito. Tente de novo.',
  reorder: 'Não foi possível salvar a ordem das criaturas. Tente de novo.',
  remove: 'Não foi possível excluir a criatura. Tente de novo.',
  removed: 'Criatura excluída',
};

export default function Peoples() {
  const { world } = useWorldContext();
  const canEdit = world.is_owner && !authService.isGuest();
  const [params, setParams] = useSearchParams();
  const tab = params.get('aba') === 'criaturas' ? 'criaturas' : 'racas';

  const races = useEntityList<RaceListItem, Race, RaceCreateData, RaceUpdateData>({
    worldId: world.id,
    service: raceService,
    toItem: toRaceItem,
    toCreateData: toRaceCreateData,
    messages: RACE_MESSAGES,
  });

  const creatures = useEntityList<CreatureListItem, Creature, CreatureCreateData, CreatureUpdateData>({
    worldId: world.id,
    service: creatureService,
    toItem: toCreatureItem,
    toCreateData: toCreatureCreateData,
    messages: CREATURE_MESSAGES,
  });

  const changeTab = (value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === 'racas') next.delete('aba');
        else next.set('aba', value);
        next.delete('raca'); // a gaveta é de uma aba só
        next.delete('criatura');
        return next;
      },
      { replace: true },
    );

  return (
    <section aria-label="Raças e Criaturas">
      <h2 className="sr-only">Raças e Criaturas</h2>

      <Tabs
        idPrefix="peoples"
        ariaLabel="Seções de raças e criaturas"
        className="mb-6"
        value={tab}
        onChange={changeTab}
        items={[
          {
            value: 'racas',
            label: 'Raças',
            count: races.isLoading ? undefined : races.items.length,
            icon: <Dna size={16} aria-hidden="true" />,
          },
          {
            value: 'criaturas',
            label: 'Criaturas',
            count: creatures.isLoading ? undefined : creatures.items.length,
            icon: <PawPrint size={16} aria-hidden="true" />,
          },
        ]}
      />

      <TabPanel idPrefix="peoples" value="racas" current={tab}>
        <RacesTab list={races} worldId={world.id} canEdit={canEdit} />
      </TabPanel>

      <TabPanel idPrefix="peoples" value="criaturas" current={tab}>
        <CreaturesTab list={creatures} worldId={world.id} canEdit={canEdit} />
      </TabPanel>

      <section id="documentos" aria-labelledby="documentos-povos-titulo" className="mt-12 scroll-mt-24">
        <DocumentsSection
          worldId={world.id}
          section="peoples"
          title="Documentos .md"
          headingId="documentos-povos-titulo"
          canEdit={canEdit}
          emptyDescription="Anotações em Markdown sobre povos e bestiário: costumes, ecologia, rumores, ideias de encontros."
        />
      </section>
    </section>
  );
}