import React from 'react';

const StoryArcIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-6 w-6" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2h0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 9h14M5 15h14" />
  </svg>
);

export default StoryArcIcon;
