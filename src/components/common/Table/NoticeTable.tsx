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

  const rows = useMemo<DisplayRow[]>(() => {
    // 질문과 답변을 별도 행으로 변환 (답변은 번호 없음)
    const expandedRows: NoticeItem[] = [];
    
    data.forEach((row) => {
      // 질문 행 추가
      expandedRows.push(row);
      
      // 답변이 있는 경우 답변 행 추가 (번호는 표시하지 않음)
      if (row.answer) {
        const answerRow: NoticeItem = {
          ...row,
          id: `answer-${row.id}`, // 답변 행의 ID는 고유하게 생성
          title: `↳ [RE] ${row.title}`, // 화살표와 [RE] 추가
          category: '답변' as const,
          author: row.answer.author,
          date: row.answer.date,
          // 답변 행은 번호 없음 (명시적으로 undefined 설정)
          __displayNo: undefined,
          originalQuestionId: row.id, // 원본 질문 ID 저장
          answerHeaderId: row.answerHeaderId,
          // 원본 질문의 권한 정보 상속 (답변도 같은 권한을 가짐)
          canViewContent: row.canViewContent,
          isAuthor: row.isAuthor,
          secret: row.secret // 원본 질문의 비밀글 여부 상속
        };
        expandedRows.push(answerRow);
      }
    });

    const autoPinned = expandedRows.map((row) =>
      row.category === '필독' ? { ...row, pinned: true } : row
    );
    const pinned = autoPinned.filter((r) => r.pinned);
    const effectivePinned = pinLimit ? pinned.slice(0, pinLimit) : pinned;
    const pinnedIdSet = new Set<string | number>(effectivePinned.map((r) => r.id));
    const nonPinned = autoPinned.filter((r) => !pinnedIdSet.has(r.id));

    // 번호는 이미 inquiry/page.tsx에서 계산되어 전달됨
    const sorted = [...effectivePinned, ...nonPinned];

    return sorted.map((row) => {
      if (pinnedIdSet.has(row.id)) return { ...row, __displayNo: '필독' as const };
      
      // __displayNo는 이미 전달받은 값 사용
      return { ...row, __displayNo: row.__displayNo };
    });
  }, [data, pinLimit]);

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
        const isPinned = row.__displayNo === '필독';
        if (isPinned) {
          return showPinnedBadgeInNo ? (
            <div className="flex items-center justify-center">
              <CategoryBadge category={row.category ?? '필독'} size="md" />
            </div>
          ) : (
            <span className="inline-block w-4 h-4" />
          );
        }
        // __displayNo가 없으면 빈 값 표시 (답변 행 등)
        if (row.__displayNo === undefined) {
          return <span className="text-[14px] text-[#111827]"></span>;
        }
        return <span className="text-[14px] text-[#111827]">{row.__displayNo}</span>;
      },
    },
    {
      key: "title",
      header: "제목",
      align: "left",
      className: "text-left",
      render: (row) => {
        const isPinned = row.__displayNo === '필독';
        const clickable = !(isPinned && !pinnedClickable);
        return (
          <div className="flex min-w-0 items-center gap-2">
            {!isPinned && row.category && (
              <CategoryBadge category={row.category} size="xs" />
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
      <BaseTable
        columns={columns}
        data={rows}
        rowKey={(r) => r.id}
        headRowClassName="bg-[#3B3F45] text-white text-center"
        zebra={false}
        // 모든 행에 동일한 hover 스타일 적용
        rowClassName={(row) => {
          const isPinned = row.__displayNo === '필독';
          const clickable = !(isPinned && !pinnedClickable);
          return `hover:bg-[#F8FAFF] ${clickable ? 'cursor-pointer' : ''}`;
        }}
        onRowClick={(row) => {
          const isPinned = row.__displayNo === '필독';
          const clickable = !(isPinned && !pinnedClickable);
          if (clickable) {
            onRowClick?.(row.id);
          }
        }}
      />

      {/* Mobile */}
      <ul className="md:hidden divide-y divide-[#F1F3F5]">
        {rows.map((row) => {
          const isPinned = row.__displayNo === '필독';
          const clickable = pinnedClickable || !isPinned;

          return (
            <li
              key={row.id}
              tabIndex={-1}
              className={[
                'px-2 py-3 transition-colors outline-none sm:px-4 active:bg-transparent focus:bg-transparent',
                // 모든 행에 동일한 스타일 적용
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
  );
}
