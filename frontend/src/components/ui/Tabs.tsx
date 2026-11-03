/**
 * Abas acessíveis (role tablist/tab/tabpanel), com setas, Home e End.
 * - Tabs: a barra de abas. Controlada por `value` e `onChange`.
 * - TabPanel: o conteúdo de uma aba. Só monta os filhos quando a aba está ativa,
 *   o que ajuda a carregar dados por aba (regra "sem buscar tudo de uma vez").
 * Use o mesmo `idPrefix` nos dois para ligar aba e painel.
 */
import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  ariaLabel?: string;
  className?: string;
}

export function Tabs({
  items,
  value,
  onChange,
  idPrefix = 'tabs',
  ariaLabel,
  className,
}: TabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = items.findIndex((item) => item.value === value);
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;

    event.preventDefault();
    const target = items[next];
    onChange(target.value);
    refs.current[target.value]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn('flex gap-6 overflow-x-auto border-b border-gray-800', className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            ref={(element) => {
              refs.current[item.value] = element;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.value}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${item.value}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              '-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
              active
                ? 'border-rpg-primary text-white'
                : 'border-transparent text-rpg-muted hover:text-white',
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-rpg-muted">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  value: string;
  current: string;
  idPrefix?: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, current, idPrefix = 'tabs', children, className }: TabPanelProps) {
  const active = value === current;
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      hidden={!active}
      className={className}
    >
      {active && children}
    </div>
  );
}
