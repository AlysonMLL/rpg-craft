/**
 * Notificações (biblioteca sonner) com as cores do RPG.Craft.
 * Monte <Toaster /> uma vez, na raiz (App.tsx), e use toast.success(...) /
 * toast.error(...) de qualquer lugar. Mantenha o mesmo verbo no botão e no
 * toast: botão "Criar mundo" → toast "Mundo criado".
 */
import type { CSSProperties } from 'react';
import { Toaster as Sonner, toast } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      style={
        {
          '--normal-bg': 'var(--color-rpg-card)',
          '--normal-text': 'var(--color-gray-200)',
          '--normal-border': 'var(--color-gray-700)',
        } as CSSProperties
      }
    />
  );
}

export { toast };
