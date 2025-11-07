
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Chat } from '@google/genai';
import { Genre, Idea, Duration, ScriptHistoryItem, SeoContent } from './types';
import { GENRES, DURATIONS } from './constants';
import { generateShortsIdeas, startScriptChat, generateInitialScriptStream, regenerateScriptStream, generateVideoForIdea, finalizeScriptAsJson, getTrendingTopics, generateSeoContent } from './services/geminiService';
import Header from './components/Header';
import GenreSelector from './components/GenreSelector';
import DurationSelector from './components/DurationSelector';
import IdeaCard from './components/IdeaCard';
import LoadingSpinner from './components/LoadingSpinner';
import ClipboardIcon from './components/icons/ClipboardIcon';
import ScriptGeneratorModal from './components/ScriptGeneratorModal';
import VideoGeneratorModal from './components/VideoGeneratorModal';
import EditIdeaModal from './components/EditIdeaModal';
import TrendingIcon from './components/icons/TrendingIcon';
import HistoryIcon from './components/icons/HistoryIcon';
import HistoryDetailModal from './components/HistoryDetailModal';

// FIX: Removed the local redeclaration of AIStudio to resolve a type conflict.
// The AIStudio interface is globally available. This block augments the global
// Window interface to make TypeScript aware of the `window.aistudio` property.
declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration>(Duration.Shorts30);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([]);
  const [savedIdeasFilter, setSavedIdeasFilter] = useState<Genre | 'all' | 'trending'>('all');
  const [isAllCopied, setIsAllCopied] = useState<boolean>(false);
  
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);
  const [selectedIdeaForScript, setSelectedIdeaForScript] = useState<Idea | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [finalJsonScript, setFinalJsonScript] = useState<string | null>(null);
  const [generatedSeoContent, setGeneratedSeoContent] = useState<SeoContent | null>(null);
  const [scriptChat, setScriptChat] = useState<Chat | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState<{idea: Idea, index: number} | null>(null);

  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedIdeaForVideo, setSelectedIdeaForVideo] = useState<Idea | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoGenError, setVideoGenError] = useState<string | null>(null);

  const [isFetchingTrends, setIsFetchingTrends] = useState<boolean>(false);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  
  const [scriptHistory, setScriptHistory] = useState<ScriptHistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ScriptHistoryItem | null>(null);

  useEffect(() => {
    try {
      const storedIdeas = localStorage.getItem('viralShortsSavedIdeas');
      if (storedIdeas) {
        setSavedIdeas(JSON.parse(storedIdeas));
      }
      const storedHistory = localStorage.getItem('viralShortsScriptHistory');
      if (storedHistory) {
        setScriptHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load or parse from localStorage.", e);
      localStorage.removeItem('viralShortsSavedIdeas');
      localStorage.removeItem('viralShortsScriptHistory');
    }
  }, []);

  const handleSaveIdea = useCallback((ideaToSave: Idea) => {
    setSavedIdeas(prev => {
      if (prev.some(i => i.title === ideaToSave.title && i.concept === ideaToSave.concept)) {
        return prev;
      }
      const newIdea = { ...ideaToSave, id: `${Date.now()}` };
      const updatedIdeas = [newIdea, ...prev].slice(0, 5);
      localStorage.setItem('viralShortsSavedIdeas', JSON.stringify(updatedIdeas));
      return updatedIdeas;
    });
  }, []);

  const handleDeleteIdea = useCallback((idToDelete: string) => {
    setSavedIdeas(prev => {
      const updatedIdeas = prev.filter(idea => idea.id !== idToDelete);
      localStorage.setItem('viralShortsSavedIdeas', JSON.stringify(updatedIdeas));
      return updatedIdeas;
    });
  }, []);
  
  const handleTrendingFilterClick = useCallback(async () => {
    setSavedIdeasFilter('trending');
    if (trendingTopics.length > 0) return; // Use cached topics

    setIsFetchingTrends(true);
    try {
        // FIX: The type of `uniqueGenres` was being inferred as `unknown[]` because
        // `savedIdeas` is populated from JSON.parse, which loses strict enum typing.
        // Explicitly casting to `Genre[]` resolves the type mismatch for `getTrendingTopics`.
        const uniqueGenres = [...new Set(savedIdeas.map(idea => idea.genre))] as Genre[];
        const topics = await getTrendingTopics(uniqueGenres);
        setTrendingTopics(topics);
    } catch (e) {
        console.error("Failed to fetch trending topics:", e);
        setError("Could not fetch trending topics. Please try again later.");
    } finally {
        setIsFetchingTrends(false);
    }
  }, [savedIdeas, trendingTopics]);
  
  const filteredSavedIdeas = useMemo(() => {
    if (savedIdeasFilter === 'all') {
      return savedIdeas;
    }
    if (savedIdeasFilter === 'trending') {
      if (isFetchingTrends || trendingTopics.length === 0) return [];
      const lowercasedTopics = trendingTopics.map(t => t.toLowerCase());
      return savedIdeas.filter(idea => {
          const ideaText = `${idea.title} ${idea.concept} ${idea.tags.join(' ')}`.toLowerCase();
          return lowercasedTopics.some(topic => ideaText.includes(topic));
      });
    }
    return savedIdeas.filter(idea => idea.genre === savedIdeasFilter);
  }, [savedIdeas, savedIdeasFilter, trendingTopics, isFetchingTrends]);

  const handleCopyAll = useCallback(() => {
    if (filteredSavedIdeas.length === 0) return;

    const allIdeasText = filteredSavedIdeas.map(idea => {
      return [
        `Title: ${idea.title}`,
        `Duration: ${idea.duration}`,
        `Concept: ${idea.concept}`,
        `Story Arc: \n${idea.storyArc}`,
        `Visual & Audio Cues: \n${idea.visualsAndAudio}`,
        `SEO Tags: ${idea.tags.join(' ')}`
      ].join('\n\n');
    }).join('\n\n---\n\n');

    navigator.clipboard.writeText(allIdeasText).then(() => {
      setIsAllCopied(true);
      setTimeout(() => setIsAllCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy all ideas: ', err);
      alert('Failed to copy all ideas to clipboard.');
    });
  }, [filteredSavedIdeas]);

  const parseMarkdownTable = (markdown: string): Omit<Idea, 'genre' | 'id' | 'duration'>[] => {
    if (!markdown.includes('|')) return [];
    
    const lines = markdown.trim().split('\n');
    const headerIndex = lines.findIndex(line => line.includes('|') && line.toLowerCase().includes('idea'));
    if (headerIndex === -1) return [];

    const dataLines = lines.slice(headerIndex + 2);

    return dataLines.map((line) => {
      const columns = line.split('|').map(cell => cell.trim());
      if (columns[0] === '' && columns[columns.length - 1] === '') {
        columns.shift();
        columns.pop();
      }
      
      if (columns.length < 5) {
        return null;
      }
      return {
        title: columns[0] || 'Untitled',
        concept: columns[1] || '',
        storyArc: columns[2] || '',
        visualsAndAudio: columns[3] || '',
        tags: columns[4].split(/\s+/).filter(tag => tag.startsWith('#')),
      };
    }).filter((idea): idea is Omit<Idea, 'genre' | 'id' | 'duration'> => idea !== null);
  };

  const handleGenerateIdeas = useCallback(async () => {
    if (!selectedGenre) {
      setError('Please select a genre first.');
      return;
    }
    if (!selectedDuration) {
      setError('Please select a duration.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdeas([]);

    try {
      const responseText = await generateShortsIdeas(selectedGenre, selectedDuration);
      const parsedIdeas = parseMarkdownTable(responseText);
      if(parsedIdeas.length === 0) {
        setError("Failed to parse ideas from the AI response. The format might be unexpected. Please try again.");
        console.error("Raw AI Response:", responseText);
      }
      const ideasWithDetails: Idea[] = parsedIdeas.map(idea => ({ ...idea, genre: selectedGenre, duration: selectedDuration }));
      setIdeas(ideasWithDetails);
    } catch (e) {
      console.error(e);
      setError('An error occurred while generating ideas. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenre, selectedDuration]);

  const handleEditRequest = (idea: Idea, index: number) => {
    setIdeaToEdit({ idea, index });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
      setIsEditModalOpen(false);
      setIdeaToEdit(null);
  };

  const handleUpdateIdea = (updatedIdea: Idea) => {
      if (ideaToEdit === null) return;
      const newIdeas = [...ideas];
      newIdeas[ideaToEdit.index] = updatedIdea;
      setIdeas(newIdeas);
      handleCloseEditModal();
  };

  const handleGenerateScriptRequest = (idea: Idea) => {
    setSelectedIdeaForScript(idea);
    setGeneratedScript(null);
    setFinalJsonScript(null);
    setGeneratedSeoContent(null);
    setScriptChat(startScriptChat());
    setIsScriptModalOpen(true);
  };

  const handleCloseScriptModal = () => {
    setIsScriptModalOpen(false);
    setSelectedIdeaForScript(null);
    setScriptChat(null);
  };

  const handleGenerateScript = async (sceneDuration: string, noNarration: boolean, language: string, suggestion?: string, selectedNarrationStyle?: string) => {
    if (!selectedIdeaForScript || !scriptChat) return;

    setIsGeneratingScript(true);
    setFinalJsonScript(null);
    setGeneratedSeoContent(null);
    setGeneratedScript(''); // Clear previous script for streaming
    
    try {
        const stream = suggestion 
            ? await regenerateScriptStream(scriptChat, sceneDuration, noNarration, language, suggestion, selectedNarrationStyle)
            : await generateInitialScriptStream(scriptChat, selectedIdeaForScript, sceneDuration, noNarration, language);

        for await (const chunk of stream) {
            setGeneratedScript((prevScript) => (prevScript || '') + chunk.text);
        }

    } catch (e) {
        console.error(e);
        setError('Failed to generate script. Please check the console for details.');
    } finally {
        setIsGeneratingScript(false);
    }
  };

  const handleAddToHistory = useCallback((idea: Idea, jsonScript: string, seoContent: SeoContent) => {
    setScriptHistory(prev => {
        const newItem: ScriptHistoryItem = { id: `${Date.now()}`, idea, jsonScript, seoContent };
        const updatedHistory = [newItem, ...prev].slice(0, 5);
        localStorage.setItem('viralShortsScriptHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
    });
  }, []);

  const handleFinalizeScript = async (sceneDuration: string, numberOfScenes?: number) => {
    if (!generatedScript || !selectedIdeaForScript) return;
    
    setIsGeneratingScript(true);
    setFinalJsonScript(null);
    setGeneratedSeoContent(null);
    try {
        const jsonText = await finalizeScriptAsJson(generatedScript, sceneDuration, numberOfScenes);
        setFinalJsonScript(jsonText);

        const seo = await generateSeoContent(jsonText, selectedIdeaForScript);
        setGeneratedSeoContent(seo);

        handleAddToHistory(selectedIdeaForScript, jsonText, seo);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingScript(false);
    }
  };


  const handleGenerateVideoRequest = async (idea: Idea) => {
    if (!window.aistudio || typeof window.aistudio.hasSelectedApiKey !== 'function' || typeof window.aistudio.openSelectKey !== 'function') {
      alert("Video generation is not available in this environment.");
      return;
    }
  
    let hasKey = await window.aistudio.hasSelectedApiKey();
    setIsApiKeySelected(hasKey);
  
    if (!hasKey) {
        const userAgrees = window.confirm(
            "To use the experimental video generation feature with Veo, you need to select a project with an enabled API key. This action may incur usage costs.\n\nFor more details, please review the billing documentation at https://ai.google.dev/gemini-api/docs/billing\n\nDo you want to continue?"
        );
  
        if (!userAgrees) {
            return;
        }
  
        await window.aistudio.openSelectKey();
        hasKey = await window.aistudio.hasSelectedApiKey();
        setIsApiKeySelected(hasKey);
    }
  
    if (hasKey) {
        setSelectedIdeaForVideo(idea);
        setGeneratedVideoUrl(null);
        setVideoGenError(null);
        setIsVideoModalOpen(true);
    } else {
        console.log("User did not select an API key.");
    }
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedIdeaForVideo(null);
    if (generatedVideoUrl) {
      URL.revokeObjectURL(generatedVideoUrl);
    }
    setGeneratedVideoUrl(null);
  };
  
  const handleGenerateVideo = async (visualStyle: string, musicMood: string) => {
    if (!selectedIdeaForVideo) return;

    setIsGeneratingVideo(true);
    setVideoGenError(null);
    setGeneratedVideoUrl(null);
    try {
        const videoUrl = await generateVideoForIdea(selectedIdeaForVideo, visualStyle, musicMood);
        setGeneratedVideoUrl(videoUrl);
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during video generation.';
        setVideoGenError(errorMessage);
        if (errorMessage.includes("Requested entity was not found.")) {
            setVideoGenError("Your API key seems invalid or was not found. Please select a valid key to continue.");
            setIsApiKeySelected(false);
        }
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  const handleOpenHistoryItem = (item: ScriptHistoryItem) => {
    setSelectedHistoryItem(item);
    setIsHistoryModalOpen(true);
  };
  
  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedHistoryItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-rose-100 to-amber-100 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg md:text-xl text-slate-600 mb-6">
            Select a genre and duration, then let our AI strategist generate 10 viral video ideas for you.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
            <GenreSelector
              genres={GENRES}
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
            />
            <DurationSelector
              durations={DURATIONS}
              selectedDuration={selectedDuration}
              onSelectDuration={setSelectedDuration}
            />
          </div>

          <button
            onClick={handleGenerateIdeas}
            disabled={!selectedGenre || !selectedDuration || isLoading}
            className="mt-4 px-8 py-4 bg-fuchsia-600 text-white font-bold text-lg rounded-full hover:bg-fuchsia-500 disabled:bg-fuchsia-400 disabled:cursor-not-allowed disabled:text-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-fuchsia-600/40"
          >
            {isLoading ? 'Generating...' : '✨ Generate 10 Viral Ideas'}
          </button>
        </div>

        <div className="mt-12">
          {isLoading && <LoadingSpinner />}
          {error && <div className="text-center text-red-700 bg-red-100 border border-red-300 p-4 rounded-lg max-w-2xl mx-auto">{error}</div>}
          
          {!isLoading && ideas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {ideas.map((idea, index) => (
                <IdeaCard 
                  key={`${idea.title}-${index}`} 
                  idea={idea} 
                  index={index + 1}
                  onSave={handleSaveIdea}
                  onGenerateScriptRequest={handleGenerateScriptRequest}
                  onGenerateVideoRequest={handleGenerateVideoRequest}
                  onEditRequest={(idea) => handleEditRequest(idea, index)}
                  isSaved={savedIdeas.some(saved => saved.title === idea.title && saved.concept === idea.concept)}
                />
              ))}
            </div>
          )}

          {!isLoading && !error && ideas.length === 0 && !isLoading && (
             <div className="text-center text-slate-500 mt-20">
                <p className="text-2xl">Your next viral hit is just a click away.</p>
             </div>
          )}
        </div>

        {savedIdeas.length > 0 && (
          <section className="mt-20 pt-10 border-t border-slate-300/70">
            <div className="max-w-6xl mx-auto text-center px-4">
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400 mb-4">
                Your Saved Ideas
              </h2>
              <p className="text-slate-600 mb-8">Review, filter, and manage your saved ideas. Only the last 5 are kept.</p>
              
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-8">
                <button
                  onClick={() => setSavedIdeasFilter('all')}
                  className={`px-6 py-3 text-sm md:text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                    savedIdeasFilter === 'all'
                      ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30'
                      : 'bg-white/80 text-slate-700 hover:bg-white shadow-sm'
                  }`}
                >
                  All ({savedIdeas.length})
                </button>
                <button
                  onClick={handleTrendingFilterClick}
                  disabled={isFetchingTrends}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm md:text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed ${
                    savedIdeasFilter === 'trending'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-white/80 text-slate-700 hover:bg-white shadow-sm'
                  }`}
                >
                  <TrendingIcon className="h-5 w-5" />
                  <span>{isFetchingTrends ? 'Analyzing...' : 'Trending'}</span>
                </button>
                {GENRES.filter(genre => savedIdeas.some(i => i.genre === genre)).map((genre) => {
                    const count = savedIdeas.filter(i => i.genre === genre).length;
                    return (
                        <button
                            key={genre}
                            onClick={() => setSavedIdeasFilter(genre)}
                            className={`px-6 py-3 text-sm md:text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                            savedIdeasFilter === genre
                                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30'
                                : 'bg-white/80 text-slate-700 hover:bg-white shadow-sm'
                            }`}
                        >
                            {genre} ({count})
                        </button>
                    );
                })}

                <button
                  onClick={handleCopyAll}
                  className="flex items-center space-x-2 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 bg-white/80 text-slate-700 hover:bg-white shadow-sm"
                  aria-label="Copy All Visible Ideas"
                >
                  <ClipboardIcon className={`h-5 w-5 transition-colors ${isAllCopied ? 'text-green-500' : 'text-slate-500'}`} />
                  {/* FIX: Corrected typo from `filteredIdeas` to `filteredSavedIdeas`. */}
                  <span className={`transition-colors ${isAllCopied ? 'text-green-600' : 'text-slate-700'}`}>{isAllCopied ? 'Copied All!' : `Copy All (${filteredSavedIdeas.length})`}</span>
                </button>
              </div>
              
              {isFetchingTrends && (
                <div className="flex justify-center items-center p-8">
                  <LoadingSpinner />
                </div>
              )}

              {!isFetchingTrends && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSavedIdeas.map((idea, index) => (
                    <IdeaCard 
                      key={idea.id || index} 
                      idea={idea} 
                      index={index + 1}
                      onDelete={handleDeleteIdea}
                      onGenerateScriptRequest={handleGenerateScriptRequest}
                      onGenerateVideoRequest={handleGenerateVideoRequest}
                    />
                  ))}
                </div>
              )}

              {!isFetchingTrends && savedIdeasFilter === 'trending' && filteredSavedIdeas.length === 0 && (
                <div className="text-center text-slate-500 mt-12">
                  <p>No saved ideas match the current trending topics.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {scriptHistory.length > 0 && (
          <section className="mt-20 pt-10 border-t border-slate-300/70">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500 mb-4">
                Script History
              </h2>
              <p className="text-slate-600 mb-8">Review your last 5 finalized scripts and their SEO kits.</p>
              <div className="flex flex-col items-center gap-3">
                {scriptHistory.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleOpenHistoryItem(item)}
                    className="w-full max-w-2xl text-left p-4 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-lg shadow-sm hover:bg-white hover:border-fuchsia-400 hover:shadow-md transition-all duration-200"
                  >
                    <p className="font-bold text-slate-800 truncate">{item.idea.title}</p>
                    <p className="text-sm text-slate-500">{item.idea.genre} &middot; {item.idea.duration}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      {isScriptModalOpen && (
        <ScriptGeneratorModal
          idea={selectedIdeaForScript}
          onClose={handleCloseScriptModal}
          onGenerate={handleGenerateScript}
          onFinalize={handleFinalizeScript}
          isLoading={isGeneratingScript}
          script={generatedScript}
          finalJsonScript={finalJsonScript}
          seoContent={generatedSeoContent}
        />
      )}

      {isVideoModalOpen && (
        <VideoGeneratorModal
          idea={selectedIdeaForVideo}
          onClose={handleCloseVideoModal}
          onGenerate={handleGenerateVideo}
          isLoading={isGeneratingVideo}
          videoUrl={generatedVideoUrl}
          error={videoGenError}
        />
      )}

      {isEditModalOpen && ideaToEdit && (
          <EditIdeaModal
            idea={ideaToEdit.idea}
            onClose={handleCloseEditModal}
            onSave={handleUpdateIdea}
          />
      )}

      {isHistoryModalOpen && selectedHistoryItem && (
        <HistoryDetailModal
          item={selectedHistoryItem}
          onClose={handleCloseHistoryModal}
        />
      )}
    </div>
  );
};

export default App;
