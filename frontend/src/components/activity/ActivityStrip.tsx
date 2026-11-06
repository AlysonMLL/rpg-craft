/**
 * Faixa "Atividade recente" da Home: cards compactos na horizontal (carrega 10, rolagem com
 * snap e setas quando passa da largura) e um card final "Ver tudo" que abre a gaveta com as
 * últimas 50. Cada card leva ao item (itens excluídos aparecem riscados e sem link).
 * Cards compactos só destacam a borda no hover (sem brilho nem elevação).
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { activityService, type Activity } from '../../api/activity';
import { TARGET_META, activityLink, verbLabel } from '../../lib/activityUtils';
import { formatRelative } from '../../lib/time';
import { cn } from '../../lib/cn';
import { Card, Drawer, Skeleton, toast } from '../ui';

function ActivityCard({ activity }: { activity: Activity }) {
  const meta = TARGET_META[activity.target_type];
  const link = activityLink(activity);

  const content = (
    <>
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
        <meta.Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block truncate text-sm font-medium',
            activity.target_deleted ? 'text-rpg-subtle line-through' : 'text-white',
          )}
        >
          {activity.target_label}
        </span>
        <span className="block truncate text-xs text-rpg-muted">
          {verbLabel(activity)} · {formatRelative(activity.created_at)}
        </span>
        <span className="block truncate text-xs text-rpg-subtle">
          {activity.target_type === 'world' ? meta.label : (activity.world_name ?? meta.label)}
        </span>
      </span>
    </>
  );

  return (
    <li className="w-60 shrink-0 snap-start">
      <Card
        padded={false}
        className={cn(
          'relative h-[88px] transition-colors',
          link && 'hover:border-rpg-primary/50 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-rpg-secondary',
        )}
      >
        {link ? (
          <Link
            to={link}
            className="flex h-full items-center gap-3 p-3 after:absolute after:inset-0 focus-visible:outline-none"
          >
            {content}
          </Link>
        ) : (
          <div className="flex h-full items-center gap-3 p-3">{content}</div>
        )}
      </Card>
    </li>
  );
}

function ActivityDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    activityService
      .list(50)
      .then(setItems)
      .catch(() => toast.error('Não foi possível carregar a atividade. Tente de novo.'))
      .finally(() => setIsLoading(false));
  }, [open]);

  return (
    <Drawer open={open} onClose={onClose} title="Atividade recente">
      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-rpg-muted">Sua atividade aparecerá aqui.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((activity) => {
            const meta = TARGET_META[activity.target_type];
            const link = activityLink(activity);
            const row = (
              <>
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                  <meta.Icon size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate text-sm font-medium',
                      activity.target_deleted ? 'text-rpg-subtle line-through' : 'text-white',
                    )}
                  >
                    {activity.target_label}
                  </span>
                  <span className="block truncate text-xs text-rpg-muted">
                    {verbLabel(activity)} · {formatRelative(activity.created_at)}
                    {activity.target_type !== 'world' && activity.world_name
                      ? ` · ${activity.world_name}`
                      : ''}
                  </span>
                </span>
              </>
            );
            return (
              <li key={activity.id}>
                {link ? (
                  <Link
                    to={link}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-gray-700 hover:bg-rpg-bg"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 p-2.5">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}

export default function ActivityStrip() {
  const [items, setItems] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const scroller = useRef<HTMLUListElement>(null);

  useEffect(() => {
    activityService
      .list(10)
      .then(setItems)
      .catch(() => toast.error('Não foi possível carregar a atividade recente.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const check = () => setOverflowing(element.scrollWidth > element.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [items]);

  const scrollBy = (direction: 1 | -1) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.current?.scrollBy({ left: direction * 480, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section aria-label="Atividade recente">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Clock size={18} className="text-rpg-primary" aria-hidden="true" />
          Atividade recente
        </h2>
        {overflowing && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Rolar atividade para a esquerda"
              className="rounded-md p-1.5 text-rpg-muted transition-colors hover:bg-rpg-card hover:text-white"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Rolar atividade para a direita"
              className="rounded-md p-1.5 text-rpg-muted transition-colors hover:bg-rpg-card hover:text-white"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[88px] w-60 shrink-0" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 p-6 text-center text-sm text-rpg-muted">
          Sua atividade aparecerá aqui.
        </div>
      ) : (
        <ul
          ref={scroller}
          className={cn(
            'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            overflowing &&
              '[-webkit-mask-image:linear-gradient(to_right,black_calc(100%_-_3rem),transparent)] [mask-image:linear-gradient(to_right,black_calc(100%_-_3rem),transparent)]',
          )}
        >
          {items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
          <li className="shrink-0 snap-start">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-[88px] w-40 items-center justify-center gap-2 rounded-xl border border-gray-800 bg-rpg-card text-sm font-medium text-rpg-muted transition-colors hover:border-rpg-primary/50 hover:text-white"
            >
              Ver tudo
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </li>
        </ul>
      )}

      <ActivityDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}