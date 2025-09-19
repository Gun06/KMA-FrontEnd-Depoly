// src/components/ui/Table/NoticeTable.tsx
import { useMemo } from 'react';
import CategoryBadge from '@/components/common/Badge/CategoryBadge';
import BaseTable, { Column } from './BaseTable';
import type { NoticeItem } from './types';

type Props = {
  data: NoticeItem[];
  onRowClick?: (id: number) => void;
  pinLimit?: number;
  numberDesc?: boolean;
  showPinnedBadgeInNo?: boolean;
  pinnedClickable?: boolean;
};

type DisplayRow = NoticeItem & { __displayNo: number | '공지' };

export default function NoticeTable({
  data,
  onRowClick,
  pinLimit = 3,
  numberDesc = true,
  showPinnedBadgeInNo = true,
  pinnedClickable = true,
}: Props) {
  const rows = useMemo<DisplayRow[]>(() => {
    const autoPinned = data.map((row) =>
      row.category === '공지' ? { ...row, pinned: true } : row
    );
    const pinned = autoPinned.filter((r) => r.pinned);
    const effectivePinned = pinLimit ? pinned.slice(0, pinLimit) : pinned;
    const pinnedIdSet = new Set(effectivePinned.map((r) => r.id));
    const nonPinned = autoPinned.filter((r) => !pinnedIdSet.has(r.id));

    const totalNonPinned = nonPinned.length;
    const idNoPairs = numberDesc
      ? nonPinned.map((r, idx) => [r.id, totalNonPinned - idx] as const)
      : nonPinned.map((r, idx) => [r.id, idx + 1] as const);

    const nonPinnedIndexMap = new Map<number, number>(idNoPairs);
    const sorted = [...effectivePinned, ...nonPinned];

    return sorted.map((row) => {
      if (pinnedIdSet.has(row.id)) return { ...row, __displayNo: '공지' as const };
      const displayNo = nonPinnedIndexMap.get(row.id) ?? 0;
      return { ...row, __displayNo: displayNo };
    });
  }, [data, pinLimit, numberDesc]);

  const handleRowKeyDown =
    (id: number, clickable: boolean) =>
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
        const isPinned = row.__displayNo === '공지';
        if (isPinned) {
          return showPinnedBadgeInNo ? (
            <div className="flex items-center justify-center">
              <CategoryBadge category={row.category ?? '공지'} size="md" />
            </div>
          ) : (
            <span className="inline-block w-4 h-4" />
          );
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
        const isPinned = row.__displayNo === '공지';
        const clickable = !(isPinned && !pinnedClickable);
        return (
          <div className="flex min-w-0 items-center gap-2">
            {!isPinned && row.category && (
              <CategoryBadge category={row.category} size="xs" />
            )}
            <span
              className="text-[15px] text-[#0F1113] truncate cursor-pointer hover:underline"
              title={row.title}
              onClick={() => clickable && onRowClick?.(row.id)}
              tabIndex={0}
              onKeyDown={handleRowKeyDown(row.id, clickable)}
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
      key: "attachments",
      header: "첨부",
      width: 100,
      align: "center",
      className: "text-[#6B7280]",
    },
    {
      key: "views",
      header: "조회수",
      width: 100,
      align: "center",
      className: "text-[#6B7280]",
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
        rowClassName={() => 'hover:bg-[#F8FAFF]'}
      />

      {/* Mobile */}
      <ul className="md:hidden divide-y divide-[#F1F3F5]">
        {rows.map((row) => {
          const isPinned = row.__displayNo === '공지';
          const clickable = pinnedClickable || !isPinned;

          return (
            <li
              key={row.id}
              tabIndex={-1}
              className={[
                'px-2 py-3 transition-colors outline-none sm:px-4 active:bg-transparent focus:bg-transparent',
                // 모든 행에 동일한 스타일 적용
                'bg-white hover:bg-[#F8FAFF]',
              ].join(' ')}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-[40px_1fr] gap-3 items-start">
                <div className="h-6 flex items-center justify-center">
                  <CategoryBadge category={row.category ?? '공지'} size="xs" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[15px] leading-[22px] text-[#0F1113] line-clamp-2 cursor-pointer hover:underline"
                      tabIndex={0}
                      onClick={() => clickable && onRowClick?.(row.id)}
                      onKeyDown={handleRowKeyDown(row.id, clickable)}
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
