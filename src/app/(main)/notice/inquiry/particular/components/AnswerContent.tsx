import React from 'react';

interface AnswerContentProps {
  content: string;
}

export const AnswerContent = React.memo(({ content }: AnswerContentProps) => {
  return (
    <div 
      className="prose max-w-none font-thin text-gray-600 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight"
      style={{ 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word', 
        fontWeight: 100, 
        color: '#4b5563',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

AnswerContent.displayName = 'AnswerContent';

