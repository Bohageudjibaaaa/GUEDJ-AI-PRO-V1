
import React, { useState } from 'react';
import { AI_PERSONALITIES } from '../constants';
import type { AIPersonalityType } from '../types';

interface PersonalitySelectorProps {
  currentPersonality: AIPersonalityType;
  onPersonalityChange: (personality: AIPersonalityType) => void;
  disabled?: boolean;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ currentPersonality, onPersonalityChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPersonality = AI_PERSONALITIES[currentPersonality];

  const handleSelect = (personality: AIPersonalityType) => {
    onPersonalityChange(personality);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 w-full text-left p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedPersonality.icon}
        <span className="flex-grow text-sm font-medium">{selectedPersonality.name}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
          <ul className="py-1">
            {Object.values(AI_PERSONALITIES).map((personality) => (
              <li key={personality.id}>
                <button
                  onClick={() => handleSelect(personality.id)}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {personality.icon}
                  {personality.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PersonalitySelector;
