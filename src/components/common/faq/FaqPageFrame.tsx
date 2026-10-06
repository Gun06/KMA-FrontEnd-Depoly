import React from 'react';
import { PUBLIC_FAQ_LIST_INNER_CLASS } from '@/lib/layout/publicContentFrame';

interface FaqPageFrameProps {
  children: React.ReactNode;
}

/** 메인 FAQ — SubmenuLayout `wide` 패딩 안에서 읽기 폭만 제한 */
export function FaqPageFrame({ children }: FaqPageFrameProps) {
  return <div className={PUBLIC_FAQ_LIST_INNER_CLASS}>{children}</div>;
}
