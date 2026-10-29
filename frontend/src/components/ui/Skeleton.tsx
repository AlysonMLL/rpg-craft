/** Bloco de carregamento. Defina tamanho via className (ex: "h-40 w-full"). */
import { cn } from '../../lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-gray-800/70', className)} />;
}
