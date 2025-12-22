import type { NoticeEventRow, NoticeType } from "@/types/notice";

// 더미 데이터용 Visibility 타입 (실제 API에서는 사용하지 않음)
type Visibility = "open" | "closed";

// 전역 메모리 DB
const DB: Record<string, NoticeEventRow[]> = {};

function ensureEvent(eid: string) {
  if (!DB[eid]) {
    DB[eid] = [];
  }
}


export type EventNoticeFilter = {
  sort?: "new" | "hit" | "name";
  kind?: NoticeType;
  visibility?: Visibility;
  q?: string;
};

export function fetchEventNotices(
  eventId: number | string,
  page: number,
  pageSize: number,
  filter?: EventNoticeFilter,
) {
  const eid = String(eventId);
  ensureEvent(eid);

  let rows = [...DB[eid]];
  const q = (filter?.q ?? "").trim().toLowerCase();

  if (filter?.kind) rows = rows.filter((r) => r.type === filter.kind);
  // visibility 필터 제거 (NoticeEventRow에 visibility 속성이 없음)
  if (q) rows = rows.filter((r) => r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q));

  const sort = filter?.sort ?? "new";
  if (sort === "new") rows.sort((a, b) => b.date.localeCompare(a.date));
  else if (sort === "name") rows.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  else if (sort === "hit") rows.sort((a, b) => b.views - a.views);

  const all = rows;
  const total = all.length;
  const start = (page - 1) * pageSize;
  return { rows: all.slice(start, start + pageSize), total };
}
