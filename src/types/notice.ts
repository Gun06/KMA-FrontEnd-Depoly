// src/types/notice.ts
import type { RegStatus } from "@/components/common/Badge/RegistrationStatusBadge";

export type NoticeType = "match" | "event" | "notice" | "general";

export type NoticeFile = {
  id: string | number;
  name: string;
  sizeMB: number;
  url?: string;
  mime?: string;
  file?: File; // 실제 File 객체 추가
};

export type NoticeFilter = {
  sort?: "new" | "hit";
  kind?: NoticeType;
  q?: string;
  year?: string;
  status?: RegStatus; // '접수중' | '접수마감' | '비접수'
};

export type NoticeEventRow = {
  id: number | string;      // UUID 문자열 또는 숫자 ID 지원
  type: NoticeType;
  title: string;           // YYYY.MM.DD 포맷의 제목 필드
  author: string;
  date: string;            // YYYY.MM.DD
  views: number;
  files?: NoticeFile[];
  content?: string;
};

/** 🔹 메인 전용 타입: 기본 NoticeEventRow와 동일 */
export type NoticeMainRow = NoticeEventRow;
