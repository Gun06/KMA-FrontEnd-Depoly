import React from 'react';
import { EVENT_FAQ_PAGE_SHELL_CLASS } from '@/lib/layout/publicContentFrame';

interface FaqPageFrameProps {
  children: React.ReactNode;
}

export function FaqPageFrame({ children }: FaqPageFrameProps) {
  return <div className={EVENT_FAQ_PAGE_SHELL_CLASS}>{children}</div>;
}
