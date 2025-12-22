// src/data/notice/types.ts
import type { RegStatus } from "@/components/common/Badge/RegistrationStatusBadge";

export type NoticeType = "match" | "event" | "notice" | "general";
export type Visibility = "open" | "closed";

export type NoticeFile = {
  id: string | number;
  name: string;
  sizeMB: number;
  url?: string;
  mime?: string;
};

export type NoticeFilter = {
  sort?: "new" | "hit";
  kind?: NoticeType;
  visibility?: Visibility;
  q?: string;
  year?: string;
  status?: RegStatus; // '접수중' | '접수마감' | '비접수'
};

export type NoticeEventRow = {
  id: number;
  type: NoticeType;
  title: string;           // YYYY.MM.DD 포맷의 제목 필드
  author: string;
  date: string;            // YYYY.MM.DD
  views: number;
  visibility?: Visibility;
  pinned?: boolean;
  files?: NoticeFile[];
  content?: string;
};

/** 🔹 메인 전용 타입: 기본 NoticeEventRow와 동일 */
export type NoticeMainRow = NoticeEventRow;