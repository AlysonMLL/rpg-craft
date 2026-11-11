/**
 * Função do Arquivo: Diálogo de confirmação para ações destrutivas ("Deseja mesmo excluir
 * esse personagem?"). Fica sobre o Modal do kit. Mostra "carregando" no botão enquanto
 * onConfirm roda e fecha sozinho quando ele termina sem erro.
 *
 * O que há aqui:
 * - ConfirmDialog: componente (props: open, title, description, confirmLabel, cancelLabel,
 *   danger, onConfirm, onClose). O foco inicial vai para "Cancelar", o lado seguro.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Botão vermelho (padrão). Use false para confirmações que não destroem nada. */
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      icon={<TriangleAlert size={20} className={danger ? 'text-rpg-danger' : 'text-rpg-primary'} aria-hidden="true" />}
      footer={
        <>
          <Button variant="secondary" autoFocus onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={busy} onClick={() => void handleConfirm()}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-gray-300">{description}</div>
    </Modal>
  );
}