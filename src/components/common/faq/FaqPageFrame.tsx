import React from 'react';

interface FaqPageFrameProps {
  children: React.ReactNode;
}

/** 메인 홈 FaqSection과 동일 가로 리듬 */
export function FaqPageFrame({ children }: FaqPageFrameProps) {
  return <div className="w-full">{children}</div>;
}
