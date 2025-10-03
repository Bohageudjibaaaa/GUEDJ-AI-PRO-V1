
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default Spinner;
