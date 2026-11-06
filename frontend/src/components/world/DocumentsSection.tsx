/**
 * Bloco de documentos .md de uma seção do mundo (História, e depois os blocos
 * "Documentos .md" de Personagens, Mapas e Raças e Criaturas).
 * - Grade de cards (6 e "Ver todos"), "+ Adicionar documento" e "Importar .md" (lê o arquivo
 *   como texto; um "# Título" no início vira o título).
 * - Clicar abre uma gaveta com Ler / Editar, exportar .md e excluir (com "Desfazer").
 *   O estado da gaveta vai na URL (?documento=ID), então links de atividade e busca abrem direto.
 * - Editar salva sozinho (useAutosave). Modo convidado / mundo alheio: só leitura.
 */
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, FileText, Plus, Trash2, Upload, type LucideIcon } from 'lucide-react';
import { documentService, type DocumentSection, type WorldDocument } from '../../api/documents';
import { useAutosave, type SaveStatus } from '../../hooks/useAutosave';
import {
  MAX_IMPORT_BYTES,
  downloadMarkdown,
  excerptFromMarkdown,
  splitMarkdown,
  stripExtension,
} from '../../lib/markdownFile';
import { formatRelative } from '../../lib/time';
import { cn } from '../../lib/cn';
import { Button, Card, Drawer, EmptyState, Input, Skeleton, TabPanel, Tabs, toast } from '../ui';
import { MarkdownEditor } from '../markdown/MarkdownEditor';
import { MarkdownView } from '../markdown/MarkdownView';
import { SectionHeader } from './SectionHeader';

const VISIBLE = 6;

const MODE_ITEMS = [
  { value: 'ler', label: 'Ler' },
  { value: 'editar', label: 'Editar' },
];

function SaveLabel({ status }: { status: SaveStatus }) {
  const text =
    status === 'saving' ? 'Salvando…' : status === 'saved' ? 'Salvo agora' : status === 'error' ? 'Erro ao salvar' : '';
  return (
    <span role="status" className={cn('text-xs', status === 'error' ? 'text-rpg-danger' : 'text-rpg-subtle')}>
      {text}
    </span>
  );
}

interface DocumentEditorProps {
  doc: WorldDocument;
  onUpdated: (doc: WorldDocument) => void;
}

function DocumentEditor({ doc, onUpdated }: DocumentEditorProps) {
  const [draft, setDraft] = useState({ title: doc.title, content: doc.content_markdown });

  const { status } = useAutosave(draft, async (value) => {
    onUpdated(
      await documentService.update(doc.id, {
        title: value.title.trim() || 'Sem título',
        content_markdown: value.content,
      }),
    );
  });

  return (
    <div className="flex h-full min-h-[28rem] flex-col gap-4">
      <Input
        label="Título"
        maxLength={160}
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      />
      <div className="min-h-0 flex-1">
        <MarkdownEditor
          value={draft.content}
          onChange={(content) => setDraft({ ...draft, content })}
          ariaLabel="Conteúdo do documento em Markdown"
        />
      </div>
      <div className="flex justify-end">
        <SaveLabel status={status} />
      </div>
    </div>
  );
}

interface DocumentPanelProps {
  doc: WorldDocument;
  canEdit: boolean;
  startInEdit: boolean;
  onUpdated: (doc: WorldDocument) => void;
}

function DocumentPanel({ doc, canEdit, startInEdit, onUpdated }: DocumentPanelProps) {
  const [mode, setMode] = useState(startInEdit && canEdit ? 'editar' : 'ler');
  const current = canEdit ? mode : 'ler';

  return (
    <div className="flex h-full flex-col gap-4">
      {canEdit && (
        <Tabs idPrefix="doc" ariaLabel="Modo do documento" items={MODE_ITEMS} value={mode} onChange={setMode} />
      )}
      <TabPanel idPrefix="doc" value="ler" current={current}>
        <h3 className="mb-1 text-2xl font-bold text-white">{doc.title}</h3>
        <p className="mb-4 text-xs text-rpg-subtle">Atualizado {formatRelative(doc.updated_at)}</p>
        {doc.content_markdown ? (
          <MarkdownView content={doc.content_markdown} />
        ) : (
          <p className="italic text-rpg-subtle">Este documento está vazio…</p>
        )}
      </TabPanel>
      <TabPanel idPrefix="doc" value="editar" current={current} className="min-h-0 flex-1">
        <DocumentEditor doc={doc} onUpdated={onUpdated} />
      </TabPanel>
    </div>
  );
}

interface DocumentsSectionProps {
  worldId: number;
  section: DocumentSection;
  title: string;
  headingId: string;
  Icon?: LucideIcon;
  canEdit: boolean;
  emptyDescription?: string;
}

