import React from 'react';
import { RichTextContent } from '@/components/common/RichTextContent';

interface InquiryContentProps {
  content: string;
}

export const InquiryContent = React.memo(({ content }: InquiryContentProps) => {
  return (
    <RichTextContent
      html={content}
      variant="responsive"
      className="[transform:translateZ(0)] [backface-visibility:hidden] will-change-transform"
    />
  );
});

InquiryContent.displayName = 'InquiryContent';
