/**
 * Função do Arquivo: Imagem de uma entidade do mundo (retrato de personagem, miniatura de raça,
 * banner de criatura). A moldura (tamanho, proporção, cantos) vem de quem usa, em className.
 * Sem URL, ou se a imagem falhar, mostra as iniciais. Sem enquadramento, recorta pelo topo
 * (preserva o rosto). Com enquadramento (crop, em % da imagem), mostra só essa parte, só com
 * CSS: a imagem é ampliada e deslocada dentro da moldura, sem canvas, então funciona com
 * qualquer URL. Com `expandable`, aparece um botão para ver a imagem inteira em tela cheia.
 *
 * O que há aqui:
 * - cropStyle(): converte o enquadramento em largura e deslocamento (em %) da imagem. Sem
 *   deformar, desde que a moldura tenha a mesma proporção do enquadramento.
 * - EntityImage: componente (props: name, url, crop, className, initialsClassName, expandable).
 */

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Maximize2 } from 'lucide-react';
import type { ImageCrop } from '../../api/common';
import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/entityUtils';
import { ImageLightbox } from './ImageLightbox';

interface EntityImageProps {
  name: string;
  url: string;
  /** Parte da imagem a mostrar (em %). Sem ela, a imagem é recortada pelo topo. */
  crop?: ImageCrop | null;
  /** Tamanho e proporção da moldura, ex.: "aspect-[3/4] w-40 rounded-xl". */
  className?: string;
  /** Tamanho do texto das iniciais (padrão grande, para os cards). */
  initialsClassName?: string;
  /** Mostra o botão de tela cheia (só quando há imagem). */
  expandable?: boolean;
}

function cropStyle(crop: ImageCrop): CSSProperties {
  return {
    width: `${10000 / crop.width}%`,
    left: `${(-crop.x * 100) / crop.width}%`,
    top: `${(-crop.y * 100) / crop.height}%`,
  };
}

export function EntityImage({
  name,
  url,
  crop = null,
  className,
  initialsClassName = 'text-4xl',
  expandable = false,
}: EntityImageProps) {
  // Guarda a URL que falhou: se a URL mudar, a nova imagem volta a ser tentada
  const [failedUrl, setFailedUrl] = useState('');
  const [expanded, setExpanded] = useState(false);
  const showImage = url !== '' && failedUrl !== url;

  return (
    <div className={cn('relative overflow-hidden bg-rpg-bg', className)}>
      {showImage ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(url)}
          style={crop ? cropStyle(crop) : undefined}
          className={crop ? 'absolute max-w-none' : 'absolute inset-0 h-full w-full object-cover object-top'}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-rpg-secondary/10 font-bold text-rpg-secondary',
            initialsClassName,
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {showImage && expandable && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={`Ver imagem inteira de ${name}`}
            title="Ver imagem inteira"
            className="absolute bottom-2 right-2 z-10 rounded-md bg-black/60 p-1.5 text-gray-200 backdrop-blur-sm transition-colors hover:text-white"
          >
            <Maximize2 size={16} aria-hidden="true" />
          </button>
          <ImageLightbox open={expanded} src={url} alt={name} onClose={() => setExpanded(false)} />
        </>
      )}
    </div>
  );
}