import { MarathonEvent } from '@/components/common/MarathonCalendar';
import event01Image from '@/assets/images/main/event01.png';
import event02Image from '@/assets/images/main/event02.png';
import event03Image from '@/assets/images/main/event03.png';
import event04Image from '@/assets/images/main/event04.png';
import event05Image from '@/assets/images/main/event05.png';

// 전마협 대회 데이터 (8개)
export const marathonEvents: MarathonEvent[] = [
  // 1월 대회
  {
    id: '1-1',
    title: '신년 마라톤',
    date: '2025-01-01', // 수요일
    location: '서울 남산타워',
    time: '09:00',
    category: '5k',
    status: 'completed',
    imageSrc: event01Image
  },
  {
    id: '1-2',
    title: '겨울왕국 마라톤',
    date: '2025-01-13', // 월요일
    location: '강원도 평창',
    time: '10:00',
    category: '10k',
    status: 'completed',
    imageSrc: event02Image
  },
  {
    id: '1-3',
    title: '설날 특별 마라톤',
    date: '2025-01-25', // 토요일
    location: '경주 불국사',
    time: '08:30',
    category: 'half',
    status: 'completed',
    imageSrc: event03Image
  },
  {
    id: '1-4',
    title: '한파 극복 마라톤',
    date: '2025-01-31', // 금요일
    location: '인천 송도',
    time: '07:00',
    category: '5k',
    status: 'completed',
    imageSrc: event04Image
  },

  // 2월 대회
  {
    id: '2-1',
    title: '발렌타인 마라톤',
    date: '2025-02-14', // 금요일
    location: '제주도 한라산',
    time: '08:00',
    category: '10k',
    status: 'completed',
    imageSrc: event05Image
  },
  {
    id: '2-2',
    title: '설날 연휴 마라톤',
    date: '2025-02-16', // 일요일
    location: '부산 해운대',
    time: '09:00',
    category: 'half',
    status: 'completed',
    imageSrc: event01Image
  },
  {
    id: '2-3',
    title: '겨울 끝자락 마라톤',
    date: '2025-02-22', // 토요일
    location: '대구 팔공산',
    time: '07:30',
    category: '5k',
    status: 'completed',
    imageSrc: event02Image
  },

  // 3월 대회
  {
    id: '3-1',
    title: '봄맞이 마라톤',
    date: '2025-03-01', // 토요일
    location: '광주 무등산',
    time: '08:00',
    category: '10k',
    status: 'upcoming',
    imageSrc: event03Image
  },
  {
    id: '3-2',
    title: '벚꽃 마라톤',
    date: '2025-03-09', // 일요일
    location: '여수 돌산공원',
    time: '09:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event04Image
  },
  {
    id: '3-3',
    title: '서울국제마라톤',
    date: '2025-03-16', // 일요일
    location: '서울시청광장',
    time: '08:00',
    category: 'full',
    status: 'upcoming',
    imageSrc: event05Image
  },
  {
    id: '3-4',
    title: '봄바람 마라톤',
    date: '2025-03-22', // 토요일
    location: '춘천 의암호',
    time: '07:30',
    category: 'half',
    status: 'upcoming',
    imageSrc: event01Image
  },
  {
    id: '3-5',
    title: '3월 마지막 마라톤',
    date: '2025-03-29', // 토요일
    location: '포항 해안도로',
    time: '08:30',
    category: '10k',
    status: 'upcoming',
    imageSrc: event02Image
  },

  // 4월 대회
  {
    id: '4-1',
    title: '벚꽃 축제 마라톤',
    date: '2025-04-05', // 토요일
    location: '진해 군항제',
    time: '09:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event03Image
  },
  {
    id: '4-2',
    title: '부산국제마라톤',
    date: '2025-04-06', // 일요일
    location: '부산 해운대',
    time: '07:30',
    category: 'full',
    status: 'upcoming',
    imageSrc: event04Image
  },
  {
    id: '4-3',
    title: '봄꽃 만발 마라톤',
    date: '2025-04-12', // 토요일
    location: '순천만 정원',
    time: '08:00',
    category: '10k',
    status: 'upcoming',
    imageSrc: event05Image
  },
  {
    id: '4-4',
    title: '대구국제마라톤',
    date: '2025-04-20', // 일요일
    location: '대구 시민운동장',
    time: '08:00',
    category: 'half',
    status: 'upcoming',
    imageSrc: event01Image
  },
  {
    id: '4-5',
    title: '4월 마감 마라톤',
    date: '2025-04-26', // 토요일
    location: '창원 마산만',
    time: '07:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event02Image
  },

  // 5월 대회
  {
    id: '5-1',
    title: '어린이날 마라톤',
    date: '2025-05-05', // 월요일
    location: '서울 올림픽공원',
    time: '09:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event03Image
  },
  {
    id: '5-2',
    title: '인천마라톤',
    date: '2025-05-04', // 일요일
    location: '인천 월미도',
    time: '07:00',
    category: '10k',
    status: 'upcoming',
    imageSrc: event04Image
  },
  {
    id: '5-3',
    title: '가정의 달 마라톤',
    date: '2025-05-11', // 일요일
    location: '대전 한밭운동장',
    time: '08:00',
    category: 'half',
    status: 'upcoming',
    imageSrc: event05Image
  },
  {
    id: '5-4',
    title: '광주마라톤',
    date: '2025-05-18', // 일요일
    location: '광주 무등경기장',
    time: '08:30',
    category: 'half',
    status: 'upcoming',
    imageSrc: event01Image
  },
  {
    id: '5-5',
    title: '5월 마지막 마라톤',
    date: '2025-05-24', // 토요일
    location: '울산 태화강',
    time: '07:30',
    category: '10k',
    status: 'upcoming',
    imageSrc: event02Image
  },

  // 6월 대회
  {
    id: '6-1',
    title: '여름 시작 마라톤',
    date: '2025-06-01', // 일요일
    location: '대전 한밭운동장',
    time: '07:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event03Image
  },
  {
    id: '6-2',
    title: '장마철 마라톤',
    date: '2025-06-07', // 토요일
    location: '부산 감천문화마을',
    time: '08:00',
    category: '10k',
    status: 'upcoming',
    imageSrc: event04Image
  },
  {
    id: '6-3',
    title: '울산마라톤',
    date: '2025-06-15', // 일요일
    location: '울산 태화강',
    time: '08:00',
    category: '10k',
    status: 'upcoming',
    imageSrc: event05Image
  },
  {
    id: '6-4',
    title: '6월 마감 마라톤',
    date: '2025-06-28', // 토요일
    location: '전주 한옥마을',
    time: '07:30',
    category: 'half',
    status: 'upcoming',
    imageSrc: event01Image
  },

  // 7월 대회
  {
    id: '7-1',
    title: '여름휴가 마라톤',
    date: '2025-07-05', // 토요일
    location: '세종시 정부청사',
    time: '07:30',
    category: 'half',
    status: 'upcoming',
    imageSrc: event02Image
  },
  {
    id: '7-2',
    title: '장마 끝 마라톤',
    date: '2025-07-12', // 토요일
    location: '강릉 경포호',
    time: '08:00',
    category: '10k',
    status: 'upcoming',
    imageSrc: event03Image
  },
  {
    id: '7-3',
    title: '여름 더위 마라톤',
    date: '2025-07-19', // 토요일
    location: '제주 올레길',
    time: '06:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event04Image
  },
  {
    id: '7-4',
    title: '7월 마감 마라톤',
    date: '2025-07-26', // 토요일
    location: '포항 해안도로',
    time: '07:00',
    category: 'half',
    status: 'upcoming',
    imageSrc: event05Image
  },

  // 8월 대회
  {
    id: '8-1',
    title: '여름휴가 마라톤',
    date: '2025-08-02', // 토요일
    location: '부산 해운대',
    time: '06:30',
    category: '10k',
    status: 'upcoming',
    imageSrc: event01Image
  },
  {
    id: '8-2',
    title: '무더위 극복 마라톤',
    date: '2025-08-09', // 토요일
    location: '대구 팔공산',
    time: '07:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event02Image
  },
  {
    id: '8-3',
    title: '춘천마라톤',
    date: '2025-08-16', // 토요일
    location: '춘천 의암호',
    time: '08:00',
    category: 'full',
    status: 'upcoming',
    imageSrc: event03Image
  },
  {
    id: '8-4',
    title: '8월 마감 마라톤',
    date: '2025-08-23', // 토요일
    location: '창원 마산만',
    time: '07:30',
    category: '10k',
    status: 'upcoming',
    imageSrc: event04Image
  },

  // 9월 대회 (8개) - 전마협과 전국대회 구분
  {
    id: '9-1',
    title: '전마협 창단 24주년 기념 2025 대전 월드런',
    date: '2025-09-06', // 토요일
    location: '대전엑스포 시민광장',
    time: '07:00',
    category: '10k',
    status: 'upcoming',
    type: 'marathon', // 전마협
    imageSrc: event01Image
  },
  {
    id: '9-2',
    title: '2025 청주마라톤',
    date: '2025-09-13', // 토요일
    location: '청주 상당공원',
    time: '08:00',
    category: 'half',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event02Image
  },
  {
    id: '9-3',
    title: '2025 남원 춘향 전국 마라톤대회',
    date: '2025-09-20', // 토요일
    location: '남원 춘향테마파크',
    time: '09:00',
    category: '5k',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event03Image
  },
  {
    id: '9-4',
    title: '2025 제주 4FULL 마라톤대회',
    date: '2025-09-27', // 토요일
    location: '제주 올레길',
    time: '07:30',
    category: '10k',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event04Image
  },
  {
    id: '9-5',
    title: '2025 춘천마라톤',
    date: '2025-09-07', // 일요일
    location: '춘천 의암호',
    time: '08:00',
    category: 'half',
    status: 'upcoming',
    type: 'marathon', // 전마협
    imageSrc: event05Image
  },
  {
    id: '9-6',
    title: '2025 울산마라톤',
    date: '2025-09-14', // 일요일
    location: '울산 태화강',
    time: '07:30',
    category: '10k',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event01Image
  },
  {
    id: '9-7',
    title: '2025 창원마라톤',
    date: '2025-09-21', // 일요일
    location: '창원 마산만',
    time: '08:00',
    category: '5k',
    status: 'upcoming',
    type: 'marathon', // 전마협
    imageSrc: event02Image
  },
  {
    id: '9-8',
    title: '2025 포항마라톤',
    date: '2025-09-28', // 일요일
    location: '포항 해안도로',
    time: '07:00',
    category: 'half',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event03Image
  },

  // 10월 대회
  {
    id: '10-1',
    title: '가을 정취 마라톤',
    date: '2025-10-04', // 토요일
    location: '제주 올레길',
    time: '08:30',
    category: 'full',
    status: 'upcoming',
    imageSrc: event04Image
  },
  {
    id: '10-2',
    title: '단풍 절정 마라톤',
    date: '2025-10-11', // 토요일
    location: '내장산 국립공원',
    time: '08:00',
    category: 'half',
    status: 'upcoming',
    imageSrc: event05Image
  },
  {
    id: '10-3',
    title: '전주마라톤',
    date: '2025-10-18', // 토요일
    location: '전주 한옥마을',
    time: '08:00',
    category: 'half',
    status: 'upcoming',
    imageSrc: event01Image
  },
  {
    id: '10-4',
    title: '10월 마감 마라톤',
    date: '2025-10-25', // 토요일
    location: '순천만 정원',
    time: '07:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event02Image
  },

  // 11월 대회
  {
    id: '11-1',
    title: '가을 끝자락 마라톤',
    date: '2025-11-01', // 토요일
    location: '포항 해안도로',
    time: '07:30',
    category: '10k',
    status: 'upcoming',
    imageSrc: event03Image
  },
  {
    id: '11-2',
    title: '단풍 마지막 마라톤',
    date: '2025-11-08', // 토요일
    location: '설악산 국립공원',
    time: '08:00',
    category: 'half',
    status: 'upcoming',
    imageSrc: event04Image
  },
  {
    id: '11-3',
    title: '창원마라톤',
    date: '2025-11-15', // 토요일
    location: '창원 마산만',
    time: '08:00',
    category: '5k',
    status: 'upcoming',
    imageSrc: event05Image
  },
  {
    id: '11-4',
    title: '11월 마감 마라톤',
    date: '2025-11-22', // 토요일
    location: '부산 해운대',
    time: '07:30',
    category: '10k',
    status: 'upcoming',
    imageSrc: event01Image
  },

  // 12월 대회
  {
    id: '12-1',
    title: '겨울 시작 마라톤',
    date: '2025-12-06', // 토요일
    location: '서울 남산타워',
    time: '08:00',
    category: '5k',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event02Image
  },
  {
    id: '12-2',
    title: '크리스마스 마라톤',
    date: '2025-12-07', // 일요일
    location: '청주 상당공원',
    time: '08:30',
    category: 'half',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event03Image
  },
  {
    id: '12-3',
    title: '연말 정리 마라톤',
    date: '2025-12-14', // 일요일
    location: '대구 시민운동장',
    time: '08:00',
    category: '10k',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event04Image
  },
  {
    id: '12-4',
    title: '올해 마지막 마라톤',
    date: '2025-12-21', // 일요일
    location: '부산 해운대',
    time: '07:00',
    category: '5k',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event05Image
  },
  {
    id: '12-5',
    title: '송년 마라톤',
    date: '2025-12-31', // 수요일
    location: '서울 시청광장',
    time: '23:00',
    category: '10k',
    status: 'upcoming',
    type: 'national', // 전국대회
    imageSrc: event01Image
  },
];

