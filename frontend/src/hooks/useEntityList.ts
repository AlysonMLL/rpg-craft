/**
 * Função do Arquivo: Lista de entidades de um mundo (raças, criaturas e, no futuro, as demais):
 * carrega a lista leve e oferece adicionar, trocar, favoritar, reordenar (otimista, com volta
 * atrás) e excluir com o toast "Desfazer". Quem usa decide a tela; aqui só mora a lógica.
 *
 * O que há aqui:
 * - useEntityList: o hook. `service` e `messages` devem ser constantes do módulo (entram nas
 *   dependências do carregamento).
 * - EntityListState: o que o hook devolve (as telas recebem isso por props).
 * - remove() devolve true se excluiu, para a tela fechar a gaveta do item.
 */

import { useEffect, useState } from 'react';
import { toast } from '../components/ui';

interface ListEntity {
  id: number;
  is_favorite: boolean;
  display_order: number;
}

interface EntityService<TItem, TFull, TCreate, TUpdate> {
  list: (world: number) => Promise<TItem[]>;
  get: (id: number) => Promise<TFull>;
  create: (data: TCreate) => Promise<TFull>;
  update: (id: number, data: TUpdate) => Promise<TFull>;
  remove: (id: number) => Promise<void>;
  reorder: (world: number, ids: number[]) => Promise<void>;
}

export interface EntityMessages {
  load: string;
  favorite: string;
  reorder: string;
  remove: string;
  /** Toast depois de excluir (com o botão Desfazer). */
  removed: string;
}

export interface EntityListState<TItem, TFull> {
  items: TItem[];
  isLoading: boolean;
  add: (full: TFull) => void;
  replace: (full: TFull) => void;
  toggleFavorite: (item: TItem) => Promise<void>;
  reorder: (orderedIds: number[]) => Promise<void>;
  remove: (item: TItem) => Promise<boolean>;
}

interface Options<TItem, TFull, TCreate, TUpdate> {
  worldId: number;
  service: EntityService<TItem, TFull, TCreate, TUpdate>;
  toItem: (full: TFull) => TItem;
  toCreateData: (full: TFull) => TCreate;
  messages: EntityMessages;
}

export function useEntityList<
  TItem extends ListEntity,
  TFull extends { id: number },
  TCreate,
  TUpdate extends { is_favorite?: boolean },
>({
  worldId,
  service,
  toItem,
  toCreateData,
  messages,
}: Options<TItem, TFull, TCreate, TUpdate>): EntityListState<TItem, TFull> {
  const [items, setItems] = useState<TItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    service
      .list(worldId)
      .then((list) => {
        if (active) setItems(list);
      })
      .catch(() => toast.error(messages.load))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [worldId, service, messages]);

  const add = (full: TFull) => setItems((previous) => [...previous, toItem(full)]);

  const replace = (full: TFull) =>
    setItems((previous) => previous.map((item) => (item.id === full.id ? toItem(full) : item)));

  const toggleFavorite = async (item: TItem) => {
    try {
      replace(await service.update(item.id, { is_favorite: !item.is_favorite } as TUpdate));
    } catch {
      toast.error(messages.favorite);
    }
  };

  const reorder = async (orderedIds: number[]) => {
    const previous = items;
    const position = new Map(orderedIds.map((id, index) => [id, index]));
    setItems((current) =>
      current.map((item) => ({ ...item, display_order: position.get(item.id) ?? item.display_order })),
    );
    try {
      await service.reorder(worldId, orderedIds);
    } catch {
      setItems(previous);
      toast.error(messages.reorder);
    }
  };

  const remove = async (target: TItem): Promise<boolean> => {
    let full: TFull;
    try {
      full = await service.get(target.id); // guarda tudo para o "Desfazer"
      await service.remove(target.id);
    } catch {
      toast.error(messages.remove);
      return false;
    }
    setItems((previous) => previous.filter((item) => item.id !== target.id));
    toast(messages.removed, {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            add(await service.create(toCreateData(full)));
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
    return true;
  };

  return { items, isLoading, add, replace, toggleFavorite, reorder, remove };
}