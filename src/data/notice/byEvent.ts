import type { NoticeEventRow, NoticeFilter } from "./types";

const DB: Record<string, NoticeEventRow[]> = {
  "101": [
    { id: 321, type: "notice",  title: "[안내] 대회 당일 입장 동선", author: "Admin", date: "2025.08.05", views: 121, visibility: "open" },
    { id: 320, type: "event",   title: "이벤트 안내",                author: "Admin", date: "2025.08.04", views:  91, visibility: "open" },
    { id: 318, type: "match",   title: "대회 진행 일정 공지",        author: "Staff", date: "2025.08.02", views:  77, visibility: "closed" },
  ],
  "102": [
    { id: 305, type: "match",   title: "대회 안내 사항",              author: "Admin", date: "2025.08.03", views: 45, visibility: "open" },
  ],
};

export function getEventNotices(eventId: string, filter?: NoticeFilter) {
  const q = (filter?.q ?? "").trim().toLowerCase();
  const visibility = filter?.visibility;
  const kind = filter?.kind;
  const sort = filter?.sort ?? "new";

  let rows = [...(DB[eventId] ?? [])];

  if (kind) rows = rows.filter(r => r.type === kind);
  if (visibility) rows = rows.filter(r => (visibility === "open" ? r.visibility !== "closed" : r.visibility === "closed"));

  if (q) {
    rows = rows.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q) ||
      r.date.toLowerCase().includes(q)
    );
  }

  if (sort === "new") rows.sort((a, b) => b.date.localeCompare(a.date));
  if (sort === "hit") rows.sort((a, b) => b.views - a.views);

  return rows;
}
