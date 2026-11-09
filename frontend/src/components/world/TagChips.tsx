/** Etiquetas de leitura (não editáveis) de personagens e locais: ciano para personagens, roxo para locais. */
import { cn } from '../../lib/cn';

const KIND_CLASS = {
  characters: 'border-rpg-secondary/20 bg-rpg-secondary/10 text-rpg-secondary',
  locations: 'border-purple-400/20 bg-purple-400/10 text-purple-300',
};

interface TagChipsProps {
  characters?: string[];
  locations?: string[];
}

export function TagChips({ characters = [], locations = [] }: TagChipsProps) {
  if (characters.length === 0 && locations.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {characters.map((tag) => (
        <span key={`c-${tag}`} className={cn('rounded border px-1.5 py-0.5 text-xs', KIND_CLASS.characters)}>
          {tag}
        </span>
      ))}
      {locations.map((tag) => (
        <span key={`l-${tag}`} className={cn('rounded border px-1.5 py-0.5 text-xs', KIND_CLASS.locations)}>
          {tag}
        </span>
      ))}
    </div>
  );
}