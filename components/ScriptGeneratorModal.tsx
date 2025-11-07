
import React, { useState, useMemo, useEffect } from 'react';
import { Idea, Duration, SeoContent } from '../types';
import { DURATIONS, LANGUAGES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import ClipboardIcon from './icons/ClipboardIcon';
import SeoIcon from './icons/SeoIcon';

interface ScriptGeneratorModalProps {
  idea: Idea | null;
  onClose: () => void;
  onGenerate: (sceneDuration: string, noNarration: boolean, language: string, suggestion?: string, selectedNarrationStyle?: string) => void;
  onFinalize: (sceneDuration: string, numberOfScenes?: number) => void;
  isLoading: boolean;
  script: string | null;
  finalJsonScript: string | null;
  seoContent: SeoContent | null;
}

const ScriptGeneratorModal: React.FC<ScriptGeneratorModalProps> = ({
  idea,
  onClose,
  onGenerate,
  onFinalize,
  isLoading,
  script,
  finalJsonScript,
  seoContent
}) => {
  const [duration, setDuration] = useState<Duration>(idea?.duration || Duration.Shorts30);
  const [suggestion, setSuggestion] = useState('');
  const [noNarration, setNoNarration] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<'script' | 'json' | 'seoTitle' | 'seoDesc' | 'seoTags' | null>(null);
  const [jsonSceneDuration, setJsonSceneDuration] = useState('15');
  const [selectedNarrationStyle, setSelectedNarrationStyle] = useState<string | null>(null);
  const [numberOfScenes, setNumberOfScenes] = useState('');
  const [language, setLanguage] = useState('English');


  const { narrationSuggestions, scriptTable } = useMemo(() => {
    if (!script) return { narrationSuggestions: null, scriptTable: null };
    const parts = script.split(/\n---\n/);
    if (parts.length > 1 && parts[0].toLowerCase().includes('suggested narration styles')) {
        return { narrationSuggestions: parts[0], scriptTable: parts.slice(1).join('\n---\n').trim() };
    }
    return { narrationSuggestions: null, scriptTable: script };
  }, [script]);

  const parsedSuggestions = useMemo(() => {
    if (!narrationSuggestions) return [];
    
    const suggestionLines = narrationSuggestions.trim().split('\n').filter(line => line.match(/^\d+\.\s*\*\*/));
    
    return suggestionLines.map(line => {
        const match = line.match(/^\d+\.\s*\*\*(.*?):\*\*(.*?)(?:\s*\*(.*)\*)?$/);
        if (match) {
            const name = match[1]?.trim() || 'Unnamed Style';
            const description = match[2]?.trim() || '';
            const justification = match[3]?.trim() || '';
            return { name, description, justification };
        }
        return null;
    }).filter((s): s is { name: string; description: string; justification: string } => s !== null);
  }, [narrationSuggestions]);

  useEffect(() => {
    if (parsedSuggestions.length > 0 && !selectedNarrationStyle) {
        setSelectedNarrationStyle(parsedSuggestions[0].name);
    }
  }, [parsedSuggestions, selectedNarrationStyle]);

  useEffect(() => {
    if (script) {
        setSelectedNarrationStyle(null);
    }
  }, [script]);


  if (!idea) return null;

  const handleCopy = (textToCopy: string | null | string[], type: 'script' | 'json' | 'seoTitle' | 'seoDesc' | 'seoTags') => {
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

  const renderScriptTable = (markdown: string) => {
    try {
        const lines = markdown.trim().split('\n');
        const headerLine = lines.find(line => line.includes('|') && line.toLowerCase().includes('timestamp'));
        if (!headerLine) return <pre className="whitespace-pre-wrap text-sm text-slate-200 bg-slate-800 p-4 rounded-lg">{markdown}</pre>;

        const headerIndex = lines.indexOf(headerLine);
        const header = headerLine.split('|').map(h => h.trim()).filter(Boolean);
        const dataRows = lines.slice(headerIndex + 2);
        const rows = dataRows.map(line => {
            const cells = line.split('|').map(c => c.trim());
            // Remove first and last empty cells if they exist from table formatting `| cell | cell |`
            if (cells[0] === '' && cells[cells.length - 1] === '') {
                return cells.slice(1, -1);
            }
            return cells;
        }).filter(row => row.length > 1);
    
        return (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                        <tr>
                            {header.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                {row.map((cell, j) => (
                                    <td key={j} className="px-4 py-3 align-top">
                                        {cell.split('\n').map((line, k) => <p key={k}>{line}</p>)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    } catch (e) {
        console.error("Failed to parse script markdown:", e);
        return <pre className="whitespace-pre-wrap text-sm text-slate-200 bg-slate-800 p-4 rounded-lg">{markdown}</pre>;
    }
  };
  
  const renderFinalJson = (jsonString: string) => {
    try {
      const scenes = JSON.parse(jsonString);
      if (Array.isArray(scenes)) {
        return (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto bg-slate-900 p-2 rounded-lg border border-slate-700">
            {scenes.map((scene, index) => (
              <details key={index} className="bg-slate-800 rounded-md" open={index === 0}>
                <summary className="text-md font-semibold text-fuchsia-400 px-4 py-2 rounded-t-md cursor-pointer hover:bg-slate-700">
                  Scene {scene.scene} ({scene.scene_timestamp})
                </summary>
                <pre className="whitespace-pre-wrap text-sm text-slate-200 p-4 pt-2 overflow-x-auto">
                  {JSON.stringify(scene, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        );
      }
    } catch (e) {
      // Fallback for invalid JSON or non-array structure
    }
    // Fallback view for raw string or malformed JSON
    return (
      <pre className="whitespace-pre-wrap text-sm text-slate-200 bg-slate-800 p-4 rounded-lg overflow-x-auto max-h-[40vh]">
        {jsonString}
      </pre>
    );
  };

  const SeoResultDisplay = ({ content, onCopy }: { content: SeoContent, onCopy: (text: string | string[], type: 'seoTitle' | 'seoDesc' | 'seoTags') => void }) => (
    <div className="mt-6 p-4 bg-sky-50 border border-sky-200 rounded-lg animate-fade-in">
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
            <h2 className="text-2xl font-bold text-slate-800">Script Generator</h2>
            <p className="text-sm text-slate-500 truncate">For idea: "{idea.title}"</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none p-2">&times;</button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow space-y-6">
          {!script && !isLoading && (
            <div className="text-center bg-slate-50 p-8 rounded-lg border border-dashed border-slate-300">
              <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Write a Script?</h3>
              <p className="text-slate-500 mb-4">Select a language and duration, then let the AI create a production-ready script.</p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 text-base text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    aria-label="Select script language"
                >
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
                <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as Duration)}
                    className="px-4 py-2 text-base text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    aria-label="Select script duration"
                >
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={() => onGenerate(duration, noNarration, language)} className="px-6 py-2 bg-fuchsia-600 text-white font-bold rounded-lg hover:bg-fuchsia-500">
                    Generate Script
                </button>
              </div>
              <div className="flex justify-center items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  id="no-narration-initial"
                  checked={noNarration}
                  onChange={(e) => setNoNarration(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500"
                />
                <label htmlFor="no-narration-initial" className="text-sm text-slate-600">
                  No Narration Required
                </label>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <LoadingSpinner />
            </div>
          )}
          
          {script && (
            <>
              {parsedSuggestions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 animate-fade-in">
                    <h4 className="text-lg font-bold text-amber-800">Select a Narration Style</h4>
                    <div className="mt-2 space-y-3">
                        {parsedSuggestions.map(({ name, description, justification }) => (
                            <div key={name} className="flex items-start">
                                <input
                                    type="radio"
                                    id={`style-${name}`}
                                    name="narration-style"
                                    value={name}
                                    checked={selectedNarrationStyle === name}
                                    onChange={() => setSelectedNarrationStyle(name)}
                                    className="h-4 w-4 mt-1 text-fuchsia-600 border-gray-300 focus:ring-fuchsia-500"
                                />
                                <label htmlFor={`style-${name}`} className="ml-3 text-sm">
                                    <span className="font-bold text-slate-800 block">{name}:</span>
                                    <span className="text-slate-600 block">{description}</span>
                                    {justification && <em className="text-slate-500 text-xs block mt-1">{justification}</em>}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
              )}
              
              {scriptTable && (
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-slate-800">Generated Script</h3>
                        <button
                            onClick={() => handleCopy(scriptTable, 'script')}
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 hover:bg-slate-100"
                            aria-label="Copy Script"
                        >
                            <ClipboardIcon className={`h-5 w-5 transition-colors ${copiedStatus === 'script' ? 'text-green-500' : 'text-slate-500'}`} />
                            <span className={`transition-colors ${copiedStatus === 'script' ? 'text-green-600' : 'text-slate-700'}`}>{copiedStatus === 'script' ? 'Copied!' : 'Copy Script'}</span>
                        </button>
                    </div>
                  {renderScriptTable(scriptTable)}
                </div>
              )}
            </>
          )}
          
          {script && !finalJsonScript && (
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <p className="text-sm text-slate-600 font-semibold">Make some changes?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="language-select-regen" className="block text-xs font-medium text-slate-500 mb-1">Language</label>
                    <select
                        id="language-select-regen"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                        aria-label="Select script language for regeneration"
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="no-narration-regen"
                        checked={noNarration}
                        onChange={(e) => setNoNarration(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500"
                      />
                      <label htmlFor="no-narration-regen" className="text-sm text-slate-600">
                        No Narration Required
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <input 
                        type="text" 
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="e.g., Make the ending more dramatic"
                        className="flex-grow px-4 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                    <button 
                        onClick={() => onGenerate(duration, noNarration, language, suggestion, selectedNarrationStyle ?? undefined)} 
                        disabled={isLoading || !suggestion}
                        className="px-4 py-2 text-sm bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 disabled:bg-slate-400"
                    >
                        Regenerate with Suggestion
                    </button>
                </div>
             </div>
          )}

          {finalJsonScript && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-slate-800">Final Production JSON</h4>
                <button
                    onClick={() => handleCopy(finalJsonScript, 'json')}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 hover:bg-slate-100"
                    aria-label="Copy JSON"
                >
                    <ClipboardIcon className={`h-5 w-5 transition-colors ${copiedStatus === 'json' ? 'text-green-500' : 'text-slate-500'}`} />
                    <span className={`transition-colors ${copiedStatus === 'json' ? 'text-green-600' : 'text-slate-700'}`}>{copiedStatus === 'json' ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
              {renderFinalJson(finalJsonScript)}
            </div>
          )}

          {seoContent && <SeoResultDisplay content={seoContent} onCopy={handleCopy} />}

        </main>

        {script && !finalJsonScript && (
            <footer className="p-6 bg-slate-100/70 border-t border-slate-200 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="scene-count" className="text-sm font-medium text-slate-600 whitespace-nowrap">Number of Scenes:</label>
                        <input 
                            type="number"
                            id="scene-count"
                            value={numberOfScenes}
                            onChange={(e) => setNumberOfScenes(e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-slate-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
                            min="1"
                            placeholder="Auto"
                            aria-label="Number of JSON scenes to create"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="scene-duration" className="text-sm font-medium text-slate-600 whitespace-nowrap">Max Scene Duration (s):</label>
                        <input 
                            type="number"
                            id="scene-duration"
                            value={jsonSceneDuration}
                            onChange={(e) => setJsonSceneDuration(e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-slate-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
                            min="5"
                            max="60"
                            aria-label="Maximum JSON scene duration in seconds"
                        />
                    </div>
                </div>
                <button
                    onClick={() => onFinalize(jsonSceneDuration, numberOfScenes ? parseInt(numberOfScenes, 10) : undefined)}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-500 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    ✅ Finalize Script as JSON
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default ScriptGeneratorModal;
