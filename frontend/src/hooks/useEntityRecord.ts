/**
 * Função do Arquivo: Registro aberto numa gaveta (raça, criatura...): busca a versão completa ao
 * abrir, guarda o último id para o conteúdo não sumir durante a animação de fechar, trata
 * "não encontrado / de outro mundo" e salva alterações de forma otimista (com volta atrás e
 * toast se a API falhar).
 *
 * O que há aqui:
 * - useEntityRecord: devolve { current, failed, save }. current é o registro carregado (ou null),
 *   failed indica erro ao carregar, save(patch) grava e avisa a lista por onUpdated.
 */

import { useEffect, useState } from 'react';
import { toast } from '../components/ui';

interface Options<TFull, TUpdate> {
  id: number | null;
  worldId: number;
  service: {
    get: (id: number) => Promise<TFull>;
    update: (id: number, data: TUpdate) => Promise<TFull>;
  };
  onUpdated: (full: TFull) => void;
}

export function useEntityRecord<TFull extends { id: number; world: number }, TUpdate extends object>({
  id,
  worldId,
  service,
  onUpdated,
}: Options<TFull, TUpdate>) {
  const [lastId, setLastId] = useState<number | null>(id);
  const [record, setRecord] = useState<TFull | null>(null);
  const [failedId, setFailedId] = useState<number | null>(null);

  if (id !== null && id !== lastId) setLastId(id);

  useEffect(() => {
    if (id === null) return;
    let active = true;
    setFailedId(null);
    service
      .get(id)
      .then((loaded) => {
        if (!active) return;
        if (loaded.world !== worldId) setFailedId(id);
        else setRecord(loaded);
      })
      .catch(() => {
        if (active) setFailedId(id);
      });
    return () => {
      active = false;
    };
  }, [id, worldId, service]);

  const current = record && record.id === lastId ? record : null;
  const failed = failedId !== null && failedId === lastId;

  const save = async (patch: TUpdate) => {
    if (!current) return;
    const previous = current;
    setRecord({ ...current, ...patch });
    try {
      const updated = await service.update(current.id, patch);
      setRecord(updated);
      onUpdated(updated);
    } catch {
      setRecord(previous);
      toast.error('Não foi possível salvar. Tente de novo.');
    }
  };

  return { current, failed, save };
}