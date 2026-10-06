'use client';

import React from 'react';
import clsx from 'clsx';

/** 목록(NoticeEventTable·BoardEventList)과 동일 */
export const adminBoardCardClass = 'overflow-hidden rounded-lg border border-gray-200 bg-white';

export const boardFormHintClass =
  'space-y-0.5 pt-2 text-sm text-gray-500 sm:text-base';

export const boardFormLabelClass = 'text-sm font-medium text-gray-700 sm:text-base';

export const boardFieldLabelClass =
  'mb-1.5 block font-pretendard text-xs font-medium text-gray-500';

/** 관리자 목록 FilterBar·SelectMenu(dense)와 동일 높이 */
export const adminFormControlClass =
  '!h-9 !rounded-md !px-3 !text-[13px] !leading-5';

export const adminEditorFrameClass =
  'w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-none';

export function BoardFormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('space-y-1.5', className)}>
      <span className={boardFormLabelClass}>{label}</span>
      {children}
    </div>
  );
}

type BoardDetailPageProps = {
  children: React.ReactNode;
};

/** 목록 page.tsx 와 동일 여백·폭 (배경은 AdminLayout card-list 회색) */
export function BoardDetailPage({ children }: BoardDetailPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1920px] space-y-4 px-4 py-4">{children}</div>
  );
}

type BoardDetailCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function BoardDetailCard({ children, className }: BoardDetailCardProps) {
  return <article className={clsx(adminBoardCardClass, className)}>{children}</article>;
}

/** 목록 카드 상단 `text-[15px] font-semibold` 띠 */
export function BoardCardTitleBar({
  title,
  action,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
      <h3 className="min-w-0 text-[15px] font-semibold text-gray-900">{title}</h3>
      {action ? <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function BoardFormCard({
  title,
  titleAction,
  children,
  className,
  /** 카페24 FormTable: 본문 패딩 없음, 상단 border-neutral-300 */
  cafe24Body = false,
}: {
  title?: React.ReactNode;
  titleAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  cafe24Body?: boolean;
}) {
  return (
    <BoardDetailCard>
      {title ? <BoardCardTitleBar title={title} action={titleAction} /> : null}
      <div
        className={clsx(
          cafe24Body
            ? 'border-t border-neutral-300'
            : 'space-y-5 px-4 py-4 sm:px-5 sm:py-5',
          className
        )}
      >
        {children}
      </div>
    </BoardDetailCard>
  );
}

type BoardDetailHeaderProps = {
  title: React.ReactNode;
  meta?: React.ReactNode;
  badges?: React.ReactNode;
};

/** 상세 본문 상단 — 회색 띠 없이 목록 카드와 같은 border-b */
export function BoardDetailHeader({ title, meta, badges }: BoardDetailHeaderProps) {
  return (
    <header className="border-b border-gray-200 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-wrap items-center gap-2">
        {badges}
        <h1 className="min-w-0 flex-1 text-base font-semibold leading-snug text-gray-900 sm:text-lg">
          {title}
        </h1>
      </div>
      {meta ? (
        <p className="mt-2 text-sm text-gray-500 sm:text-[15px]">{meta}</p>
      ) : null}
    </header>
  );
}

export function BoardDetailDivider() {
  return <div className="border-t border-gray-200" aria-hidden />;
}

/** 상세 본문 — 참고 UI의 테두리 박스 */
export function BoardDetailContentBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-gray-800',
        className
      )}
    >
      {children}
    </div>
  );
}

export function BoardDetailFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-4 py-3 sm:px-5">
      {children}
    </div>
  );
}

type BoardDetailSectionProps = {
  id?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
};

/** 섹션 회색 헤더 없음 — 라벨만 또는 구분선 아래 본문 */
export function BoardDetailSection({ id, label, children, className }: BoardDetailSectionProps) {
  return (
    <section id={id} className={clsx('px-4 py-4 sm:px-5 sm:py-5', className)}>
      {label ? (
        <h2 className="mb-3 text-sm font-medium text-gray-700 sm:text-base">{label}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function BoardDetailPlaceholder({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode;
  tone?: 'muted' | 'error';
}) {
  return (
    <BoardDetailCard>
      <div
        className={clsx(
          'px-4 py-10 text-center text-sm sm:px-5 sm:text-base',
          tone === 'error' ? 'text-red-600' : 'text-gray-500'
        )}
      >
        {children}
      </div>
    </BoardDetailCard>
  );
}
