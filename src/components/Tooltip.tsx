import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  id?: string;
}

export function Tooltip({ children, content, position = 'top', id }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[#2E3440] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#2E3440] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[#2E3440] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[#2E3440] border-y-transparent border-l-transparent'
  };

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      id={id}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${positionClasses[position]} z-50 flex flex-col items-center pointer-events-none drop-shadow-md select-none`}>
          <div className="bg-[#2E3440] text-[#ECEFF4] text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#4C566A] whitespace-nowrap leading-tight text-center">
            {content}
          </div>
          <div className={`w-0 h-0 border-4 ${arrowClasses[position]} -mt-[1px] ${position === 'bottom' ? 'mt-[-1px]' : ''}`}></div>
        </div>
      )}
    </div>
  );
}
