/**
 * Função do Arquivo: Modal "Enquadrar retrato". Mostra a imagem da URL do personagem com uma
 * moldura 3:4 fixa; o dono arrasta a imagem e ajusta o zoom para escolher a parte que aparece
 * no card e na gaveta. Entrega o enquadramento em % da imagem original (PortraitCrop), sem
 * cortar nem enviar a imagem: só guarda os números. Também permite remover o enquadramento.
 *
 * O que há aqui:
 * - PortraitCropModal: componente (props: open, imageUrl, initialCrop, onSave, onClose).
 *   O estado (posição, zoom) reinicia a cada abertura; o Cropper só monta com o modal aberto
 *   e restaura o enquadramento salvo (initialCroppedAreaPercentages).
 */

import { useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import type { PortraitCrop } from '../../api/characters';
import { PORTRAIT_ASPECT } from '../../lib/characterUtils';
import { Button, Modal } from '../ui';

interface PortraitCropModalProps {
  open: boolean;
  imageUrl: string;
  initialCrop: PortraitCrop | null;
  /** null = remover o enquadramento. */
  onSave: (crop: PortraitCrop | null) => void;
  onClose: () => void;
}

const round = (value: number) => Math.round(value * 100) / 100;

export function PortraitCropModal({ open, imageUrl, initialCrop, onSave, onClose }: PortraitCropModalProps) {
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // Reinicia ao abrir (ajuste de estado durante a renderização, sem useEffect)
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      setArea(null);
    }
  }

  const save = () => {
    if (!area) return;
    onSave({
      x: Math.max(0, round(area.x)),
      y: Math.max(0, round(area.y)),
      width: round(area.width),
      height: round(area.height),
    });
    onClose();
  };

  const remove = () => {
    onSave(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enquadrar retrato"
      size="md"
      footer={
        <>
          {initialCrop !== null && (
            <Button variant="ghost" onClick={remove}>
              Remover enquadramento
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={area === null}>
            Salvar
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-rpg-muted">
        Arraste a imagem para posicionar e use o zoom para aproximar. A moldura é a parte que aparece
        no card e na ficha.
      </p>

      <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black sm:h-96">
        <Cropper
          image={imageUrl}
          crop={position}
          zoom={zoom}
          minZoom={1}
          maxZoom={4}
          aspect={PORTRAIT_ASPECT}
          initialCroppedAreaPercentages={initialCrop ?? undefined}
          onCropChange={setPosition}
          onZoomChange={setZoom}
          onCropComplete={(percentages) => setArea(percentages)}
        />
      </div>

      <label className="mt-4 flex items-center gap-3 text-sm text-gray-200">
        <span className="shrink-0">Zoom</span>
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={zoom}
          aria-label="Zoom do retrato"
          onChange={(event) => setZoom(Number(event.target.value))}
          className="w-full accent-rpg-primary"
        />
      </label>
    </Modal>
  );
}