/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { speakText, subscribeSpeech } from '../utils/audio';

interface SpeechButtonProps {
  text: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  inline?: boolean;
}

export default function SpeechButton({ 
  text, 
  size = 'sm', 
  className = '', 
  inline = false 
}: SpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpeech(activeText => {
      setIsSpeaking(activeText === text);
    });
    return unsubscribe;
  }, [text]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(text);
  };

  const sizeClasses = {
    xs: 'p-1 rounded-md text-[10px]',
    sm: 'p-1.5 rounded-lg text-xs',
    md: 'p-2 rounded-xl text-sm',
    lg: 'p-2.5 rounded-2xl text-base'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
        isSpeaking
          ? 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-300 animate-pulse shadow-md'
          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 hover:shadow-xs active:scale-95'
      } ${sizeClasses[size]} ${inline ? 'ml-2 vertical-middle' : ''} ${className}`}
      title={isSpeaking ? 'Zatrzymaj czytanie' : 'Przeczytaj na głos (Lektor pl)'}
      id={`speech-btn-${text.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '') || 'default'}`}
    >
      {isSpeaking ? (
        <Square className={`${iconSizes[size]} fill-current`} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      <span className="text-[10px] font-bold px-0.5">Lektor</span>
    </button>
  );
}
