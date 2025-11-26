import type { NoticeEventRow, NoticeType, NoticeFile } from "@/types/notice";

// 더미 데이터용 Visibility 타입 (실제 API에서는 사용하지 않음)
type Visibility = "open" | "closed";

// ✅ 결정적 seed (서버/클라 동일) → Hydration 에러 방지
const seededViews = (key: string, n = 900) => {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  const x = Math.abs(h % n);
  return 100 + x;
};
const V = (eventId: string, id: number) => seededViews(`${eventId}-${id}`);

const ymd = (offset: number) => {
  const d = new Date(Date.now() - offset * 86400000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const pdf = (id: string, name: string, sizeMB: number): NoticeFile => ({
  id, name, sizeMB, mime: "application/pdf", url: "#",
});

// 전역 메모리 DB
const DB: Record<string, NoticeEventRow[]> = {};

const SEED_BY_EVENT: Record<string, NoticeEventRow[]> = {
  "25": [
    { id: 50, type: "notice",  title: "참가자 필독 안내문",    author: "Admin",  date: ymd(1), views: V("25",50), files: [pdf("p1","안내문.pdf",12)], content: "<p>집결 시간은 07:30입니다.</p>" },
    { id: 49, type: "notice",  title: "대회 일정 조정 안내",  author: "Admin",  date: ymd(2), views: V("25",49) },
    { id: 48, type: "event",   title: "기념품 사전 신청 오픈",author: "운영팀", date: ymd(3), views: V("25",48), files: [pdf("p3","굿즈 안내.pdf",5)] },
    { id: 47, type: "general", title: "게시판 이용 가이드",    author: "관리자", date: ymd(4), views: V("25",47) },
    { id: 46, type: "match",   title: "코스 및 주차 안내",     author: "운영팀", date: ymd(5), views: V("25",46), files: [pdf("p4","배치도.pdf",2)] },
  ],
  "5": [
    { id: 37, type: "match",   title: "집결 시간 공지",        author: "Admin",  date: ymd(3), views: V("5",37), files: [pdf("p7","집결 시간표.pdf",1)] },
    { id: 36, type: "event",   title: "포토존 이벤트",          author: "Staff",  date: ymd(5), views: V("5",36) },
  ],
};

function defaultSeed(eid: string): NoticeEventRow[] {
  return [
    { id: 10, type: "notice",  title: `${eid}번 대회 공지사항`, author: "Admin",  date: ymd(1), views: V(eid,10) },
    { id:  9, type: "event",   title: "현장 이벤트 안내",      author: "운영팀", date: ymd(2), views: V(eid,9) },
    { id:  8, type: "general", title: "자주 묻는 질문",         author: "운영팀", date: ymd(3), views: V(eid,8) },
    { id:  7, type: "match",   title: "코스/주차 안내",         author: "운영팀", date: ymd(4), views: V(eid,7) },
    { id:  6, type: "notice",  title: "안전 수칙 안내",         author: "Admin",  date: ymd(5), views: V(eid,6) },
  ];
}

function ensureEvent(eid: string) {
  if (!DB[eid]) {
    DB[eid] = (SEED_BY_EVENT[eid] ?? defaultSeed(eid)).slice().sort((a, b) => Number(b.id) - Number(a.id));
  }
}

const nextId = (eid: string) => {
  ensureEvent(eid);
  const list = DB[eid];
  return list.length ? Math.max(...list.map((r) => Number(r.id))) + 1 : 1;
};

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

export function getEventNoticeDetail(eventId: string | number, noticeId: string | number) {
  const eid = String(eventId);
  ensureEvent(eid);
  const nid = Number(noticeId);
  return DB[eid].find((r) => r.id === nid);
}

export function saveEventNotice(eventId: string | number, payload: NoticeEventRow) {
  const eid = String(eventId);
  ensureEvent(eid);
  const list = DB[eid];
  const idx = list.findIndex((r) => r.id === payload.id);
  if (idx >= 0)
    list[idx] = { ...list[idx], ...payload };
  return list[idx];
}

export function createEventNotice(
  eventId: string | number,
  payload: Omit<NoticeEventRow, "id" | "date" | "views"> & { id?: number },
) {
  const eid = String(eventId);
  ensureEvent(eid);

  const id = payload.id ?? nextId(eid);
  const row: NoticeEventRow = {
    id,
    type: payload.type,
    title: payload.title,
    author: payload.author,
    date: ymd(0),
    views: 0,
    // visibility 속성 제거 (NoticeEventRow에 없음)
    files: payload.files ?? [],
    content: payload.content ?? "",
  };
  DB[eid] = [row, ...DB[eid]];
  return row;
}

export function deleteEventNotice(eventId: string | number, noticeId: number) {
  const eid = String(eventId);
  ensureEvent(eid);
  DB[eid] = DB[eid].filter((r) => r.id !== noticeId);
}
