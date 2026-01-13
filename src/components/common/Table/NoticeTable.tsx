// src/components/ui/Table/NoticeTable.tsx
import { useMemo } from 'react';
import CategoryBadge from '@/components/common/Badge/CategoryBadge';
import BaseTable, { Column } from './BaseTable';
import type { NoticeItem } from './types';

type Props = {
  data: NoticeItem[];
  onRowClick?: (id: string | number) => void;
  pinLimit?: number;
  numberDesc?: boolean;
  showPinnedBadgeInNo?: boolean;
  pinnedClickable?: boolean;
  // 페이지네이션을 위한 추가 props
  currentPage?: number;
  pageSize?: number;
  totalElements?: number;
};

type DisplayRow = NoticeItem & { __displayNo: number | '필독' | undefined };

export default function NoticeTable({
  data,
  onRowClick,
  pinLimit = 3,
  numberDesc = true,
  showPinnedBadgeInNo = true,
  pinnedClickable = true,
  currentPage = 1,
  pageSize = 10,
  totalElements = 0,
}: Props) {

  const { pinnedRows, regularRows } = useMemo(() => {
    // 모든 데이터를 그대로 사용 (필터링하지 않음)
    // 데이터는 이미 상위 컴포넌트에서 처리되어 전달됨
    
    // pinned 항목과 일반 항목 분리
    const pinned = data.filter((r) => r.pinned);
    const effectivePinned = pinLimit ? pinned.slice(0, pinLimit) : pinned;
    const pinnedIdSet = new Set<string | number>(effectivePinned.map((r) => r.id));
    const nonPinned = data.filter((r) => !pinnedIdSet.has(r.id));

    const pinnedRows: DisplayRow[] = effectivePinned.map((row) => ({
      ...row,
      __displayNo: row.__displayNo,
    }));

    const regularRows: DisplayRow[] = nonPinned.map((row) => ({
      ...row,
      __displayNo: row.__displayNo,
    }));

    return { pinnedRows, regularRows };
  }, [data, pinLimit]);

  const rows = useMemo<DisplayRow[]>(() => {
    return [...pinnedRows, ...regularRows];
  }, [pinnedRows, regularRows]);

  const handleRowKeyDown =
    (id: string | number, clickable: boolean) =>
    (e: React.KeyboardEvent<HTMLTableRowElement | HTMLLIElement>) => {
      if (!clickable) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRowClick?.(id);
      }
    };

  const columns: Column<DisplayRow>[] = [
    {
      key: "__no",
      header: "번호",
      width: 80,
      align: "center",
      className: "align-middle whitespace-nowrap",
      render: (row) => {
        const isPinned = row.pinned;
        // 문의사항인지 확인 (category가 '문의' 또는 '답변'이거나, originalQuestionId/answerHeaderId가 있는 경우)
        const isInquiry = row.category === '문의' || row.category === '답변' || row.originalQuestionId !== undefined || row.answerHeaderId !== undefined;
        
        // 고정글인 경우
        if (isPinned) {
          return showPinnedBadgeInNo ? (
            <div className="flex items-center justify-center">
              <CategoryBadge category={row.category ?? '필독'} size="md" />
            </div>
          ) : (
            <span className="inline-block w-4 h-4" />
          );
        }
        
        // 문의사항인 경우: 번호 열에는 번호만 표시
        if (isInquiry) {
          if (row.__displayNo !== undefined && typeof row.__displayNo === 'number') {
            return <span className="text-[14px] text-[#111827] font-medium">{row.__displayNo}</span>;
          }
          // 답변 행 등 번호가 없는 경우 빈 값
          return <span className="text-[14px] text-[#111827]"></span>;
        }
        
        // 공지사항인 경우: 번호 열에는 태그만 표시 (번호 없음)
        if (row.category) {
          return (
            <div className="flex items-center justify-center">
              <CategoryBadge category={row.category} size="md" />
            </div>
          );
        }
        // category가 없으면 빈 값 표시
        return <span className="text-[14px] text-[#111827]"></span>;
      },
    },
    {
      key: "title",
      header: "제목",
      align: "left",
      className: "text-left",
      render: (row) => {
        const isPinned = row.pinned;
        const clickable = !(isPinned && !pinnedClickable);
        // 문의사항인지 확인 (category가 '문의' 또는 '답변'이거나, originalQuestionId/answerHeaderId가 있는 경우)
        const isInquiry = row.category === '문의' || row.category === '답변' || row.originalQuestionId !== undefined || row.answerHeaderId !== undefined;
        
        return (
          <div className="flex min-w-0 items-center gap-2">
            {/* 문의사항인 경우: 제목 앞에 태그 표시 */}
            {isInquiry && row.category && (
              <CategoryBadge category={row.category} size="md" />
            )}
            <span
              className={`text-[15px] text-[#0F1113] truncate ${clickable ? 'cursor-pointer hover:underline' : ''}`}
              title={row.title}
              onClick={(e) => { if (clickable) { e.stopPropagation(); onRowClick?.(row.id); } }}
            >
              {row.title}
            </span>
          </div>
        );
      },
    },
    {
      key: "author",
      header: "작성자",
      width: 110,
      align: "center",
      className: "text-[#6B7280] whitespace-nowrap",
    },
    {
      key: "date",
      header: "작성일",
      width: 120,
      align: "center",
      className: "text-[#6B7280] whitespace-nowrap",
    },
    {
      key: "views",
      header: "조회수",
      width: 100,
      align: "center",
      className: "text-[#6B7280]",
      render: (row) => <span className="font-medium">{row.views.toLocaleString()}</span>,
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop / Tablet */}
      <div className="hidden md:block">
        {/* 고정글 섹션 */}
        {pinnedRows.length > 0 && (
          <div className="bg-white">
            <BaseTable
              columns={columns}
              data={pinnedRows}
              rowKey={(r) => r.id}
              headRowClassName="bg-[#3B3F45] text-white text-center"
              zebra={false}
              rowClassName={(row) => {
                const isPinned = row.pinned;
                const clickable = !(isPinned && !pinnedClickable);
                return `bg-white hover:bg-[#F8FAFF] ${clickable ? 'cursor-pointer' : ''}`;
              }}
              onRowClick={(row) => {
                const isPinned = row.pinned;
                const clickable = !(isPinned && !pinnedClickable);
                if (clickable) {
                  onRowClick?.(row.id);
                }
              }}
            />
          </div>
        )}

        {/* 일반글 섹션 */}
        {regularRows.length > 0 && (
          <div className="bg-white">
            <BaseTable
              columns={columns}
              data={regularRows}
              rowKey={(r) => r.id}
              headRowClassName={pinnedRows.length > 0 ? undefined : "bg-[#3B3F45] text-white text-center"}
              zebra={false}
              hideTopBorder={pinnedRows.length > 0}
              hideHeader={pinnedRows.length > 0}
              rowClassName={(row) => {
                const clickable = true;
                return `bg-white hover:bg-[#F8FAFF] ${clickable ? 'cursor-pointer' : ''}`;
              }}
              onRowClick={(row) => {
                onRowClick?.(row.id);
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        {/* 고정글 섹션 */}
        {pinnedRows.length > 0 && (
          <div className="bg-white">
            <ul className="divide-y divide-[#F1F3F5]">
              {pinnedRows.map((row) => {
                const isPinned = row.pinned;
                const clickable = pinnedClickable || !isPinned;

                return (
                  <li
                    key={row.id}
                    tabIndex={-1}
                    className={[
                      'px-2 py-3 transition-colors outline-none sm:px-4 active:bg-transparent focus:bg-transparent',
                      'bg-white hover:bg-[#F8FAFF]',
                      clickable ? 'cursor-pointer' : '',
                    ].join(' ')}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (clickable) {
                        onRowClick?.(row.id);
                      }
                    }}
                    onKeyDown={handleRowKeyDown(row.id, clickable)}
                  >
                    <div className="grid grid-cols-[40px_1fr] gap-3 items-start">
                      <div className="h-6 flex items-center justify-center">
                        <CategoryBadge category={row.category ?? '필독'} size="xs" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-1.5">
                          <span
                            className="text-[15px] leading-[22px] text-[#0F1113] line-clamp-2 flex-1"
                            title={row.title}
                          >
                            {row.title}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] leading-[18px] text-[#6B7280]">
                          <span className="shrink-0">{row.author}</span>
                          <span className="opacity-30">·</span>
                          <span className="shrink-0">{row.date}</span>
                          <span className="opacity-30">·</span>
                          <span className="shrink-0">첨부 {row.attachments ?? 0}</span>
                          <span className="opacity-30">·</span>
                          <span className="shrink-0">조회 {row.views}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 일반글 섹션 */}
        {regularRows.length > 0 && (
          <div className="bg-white">
            <ul className="divide-y divide-[#F1F3F5]">
              {regularRows.map((row) => {
                const clickable = true;

                return (
                  <li
                    key={row.id}
                    tabIndex={-1}
                    className={[
                      'px-2 py-3 transition-colors outline-none sm:px-4 active:bg-transparent focus:bg-transparent',
                      'bg-white hover:bg-[#F8FAFF]',
                      clickable ? 'cursor-pointer' : '',
                    ].join(' ')}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (clickable) {
                        onRowClick?.(row.id);
                      }
                    }}
                    onKeyDown={handleRowKeyDown(row.id, clickable)}
                  >
                    <div className="grid grid-cols-[40px_1fr] gap-3 items-start">
                      <div className="h-6 flex items-center justify-center">
                        <CategoryBadge category={row.category ?? '일반'} size="xs" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-1.5">
                          <span
                            className="text-[15px] leading-[22px] text-[#0F1113] line-clamp-2 flex-1"
                            title={row.title}
                          >
                            {row.title}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] leading-[18px] text-[#6B7280]">
                          <span className="shrink-0">{row.author}</span>
                          <span className="opacity-30">·</span>
                          <span className="shrink-0">{row.date}</span>
                          <span className="opacity-30">·</span>
                          <span className="shrink-0">첨부 {row.attachments ?? 0}</span>
                          <span className="opacity-30">·</span>
                          <span className="shrink-0">조회 {row.views}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
