/**
 * O que há aqui:
 * - Modal expansivo para Leitura e Edição de anotações em Markdown.
 * - Integração com react-markdown para renderização real do texto formatado.
 * - Gerenciamento de abas (Ler / Editar). Aba padrão ao abrir é sempre 'ler'.
 * 
 * Função do arquivo: Servir como o editor de texto rápido do Mestre.
 * Garante uma experiência fluida para rascunhar lore e ideias sem sair da tela atual.
 */

import { useState, useEffect } from 'react';
import { X, Save, Edit3, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface NoteData {
  id?: number;
  title: string;
  content: string;
}

interface Props {
  isOpen: boolean;
  initialData: NoteData | null;
  onClose: () => void;
  onSave: (note: NoteData) => void;
}

export default function NoteModal({ isOpen, initialData, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'ler' | 'editar'>('ler');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setContent(initialData?.content || '');
      setActiveTab(initialData?.id ? 'ler' : 'editar');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert("O título da anotação é obrigatório.");
      return;
    }
    onSave({ id: initialData?.id, title, content });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-rpg-bg border border-gray-700 w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-center justify-between p-4 bg-rpg-card border-b border-gray-800">
          <div className="w-1/2">
            {activeTab === 'editar' ? (
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                maxLength={60}
                placeholder="Título da Nota (Obrigatório)..." 
                className="w-full bg-rpg-bg text-xl text-white font-bold border border-gray-700 rounded-md px-3 py-1.5 focus:border-rpg-primary focus:outline-none"
              />
            ) : (
              <h2 className="text-xl font-bold text-white px-3 py-1.5">{title || 'Nota sem título'}</h2>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
              <button 
                onClick={() => setActiveTab('ler')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'ler' ? 'bg-rpg-card text-rpg-secondary shadow-sm' : 'text-gray-500 hover:text-white'}`}
              >
                <Eye size={16} /> Ler
              </button>
              <button 
                onClick={() => setActiveTab('editar')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'editar' ? 'bg-rpg-card text-rpg-primary shadow-sm' : 'text-gray-500 hover:text-white'}`}
              >
                <Edit3 size={16} /> Editar
              </button>
            </div>
            
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* CORPO DO MODAL */}
        <div className="flex-1 overflow-hidden p-6 bg-rpg-bg">
          {activeTab === 'editar' ? (
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Escreva em formato Markdown (ex: **negrito**, # Título, * lista)..."
              className="w-full h-full bg-rpg-card/50 text-gray-300 font-mono text-sm p-4 border border-gray-800 rounded-lg resize-none focus:outline-none focus:border-gray-600 leading-relaxed"
            />
          ) : (
            <div className="w-full h-full overflow-y-auto text-gray-300 prose prose-invert prose-p:leading-relaxed prose-headings:text-white prose-a:text-rpg-primary max-w-none">
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <span className="text-gray-600 italic">Esta anotação está vazia...</span>
              )}
            </div>
          )}
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="p-4 border-t border-gray-800 bg-rpg-card flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-black bg-rpg-primary hover:bg-[#c5cc04] transition-colors">
            <Save size={18} /> Salvar Anotação
          </button>
        </div>
      </div>
    </div>
  );
}