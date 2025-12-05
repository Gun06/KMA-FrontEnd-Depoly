// src/app/admin/galleries/_mockRepo.ts (예시 경로)
// 기존 파일 전체 교체

import type { Gallery, GalleryFilter, Paged } from "./types";

/** 'YYYY-MM-DD' → 'YYYY.MM.DD' */
const toDots = (s: string) => s.replaceAll("-", ".");

/** 오늘 'YYYY.MM.DD' */
const ymd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${da}`;
};

/** 메모리 DB: eventId -> Gallery */
const DB: Record<string, Gallery> = Object.create(null);


/** 이벤트 더미로부터 시드하기 (최초 1회) - 더미 데이터 제거됨 */
function ensureSeed() {
  // 더미 데이터 생성 로직 제거됨
  // DB는 빈 상태로 시작하며, 실제 데이터는 등록 기능을 통해 추가됨
}

/** 필요 시 강제 재시드용(개발 편의) - 더미 데이터 제거로 인해 빈 DB로 리셋만 수행 */
export function reseedFromEvents() {
  for (const k of Object.keys(DB)) delete DB[k];
}

/** 현재 최대 eventId + 1 반환 */
export function getNextEventId(): string {
  ensureSeed();
  const ids = Object.keys(DB).map(Number).filter(n => !Number.isNaN(n));
  const next = ids.length ? Math.max(...ids) + 1 : 1;
  return String(next);
}

/** 프리셋 ↔ 내부 필터 매핑 */
function normalizeFilter(f?: GalleryFilter) {
  if (!f) return f;

  const raw = (f as any).visible;
  const vis =
    raw === "open" || raw === "on" || raw === "공개" || raw === true
      ? "on"
      : raw === "closed" || raw === "off" || raw === "비공개" || raw === false
      ? "off"
      : undefined;

  return { ...f, visible: vis } as GalleryFilter;
}

function applyFilter(base: Gallery[], raw?: GalleryFilter) {
  const f = normalizeFilter(raw);
  let rows = [...base];

  if (f?.visible === "on") rows = rows.filter((r) => r.visible);
  else if (f?.visible === "off") rows = rows.filter((r) => !r.visible);

  const q = (f?.q ?? "").trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.tagName.toLowerCase().includes(q)
    );
  }

  const sort = (f?.sort ?? "no") as "no" | "date" | "title";
  if (sort === "no") rows.sort((a, b) => Number(b.eventId) - Number(a.eventId));
  else if (sort === "date") rows.sort((a, b) => b.date.localeCompare(a.date));
  else if (sort === "title") rows.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  return rows;
}

/** 리스트 */
export function getGalleries(page = 1, pageSize = 20, f?: GalleryFilter): Paged<Gallery> {
  ensureSeed();
  const base = Object.values(DB);
  const rows = applyFilter(base, f);
  const total = rows.length;

  const size = Math.max(1, pageSize | 0);
  const start = (Math.max(1, page | 0) - 1) * size;
  return { rows: rows.slice(start, start + size), total };
}

/** 단건 */
export function getGallery(eventId: string) {
  ensureSeed();
  return DB[eventId];
}

/** 생성/수정 */
export function upsertGallery(eventId: string, patch: Partial<Gallery>) {
  ensureSeed();

  const base: Gallery =
    DB[eventId] ??
    ({
      eventId,
      date: ymd(new Date()),
      tagName: "",
      title: "",
      googlePhotosUrl: "",
      visible: true,
      periodFrom: "",
      periodTo: "",
      views: 0,
    } as Gallery);

  const date =
    typeof patch.date === "string" && patch.date.trim()
      ? patch.date
      : base.date;

  const views =
    typeof patch.views === "number" ? patch.views : base.views;

  DB[eventId] = {
    ...base,
    ...patch,
    eventId,
    date,
    views,
  };
}

/** 삭제 */
export function deleteGallery(eventId: string) {
  ensureSeed();
  delete DB[eventId];
}
