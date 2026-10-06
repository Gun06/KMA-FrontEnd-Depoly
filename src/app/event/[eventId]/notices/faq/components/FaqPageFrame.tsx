import React from 'react';

interface FaqPageFrameProps {
  children: React.ReactNode;
}

export function FaqPageFrame({ children }: FaqPageFrameProps) {
  return (
    <div className="h-full w-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">{children}</div>
  );
}
