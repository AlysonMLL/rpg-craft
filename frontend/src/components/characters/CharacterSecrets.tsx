/**
 * Função do Arquivo: Bloco "Segredos" da ficha (só do mestre). Começa borrado e escondido de
 * leitores de tela (aria-hidden); o botão com olho revela e, para o dono, libera a edição.
 *
 * O que há ali:
 * - CharacterSecrets: componente (props: value, canEdit, onSave).
 */

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button, InlineTextarea } from '../ui';

interface CharacterSecretsProps {
  value: string;
  canEdit: boolean;
  onSave: (value: string) => void;
}

export function CharacterSecrets({ value, canEdit, onSave }: CharacterSecretsProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs text-rpg-muted">Só o mestre vê. Fica borrado até você revelar.</p>
        <Button
          size="sm"
          variant="secondary"
          aria-pressed={revealed}
          aria-label={revealed ? 'Ocultar segredos' : 'Revelar segredos'}
          leftIcon={revealed ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
          onClick={() => setRevealed((previous) => !previous)}
        >
          {revealed ? 'Ocultar' : 'Revelar'}
        </Button>
      </div>

      {revealed ? (
        <InlineTextarea
          value={value}
          onSave={onSave}
          ariaLabel="Segredos"
          placeholder="Nenhum segredo registrado."
          disabled={!canEdit}
          rows={5}
          className="px-2 py-1 text-sm text-gray-200"
        />
      ) : value ? (
        <p aria-hidden="true" className="select-none whitespace-pre-wrap px-2 py-1 text-sm text-gray-200 blur-sm">
          {value}
        </p>
      ) : (
        <p className="px-2 py-1 text-sm text-rpg-subtle">Nenhum segredo registrado.</p>
      )}
    </div>
  );
}