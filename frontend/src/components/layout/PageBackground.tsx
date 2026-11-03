/**
 * Fundo decorativo da área logada (tema "Pontilhado"): pontos neutros muito sutis
 * nas bordas + acento amarelo no canto inferior direito que esmaece até sumir
 * no meio da tela. Fica fixo atrás do conteúdo (precisa do `isolate` no pai),
 * é só CSS e não anima. As classes estão em index.css.
 */
export default function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="dots-neutral absolute inset-0" />
      <div className="dots-accent absolute inset-0" />
    </div>
  );
}