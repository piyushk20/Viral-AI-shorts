import React, { useState, useEffect, useMemo } from 'react';
import { Idea } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { VISUAL_STYLES, MUSIC_MOODS, GENRE_SUGGESTIONS } from '../constants';

interface VideoGeneratorModalProps {
  idea: Idea | null;
  onClose: () => void;
  onGenerate: (visualStyle: string, musicMood: string) => void;
  isLoading: boolean;
  videoUrl: string | null;
  error: string | null;
}

const loadingMessages = [
  "Warming up the virtual cameras...",
  "Analyzing visual cues from the concept...",
  "Storyboarding the first scene...",
  "Assembling digital assets...",
  "Rendering high-quality frames...",
  "Adding special effects and audio...",
  "Finalizing the video. This can take a few minutes...",
];

const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({
  idea,
  onClose,
  onGenerate,
  isLoading,
  videoUrl,
  error,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0]);
  const [musicMood, setMusicMood] = useState(MUSIC_MOODS[0]);
  
  const suggestedOptions = useMemo(() => {
    if (!idea?.genre) return { styles: [], moods: [] };
    return GENRE_SUGGESTIONS[idea.genre] || { styles: [], moods: [] };
  }, [idea]);

  const partitionedVisualStyles = useMemo(() => {
    const suggested = suggestedOptions.styles.filter(style => VISUAL_STYLES.includes(style));
    const other = VISUAL_STYLES.filter(style => !suggested.includes(style));
    return { suggested, other };
  }, [suggestedOptions.styles]);
  
  const partitionedMusicMoods = useMemo(() => {
    const suggested = suggestedOptions.moods.filter(mood => MUSIC_MOODS.includes(mood));
    const other = MUSIC_MOODS.filter(mood => !suggested.includes(mood));
    return { suggested, other };
  }, [suggestedOptions.moods]);
  
  useEffect(() => {
    // Set default selection to the first suggested option, or the first overall if no suggestions exist.
    if (partitionedVisualStyles.suggested.length > 0) {
      setVisualStyle(partitionedVisualStyles.suggested[0]);
    } else if (partitionedVisualStyles.other.length > 0) {
      setVisualStyle(partitionedVisualStyles.other[0]);
    }
    if (partitionedMusicMoods.suggested.length > 0) {
      setMusicMood(partitionedMusicMoods.suggested[0]);
    } else if (partitionedMusicMoods.other.length > 0) {
      setMusicMood(partitionedMusicMoods.other[0]);
    }
  }, [partitionedVisualStyles, partitionedMusicMoods]);


  useEffect(() => {
    let intervalId: number;
    if (isLoading) {
      setCurrentMessageIndex(0);
      intervalId = window.setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
      }, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  if (!idea) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
            <LoadingSpinner />
            <p className="text-slate-600 mt-4 animate-fade-in">{loadingMessages[currentMessageIndex]}</p>
        </div>
      );
    }
    if (error) {
        return (
            <div className="text-center text-red-700 bg-red-100 border border-red-300 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Generation Failed</h3>
                <p>{error}</p>
            </div>
        );
    }
    if (videoUrl) {
      return (
        <video src={videoUrl} controls autoPlay className="w-full rounded-lg aspect-video"></video>
      );
    }
    return (
      <div className="text-center space-y-4 w-full">
        <p className="text-slate-600">
          Ready to generate a video for <span className="font-bold text-slate-800">"{idea.title}"</span>?
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-4">
            <div>
                <label htmlFor="visual-style" className="block text-sm font-medium text-slate-700 mb-1">Visual Style</label>
                <select
                    id="visual-style"
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full px-4 py-2 text-base text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                >
                    <optgroup label={`✨ Suggested for ${idea.genre}`}>
                      {partitionedVisualStyles.suggested.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Styles">
                      {partitionedVisualStyles.other.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </optgroup>
                </select>
            </div>
            <div>
                <label htmlFor="music-mood" className="block text-sm font-medium text-slate-700 mb-1">Music Mood</label>
                <select
                    id="music-mood"
                    value={musicMood}
                    onChange={(e) => setMusicMood(e.target.value)}
                    className="w-full px-4 py-2 text-base text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                >
                    <optgroup label={`✨ Suggested for ${idea.genre}`}>
                      {partitionedMusicMoods.suggested.map(mood => (
                        <option key={mood} value={mood}>{mood}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Moods">
                      {partitionedMusicMoods.other.map(mood => (
                        <option key={mood} value={mood}>{mood}</option>
                      ))}
                    </optgroup>
                </select>
            </div>
        </div>

        <p className="text-sm text-slate-500 pt-4">
          The AI will use the concept, story arc, and visual cues to create a short video clip. This process might take several minutes.
        </p>
      </div>
    );
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
            <h2 className="text-2xl font-bold text-slate-800">Generate Video Clip</h2>
            <p className="text-sm text-slate-500 truncate">Using Veo AI</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none p-2">&times;</button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow flex items-center justify-center bg-white">
          {renderContent()}
        </main>

        {!videoUrl && !error && !isLoading && (
          <footer className="p-6 bg-slate-100/70 border-t border-slate-200 flex justify-end flex-shrink-0">
            <button
              onClick={() => onGenerate(visualStyle, musicMood)}
              disabled={isLoading}
              className="px-6 py-2 bg-fuchsia-600 text-white font-bold rounded-lg hover:bg-fuchsia-500 disabled:bg-fuchsia-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              ✨ Generate Video
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default VideoGeneratorModal;