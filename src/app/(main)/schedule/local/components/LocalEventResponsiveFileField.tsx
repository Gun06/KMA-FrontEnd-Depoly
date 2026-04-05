'use client';

import type { ComponentProps } from 'react';
import FileUploader from '@/components/common/Upload/FileUploader';
import { cn } from '@/utils/cn';

type Props = Omit<ComponentProps<typeof FileUploader>, 'className'> & {
  className?: string;
  /** 점선 업로드 영역 래퍼 추가 클래스 */
  shellClassName?: string;
};

/**
 * 홍보 배너 등 — FileUploader와 동일 API, 점선 셸 + 좁은 화면에서 업로드 버튼·안내 반응형.
 */
export default function LocalEventResponsiveFileField({
  shellClassName,
  className,
  ...rest
}: Props) {
  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-gray-300 bg-gray-50/60 max-[420px]:p-[1px] p-1 min-w-0 overflow-hidden sm:p-4',
        shellClassName
      )}
    >
      <FileUploader
        {...rest}
        className={cn(
          'min-w-0',
          className
        )}
      />
    </div>
  );
}
