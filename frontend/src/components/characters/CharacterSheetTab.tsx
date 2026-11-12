/**
 * Função do Arquivo: Conteúdo da aba "Ficha completa" da gaveta do personagem: a ficha em
 * Markdown (campo sheet_markdown). O dono alterna entre Ler e Editar (começa em Editar se a
 * ficha estiver vazia); convidado só lê. Editar salva sozinho (useAutosave) e também ao sair
 * da aba ou fechar a gaveta.
 *
 * O que há aqui:
 * - CharacterSheetTab: componente (props: character, canEdit, onDraftChange, onSaved).
 *   onDraftChange avisa a gaveta do texto atual a cada digitação (mantém o Ler em dia);
 *   onSaved recebe o personagem devolvido pela API depois de cada salvamento.
 * - SheetEditor (interno): editor de Markdown com autosave e o rótulo "Salvando… / Salvo agora".
 * - SaveLabel (interno): estado do salvamento (igual ao do DocumentsSection).
 */

import { useState } from 'react';
import { characterService, type Character } from '../../api/characters';
import { useAutosave, type SaveStatus } from '../../hooks/useAutosave';
import { cn } from '../../lib/cn';
import { MarkdownEditor } from '../markdown/MarkdownEditor';
import { MarkdownView } from '../markdown/MarkdownView';
import { TabPanel, Tabs } from '../ui';

const MODE_ITEMS = [
  { value: 'ler', label: 'Ler' },
  { value: 'editar', label: 'Editar' },
];

function SaveLabel({ status }: { status: SaveStatus }) {
  const text =
    status === 'saving' ? 'Salvando…' : status === 'saved' ? 'Salvo agora' : status === 'error' ? 'Erro ao salvar' : '';
  return (
    <span role="status" className={cn('text-xs', status === 'error' ? 'text-rpg-danger' : 'text-rpg-subtle')}>
      {text}
    </span>
  );
}

interface CharacterSheetTabProps {
  character: Character;
  canEdit: boolean;
  onDraftChange: (markdown: string) => void;
  onSaved: (character: Character) => void;
}

function SheetEditor({ character, onDraftChange, onSaved }: Omit<CharacterSheetTabProps, 'canEdit'>) {
  const [draft, setDraft] = useState(character.sheet_markdown);

  const { status } = useAutosave(draft, async (value) => {
    onSaved(await characterService.update(character.id, { sheet_markdown: value }));
  });

  const change = (value: string) => {
    setDraft(value);
    onDraftChange(value);
  };

  return (
    <div className="space-y-2">
      <div className="h-[60vh] min-h-96">
        <MarkdownEditor
          value={draft}
          onChange={change}
          ariaLabel="Ficha completa em Markdown"
          placeholder="História, personalidade, anotações de campanha… (Markdown)"
        />
      </div>
      <div className="flex justify-end">
        <SaveLabel status={status} />
      </div>
    </div>
  );
}

export function CharacterSheetTab({ character, canEdit, onDraftChange, onSaved }: CharacterSheetTabProps) {
  const [mode, setMode] = useState(canEdit && !character.sheet_markdown ? 'editar' : 'ler');
  const current = canEdit ? mode : 'ler';

  return (
    <div className="space-y-4">
      {canEdit && (
        <Tabs
          idPrefix="char-md"
          ariaLabel="Modo da ficha completa"
          items={MODE_ITEMS}
          value={mode}
          onChange={setMode}
        />
      )}

      <TabPanel idPrefix="char-md" value="ler" current={current}>
        {character.sheet_markdown ? (
          <MarkdownView content={character.sheet_markdown} />
        ) : (
          <p className="italic text-rpg-subtle">
            {canEdit
              ? 'A ficha completa está vazia. Use a aba Editar para escrever.'
              : 'Este personagem ainda não tem ficha completa.'}
          </p>
        )}
      </TabPanel>

      <TabPanel idPrefix="char-md" value="editar" current={current}>
        <SheetEditor character={character} onDraftChange={onDraftChange} onSaved={onSaved} />
      </TabPanel>
    </div>
  );
}