// src/data/events.ts
import type { EventRow } from '@/components/admin/events/EventTable';

/**
 * 관리자-대회관리 & 참가신청(대회목록) 공용 더미 데이터
 */
export const MOCK_EVENTS: EventRow[] = [
  {
    id: '25',
    date: '2025-12-28',
    title: '2025 남원 춘향 전국 마라톤 대회',
    titleEn: '2025 Namwon Chunhyang National Marathon', // 🔹 상세에서만 사용
    place: '남원 종합 축구 운동장',
    host: '남원시체육회',
    applyStatus: '접수중',
    isPublic: true,
  },
  { id: '24', date: '2025-12-21', title: '2025 목포 해양 마라톤', place: '목포 종합운동장', host: '목포시체육회', applyStatus: '접수마감', isPublic: false },
  { id: '23', date: '2025-12-14', title: '2025 진주 남강 마라톤', place: '진주 종합운동장', host: '진주시체육회', applyStatus: '비접수', isPublic: true },
  { id: '22', date: '2025-11-30', title: '2025 천안 흥타령 마라톤', place: '천안 종합운동장', host: '천안시체육회', applyStatus: '접수중', isPublic: false },
  { id: '21', date: '2025-11-16', title: '2025 밀양 아리랑 마라톤', place: '밀양 종합운동장', host: '밀양군체육회', applyStatus: '접수마감', isPublic: true },
  { id: '20', date: '2025-11-02', title: '2025 통영 바다 마라톤', place: '통영 종합운동장', host: '통영시체육회', applyStatus: '비접수', isPublic: false },
  { id: '19', date: '2025-10-19', title: '2025 함양 산삼 마라톤', place: '함양 종합운동장', host: '함양군체육회', applyStatus: '접수중', isPublic: true },
  { id: '18', date: '2025-10-05', title: '2025 군산 시간여행 마라톤', place: '군산 월명 종합운동장', host: '군산시체육회', applyStatus: '접수마감', isPublic: false },
  { id: '17', date: '2025-09-21', title: '2025 여수 밤바다 마라톤', place: '여수 종합운동장', host: '여수시체육회', applyStatus: '비접수', isPublic: true },
  { id: '16', date: '2025-09-07', title: '2025 평창 대관령 마라톤', place: '평창 알펜시아 스타디움', host: '평창군체육회', applyStatus: '접수중', isPublic: false },
  { id: '15', date: '2025-08-24', title: '2025 청주 직지 마라톤', place: '청주 종합운동장', host: '청주시체육회', applyStatus: '접수마감', isPublic: true },
  { id: '14', date: '2025-08-10', title: '2025 김해 가야 마라톤', place: '김해 종합운동장', host: '김해시체육회', applyStatus: '비접수', isPublic: false },
  { id: '13', date: '2025-07-27', title: '2025 포항 호미곶 마라톤', place: '포항 종합운동장', host: '포항시체육회', applyStatus: '접수중', isPublic: true },
  { id: '12', date: '2025-07-13', title: '2025 속초 설악 마라톤', place: '속초 종합운동장', host: '속초시체육회', applyStatus: '접수마감', isPublic: false },
  { id: '11', date: '2025-06-29', title: '2025 전주 한지 마라톤', place: '전주 종합운동장', host: '전주시체육회', applyStatus: '비접수', isPublic: true },
  { id: '10', date: '2025-06-15', title: '2025 수원 화성 마라톤', place: '수원 종합운동장', host: '수원시체육회', applyStatus: '접수중', isPublic: false },
  { id: '9',  date: '2025-06-01', title: '2025 대전 한밭 마라톤', place: '대전 한밭종합운동장', host: '대전시체육회', applyStatus: '접수마감', isPublic: true },
  { id: '8',  date: '2025-05-18', title: '2025 광주 마라톤', place: '광주 종합운동장', host: '광주시체육회', applyStatus: '비접수', isPublic: false },
  { id: '7',  date: '2025-05-04', title: '2025 인천 송도 국제 마라톤', place: '인천 송도 운동장', host: '인천시체육회', applyStatus: '접수중', isPublic: true },
  { id: '6',  date: '2025-04-20', title: '2025 울산 산업수도 마라톤', place: '울산 종합운동장', host: '울산시체육회', applyStatus: '접수마감', isPublic: false },
  { id: '5',  date: '2025-04-06', title: '2025 제주 국제 마라톤', place: '제주 종합경기장', host: '제주시체육회', applyStatus: '비접수', isPublic: true },
  { id: '4',  date: '2025-03-23', title: '2025 춘천 마라톤', place: '춘천 공지천 운동장', host: '춘천시체육회', applyStatus: '접수중', isPublic: false },
  { id: '3',  date: '2025-03-09', title: '2025 대구 컬러풀 마라톤', place: '대구 스타디움', host: '대구시체육회', applyStatus: '접수마감', isPublic: true },
  { id: '2',  date: '2025-02-16', title: '2025 부산 바다 마라톤', place: '부산 사직 종합운동장', host: '부산시체육회', applyStatus: '비접수', isPublic: true },
  { id: '1',  date: '2024-12-26', title: '2025 서울 국제 마라톤', place: '잠실 종합운동장', host: '서울시체육회', applyStatus: '접수중', isPublic: false },
];

/** 최근 날짜가 위로 오도록 정렬 + 페이징 */
export function fetchEventsFromMock(page: number, pageSize: number) {
  const sorted = [...MOCK_EVENTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);
  return { rows, total };
}

/** 상세/수정 페이지 헬퍼 */
export function getEventById(id: number) {
  return MOCK_EVENTS.find((e) => Number(e.id) === id) || null;
}
