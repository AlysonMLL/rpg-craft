/**
 * Função do Arquivo: Retrato de um personagem. Mostra a imagem (recortada pelo topo, para
 * preservar o rosto) ou, sem URL ou se a imagem falhar, um bloco ciano com as iniciais.
 * O tamanho vem de quem usa (className); a gaveta da ficha vai reutilizar este componente.
 *
 * O que há aqui:
 * - CharacterPortrait: componente com as props name, url e className.
 */

import { useState } from 'react';
import { getInitials } from '../../lib/characterUtils';
import { cn } from '../../lib/cn';

interface CharacterPortraitProps {
  name: string;
  url: string;
  className?: string;
}

export function CharacterPortrait({ name, url, className }: CharacterPortraitProps) {
  // Guarda a URL que falhou: se a URL mudar, a nova imagem volta a ser tentada
  const [failedUrl, setFailedUrl] = useState('');
  const showImage = url !== '' && failedUrl !== url;

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
        'flex items-center justify-center bg-rpg-secondary/10 text-4xl font-bold text-rpg-secondary',
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}