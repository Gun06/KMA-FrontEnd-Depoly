// src/data/notice/main.ts
import type { NoticeFilter, NoticeMainRow } from "./types";

const MAIN: NoticeMainRow[] = [];

// 검색/정렬 필터(전체 목록 반환)
// 리스트 필터/정렬
export function getMainNotices(filter?: NoticeFilter): NoticeMainRow[] {
  const q = (filter?.q ?? "").trim().toLowerCase();
  const visibility = filter?.visibility;
  const kind = filter?.kind;
  const sort = filter?.sort ?? "new";

  let rows = [...MAIN];
  if (kind) rows = rows.filter((r) => r.type === kind);
  if (visibility)
    rows = rows.filter((r) =>
      visibility === "open" ? r.visibility !== "closed" : r.visibility === "closed"
    );

  if (q) {
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q)
    );
  }

  if (sort === "new") rows.sort((a, b) => b.date.localeCompare(a.date));
  if (sort === "hit") rows.sort((a, b) => b.views - a.views);

  return rows;
}