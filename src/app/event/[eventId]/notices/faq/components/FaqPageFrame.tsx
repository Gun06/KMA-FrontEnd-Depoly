import React from 'react';
import {
  PUBLIC_BOARD_LIST_OUTER_CLASS,
  PUBLIC_FAQ_LIST_INNER_CLASS,
} from '@/lib/layout/publicContentFrame';

interface FaqPageFrameProps {
  children: React.ReactNode;
}

export function FaqPageFrame({ children }: FaqPageFrameProps) {
  return (
    <div className={PUBLIC_BOARD_LIST_OUTER_CLASS}>
      <div className={PUBLIC_FAQ_LIST_INNER_CLASS}>{children}</div>
    </div>
  );
}
