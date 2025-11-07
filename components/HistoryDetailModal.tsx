
import React, { useState } from 'react';
import { ScriptHistoryItem, SeoContent } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import SeoIcon from './icons/SeoIcon';

interface HistoryDetailModalProps {
  item: ScriptHistoryItem | null;
  onClose: () => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ item, onClose }) => {
  const [copiedStatus, setCopiedStatus] = useState<'json' | 'seoTitle' | 'seoDesc' | 'seoTags' | null>(null);

  if (!item) return null;

  const handleCopy = (textToCopy: string | string[], type: 'json' | 'seoTitle' | 'seoDesc' | 'seoTags') => {
    if (!textToCopy) return;
    const text = Array.isArray(textToCopy) ? textToCopy.join(', ') : textToCopy;
    navigator.clipboard.writeText(text).then(() => {
        setCopiedStatus(type);
        setTimeout(() => setCopiedStatus(null), 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard.');
    });
  };

  const renderJson = (jsonString: string) => (
    <pre className="whitespace-pre-wrap text-sm text-slate-200 bg-slate-800 p-4 rounded-lg overflow-x-auto max-h-[25vh]">
      {JSON.stringify(JSON.parse(jsonString), null, 2)}
    </pre>
  );

  const SeoResultDisplay = ({ content, onCopy }: { content: SeoContent, onCopy: (text: string | string[], type: 'seoTitle' | 'seoDesc' | 'seoTags') => void }) => (
    <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
            <SeoIcon className="h-8 w-8 text-sky-500"/>
            <h4 className="text-xl font-bold text-sky-800">SEO & Marketing Kit</h4>
        </div>

        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-slate-700">Generated Title</label>
                    <button onClick={() => onCopy(content.title, 'seoTitle')} className="text-xs font-medium text-slate-500 hover:text-fuchsia-600 flex items-center gap-1">
                        <ClipboardIcon className={`h-4 w-4 ${copiedStatus === 'seoTitle' ? 'text-green-500' : ''}`} />
                        {copiedStatus === 'seoTitle' ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <p className="text-base font-semibold bg-white p-2 border rounded-md text-slate-800">{content.title}</p>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-slate-700">Generated Description</label>
                     <button onClick={() => onCopy(content.description, 'seoDesc')} className="text-xs font-medium text-slate-500 hover:text-fuchsia-600 flex items-center gap-1">
                        <ClipboardIcon className={`h-4 w-4 ${copiedStatus === 'seoDesc' ? 'text-green-500' : ''}`} />
                        {copiedStatus === 'seoDesc' ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <p className="text-sm bg-white p-2 border rounded-md text-slate-600 whitespace-pre-wrap">{content.description}</p>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-slate-700">Hashtags & Keywords</label>
                    <button onClick={() => onCopy(content.tags, 'seoTags')} className="text-xs font-medium text-slate-500 hover:text-fuchsia-600 flex items-center gap-1">
                        <ClipboardIcon className={`h-4 w-4 ${copiedStatus === 'seoTags' ? 'text-green-500' : ''}`} />
                        {copiedStatus === 'seoTags' ? 'Copied!' : 'Copy All'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 bg-white p-2 border rounded-md">
                    {content.tags.map(tag => <span key={tag} className="bg-cyan-100 text-cyan-800 text-xs font-medium px-2 py-1 rounded-full">{tag}</span>)}
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Script History Details</h2>
            <p className="text-sm text-slate-500 truncate">For idea: "{item.idea.title}"</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none p-2">&times;</button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-slate-800">Final Production JSON</h4>
              <button
                  onClick={() => handleCopy(item.jsonScript, 'json')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 hover:bg-slate-100"
                  aria-label="Copy JSON"
              >
                  <ClipboardIcon className={`h-5 w-5 transition-colors ${copiedStatus === 'json' ? 'text-green-500' : 'text-slate-500'}`} />
                  <span className={`transition-colors ${copiedStatus === 'json' ? 'text-green-600' : 'text-slate-700'}`}>{copiedStatus === 'json' ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            {renderJson(item.jsonScript)}
          </div>
          <SeoResultDisplay content={item.seoContent} onCopy={handleCopy} />
        </main>
      </div>
    </div>
  );
};

export default HistoryDetailModal;
