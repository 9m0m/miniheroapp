'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
  className?: string;
  isComplete?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speedMs = 22,
  onComplete,
  className = '',
  isComplete = false,
}) => {
  const [displayedLength, setDisplayedLength] = useState<number>(() => (isComplete ? text.length : 0));
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isComplete) {
      setDisplayedLength(text.length);
      return;
    }

    setDisplayedLength(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current <= text.length) {
        setDisplayedLength(current);
      } else {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs, isComplete]);

  const displayedText = isComplete ? text : text.slice(0, displayedLength);
  const isTyping = displayedLength < text.length && !isComplete;

  return (
    <span className={className}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
};
