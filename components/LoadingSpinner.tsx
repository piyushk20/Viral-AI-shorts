
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fuchsia-500"></div>
      <p className="text-fuchsia-600 text-lg">AI is researching viral trends...</p>
    </div>
  );
};

export default LoadingSpinner;