/**
 * Função do Arquivo: Modal "Enquadrar imagem". Mostra a imagem da URL com uma moldura de
 * proporção fixa (aspect); o dono arrasta a imagem e ajusta o zoom para escolher a parte que
 * aparece nos cards e nas gavetas. Entrega o enquadramento em % da imagem original (ImageCrop),
 * sem cortar nem enviar a imagem: só guarda os números. Também permite remover o enquadramento.
 *
 * O que há aqui:
 * - ImageCropModal: componente (props: open, imageUrl, aspect, title, initialCrop, onSave,
 *   onClose). O estado (posição, zoom) reinicia a cada abertura; o Cropper só monta com o modal
 *   aberto e restaura o enquadramento salvo (initialCroppedAreaPercentages).
 */

import { useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import type { ImageCrop } from '../../api/common';
import { Button } from './Button';
import { Modal } from './Modal';

interface ImageCropModalProps {
  open: boolean;
  imageUrl: string;
  /** Proporção da moldura (largura / altura): 3 / 4 para retrato, 3 / 1 para banner. */
  aspect: number;
  title?: string;
  initialCrop: ImageCrop | null;
  /** null = remover o enquadramento. */
  onSave: (crop: ImageCrop | null) => void;
  onClose: () => void;
}

const round = (value: number) => Math.round(value * 100) / 100;

export function ImageCropModal({
  open,
  imageUrl,
  aspect,
  title = 'Enquadrar imagem',
  initialCrop,
  onSave,
  onClose,
}: ImageCropModalProps) {
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
      title={title}
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
        nos cards e nas fichas.
      </p>

      <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black sm:h-96">
        <Cropper
          image={imageUrl}
          crop={position}
          zoom={zoom}
          minZoom={1}
          maxZoom={4}
          aspect={aspect}
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
          aria-label="Zoom da imagem"
          onChange={(event) => setZoom(Number(event.target.value))}
          className="w-full accent-rpg-primary"
        />
      </label>
    </Modal>
  );
}