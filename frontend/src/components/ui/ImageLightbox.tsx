/**
 * Função do Arquivo: Visualizador de imagem em tela cheia (sobre <dialog>): mostra a imagem
 * inteira, sem enquadramento, sobre fundo escuro. Fecha com Esc, clique fora e botão X.
 * Fica ao lado (ou dentro) de gavetas sem problemas, porque o <dialog> vai para a camada
 * mais alta e o Esc fecha só ele.
 *
 * O que há aqui:
 * - ImageLightbox: componente (props: open, src, alt, onClose).
 */

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ open, src, alt, onClose }: ImageLightboxProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={`Imagem de ${alt}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-inherit backdrop:bg-black/90"
    >
      {open && (
        <div
          onClick={onClose}
          className="flex h-full w-full cursor-zoom-out items-center justify-center p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar imagem"
            className="absolute right-4 top-4 z-10 rounded-md bg-black/60 p-2 text-gray-200 transition-colors hover:text-white"
          >
            <X size={22} aria-hidden="true" />
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full cursor-default rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </dialog>
  );
}