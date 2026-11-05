/**
 * Salva automaticamente um valor depois de uma pausa na digitação (padrão 800ms) e
 * ao desmontar o componente (não perde o que foi digitado ao trocar de nota).
 * status: 'idle' | 'saving' | 'saved' | 'error'.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Options {
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  { delay = 800, enabled = true }: Options = {},
) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const serialized = JSON.stringify(value);
  const lastSaved = useRef(serialized);
  const latest = useRef(value);
  const saveRef = useRef(save);

  useEffect(() => {
    latest.current = value;
    saveRef.current = save;
  });

  const flush = useCallback(async () => {
    const current = latest.current;
    const snapshot = JSON.stringify(current);
    if (snapshot === lastSaved.current) return;
    setStatus('saving');
    try {
      await saveRef.current(current);
      lastSaved.current = snapshot;
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!enabled || serialized === lastSaved.current) return;
    const timer = window.setTimeout(() => {
      void flush();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [serialized, enabled, delay, flush]);

  // Ao desmontar, salva o que ficou pendente
  useEffect(
    () => () => {
      void flush();
    },
    [flush],
  );

  return { status, flush };
}
