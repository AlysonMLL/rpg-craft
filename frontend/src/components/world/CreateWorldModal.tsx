/**
 * O que há aqui:
 * - Modal interativo para criação de um novo Mundo/Campanha.
 * - Busca automática de Tags via useEffect assim que o modal abre.
 * - Seleção múltipla de tags (array de IDs) através de botões com estilo condicional.
 * 
 * Função do arquivo: Interface rápida de inserção de dados. 
 * Permite ao usuário criar instâncias no banco de dados sem sair do Dashboard.
 */

import { useState, useEffect } from 'react';
import { X, Sparkles, Tag as TagIcon } from 'lucide-react';
import { worldService, type WorldCreateData, type Tag } from '../../api/worlds';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateWorldModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<WorldCreateData>({ name: '', synopsis: '', is_demo: false, tags: [] });
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      worldService.getAllTags().then(setAvailableTags).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tagId: number) => {
    setFormData(prev => {
      const isSelected = prev.tags.includes(tagId);
      return {
        ...prev,
        tags: isSelected 
          ? prev.tags.filter(id => id !== tagId) 
          : [...prev.tags, tagId]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await worldService.createWorld(formData);
      onSuccess();
      setFormData({ name: '', synopsis: '', is_demo: false, tags: [] }); // Reseta o form
      onClose();
    } catch (error) {
      console.error("Erro ao criar mundo:", error);
      alert("Falha ao forjar o mundo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-rpg-card border border-gray-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-rpg-primary" size={20} /> Forjar Novo Mundo
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Inputs de Nome e Sinopse iguais aos anteriores... */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">Nome do Mundo / Campanha *</label>
            <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-rpg-bg text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:border-rpg-primary focus:outline-none" />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">Sinopse Breve *</label>
            <textarea required rows={2} value={formData.synopsis} onChange={(e) => setFormData({...formData, synopsis: e.target.value})} className="w-full bg-rpg-bg text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:border-rpg-primary focus:outline-none resize-none" />
          </div>

          {/* Seleção de Tags */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2 flex items-center gap-1">
              <TagIcon size={14} /> Gêneros e Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const isSelected = formData.tags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 text-xs font-bold rounded border transition-colors ${
                      isSelected 
                        ? 'bg-rpg-secondary/20 text-rpg-secondary border-rpg-secondary' 
                        : 'bg-rpg-bg text-gray-400 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-colors">
            <input type="checkbox" checked={formData.is_demo} onChange={(e) => setFormData({...formData, is_demo: e.target.checked})} className="w-4 h-4 accent-rpg-primary" />
            <div>
              <p className="text-white text-sm font-medium">Mundo Público (Demo)</p>
              <p className="text-gray-500 text-xs">Visitantes poderão visualizar este mundo sem fazer login.</p>
            </div>
          </label>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors">Cancelar</button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-rpg-primary text-black font-bold py-2.5 rounded-lg hover:bg-[#c5cc04] transition-colors disabled:opacity-50">
              {isLoading ? 'Criando...' : 'Criar Mundo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}