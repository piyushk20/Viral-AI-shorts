import React, { useState } from 'react';
import { Idea } from '../types';
import LightbulbIcon from './icons/LightbulbIcon';
import StoryArcIcon from './icons/StoryArcIcon';
import CameraIcon from './icons/CameraIcon';
import TagIcon from './icons/TagIcon';
import StarIcon from './icons/StarIcon';
import TrashIcon from './icons/TrashIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import ScriptIcon from './icons/ScriptIcon';
import VideoIcon from './icons/VideoIcon';
import EditIcon from './icons/EditIcon';

interface IdeaCardProps {
  idea: Idea;
  index: number;
  onSave?: (idea: Idea) => void;
  onDelete?: (id: string) => void;
  onGenerateScriptRequest?: (idea: Idea) => void;
  onGenerateVideoRequest?: (idea: Idea) => void;
  onEditRequest?: (idea: Idea, index: number) => void;
  isSaved?: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index, onSave, onDelete, onGenerateScriptRequest, onGenerateVideoRequest, onEditRequest, isSaved }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Helper to format multiline text from markdown-like strings
  const formatMultiLineText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i} className="block">{line.trim()}</span>
    ));
  };

  const handleCopy = () => {
    const ideaText = [
      `Title: ${idea.title}`,
      `Duration: ${idea.duration}`,
      `Concept: ${idea.concept}`,
      `Story Arc: \n${idea.storyArc}`,
      `Visual & Audio Cues: \n${idea.visualsAndAudio}`,
      `SEO Tags: ${idea.tags.join(' ')}`
    ].join('\n\n');

    navigator.clipboard.writeText(ideaText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy idea: ', err);
      alert('Failed to copy idea to clipboard.');
    });
  };

  return (
    <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 flex flex-col space-y-5 transform transition-all duration-300 hover:bg-white/90 hover:shadow-2xl hover:shadow-fuchsia-900/10 hover:-translate-y-1">
      <header>
        <div className="flex justify-between items-start">
            <span className="bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">Idea #{index}</span>
            <span className="bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">{idea.duration}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800">{idea.title}</h3>
      </header>
      
      <div className="flex-grow space-y-4">
        <DetailSection icon={<LightbulbIcon className="h-5 w-5 text-fuchsia-500 flex-shrink-0" />} title="Concept">
            <p className="text-slate-600 text-sm italic">{idea.concept}</p>
        </DetailSection>

        <DetailSection icon={<StoryArcIcon className="h-5 w-5 text-fuchsia-500 flex-shrink-0" />} title="Story Arc">
             <div className="text-slate-600 text-sm space-y-1">{formatMultiLineText(idea.storyArc)}</div>
        </DetailSection>

        <DetailSection icon={<CameraIcon className="h-5 w-5 text-fuchsia-500 flex-shrink-0" />} title="Visual & Audio Cues">
            <div className="text-slate-600 text-sm space-y-1">{formatMultiLineText(idea.visualsAndAudio)}</div>
        </DetailSection>
        
        <DetailSection icon={<TagIcon className="h-5 w-5 text-fuchsia-500 flex-shrink-0" />} title="SEO Tags">
            <div className="flex flex-wrap gap-2 mt-1">
              {idea.tags.map((tag, i) => (
                <span key={i} className="bg-cyan-100 text-cyan-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
        </DetailSection>
      </div>

      {(onSave || onDelete || onGenerateScriptRequest || onGenerateVideoRequest) && (
        <footer className="mt-auto pt-4 border-t border-slate-200/80 flex justify-end items-center flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 hover:bg-slate-100"
            aria-label="Copy Idea"
          >
            <ClipboardIcon className={`h-5 w-5 transition-colors ${isCopied ? 'text-green-500' : 'text-slate-500'}`} />
            <span className={`transition-colors ${isCopied ? 'text-green-600' : 'text-slate-700'}`}>{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          {onEditRequest && (
            <button 
              onClick={() => onEditRequest(idea, index - 1)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 hover:bg-slate-100"
              aria-label="Edit Idea"
            >
              <EditIcon className="h-5 w-5 text-slate-500" />
              <span className="text-slate-700">Edit</span>
            </button>
          )}

          {onGenerateScriptRequest && (
            <button 
              onClick={() => onGenerateScriptRequest(idea)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 hover:bg-slate-100"
              aria-label="Create Script"
            >
              <ScriptIcon className="h-5 w-5 text-slate-500" />
              <span className="text-slate-700">Create Script</span>
            </button>
          )}
          
          {onGenerateVideoRequest && (
            <button 
              onClick={() => onGenerateVideoRequest(idea)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 hover:bg-slate-100"
              aria-label="Generate Video"
            >
              <VideoIcon className="h-5 w-5 text-slate-500" />
              <span className="text-slate-700">Generate Video</span>
            </button>
          )}

          {onSave && (
            <button 
              onClick={() => onSave(idea)} 
              disabled={isSaved}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-slate-100"
              aria-label={isSaved ? 'Idea Saved' : 'Save Idea'}
            >
              <StarIcon className={`h-5 w-5 ${isSaved ? 'text-amber-500' : 'text-slate-500'}`} />
              <span className={`${isSaved ? 'text-amber-600' : 'text-slate-700'}`}>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => idea.id && onDelete(idea.id)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-red-500 rounded-lg transition-colors duration-200 hover:bg-red-100"
              aria-label="Delete Idea"
            >
              <TrashIcon className="h-5 w-5" />
              <span>Delete</span>
            </button>
          )}
        </footer>
      )}
    </div>
  );
};

// Sub-component for sections inside the card for consistency
const DetailSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-3">
        {icon}
        <div className="flex-1">
            <h4 className="font-semibold text-slate-700 text-base">{title}</h4>
            {children}
        </div>
    </div>
);

export default IdeaCard;