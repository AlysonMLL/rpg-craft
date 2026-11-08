/**
 * Modal "Calendário e eras" da Linha do Tempo (só o dono):
 * - Calendário: nome da era ("da Queda") e a data atual da campanha ("Agora"), gravados no mundo.
 * - Eras: faixas de anos que agrupam os eventos (criar, editar, excluir com "Desfazer").
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { timelineService, type Era } from '../../api/timeline';
import { worldService, type World } from '../../api/worlds';
import { Button, Input, Modal, toast } from '../ui';

const toNumber = (text: string): number | null => {
  if (text.trim() === '') return null;
  return /^-?\d+$/.test(text.trim()) ? Number.parseInt(text, 10) : Number.NaN;
};
const toText = (value: number | null) => (value === null ? '' : String(value));

function CalendarForm({ world, onSaved }: { world: World; onSaved: (world: World) => void }) {
  const [eraName, setEraName] = useState(world.calendar_era_name);
  const [year, setYear] = useState(toText(world.now_year));
  const [month, setMonth] = useState(toText(world.now_month));
  const [day, setDay] = useState(toText(world.now_day));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const save = async (clear = false) => {
    const nowYear = clear ? null : toNumber(year);
    const nowMonth = clear ? null : toNumber(month);
    const nowDay = clear ? null : toNumber(day);

    if ([nowYear, nowMonth, nowDay].some((v) => v !== null && Number.isNaN(v))) {
      setError('Use apenas números inteiros na data.');
      return;
    }
    if ((nowMonth !== null || nowDay !== null) && nowYear === null) {
      setError('Informe o ano para definir o mês e o dia.');
      return;
    }
    if (nowDay !== null && nowMonth === null) {
      setError('Informe o mês antes do dia.');
      return;
    }
    if ((nowMonth !== null && nowMonth < 1) || (nowDay !== null && nowDay < 1)) {
      setError('Mês e dia começam em 1.');
      return;
    }
    setError('');

    setIsSaving(true);
    try {
      const updated = await worldService.updateWorld(world.id, {
        calendar_era_name: eraName.trim(),
        now_year: nowYear,
        now_month: nowMonth,
        now_day: nowDay,
      });
      if (clear) {
        setYear('');
        setMonth('');
        setDay('');
      }
      onSaved(updated);
      toast.success('Calendário salvo');
    } catch {
      toast.error('Não foi possível salvar o calendário. Tente de novo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        void save();
      }}
      className="space-y-4"
      noValidate
    >
      <Input
        label="Nome da era"
        maxLength={60}
        value={eraName}
        onChange={(e) => setEraName(e.target.value)}
        placeholder="da Queda"
        hint='Aparece depois do ano: "Ano 201 da Queda".'
      />
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-rpg-muted">Agora (data atual da campanha)</legend>
        <div className="grid grid-cols-3 gap-3">
          <Input aria-label="Ano atual" inputMode="numeric" placeholder="Ano" value={year} onChange={(e) => setYear(e.target.value)} />
          <Input aria-label="Mês atual" inputMode="numeric" placeholder="Mês" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Input aria-label="Dia atual" inputMode="numeric" placeholder="Dia" value={day} onChange={(e) => setDay(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-rpg-danger">
            {error}
          </p>
        )}
        <p className="mt-1.5 text-xs text-rpg-subtle">O marcador "Agora" separa o passado do futuro na linha do tempo.</p>
      </fieldset>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => void save(true)} disabled={isSaving}>
          Limpar "Agora"
        </Button>
        <Button type="submit" leftIcon={<Save size={16} />} loading={isSaving}>
          Salvar calendário
        </Button>
      </div>
    </form>
  );
}

function EraManager({
  worldId,
  eras,
  onErasChange,
}: {
  worldId: number;
  eras: Era[];
  onErasChange: (eras: Era[]) => void;
}) {
  const [editing, setEditing] = useState<Era | null>(null);
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (era: Era | null) => {
    setEditing(era);
    setName(era?.name ?? '');
    setStart(era ? String(era.start_year) : '');
    setEnd(era ? String(era.end_year) : '');
    setError('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const startYear = toNumber(start);
    const endYear = toNumber(end);
    if (!name.trim()) return setError('O nome da era é obrigatório.');
    if (startYear === null || endYear === null || Number.isNaN(startYear) || Number.isNaN(endYear)) {
      return setError('Informe o ano inicial e o final (números inteiros).');
    }
    if (startYear > endYear) return setError('O ano final deve ser igual ou maior que o inicial.');
    setError('');

    setIsSaving(true);
    try {
      const data = { name: name.trim(), start_year: startYear, end_year: endYear };
      if (editing) {
        const updated = await timelineService.updateEra(editing.id, data);
        onErasChange(eras.map((era) => (era.id === updated.id ? updated : era)));
      } else {
        onErasChange([...eras, await timelineService.createEra({ world: worldId, ...data })]);
      }
      toast.success('Era salva');
      startEdit(null);
    } catch {
      toast.error('Não foi possível salvar a era. Tente de novo.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (era: Era) => {
    try {
      await timelineService.removeEra(era.id);
    } catch {
      toast.error('Não foi possível excluir a era. Tente de novo.');
      return;
    }
    onErasChange(eras.filter((e) => e.id !== era.id));
    if (editing?.id === era.id) startEdit(null);
    toast('Era excluída', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            const restored = await timelineService.createEra({
              world: worldId,
              name: era.name,
              start_year: era.start_year,
              end_year: era.end_year,
            });
            onErasChange([...eras.filter((e) => e.id !== era.id), restored]);
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  const ordered = [...eras].sort((a, b) => a.start_year - b.start_year || a.id - b.id);

  return (
    <div className="space-y-4">
      {ordered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-sm text-rpg-muted">
          Nenhuma era ainda. Sem eras, os eventos aparecem numa lista única.
        </p>
      ) : (
        <ul className="space-y-2">
          {ordered.map((era) => (
            <li
              key={era.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-rpg-bg px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm text-white">
                {era.name}
                <span className="text-rpg-muted"> · Anos {era.start_year}–{era.end_year}</span>
              </span>
              <span className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(era)}
                  aria-label={`Editar era ${era.name}`}
                  className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-white"
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(era)}
                  aria-label={`Excluir era ${era.name}`}
                  className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-rpg-danger"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="space-y-3 rounded-lg border border-gray-800 p-3" noValidate>
        <p className="text-sm font-medium text-white">{editing ? `Editar era "${editing.name}"` : 'Nova era'}</p>
        <div className="grid grid-cols-[1fr_6rem_6rem] gap-3">
          <Input aria-label="Nome da era" placeholder="Era das Estrelas" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
          <Input aria-label="Ano inicial" inputMode="numeric" placeholder="De" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input aria-label="Ano final" inputMode="numeric" placeholder="Até" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="text-xs text-rpg-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          {editing && (
            <Button variant="ghost" onClick={() => startEdit(null)} disabled={isSaving}>
              Cancelar edição
            </Button>
          )}
          <Button type="submit" size="sm" variant="outline" leftIcon={editing ? <Save size={14} /> : <Plus size={14} />} loading={isSaving}>
            {editing ? 'Salvar era' : 'Adicionar era'}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface TimelineSettingsModalProps {
  open: boolean;
  onClose: () => void;
  world: World;
  onWorldChange: (world: World) => void;
  eras: Era[];
  onErasChange: (eras: Era[]) => void;
}

export default function TimelineSettingsModal({
  open,
  onClose,
  world,
  onWorldChange,
  eras,
  onErasChange,
}: TimelineSettingsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Calendário e eras" size="lg">
      <div className="space-y-8">
        <section aria-labelledby="calendario-titulo">
          <h3 id="calendario-titulo" className="mb-3 font-bold text-white">
            Calendário
          </h3>
          <CalendarForm world={world} onSaved={onWorldChange} />
        </section>
        <section aria-labelledby="eras-titulo">
          <h3 id="eras-titulo" className="mb-3 font-bold text-white">
            Eras
          </h3>
          <EraManager worldId={world.id} eras={eras} onErasChange={onErasChange} />
        </section>
      </div>
    </Modal>
  );
}