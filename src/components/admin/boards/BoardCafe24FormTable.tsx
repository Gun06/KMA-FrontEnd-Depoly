'use client';

import React from 'react';
import clsx from 'clsx';
import { FormLayoutProvider } from '@/components/admin/Form/FormLayoutContext';

/** 카페24·대회등록 FormTable과 동일: 다크 라벨 + neutral-300 구분 */
export const boardCafe24EditorFrameClass =
  'w-full overflow-hidden rounded-sm border border-neutral-300 bg-white shadow-none';

export const boardCafe24RowFieldClass = 'items-center px-3';
export const boardCafe24RowBlockClass = 'items-start px-3 py-3';

/** 대회등록 NoticeMessage와 동일 */
export const boardCafe24HintClass = 'pt-1 text-[13px] leading-6 text-gray-500';

type BoardCafe24FormTableProps = {
  children: React.ReactNode;
  labelWidth?: number;
  className?: string;
};

export function BoardCafe24FormTable({
  children,
  labelWidth = 120,
  className,
}: BoardCafe24FormTableProps) {
  return (
    <FormLayoutProvider labelWidth={labelWidth} tightRows>
      <div className={clsx('divide-y divide-neutral-300 bg-white', className)}>{children}</div>
    </FormLayoutProvider>
  );
}
