// src/data/notice/main.ts
import type { NoticeFilter, NoticeMainRow, NoticeType, Visibility, NoticeFile } from "./types";

// 25개 더미 (이미 있다면 그대로 사용)
const MAIN: NoticeMainRow[] = [
  { id: 555, type: "notice", title: "전국마라톤협회 사이트", author: "Admin", date: "2025.08.25", views: 412 },
  { id: 554, type: "event",  title: "2025 전마협 부산 바다런",       author: "Admin", date: "2025.08.24", views: 198 },
  { id: 553, type: "match",  title: "2025 대구 국제 하프",          author: "Staff", date: "2025.08.23", views: 167 },
  { id: 552, type: "event",  title: "2025 전마협 제주 4Full",        author: "Admin", date: "2025.08.22", views: 241 },
  { id: 551, type: "notice", title: "서버 점검 안내 (8/21 02:00)",   author: "Editor",date: "2025.08.21", views: 305 },
  { id: 550, type: "event",  title: "2025 울산 싱크로드 10K",        author: "Staff", date: "2025.08.20", views: 129 },
  { id: 549, type: "match",  title: "2025 서울 국제 마라톤",         author: "Staff", date: "2025.08.19", views: 344 },
  { id: 548, type: "notice", title: "개인정보 처리방침 개정",        author: "Admin", date: "2025.08.18", views: 221 },
  { id: 547, type: "event",  title: "2025 광주 무등하프",            author: "Admin", date: "2025.08.17", views: 114 },
  { id: 546, type: "event",  title: "2025 인천 바람길 5K",           author: "Staff", date: "2025.08.16", views: 88 },
  { id: 545, type: "notice", title: "참가자 보험 안내",              author: "Editor",date: "2025.08.15", views: 276 },
  { id: 544, type: "match",  title: "2025 춘천 레이크 마라톤",       author: "Staff", date: "2025.08.14", views: 194 },
  { id: 543, type: "event",  title: "2025 전마협 대전 하프",         author: "Admin", date: "2025.08.13", views: 132 },
  { id: 542, type: "notice", title: "기록증 발급 지연 안내",         author: "Admin", date: "2025.08.12", views: 257 },
  { id: 541, type: "event",  title: "2025 포항 블루웨이 10K",        author: "Staff", date: "2025.08.11", views: 97 },
  { id: 540, type: "match",  title: "2025 부산 마린 풀코스",         author: "Staff", date: "2025.08.10", views: 318 },
  { id: 539, type: "notice", title: "모바일 앱 출시 예정",           author: "Editor",date: "2025.08.09", views: 289 },
  { id: 538, type: "event",  title: "2025 수원 성곽 하프",           author: "Admin", date: "2025.08.08", views: 121 },
  { id: 537, type: "event",  title: "2025 김해 가야런 5K",           author: "Staff", date: "2025.08.07", views: 84,  visibility: "open" },
  { id: 536, type: "notice", title: "단체접수 안내 (가이드)",        author: "Admin", date: "2025.08.06", views: 233 },
  { id: 535, type: "notice", title: "전국마라톤협회 사이트",         author: "Admin", date: "2025.08.05", views: 312 },
  { id: 534, type: "event",  title: "2025 전마협 제주 4Full",        author: "Admin", date: "2025.08.04", views: 91,  visibility: "open" },
  { id: 533, type: "match",  title: "2025 대전 시티 마라톤",         author: "Staff", date: "2025.08.03", views: 173 },
  { id: 532, type: "match",  title: "2025 서울 국제 마라톤 예선",    author: "Staff", date: "2025.08.02", views: 159 },
  { id: 531, type: "event",  title: "2025 전주 한옥마을 10K",        author: "Admin", date: "2025.08.01", views: 106 },
];

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

export function fetchNoticeOverview(
  page = 1,
  pageSize = 20,
  filter?: NoticeFilter
): { rows: NoticeMainRow[]; total: number } {
  const all = getMainNotices(filter);
  const total = all.length;
  const start = Math.max(0, (page - 1) * pageSize);
  const end = start + pageSize;
  return { rows: all.slice(start, end), total };
}

// ✅ 메인 상세 조회 (내용/파일 포함)
export function getMainNoticeDetail(noticeId: string | number) {
  const idNum = Number(noticeId);
  return MAIN.find((r) => r.id === idNum);
}

// ✅ 메인 등록
export function createMainNotice(payload: {
  type: NoticeType;
  title: string;
  author: string;
  visibility: Visibility;
  pinned?: boolean;
  content?: string;
  files?: NoticeFile[];
}) {
  const nextId = (MAIN[0]?.id ?? 0) + 1;
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");

  MAIN.unshift({
    id: nextId,
    type: payload.type,
    title: payload.title,
    author: payload.author,
    date: `${y}.${m}.${d}`,
    views: 0,
    visibility: payload.visibility,
    pinned: !!payload.pinned,
    content: payload.content,
    files: payload.files ?? [],
  });

  return nextId;
}

// ✅ 메인 삭제(이미 사용 중)
export function deleteMainNotice(id: number) {
  const idx = MAIN.findIndex((r) => r.id === id);
  if (idx >= 0) MAIN.splice(idx, 1);
}
export function saveMainNotice(
  noticeId: string | number,
  patch: { type: NoticeType; title: string; visibility: Visibility; pinned?: boolean; content?: string; files?: NoticeFile[] }
) {
  const id = Number(noticeId);
  const it = MAIN.find((r) => r.id === id);
  if (!it) return;
  it.type = patch.type;
  it.title = patch.title;
  it.visibility = patch.visibility;
  if ('pinned' in it) it.pinned = !!patch.pinned;
  if ('content' in it) it.content = patch.content ?? it.content ?? "";
  if ('files' in it) it.files = patch.files ?? it.files ?? [];
}