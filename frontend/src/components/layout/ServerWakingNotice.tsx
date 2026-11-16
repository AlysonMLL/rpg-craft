/**
 * Função do Arquivo: Aviso fixo "Acordando o servidor…", mostrado quando uma requisição à API
 * passa de 4 s (a hospedagem gratuita hiberna o servidor e o primeiro acesso demora). Some sozinho
 * quando as requisições terminam.
 *
 * O que há aqui:
 * - ServerWakingNotice (export default): sem props; escuta onServerWaking (api/client.ts).
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { onServerWaking } from '../../api/client';

export default function ServerWakingNotice() {
  const [waking, setWaking] = useState(false);

  useEffect(() => onServerWaking(setWaking), []);

  if (!waking) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-xl border border-rpg-primary/40 bg-rpg-card p-4 shadow-2xl"
    >
      <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-rpg-primary" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold text-white">Acordando o servidor…</p>
        <p className="mt-0.5 text-sm text-rpg-muted">
          Na hospedagem gratuita ele hiberna quando fica parado. O primeiro acesso pode levar cerca de 1 minuto.
        </p>
      </div>
    </div>
  );
}