import { NoticeItem } from "@/components/common/Table/types";

export const noticeData: NoticeItem[] = [
  { id: "1", category: "공지", title: "2025년 전국마라톤협회 대회 일정 안내", author: "관리자", date: "2025-01-15", attachments: 2, views: 156, pinned: true },
  { id: "2", category: "공지", title: "마라톤 참가자 안전 수칙 및 준비사항", author: "관리자", date: "2025-01-10", attachments: 1, views: 89, pinned: true },
  { id: "3", category: "공지", title: "2024년 마라톤 대회 결과 및 시상식 안내", author: "관리자", date: "2025-01-05", attachments: 3, views: 234, pinned: true },
  { id: "4", category: "이벤트", title: "겨울 마라톤 훈련 프로그램 참가자 모집", author: "이벤트팀", date: "2025-01-12", attachments: 0, views: 67 },
  { id: "5", category: "대회", title: "2025년 봄 마라톤 대회 사전 신청 안내", author: "대회팀", date: "2025-01-08", attachments: 1, views: 123 },
  { id: "6", category: "공지", title: "마라톤 코스 변경 및 교통편 안내", author: "관리자", date: "2025-01-03", attachments: 2, views: 78 },
  { id: "7", category: "이벤트", title: "마라톤 사진 공모전 수상작 발표", author: "문화팀", date: "2024-12-28", attachments: 0, views: 45 },
  { id: "8", category: "대회", title: "2025년 하반기 마라톤 대회 일정 예고", author: "대회팀", date: "2024-12-25", attachments: 1, views: 92 },
  { id: "9", category: "공지", title: "마라톤 참가비 결제 방법 및 환불 정책", author: "관리자", date: "2024-12-20", attachments: 0, views: 134 },
  { id: "10", category: "이벤트", title: "마라톤 동호인 모임 및 네트워킹 행사", author: "문화팀", date: "2024-12-18", attachments: 0, views: 56 },
  { id: "11", category: "대회", title: "2025년 겨울 마라톤 대회 참가자 모집", author: "대회팀", date: "2024-12-15", attachments: 2, views: 167 },
  { id: "12", category: "공지", title: "마라톤 기록 측정 및 인증 시스템 개선", author: "기술팀", date: "2024-12-10", attachments: 1, views: 88 },
  { id: "13", category: "이벤트", title: "마라톤 관련 도서 및 자료 추천", author: "문화팀", date: "2024-12-08", attachments: 0, views: 34 },
  { id: "14", category: "대회", title: "2025년 전국 마라톤 챔피언십 안내", author: "대회팀", date: "2024-12-05", attachments: 3, views: 198 },
  { id: "15", category: "공지", title: "마라톤 참가자 건강검진 및 의료 지원", author: "의료팀", date: "2024-12-01", attachments: 1, views: 76 },
];

export function fetchNotices(page: number, pageSize: number) {
  const total = noticeData.length;
  const start = (page - 1) * pageSize;
  const rows = noticeData.slice(start, start + pageSize);
  return { rows, total };
}
