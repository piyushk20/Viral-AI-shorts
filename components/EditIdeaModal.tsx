import React, { useState } from 'react';
import { Idea } from '../types';

interface EditIdeaModalProps {
  idea: Idea;
  onClose: () => void;
  onSave: (updatedIdea: Idea) => void;
}

const EditIdeaModal: React.FC<EditIdeaModalProps> = ({ idea, onClose, onSave }) => {
  const [formData, setFormData] = useState<Idea>(idea);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
          <div className='flex-1'>
            <h2 className="text-2xl font-bold text-slate-800">Edit Idea</h2>
            <p className="text-sm text-slate-500 truncate">Refine the AI's suggestion</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none p-2">&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow contents">
          <main className="p-6 overflow-y-auto flex-grow space-y-4 bg-white">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-1">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 text-base text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
            <div>
              <label htmlFor="concept" className="block text-sm font-medium text-slate-600 mb-1">Concept</label>
              <textarea
                id="concept"
                name="concept"
                value={formData.concept}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 text-base text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
            <div>
              <label htmlFor="storyArc" className="block text-sm font-medium text-slate-600 mb-1">Story Arc</label>
              <textarea
                id="storyArc"
                name="storyArc"
                value={formData.storyArc}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 text-base text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
            <div>
              <label htmlFor="visualsAndAudio" className="block text-sm font-medium text-slate-600 mb-1">Visual & Audio Cues</label>
              <textarea
                id="visualsAndAudio"
                name="visualsAndAudio"
                value={formData.visualsAndAudio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 text-base text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
          </main>
          
          <footer className="p-6 bg-slate-100/70 border-t border-slate-200 flex justify-end flex-shrink-0">
            <button
              type="submit"
              className="px-6 py-2 bg-fuchsia-600 text-white font-bold rounded-lg hover:bg-fuchsia-500"
            >
              Save Changes
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default EditIdeaModal;