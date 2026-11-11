/**
 * Função do Arquivo: Página /world/:id/personagens. Abas Personagens | Relações (aba na URL:
 * ?aba=relacoes). A aba Personagens mostra a grade de cards com busca, filtros, ordenação,
 * favoritos, arrastar para reordenar e excluir com confirmação (e "Desfazer"). "Relações" é
 * um espaço reservado (o grafo vem na parte 4). Clicar num card grava ?personagem=ID na URL
 * (a gaveta da ficha entra na parte 2). Dono edita; convidado só lê.
 *
 * O que há ali:
 * - Characters (export default): carrega a lista leve do mundo e controla filtros, ordenação,
 *   aba, modal de criação, confirmação de exclusão e os estados carregando / vazio / sem
 *   resultado. O arraste só vale na ordem "Personalizada" e sem filtros ativos.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Network, Plus, Users } from 'lucide-react';
import { authService } from '../api/auth';
import { characterService, type Character, type CharacterListItem } from '../api/characters';
import { CharacterCard } from '../components/characters/CharacterCard';
import { CharacterFiltersBar } from '../components/characters/CharacterFilters';
import { CreateCharacterModal } from '../components/characters/CreateCharacterModal';
import { CharacterDrawer } from '../components/characters/CharacterDrawer';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  SortableGrid,
  TabPanel,
  Tabs,
  toast,
} from '../components/ui';
import { useWorldContext } from '../hooks/useWorld';
import {
  EMPTY_FILTERS,
  filterCharacters,
  hasActiveFilters,
  sortCharacters,
  toCreateData,
  toListItem,
  type CharacterFilters,
  type CharacterSort,
} from '../lib/characterUtils';

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(11.75rem,1fr))] gap-4';

export default function Characters() {
  const { world } = useWorldContext();
  const canEdit = world.is_owner && !authService.isGuest();
  const [params, setParams] = useSearchParams();
  const tab = params.get('aba') === 'relacoes' ? 'relacoes' : 'personagens';

  const [characters, setCharacters] = useState<CharacterListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CharacterFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CharacterSort>('custom');
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<CharacterListItem | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    characterService
      .list(world.id)
      .then((list) => {
        if (active) setCharacters(list);
      })
      .catch(() => toast.error('Não foi possível carregar os personagens. Tente de novo.'))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [world.id]);

  const filtersActive = hasActiveFilters(filters);
  const visible = sortCharacters(filterCharacters(characters, filters), sort);
  const canDrag = canEdit && sort === 'custom' && !filtersActive;

  const changeTab = (value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === 'personagens') next.delete('aba');
        else next.set('aba', value);
        return next;
      },
      { replace: true },
    );

  const openCharacter = (id: number) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('personagem', String(id));
      return next;
    });

  const selectedId = Number(params.get('personagem')) || null;

  const closeCharacter = () =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('personagem');
        return next;
      },
      { replace: true },
    );

  const handleUpdated = (updated: Character) =>
    setCharacters((previous) => previous.map((item) => (item.id === updated.id ? toListItem(updated) : item)));

  const handleCreated = (created: Character) =>
    setCharacters((previous) => [...previous, toListItem(created)]);

  const handleFavorite = async (character: CharacterListItem) => {
    try {
      const updated = await characterService.update(character.id, { is_favorite: !character.is_favorite });
      setCharacters((previous) =>
        previous.map((item) => (item.id === updated.id ? toListItem(updated) : item)),
      );
    } catch {
      toast.error('Não foi possível atualizar o favorito. Tente de novo.');
    }
  };

  const handleReorder = async (orderedIds: number[]) => {
    const previous = characters;
    const position = new Map(orderedIds.map((id, index) => [id, index]));
    setCharacters((current) =>
      current.map((item) => ({ ...item, display_order: position.get(item.id) ?? item.display_order })),
    );
    try {
      await characterService.reorder(world.id, orderedIds);
    } catch {
      setCharacters(previous);
      toast.error('Não foi possível salvar a ordem dos personagens. Tente de novo.');
    }
  };

  const deleteCharacter = async (target: CharacterListItem) => {
    let full: Character;
    try {
      full = await characterService.get(target.id); // guarda a ficha inteira para o "Desfazer"
      await characterService.remove(target.id);
    } catch {
      toast.error('Não foi possível excluir o personagem. Tente de novo.');
      return;
    }
    setCharacters((previous) => previous.filter((item) => item.id !== target.id));
    if (params.get('personagem') === String(target.id)) {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.delete('personagem');
          return next;
        },
        { replace: true },
      );
    }
    toast('Personagem excluído', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            const restored = await characterService.create(toCreateData(full));
            setCharacters((previous) => [...previous, toListItem(restored)]);
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  const createButton = canEdit && (
    <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
      Novo personagem
    </Button>
  );

  return (
    <section aria-label="Personagens">
      <h2 className="sr-only">Personagens</h2>

      <Tabs
        idPrefix="char"
        ariaLabel="Seções de personagens"
        className="mb-6"
        value={tab}
        onChange={changeTab}
        items={[
          {
            value: 'personagens',
            label: 'Personagens',
            count: isLoading ? undefined : characters.length,
            icon: <Users size={16} aria-hidden="true" />,
          },
          { value: 'relacoes', label: 'Relações', icon: <Network size={16} aria-hidden="true" /> },
        ]}
      />

      <TabPanel idPrefix="char" value="personagens" current={tab}>
        {isLoading ? (
          <div className={GRID} aria-busy="true">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : characters.length === 0 ? (
          <EmptyState
            icon={<Users size={28} aria-hidden="true" />}
            title="Nenhum personagem ainda"
            description={
              canEdit
                ? 'Crie a primeira ficha: retrato, raça, papel, segredos e tudo o que o mestre precisa lembrar.'
                : 'Este mundo ainda não tem personagens.'
            }
            action={createButton}
          />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <CharacterFiltersBar
                characters={characters}
                filters={filters}
                createButton={createButton}
                shown={visible.length}
                sort={sort}
                onChange={setFilters}
                onSortChange={setSort}
              />
            </div>

            {visible.length === 0 ? (
              <EmptyState
                title="Nenhum personagem com esses filtros"
                description="Tente outro termo ou limpe os filtros."
                action={
                  <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
                    Limpar filtros
                  </Button>
                }
              />
            ) : (
              <SortableGrid
                items={visible}
                canDrag={canDrag}
                className={GRID}
                getLabel={(character) => character.name}
                onReorder={(ids) => void handleReorder(ids)}
                renderItem={(character, { handle, dragging }) => (
                  <CharacterCard
                    character={character}
                    handle={handle}
                    dragging={dragging}
                    onOpen={openCharacter}
                    onToggleFavorite={canEdit ? (item) => void handleFavorite(item) : undefined}
                    onDelete={canEdit ? setToDelete : undefined}
                  />
                )}
                renderOverlay={(character) => <CharacterCard character={character} lifted />}
              />
            )}
          </>
        )}
      </TabPanel>

      <TabPanel idPrefix="char" value="relacoes" current={tab}>
        <EmptyState
          icon={<Network size={28} aria-hidden="true" />}
          title="Relações em breve"
          description="O grafo de relações entre personagens (família, romance, aliança, inimizade e mentoria) chega em uma próxima etapa."
        />
      </TabPanel>

      <CreateCharacterModal
        open={creating}
        worldId={world.id}
        characters={characters}
        onClose={() => setCreating(false)}
        onCreated={handleCreated}
      />

      <CharacterDrawer
        characterId={selectedId}
        worldId={world.id}
        canEdit={canEdit}
        characters={characters}
        onClose={closeCharacter}
        onUpdated={handleUpdated}
        onDelete={setToDelete}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir personagem"
        description={
          <>
            Deseja mesmo excluir esse personagem? <strong className="text-white">{toDelete?.name}</strong> e toda
            a ficha serão removidos.
          </>
        }
        confirmLabel="Excluir"
        onClose={() => setToDelete(null)}
        onConfirm={() => (toDelete ? deleteCharacter(toDelete) : undefined)}
      />
    </section>
  );
}