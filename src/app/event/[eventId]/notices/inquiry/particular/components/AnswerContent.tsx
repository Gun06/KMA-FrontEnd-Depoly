import React from 'react';
import { RichTextContent } from '@/components/common/RichTextContent';

interface AnswerContentProps {
  content: string;
}

export const AnswerContent = React.memo(({ content }: AnswerContentProps) => {
  return (
    <RichTextContent
      html={content}
      className="[transform:translateZ(0)] [backface-visibility:hidden] will-change-transform"
    />
  );
});

AnswerContent.displayName = 'AnswerContent';
