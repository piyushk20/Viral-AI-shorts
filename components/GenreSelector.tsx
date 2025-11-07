import React from 'react';
import { Genre } from '../types';

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenre: Genre | null;
  onSelectGenre: (genre: Genre) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ genres, selectedGenre, onSelectGenre }) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <select
        value={selectedGenre || ''}
        onChange={(e) => onSelectGenre(e.target.value as Genre)}
        className="w-full px-6 py-4 text-lg text-slate-800 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all duration-300 cursor-pointer shadow-sm"
        aria-label="Select a genre"
      >
        <option value="" disabled>
          Select a Genre...
        </option>
        {genres.map((genre) => (
          <option key={genre} value={genre} className="bg-white text-slate-800">
            {genre}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 pointer-events-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );
};

export default GenreSelector;