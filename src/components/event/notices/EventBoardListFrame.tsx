import React from 'react';
import {
  PUBLIC_BOARD_LIST_INNER_CLASS,
  PUBLIC_BOARD_LIST_OUTER_CLASS,
} from '@/lib/layout/publicContentFrame';

interface EventBoardListFrameProps {
  children: React.ReactNode;
}

export function EventBoardListFrame({ children }: EventBoardListFrameProps) {
  return (
    <div className={PUBLIC_BOARD_LIST_OUTER_CLASS}>
      <div className={PUBLIC_BOARD_LIST_INNER_CLASS}>{children}</div>
    </div>
  );
}