export default function DocumentsSection({
  worldId,
  section,
  title,
  headingId,
  Icon = FileText,
  canEdit,
  emptyDescription = 'Escreva em Markdown ou importe arquivos .md.',
}: DocumentsSectionProps) {
  const [docs, setDocs] = useState<WorldDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [editOnOpen, setEditOnOpen] = useState<number | null>(null);
  const [lastDoc, setLastDoc] = useState<WorldDocument | null>(null);
  const [params, setParams] = useSearchParams();
  const fileInput = useRef<HTMLInputElement>(null);

  const selectedId = Number(params.get('documento')) || null;
  const selected = docs.find((doc) => doc.id === selectedId) ?? null;
  const shownDoc = selected ?? lastDoc; // mantém o conteúdo durante a animação de fechar

  useEffect(() => {
    if (selected) setLastDoc(selected);
  }, [selected]);

  useEffect(() => {
    setIsLoading(true);
    documentService
      .list(worldId, section)
      .then(setDocs)
      .catch(() => toast.error('Não foi possível carregar os documentos. Tente de novo.'))
      .finally(() => setIsLoading(false));
  }, [worldId, section]);

  const openDoc = (id: number) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('documento', String(id));
      return next;
    });

  const closeDoc = () => {
    setEditOnOpen(null);
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('documento');
        return next;
      },
      { replace: true },
    );
  };

  const replaceDoc = (updated: WorldDocument) =>
    setDocs((previous) => previous.map((doc) => (doc.id === updated.id ? updated : doc)));

  const createDoc = async () => {
    try {
      const created = await documentService.create({ world: worldId, section, title: 'Novo documento' });
      setDocs((previous) => [...previous, created]);
      setExpanded(true);
      setEditOnOpen(created.id);
      openDoc(created.id);
    } catch {
      toast.error('Não foi possível criar o documento. Tente de novo.');
    }
  };

  const importFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files ?? []);
    event.target.value = '';
    let imported = 0;
    for (const file of files) {
      if (file.size > MAX_IMPORT_BYTES) {
        toast.error(`"${file.name}" tem mais de 500 KB e não foi importado.`);
        continue;
      }
      try {
        const { title, content } = splitMarkdown(await file.text(), stripExtension(file.name));
        const created = await documentService.create({
          world: worldId,
          section,
          title,
          content_markdown: content,
        });
        setDocs((previous) => [...previous, created]);
        imported += 1;
      } catch {
        toast.error(`Não foi possível importar "${file.name}".`);
      }
    }
    if (imported > 0) {
      setExpanded(true);
      toast.success(imported === 1 ? 'Documento importado' : `${imported} documentos importados`);
    }
  };

  const deleteDoc = async (doc: WorldDocument) => {
    try {
      await documentService.remove(doc.id);
    } catch {
      toast.error('Não foi possível excluir o documento. Tente de novo.');
      return;
    }
    setDocs((previous) => previous.filter((d) => d.id !== doc.id));
    closeDoc();
    toast('Documento excluído', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          try {
            const restored = await documentService.create({
              world: worldId,
              section,
              title: doc.title,
              content_markdown: doc.content_markdown,
            });
            setDocs((previous) => [...previous, restored]);
          } catch {
            toast.error('Não foi possível desfazer.');
          }
        },
      },
    });
  };

  const visibleDocs = expanded ? docs : docs.slice(0, VISIBLE);

  return (
    <>
      <SectionHeader
        id={headingId}
        title={title}
        Icon={Icon}
        actions={
          canEdit && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                multiple
                className="sr-only"
                tabIndex={-1}
                aria-label="Arquivos .md para importar"
                onChange={importFiles}
              />
              <Button variant="secondary" size="sm" leftIcon={<Upload size={14} />} onClick={() => fileInput.current?.click()}>
                Importar .md
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={createDoc}>
                Adicionar documento
              </Button>
            </>
          )
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} aria-hidden="true" />}
          title="Nenhum documento ainda"
          description={emptyDescription}
          action={
            canEdit && (
              <Button variant="outline" leftIcon={<Plus size={16} />} onClick={createDoc}>
                Adicionar documento
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleDocs.map((doc) => (
              <Card
                key={doc.id}
                interactive
                className="flex h-full flex-col gap-2 has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-rpg-secondary"
              >
                <h3 className="font-bold text-white">
                  <button
                    type="button"
                    onClick={() => openDoc(doc.id)}
                    className="text-left after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {doc.title}
                  </button>
                </h3>
                <p className="line-clamp-3 text-sm text-rpg-muted">
                  {excerptFromMarkdown(doc.content_markdown) || 'Documento vazio.'}
                </p>
                <span className="mt-auto pt-2 text-xs text-rpg-subtle">
                  Atualizado {formatRelative(doc.updated_at)}
                </span>
              </Card>
            ))}
          </div>
          {docs.length > VISIBLE && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)}>
                {expanded ? 'Mostrar menos' : `Ver todos (${docs.length})`}
              </Button>
            </div>
          )}
        </>
      )}

      <Drawer
        open={selected !== null}
        onClose={closeDoc}
        width="lg"
        title={shownDoc?.title ?? ''}
        headerActions={
          shownDoc && (
            <>
              <button
                type="button"
                onClick={() => downloadMarkdown(shownDoc.title, shownDoc.content_markdown)}
                aria-label="Exportar como .md"
                title="Exportar como .md"
                className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-white"
              >
                <Download size={18} aria-hidden="true" />
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => deleteDoc(shownDoc)}
                  aria-label="Excluir documento"
                  title="Excluir documento"
                  className="rounded-md p-1.5 text-rpg-muted transition-colors hover:text-rpg-danger"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              )}
            </>
          )
        }
      >
        {shownDoc && (
          <DocumentPanel
            key={shownDoc.id}
            doc={shownDoc}
            canEdit={canEdit}
            startInEdit={editOnOpen === shownDoc.id}
            onUpdated={replaceDoc}
          />
        )}
      </Drawer>
    </>
  );
}