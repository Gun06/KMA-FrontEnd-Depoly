import { NoticeItem } from "@/components/common/Table/types";

// 대회별 공지사항 데이터
export interface EventNoticeItem extends NoticeItem {
  eventId: string;
}

export const eventNoticeData: EventNoticeItem[] = [
  // marathon2025 공지사항
  { id: "1", eventId: "marathon2025", category: "공지", title: "2025 청주 마라톤 대회 코스 변경 안내", author: "대회운영팀", date: "2025-01-20", attachments: 2, views: 345, pinned: true },
  { id: "2", eventId: "marathon2025", category: "공지", title: "참가자 안전 수칙 및 응급상황 대처 방안", author: "안전관리팀", date: "2025-01-18", attachments: 1, views: 289, pinned: true },
  { id: "3", eventId: "marathon2025", category: "공지", title: "대회 당일 교통편 및 셔틀버스 운행 안내", author: "교통관리팀", date: "2025-01-15", attachments: 3, views: 512, pinned: true },
  { id: "4", eventId: "marathon2025", category: "이벤트", title: "대회 기념품 및 완주메달 디자인 공개", author: "기념품팀", date: "2025-01-12", attachments: 0, views: 178 },
  { id: "5", eventId: "marathon2025", category: "대회", title: "참가자 번호표 수령 및 물품 지급 안내", author: "등록관리팀", date: "2025-01-10", attachments: 1, views: 234 },
  { id: "6", eventId: "marathon2025", category: "공지", title: "날씨 변화에 따른 대회 진행 계획", author: "대회운영팀", date: "2025-01-08", attachments: 0, views: 156 },
  { id: "7", eventId: "marathon2025", category: "이벤트", title: "마라톤 사진 촬영 서비스 및 온라인 갤러리", author: "미디어팀", date: "2025-01-05", attachments: 0, views: 89 },
  { id: "8", eventId: "marathon2025", category: "대회", title: "급수대 위치 및 보급품 안내", author: "보급관리팀", date: "2025-01-03", attachments: 2, views: 267 },
  { id: "9", eventId: "marathon2025", category: "공지", title: "의료진 배치 및 응급처치소 위치 안내", author: "의료팀", date: "2024-12-30", attachments: 1, views: 198 },
  { id: "10", eventId: "marathon2025", category: "이벤트", title: "대회 전후 이벤트 및 부대행사 안내", author: "이벤트팀", date: "2024-12-28", attachments: 0, views: 123 },
  { id: "11", eventId: "marathon2025", category: "대회", title: "참가자 주차장 및 주차 요금 안내", author: "시설관리팀", date: "2024-12-25", attachments: 1, views: 301 },
  { id: "12", eventId: "marathon2025", category: "공지", title: "대회 취소 및 환불 정책 안내", author: "고객지원팀", date: "2024-12-22", attachments: 0, views: 145 },
  { id: "13", eventId: "marathon2025", category: "이벤트", title: "마라톤 완주 인증서 발급 및 기록 확인", author: "기록관리팀", date: "2024-12-20", attachments: 0, views: 87 },
  { id: "14", eventId: "marathon2025", category: "대회", title: "대회 당일 일정 및 시간표 안내", author: "일정관리팀", date: "2024-12-18", attachments: 2, views: 423 },
  { id: "15", eventId: "marathon2025", category: "공지", title: "참가자 건강검진 및 의료진단서 제출", author: "의료팀", date: "2024-12-15", attachments: 1, views: 167 },

  // 다른 대회 예시 데이터 (확장 가능)
  { id: "16", eventId: "example2026", category: "공지", title: "2026 예시 마라톤 대회 개최 안내", author: "대회기획팀", date: "2025-01-25", attachments: 1, views: 45, pinned: true },
  { id: "17", eventId: "example2026", category: "대회", title: "2026 예시 마라톤 참가 신청 방법", author: "등록팀", date: "2025-01-23", attachments: 0, views: 32 },
];

export function fetchEventNotices(eventId: string, page: number, pageSize: number) {
  const eventNotices = eventNoticeData.filter(notice => notice.eventId === eventId);
  const total = eventNotices.length;
  const start = (page - 1) * pageSize;
  const rows = eventNotices.slice(start, start + pageSize);
  return { rows, total };
}

export function getEventNoticeById(eventId: string, id: string): EventNoticeItem | undefined {
  return eventNoticeData.find(notice => notice.eventId === eventId && notice.id === id);
}

export function getEventNoticesByCategory(eventId: string, category: string) {
  return eventNoticeData.filter(notice => 
    notice.eventId === eventId && 
    (category === 'all' || notice.category === category)
  );
}
