/**
 * Modal "Enquadrar retrato". Usa o modal genérico de recorte com a proporção fixa
 * dos retratos de personagem.
 */

import type { PortraitCrop } from '../../api/characters';
import { PORTRAIT_ASPECT } from '../../lib/characterUtils';
import { ImageCropModal } from '../ui';

interface PortraitCropModalProps {
  open: boolean;
  imageUrl: string;
  initialCrop: PortraitCrop | null;
  onSave: (crop: PortraitCrop | null) => void;
  onClose: () => void;
}

export function PortraitCropModal({
  open,
  imageUrl,
  initialCrop,
  onSave,
  onClose,
}: PortraitCropModalProps) {
  return (
    <ImageCropModal
      open={open}
      imageUrl={imageUrl}
      aspect={PORTRAIT_ASPECT}
      title="Enquadrar retrato"
      initialCrop={initialCrop}
      onSave={onSave}
      onClose={onClose}
    />
  );
}
