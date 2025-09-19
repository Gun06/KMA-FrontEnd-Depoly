import { NoticeItem } from "@/components/common/Table/types";

// 대회별 문의사항 데이터
export interface EventQnaItem extends NoticeItem {
  eventId: string;
}

export const eventQnaData: EventQnaItem[] = [
  // marathon2025 문의사항
  { id: 1, eventId: "marathon2025", category: "문의", title: "2025 청주 마라톤 참가비 결제 오류가 발생합니다.", author: "김철수", date: "2025-01-20", attachments: 1, views: 25 },
  { id: 2, eventId: "marathon2025", category: "문의", title: "대회 신청 취소 및 환불은 어떻게 하나요?", author: "이영희", date: "2025-01-18", attachments: 0, views: 42 },
  { id: 3, eventId: "marathon2025", category: "문의", title: "마라톤 코스 난이도와 고도 정보를 알고 싶습니다.", author: "박민수", date: "2025-01-15", attachments: 0, views: 38 },
  { id: 4, eventId: "marathon2025", category: "문의", title: "대회 당일 응급상황 발생 시 대처 방안이 궁금합니다.", author: "최수정", date: "2025-01-12", attachments: 0, views: 31 },
  { id: 5, eventId: "marathon2025", category: "문의", title: "참가자 번호표 수령 장소와 시간을 알려주세요.", author: "홍길동", date: "2025-01-10", attachments: 0, views: 56 },
  { id: 6, eventId: "marathon2025", category: "문의", title: "기록 측정 방식과 기록증 발급은 어떻게 되나요?", author: "정다은", date: "2025-01-08", attachments: 0, views: 29 },
  { id: 7, eventId: "marathon2025", category: "문의", title: "대회 당일 날씨가 좋지 않으면 어떻게 되나요?", author: "박재현", date: "2025-01-05", attachments: 0, views: 47 },
  { id: 8, eventId: "marathon2025", category: "문의", title: "마라톤 완주 후 기념품은 언제 받을 수 있나요?", author: "윤소희", date: "2025-01-03", attachments: 0, views: 33 },
  { id: 9, eventId: "marathon2025", category: "문의", title: "참가자 주차장 이용료와 예약 방법을 알려주세요.", author: "조민수", date: "2024-12-30", attachments: 0, views: 41 },
  { id: 10, eventId: "marathon2025", category: "문의", title: "대회 참가 전 건강검진서 제출이 필수인가요?", author: "김하늘", date: "2024-12-28", attachments: 0, views: 28 },
  { id: 11, eventId: "marathon2025", category: "문의", title: "마라톤 코스 중간에 급수대는 몇 개나 있나요?", author: "이도윤", date: "2024-12-25", attachments: 0, views: 35 },
  { id: 12, eventId: "marathon2025", category: "문의", title: "대회 당일 교통편과 셔틀버스 이용 방법", author: "서지원", date: "2024-12-22", attachments: 0, views: 52 },
  { id: 13, eventId: "marathon2025", category: "문의", title: "마라톤 참가자 명단 확인은 어디서 할 수 있나요?", author: "이세진", date: "2024-12-20", attachments: 0, views: 19 },
  { id: 14, eventId: "marathon2025", category: "문의", title: "대회 사진 촬영 서비스 이용료는 얼마인가요?", author: "최영훈", date: "2024-12-18", attachments: 0, views: 24 },
  { id: 15, eventId: "marathon2025", category: "문의", title: "마라톤 대회 후 부대행사 참여는 어떻게 하나요?", author: "박서연", date: "2024-12-15", attachments: 0, views: 17 },
  { id: 16, eventId: "marathon2025", category: "문의", title: "대회 당일 응원 가족들의 관람석은 있나요?", author: "김민지", date: "2024-12-12", attachments: 0, views: 43 },
  { id: 17, eventId: "marathon2025", category: "문의", title: "마라톤 참가 후 기록 인증은 언제 가능한가요?", author: "이준호", date: "2024-12-10", attachments: 0, views: 26 },
  { id: 18, eventId: "marathon2025", category: "문의", title: "대회 전날 컨디션 관리 방법을 조언해주세요.", author: "박예진", date: "2024-12-08", attachments: 0, views: 38 },
  { id: 19, eventId: "marathon2025", category: "문의", title: "마라톤 참가비에 포함된 항목들이 무엇인가요?", author: "정우성", date: "2024-12-05", attachments: 0, views: 31 },
  { id: 20, eventId: "marathon2025", category: "문의", title: "대회 중 부상 발생 시 의료진 지원은 어떻게 되나요?", author: "한소영", date: "2024-12-03", attachments: 0, views: 22 },

  // 다른 대회 예시 데이터 (확장 가능)
  { id: 21, eventId: "example2026", category: "문의", title: "2026 예시 마라톤 참가 조건을 알려주세요.", author: "김예시", date: "2025-01-25", attachments: 0, views: 15 },
  { id: 22, eventId: "example2026", category: "문의", title: "2026 예시 마라톤 코스 정보를 확인하고 싶습니다.", author: "이예시", date: "2025-01-23", attachments: 0, views: 12 },

  // eventId "101"에 대한 더미 데이터
  { id: 23, eventId: "101", category: "문의", title: "대회 참가 신청 방법을 알려주세요.", author: "김참가", date: "2025-01-25", attachments: 0, views: 18 },
  { id: 24, eventId: "101", category: "문의", title: "참가비 결제는 언제까지 해야 하나요?", author: "이결제", date: "2025-01-24", attachments: 0, views: 25 },
  { id: 25, eventId: "101", category: "문의", title: "대회 코스 정보를 확인하고 싶습니다.", author: "박코스", date: "2025-01-23", attachments: 0, views: 22 },
  { id: 26, eventId: "101", category: "문의", title: "참가자 명단은 언제 공개되나요?", author: "최명단", date: "2025-01-22", attachments: 0, views: 19 },
  { id: 27, eventId: "101", category: "문의", title: "대회 당일 날씨가 좋지 않으면 어떻게 되나요?", author: "정날씨", date: "2025-01-21", attachments: 0, views: 31 },
  { id: 28, eventId: "101", category: "문의", title: "참가자 주차장 이용은 가능한가요?", author: "한주차", date: "2025-01-20", attachments: 0, views: 16 },
  { id: 29, eventId: "101", category: "문의", title: "대회 중 부상 발생 시 의료 지원은?", author: "김의료", date: "2025-01-19", attachments: 0, views: 28 },
  { id: 30, eventId: "101", category: "문의", title: "완주 후 기념품은 언제 받을 수 있나요?", author: "이기념", date: "2025-01-18", attachments: 0, views: 24 },
  { id: 31, eventId: "101", category: "문의", title: "참가자 번호표 수령 방법은?", author: "박번호", date: "2025-01-17", attachments: 0, views: 21 },
  { id: 32, eventId: "101", category: "문의", title: "대회 사진 촬영 서비스가 있나요?", author: "최사진", date: "2025-01-16", attachments: 0, views: 17 },
];

export function fetchEventQna(eventId: string, page: number, pageSize: number) {
  const eventQnaItems = eventQnaData.filter(qna => qna.eventId === eventId);
  const total = eventQnaItems.length;
  const start = (page - 1) * pageSize;
  const rows = eventQnaItems.slice(start, start + pageSize);
  return { rows, total };
}

export function getEventQnaById(eventId: string, id: number): EventQnaItem | undefined {
  return eventQnaData.find(qna => qna.eventId === eventId && qna.id === id);
}

export function getEventQnaByCategory(eventId: string, category: string) {
  return eventQnaData.filter(qna => 
    qna.eventId === eventId && 
    (category === 'all' || qna.category === category)
  );
}
