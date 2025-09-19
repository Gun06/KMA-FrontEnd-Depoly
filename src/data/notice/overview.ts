// src/data/notice/overview.ts
import type { ApplicantListRow } from "@/components/admin/applications/ApplicantEventListTable";
import { MOCK_EVENTS } from "@/data/events";
import type { NoticeFilter } from "./types";
import { buildEventUrl } from "@/utils/url";
import type { RegStatus } from "@/components/common/Badge/RegistrationStatusBadge";

/** Event -> ApplicantListRow 매핑 (테이블 스키마에 정확히 맞춤) */
function toRow(e: (typeof MOCK_EVENTS)[number]): ApplicantListRow {
  return {
    id: e.id,            // 번호
    date: e.date,        // YYYY-MM-DD (렌더에서 [YYYY.MM.DD]로 변환)
    title: e.title,      // 대회명
    applyStatus: e.applyStatus as RegStatus,
    isPublic: e.isPublic,
    url: buildEventUrl(e.id), // 공개 사이트의 대회 URL로 통일
  };
}

/** 목록/검색/필터/정렬 + 페이징 */
export function fetchNoticeOverview(
  page: number,
  pageSize: number,
  filter?: NoticeFilter
) {
  const qRaw = (filter?.q ?? "").trim();
  // 날짜 검색 편의: 사용자가 '.'로 검색해도 매칭되게 '.'→'-' 정규화
  const q = qRaw.replace(/\./g, "-").toLowerCase();

  const sort = filter?.sort ?? "new";            // "new" | "hit"
  const visibility = filter?.visibility;         // "open" | "closed"
  const status = filter?.status;                 // '접수중' | '접수마감' | '비접수'
  const year = (filter?.year ?? "").trim();      // "2025" 같은 4자리

  // 1) 원천 rows
  let rows: ApplicantListRow[] = MOCK_EVENTS.map(toRow);

  // 2) 공개여부 필터
  if (visibility) {
    const want = visibility === "open";
    rows = rows.filter(r => r.isPublic === want);
  }

  // 3) 신청상태 필터
  if (status) {
    rows = rows.filter(r => r.applyStatus === status);
  }

  // 4) 년도 필터
  if (year) {
    rows = rows.filter(r => r.date.startsWith(`${year}-`));
  }

  // 5) 검색 (대회날짜/대회명/URL)
  if (q) {
    rows = rows.filter(r => {
      const date = r.date.toLowerCase();
      const title = r.title.toLowerCase();
      const url = r.url.toLowerCase();
      return date.includes(q) || title.includes(q) || url.includes(q);
    });
  }

  // 6) 정렬
  if (sort === "new") {
    rows.sort((a, b) => b.date.localeCompare(a.date)); // YYYY-MM-DD 문자열 정렬 OK
  }
  // "hit"은 개념이 없어서(이 화면) 필요 시 다른 기준 추가

  // 7) 페이징
  const total = rows.length;
  const start = (page - 1) * pageSize;
  const sliced = rows.slice(start, start + pageSize);

  return { rows: sliced, total };
}
