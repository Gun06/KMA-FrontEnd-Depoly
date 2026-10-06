import React from 'react';

interface EventBoardListFrameProps {
  children: React.ReactNode;
}

export function EventBoardListFrame({ children }: EventBoardListFrameProps) {
  return (
    <div className="w-full py-8 md:py-10 lg:py-12 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </div>
  );
}
