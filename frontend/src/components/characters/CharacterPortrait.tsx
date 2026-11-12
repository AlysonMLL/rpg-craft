/**
 * Função do Arquivo: Retrato de um personagem. Mostra a imagem ou, sem URL ou se a imagem
 * falhar, um bloco ciano com as iniciais. Sem enquadramento, a imagem é recortada pelo topo
 * (preserva o rosto). Com enquadramento (crop, em % da imagem original), mostra só essa parte,
 * só com CSS: a imagem é ampliada e deslocada dentro de uma moldura com overflow oculto, sem
 * canvas, então funciona com qualquer URL. O tamanho e a proporção vêm de quem usa (className).
 *
 * O que há aqui:
 * - cropStyle(): converte o enquadramento em largura e deslocamento (em %) da imagem.
 * - CharacterPortrait: componente (props: name, url, crop, className, initialsClassName).
 */

import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { PortraitCrop } from '../../api/characters';
import { getInitials } from '../../lib/characterUtils';
import { cn } from '../../lib/cn';

interface CharacterPortraitProps {
  name: string;
  url: string;
  /** Parte da imagem a mostrar (em %). Sem ela, a imagem é recortada pelo topo. */
  crop?: PortraitCrop | null;
  className?: string;
  /** Tamanho do texto das iniciais (padrão grande, para os cards). */
  initialsClassName?: string;
}

/**
 * Com a moldura na mesma proporção do recorte, a imagem não deforma: ela só precisa ficar
 * (100 / width)% da largura da moldura e deslocada em x/width e y/height (também em %).
 */
function cropStyle(crop: PortraitCrop): CSSProperties {
  return {
    width: `${10000 / crop.width}%`,
    left: `${(-crop.x * 100) / crop.width}%`,
    top: `${(-crop.y * 100) / crop.height}%`,
  };
}

export function CharacterPortrait({
  name,
  url,
  crop = null,
  className,
  initialsClassName = 'text-4xl',
}: CharacterPortraitProps) {
  // Guarda a URL que falhou: se a URL mudar, a nova imagem volta a ser tentada
  const [failedUrl, setFailedUrl] = useState('');
  const showImage = url !== '' && failedUrl !== url;

  if (showImage && crop) {
    return (
      <div className={cn('relative overflow-hidden bg-rpg-bg', className)}>
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(url)}
          style={cropStyle(crop)}
          className="absolute max-w-none"
        />
      </div>
    );
  }

  if (showImage) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(url)}
        className={cn('bg-rpg-bg object-cover object-top', className)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center bg-rpg-secondary/10 font-bold text-rpg-secondary',
        initialsClassName,
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}