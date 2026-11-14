/**
 * Função do Arquivo: Pecinhas visuais das gavetas e dos formulários de raças e criaturas.
 *
 * O que há aqui:
 * - FIELD: classes dos campos editáveis inline (o tamanho do texto vem do contêiner).
 * - Section / Field: título de seção e linha "rótulo + valor" das gavetas.
 * - FormSection: título de seção dos modais de criar.
 */

import type { ReactNode } from 'react';

export const FIELD = 'block px-2 py-1 text-gray-200';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 border-b border-gray-800 pb-2 text-base font-bold text-white">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-start gap-x-3">
      <span className="pt-1.5 text-sm text-rpg-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="border-b border-gray-800 pb-2 text-sm font-bold text-white">{title}</h3>
      {children}
    </section>
  );
}