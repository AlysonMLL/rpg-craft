/**
 * Devolve o id da seção visível, para destacar o item do índice (scroll-spy).
 * `ids` precisa ser estável (constante fora do componente), na ordem em que aparecem na página.
 */
import { useEffect, useState } from 'react';

export function useScrollSpy(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const first = ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      // Considera "visível" a faixa logo abaixo da barra de abas, até pouco antes do meio da tela
      { rootMargin: '-110px 0px -55% 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}