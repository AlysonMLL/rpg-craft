/**
 * Seção "Resumo / Introdução" do mundo: leitura em Markdown (largura de leitura ~70ch) e, para o
 * dono, edição com barra de formatação. Salvar grava `introduction_markdown` no mundo.
 */
import { useState } from 'react';
import { BookOpen, Pencil, Save } from 'lucide-react';
import { authService } from '../../api/auth';
import { worldService } from '../../api/worlds';
import { useWorldContext } from '../../hooks/useWorld';
import { MarkdownEditor } from '../markdown/MarkdownEditor';
import { MarkdownView } from '../markdown/MarkdownView';
import { Button, EmptyState, toast } from '../ui';
import { SectionHeader } from './SectionHeader';

export default function SummarySection() {
  const { world, updateWorld } = useWorldContext();
  const canEdit = world.is_owner && !authService.isGuest();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    setDraft(world.introduction_markdown ?? '');
    setEditing(true);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      updateWorld(await worldService.updateWorld(world.id, { introduction_markdown: draft }));
      toast.success('Resumo salvo');
      setEditing(false);
    } catch {
      toast.error('Não foi possível salvar o resumo. Tente de novo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SectionHeader
        id="resumo-titulo"
        title="Resumo / Introdução"
        Icon={BookOpen}
        actions={
          canEdit &&
          !editing && (
            <Button variant="outline" size="sm" leftIcon={<Pencil size={14} />} onClick={startEditing}>
              Editar
            </Button>
          )
        }
      />

      {editing ? (
        <div className="space-y-3">
          <div className="h-96">
            <MarkdownEditor
              value={draft}
              onChange={setDraft}
              ariaLabel="Resumo do mundo em Markdown"
              placeholder="Apresente o mundo: a premissa, o tom e o ponto de partida da campanha…"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button leftIcon={<Save size={16} />} onClick={save} loading={isSaving}>
              Salvar resumo
            </Button>
          </div>
        </div>
      ) : world.introduction_markdown ? (
        <MarkdownView content={world.introduction_markdown} className="max-w-[70ch]" />
      ) : (
        <EmptyState
          title="Sem introdução ainda"
          description="O resumo do mundo e a premissa da campanha aparecerão aqui."
          action={
            canEdit && (
              <Button variant="outline" leftIcon={<Pencil size={16} />} onClick={startEditing}>
                Escrever resumo
              </Button>
            )
          }
        />
      )}
    </>
  );
}