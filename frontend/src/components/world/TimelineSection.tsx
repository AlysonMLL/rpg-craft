/**
 * Seção "Linha do Tempo" da Visão geral do mundo.
 * - Eventos ordenados por data no calendário do mundo, agrupados em eras recolhíveis (se houver),
 *   com o marcador "Agora" separando passado e futuro.
 * - Mostra 6 eventos e "Ver todos os eventos (N)".
 * - Filtros por personagem e local (tags simples). Evento "só do mestre": borrado, com olho.
 * - Dono: "+ Evento", "Calendário e eras", editar/excluir (com "Desfazer") e "+" entre dois
 *   eventos para inserir naquele ponto (a data sugerida é a do evento anterior).
 *   Eventos com a mesma data seguem a ordem de criação.
 */
import { useEffect, useState } from 'react';
import { ChevronDown, Clock, Eye, EyeOff, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import { timelineService, type Era, type TimelineEvent } from '../../api/timeline';
import { useWorldContext } from '../../hooks/useWorld';
import {
  buildGroups,
  collectTags,
  compareEvents,
  firstAfterNowIndex,
  formatEventDate,
  formatNow,
  hasTag,
  type NowDate,
} from '../../lib/timelineUtils';
import { cn } from '../../lib/cn';
import { Button, Drawer, EmptyState, Select, Skeleton, toast } from '../ui';
import { SectionHeader } from './SectionHeader';
import TimelineEventForm from './TimelineEventForm';
import TimelineSettingsModal from './TimelineSettingsModal';

const VISIBLE = 6;
const COLUMNS = 'grid-cols-[6rem_1.25rem_1fr] md:grid-cols-[8rem_1.25rem_1fr]';

type Defaults = { year: number | null; month: number | null; day: number | null };
interface DrawerState {
  event: TimelineEvent | null;
  defaults?: Defaults;
  key: number;
}

const tagClass = {
  characters: 'border-rpg-secondary/20 bg-rpg-secondary/10 text-rpg-secondary',
  locations: 'border-purple-400/20 bg-purple-400/10 text-purple-300',
};

function TagList({ tags, kind }: { tags: string[]; kind: 'characters' | 'locations' }) {
  return (
    <>
      {tags.map((tag) => (
        <span key={`${kind}-${tag}`} className={cn('rounded border px-1.5 py-0.5 text-xs', tagClass[kind])}>
          {tag}
        </span>
      ))}
    </>
  );
}

interface EventRowProps {
  event: TimelineEvent;
  eraName: string;
  canEdit: boolean;
  revealed: boolean;
  isLastInGroup: boolean;
  onToggleReveal: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onInsertAfter: () => void;
}

function EventRow({
  event,
  eraName,
  canEdit,
  revealed,
  isLastInGroup,
  onToggleReveal,
  onEdit,
  onDelete,
  onInsertAfter,
}: EventRowProps) {
  const date = formatEventDate(event, eraName);
  const hidden = event.is_secret && !revealed;

  return (
    <li className={cn('group/event grid gap-x-3', COLUMNS)}>
      <div className="pt-0.5 text-right">
        <p className="text-sm font-semibold text-slate-300">{date.primary}</p>
        {date.secondary && <p className="text-xs text-slate-400">{date.secondary}</p>}
      </div>

      <div className="relative flex justify-center">
        {!isLastInGroup && <span aria-hidden="true" className="absolute inset-y-0 w-px bg-gray-800" />}
        <span
          aria-hidden="true"
          className="relative mt-1.5 h-2.5 w-2.5 rounded-full bg-slate-500 ring-4 ring-rpg-bg transition-colors group-hover/event:bg-rpg-primary"
        />
        {canEdit && !isLastInGroup && (
          <button
            type="button"
            onClick={onInsertAfter}
            aria-label={`Inserir evento depois de ${event.title}`}
            title="Inserir evento aqui"
            className="absolute bottom-0 z-10 flex h-5 w-5 translate-y-1/2 items-center justify-center rounded-full border border-gray-700 bg-rpg-card text-rpg-muted opacity-0 transition-opacity hover:border-rpg-primary hover:text-rpg-primary focus-visible:opacity-100 group-hover/event:opacity-100 pointer-coarse:opacity-100"
          >
            <Plus size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="min-w-0 pb-7">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {event.is_secret && (
              <button
                type="button"
                onClick={onToggleReveal}
                aria-pressed={revealed}
                aria-label={revealed ? 'Ocultar evento do mestre' : 'Mostrar evento do mestre'}
                className="mb-1 inline-flex items-center gap-1.5 rounded border border-red-400/30 bg-red-400/10 px-1.5 py-0.5 text-xs text-rpg-danger transition-colors hover:bg-red-400/20"
              >
                {revealed ? <EyeOff size={12} aria-hidden="true" /> : <Eye size={12} aria-hidden="true" />}
                Só do mestre
              </button>
            )}
            <div
              aria-hidden={hidden || undefined}
              className={cn('space-y-2', hidden && 'select-none blur-sm')}
            >
              <h3 className="font-bold text-white">{event.title}</h3>
              {event.description && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">{event.description}</p>
              )}
              {(event.characters.length > 0 || event.locations.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  <TagList tags={event.characters} kind="characters" />
                  <TagList tags={event.locations} kind="locations" />
                </div>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/event:opacity-100 pointer-coarse:opacity-100">
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Editar evento ${event.title}`}
                className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-white"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Excluir evento ${event.title}`}
                className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-rpg-danger"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function TimelineSection({ canEdit }: { canEdit: boolean }) {
  const { world, updateWorld } = useWorldContext();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eras, setEras] = useState<Era[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [characterFilter, setCharacterFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [shownDrawer, setShownDrawer] = useState<DrawerState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (drawer) setShownDrawer(drawer);
  }, [drawer]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([timelineService.listEvents(world.id), timelineService.listEras(world.id)])
      .then(([loadedEvents, loadedEras]) => {
        setEvents(loadedEvents);
        setEras(loadedEras);
      })
      .catch(() => toast.error('Não foi possível carregar a linha do tempo. Tente de novo.'))
      .finally(() => setIsLoading(false));
  }, [world.id]);

  const eraName = world.calendar_era_name;
  const now: NowDate | null =
    world.now_year !== null ? { year: world.now_year, month: world.now_month, day: world.now_day } : null;

  const sorted = [...events].sort(compareEvents);
  const characterTags = collectTags(events, 'characters');
  const locationTags = collectTags(events, 'locations');
  const filtered = sorted.filter(
    (event) =>
      (!characterFilter || hasTag(event.characters, characterFilter)) &&
      (!locationFilter || hasTag(event.locations, locationFilter)),
  );
  const visible = expanded ? filtered : filtered.slice(0, VISIBLE);
  const markerIndex = now ? firstAfterNowIndex(filtered, now) : null;
  // O marcador só aparece onde está de verdade: se o primeiro evento depois dele está escondido, ele também fica
  const showNow = markerIndex !== null && markerIndex <= visible.length;
  const groups = buildGroups(visible, eras, now, showNow);

  const openCreate = (defaults?: Defaults) =>
    setDrawer({ event: null, defaults: defaults ?? (now ? { ...now } : undefined), key: Date.now() });
  const openEdit = (event: TimelineEvent) => setDrawer({ event, key: event.id });
  const closeDrawer = () => setDrawer(null);

  const handleSaved = (saved: TimelineEvent) => {
    setEvents((previous) =>
      previous.some((event) => event.id === saved.id)
        ? previous.map((event) => (event.id === saved.id ? saved : event))
        : [...previous, saved],
    );
    closeDrawer();
  };

  const deleteEvent = async (event: TimelineEvent) => {
    try {
      await timelineService.removeEvent(event.id);
    } catch {
      toast.error('Não foi possível excluir o evento. Tente de novo.');
      return;
    }
    setEvents((previous) => previous.filter((e) => e.id !== event.id));
    toast('Evento excluído', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            const restored = await timelineService.createEvent({
              world: world.id,
              title: event.title,
              year: event.year,
              month: event.month,
              day: event.day,
              date_label: event.date_label,
              description: event.description,
              characters: event.characters,
              locations: event.locations,
              is_secret: event.is_secret,
            });
            setEvents((previous) => [...previous, restored]);
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  const toggleSet = <T,>(setter: (updater: (previous: Set<T>) => Set<T>) => void, value: T) =>
    setter((previous) => {
      const next = new Set(previous);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  return (
    <>
      <SectionHeader
        id="linha-titulo"
        title="Linha do Tempo"
        Icon={Clock}
        actions={
          canEdit && (
            <>
              <Button variant="secondary" size="sm" leftIcon={<Settings size={14} />} onClick={() => setSettingsOpen(true)}>
                Calendário e eras
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => openCreate()}>
                Adicionar evento
              </Button>
            </>
          )
        }
      />

      {(characterTags.length > 0 || locationTags.length > 0) && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {characterTags.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-rpg-muted">
              Personagem
              <div className="w-44">
                <Select size="sm" value={characterFilter} onChange={(e) => setCharacterFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {characterTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </Select>
              </div>
            </label>
          )}
          {locationTags.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-rpg-muted">
              Local
              <div className="w-44">
                <Select size="sm" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {locationTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </Select>
              </div>
            </label>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Clock size={28} aria-hidden="true" />}
          title="Nenhum evento ainda"
          description="Registre os acontecimentos do mundo no calendário da campanha."
          action={
            canEdit && (
              <Button variant="outline" leftIcon={<Plus size={16} />} onClick={() => openCreate()}>
                Adicionar evento
              </Button>
            )
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum evento com esses filtros"
          description="Tente outro personagem ou local."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setCharacterFilter('');
                setLocationFilter('');
              }}
            >
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const eventRows = group.rows.filter((row) => row.kind === 'event');
            const showHeader = group.era !== null || group.isLoose;
            const isCollapsed = showHeader && collapsed.has(group.id);
            const label = group.era
              ? `${group.era.name} · Anos ${group.era.start_year}–${group.era.end_year}`
              : 'Sem era';

            return (
              <section key={group.id} aria-label={showHeader ? label : 'Eventos'}>
                {showHeader && (
                  <button
                    type="button"
                    onClick={() => toggleSet(setCollapsed, group.id)}
                    aria-expanded={!isCollapsed}
                    className="mb-4 flex w-full items-center justify-between rounded-lg border border-gray-800 bg-rpg-card px-4 py-2.5 text-left transition-colors hover:border-gray-600"
                  >
                    <span className="text-sm font-bold text-white">{label}</span>
                    <span className="flex items-center gap-2 text-xs text-rpg-muted">
                      {eventRows.length} {eventRows.length === 1 ? 'evento' : 'eventos'}
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={cn('transition-transform', isCollapsed && '-rotate-90')}
                      />
                    </span>
                  </button>
                )}

                {!isCollapsed && (
                  <ol>
                    {group.rows.map((row, index) => {
                      if (row.kind === 'now' && now) {
                        return (
                          <li key="now" aria-label={formatNow(now, eraName)} className="my-3 flex items-center gap-3">
                            <span aria-hidden="true" className="h-px flex-1 bg-rpg-primary/60" />
                            <span className="rounded-full border border-rpg-primary px-3 py-1 text-xs font-bold text-rpg-primary">
                              {formatNow(now, eraName)}
                            </span>
                            <span aria-hidden="true" className="h-px flex-1 bg-rpg-primary/60" />
                          </li>
                        );
                      }
                      if (row.kind !== 'event') return null;
                      const nextEvent = group.rows.slice(index + 1).some((r) => r.kind === 'event');
                      return (
                        <EventRow
                          key={row.event.id}
                          event={row.event}
                          eraName={eraName}
                          canEdit={canEdit}
                          revealed={revealed.has(row.event.id)}
                          isLastInGroup={!nextEvent}
                          onToggleReveal={() => toggleSet(setRevealed, row.event.id)}
                          onEdit={() => openEdit(row.event)}
                          onDelete={() => void deleteEvent(row.event)}
                          onInsertAfter={() =>
                            openCreate({ year: row.event.year, month: row.event.month, day: row.event.day })
                          }
                        />
                      );
                    })}
                  </ol>
                )}
              </section>
            );
          })}

          {filtered.length > VISIBLE && (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)}>
                {expanded ? 'Mostrar menos' : `Ver todos os eventos (${filtered.length})`}
              </Button>
            </div>
          )}
        </div>
      )}

      <Drawer
        open={drawer !== null}
        onClose={closeDrawer}
        width="md"
        title={shownDrawer?.event ? 'Editar evento' : 'Novo evento'}
      >
        {shownDrawer && (
          <TimelineEventForm
            key={shownDrawer.key}
            worldId={world.id}
            eraName={eraName}
            event={shownDrawer.event}
            defaults={shownDrawer.defaults}
            characterSuggestions={characterTags}
            locationSuggestions={locationTags}
            onSaved={handleSaved}
            onCancel={closeDrawer}
          />
        )}
      </Drawer>

      <TimelineSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        world={world}
        onWorldChange={updateWorld}
        eras={eras}
        onErasChange={setEras}
      />
    </>
  );
}