/**
 * O que há aqui:
 * - Modal de leitura e edição rápida de uma anotação em Markdown (usado pelos widgets da Home).
 * - Abas Ler / Editar, barra de formatação (MarkdownEditor) e renderização segura (MarkdownView,
 *   com suporte a <u> e <mark>). Aba padrão: 'ler' para nota existente, 'editar' para nova.
 * - readOnly (modo convidado): só leitura.
 *
 * Função do arquivo: Editor rápido do Mestre. A tela /notebook tem o editor completo
 * com salvamento automático; este modal salva ao clicar em "Salvar anotação".
 */

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Input, Modal, TabPanel, Tabs } from '../ui';
import { MarkdownEditor } from '../markdown/MarkdownEditor';
import { MarkdownView } from '../markdown/MarkdownView';

export interface NoteData {
  id?: number;
  title: string;
  content: string;
}

interface Props {
  isOpen: boolean;
  initialData: NoteData | null;
  onClose: () => void;
  onSave: (note: NoteData) => void;
  /** Modo convidado: só leitura (sem aba Editar nem botão Salvar) */
  readOnly?: boolean;
}

const TAB_ITEMS = [
  { value: 'ler', label: 'Ler' },
  { value: 'editar', label: 'Editar' },
];

export default function NoteModal({ isOpen, initialData, onClose, onSave, readOnly = false }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tab, setTab] = useState('ler');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title ?? '');
      setContent(initialData?.content ?? '');
      setTab(readOnly || initialData?.id ? 'ler' : 'editar');
      setError('');
    }
  }, [isOpen, initialData, readOnly]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('O título da anotação é obrigatório.');
      setTab('editar');
      return;
    }
    onSave({ id: initialData?.id, title: title.trim(), content });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      tall
      title={initialData?.id ? 'Anotação' : 'Nova anotação'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!readOnly && (
            <Button leftIcon={<Save size={16} />} onClick={handleSave}>
              Salvar anotação
            </Button>
          )}
        </>
      }
    >
      <div className="flex h-full flex-col gap-4">
        {!readOnly && (
          <Tabs idPrefix="notemodal" ariaLabel="Modo da anotação" items={TAB_ITEMS} value={tab} onChange={setTab} />
        )}

        <TabPanel idPrefix="notemodal" value="ler" current={tab} className="min-h-0 flex-1 overflow-y-auto">
          <h3 className="mb-3 text-xl font-bold text-white">{title || 'Nota sem título'}</h3>
          {content ? (
            <MarkdownView content={content} />
          ) : (
            <p className="italic text-rpg-subtle">Esta anotação está vazia…</p>
          )}
        </TabPanel>

        <TabPanel idPrefix="notemodal" value="editar" current={tab} className="flex min-h-0 flex-1 flex-col gap-4">
          <Input
            label="Título"
            required
            maxLength={120}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            error={error}
            placeholder="Ex: Lore da Seita dos Cinco Pilares"
          />
          <div className="min-h-0 flex-1">
            <MarkdownEditor value={content} onChange={setContent} />
          </div>
        </TabPanel>
      </div>
    </Modal>
  );
}
