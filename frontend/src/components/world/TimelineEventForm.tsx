/**
 * Formulário de evento da Linha do Tempo (dentro da gaveta): título, data no calendário do mundo
 * (ano obrigatório; mês e dia opcionais), rótulo livre, personagens e locais como tags simples,
 * descrição e "só do mestre".
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Save } from 'lucide-react';
import { timelineService, type TimelineEvent } from '../../api/timeline';
import { Button, Input, TagInput, Textarea, Toggle, toast } from '../ui';

interface TimelineEventFormProps {
  worldId: number;
  eraName: string;
  /** null = novo evento */
  event: TimelineEvent | null;
  /** Data sugerida num evento novo (ex.: a do evento anterior ao usar o "+" entre dois eventos) */
  defaults?: { year: number | null; month: number | null; day: number | null };
  characterSuggestions: string[];
  locationSuggestions: string[];
  onSaved: (event: TimelineEvent) => void;
  onCancel: () => void;
}

const toText = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));

/** '' -> null; número inteiro -> número; qualquer outra coisa -> NaN (inválido) */
const toNumber = (text: string): number | null => {
  if (text.trim() === '') return null;
  return /^-?\d+$/.test(text.trim()) ? Number.parseInt(text, 10) : Number.NaN;
};

export default function TimelineEventForm({
  worldId,
  eraName,
  event,
  defaults,
  characterSuggestions,
  locationSuggestions,
  onSaved,
  onCancel,
}: TimelineEventFormProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [year, setYear] = useState(toText(event?.year ?? defaults?.year));
  const [month, setMonth] = useState(toText(event ? event.month : defaults?.month));
  const [day, setDay] = useState(toText(event ? event.day : defaults?.day));
  const [dateLabel, setDateLabel] = useState(event?.date_label ?? '');
  const [characters, setCharacters] = useState<string[]>(event?.characters ?? []);
  const [locations, setLocations] = useState<string[]>(event?.locations ?? []);
  const [description, setDescription] = useState(event?.description ?? '');
  const [isSecret, setIsSecret] = useState(event?.is_secret ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const found: Record<string, string> = {};
    const yearValue = toNumber(year);
    const monthValue = toNumber(month);
    const dayValue = toNumber(day);

    if (!title.trim()) found.title = 'O título do evento é obrigatório.';
    if (yearValue === null || Number.isNaN(yearValue)) found.year = 'Informe o ano (número inteiro).';
    if (monthValue !== null && (Number.isNaN(monthValue) || monthValue < 1)) found.month = 'Use um número a partir de 1.';
    if (dayValue !== null && (Number.isNaN(dayValue) || dayValue < 1)) found.day = 'Use um número a partir de 1.';
    if (dayValue !== null && monthValue === null && !found.day) found.day = 'Informe o mês antes do dia.';
    return { found, yearValue, monthValue, dayValue };
  };

  const handleSubmit = async (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    const { found, yearValue, monthValue, dayValue } = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || yearValue === null) return;

    const payload = {
      title: title.trim(),
      year: yearValue,
      month: monthValue,
      day: dayValue,
      date_label: dateLabel.trim(),
      description,
      characters,
      locations,
      is_secret: isSecret,
    };

    setIsSaving(true);
    try {
      const saved = event
        ? await timelineService.updateEvent(event.id, payload)
        : await timelineService.createEvent({ world: worldId, ...payload });
      toast.success('Evento salvo');
      onSaved(saved);
    } catch {
      toast.error('Não foi possível salvar o evento. Tente de novo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Título"
        required
        maxLength={160}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Ex: Fundação da Torre de Cristal"
      />

      <div className="grid grid-cols-3 gap-3">
        <Input
          label={`Ano${eraName ? ` ${eraName}` : ''}`}
          required
          inputMode="numeric"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          error={errors.year}
          placeholder="201"
        />
        <Input
          label="Mês"
          inputMode="numeric"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          error={errors.month}
          placeholder="Opcional"
        />
        <Input
          label="Dia"
          inputMode="numeric"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          error={errors.day}
          placeholder="Opcional"
        />
      </div>

      <Input
        label="Rótulo da data (opcional)"
        maxLength={80}
        value={dateLabel}
        onChange={(e) => setDateLabel(e.target.value)}
        hint='Aparece no lugar da data, ex.: "Antes da Queda". A ordem continua pelo ano.'
      />

      <TagInput
        label="Personagens"
        value={characters}
        onChange={setCharacters}
        suggestions={characterSuggestions}
        placeholder="Nome e Enter"
      />
      <TagInput
        label="Locais"
        value={locations}
        onChange={setLocations}
        suggestions={locationSuggestions}
        placeholder="Nome e Enter"
      />

      <Textarea
        label="Descrição"
        rows={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="O que aconteceu?"
      />

      <Toggle
        label="Só do mestre (aparece borrado na lista)"
        checked={isSecret}
        onChange={setIsSecret}
      />

      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" leftIcon={<Save size={16} />} loading={isSaving}>
          Salvar evento
        </Button>
      </div>
    </form>
  );
}