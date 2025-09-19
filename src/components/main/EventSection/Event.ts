// 로컬 샘플 이미지 (실 서비스에서는 API 연동 예정)
import event01 from '@/assets/images/main/event01.png'
import event02 from '@/assets/images/main/event02.png'
import event03 from '@/assets/images/main/event03.png'
import event04 from '@/assets/images/main/event04.png'
import event05 from '@/assets/images/main/event05.png'

export interface EventItemBase {
  id: string
  title: string
  subtitle: string
  date: string
  price: string
  status: string
  eventDate: string // YYYY-MM-DD 형식
}

// 이미지 타입은 컴포넌트 환경에 따라 달라질 수 있어 느슨하게 두고,
// 각 컴포넌트에서 StaticImageData 등으로 보강해서 사용합니다.
export type EventItem<ImageT = unknown> = EventItemBase & { 
  image: ImageT
  imageSrc: ImageT
  imageAlt: string
}

export interface EventSectionProps {
  className?: string
}

// 이벤트 데이터
export const EVENT_ITEMS = [
  {
    id: 'national-marathon-2025',
    title: '2025 청주마라톤',
    subtitle: '10km 레이스',
    date: '2025.09.06(토) 16시~20시',
    price: '50,000원~',
    status: '접수중',
    eventDate: '2025-09-06',
    image: event01,
    imageSrc: event01,
    imageAlt: '2025 전국마라톤',
  },
  {
    id: 'jeju-4full-2025',
    title: '제주 4FULL 마라톤대회',
    subtitle: '25 전마협',
    date: '2025.01.03(금) ~ 01.06(월)',
    price: '80,000원~',
    status: '접수중',
    eventDate: '2025-01-03',
    image: event02,
    imageSrc: event02,
    imageAlt: '제주 4FULL 마라톤대회',
  },
  {
    id: 'newyear-geumsan-2025',
    title: '새해맞이 금산',
    subtitle: '무료 훈련 마라톤',
    date: '2025.01.01(수) 09시~12시',
    price: 'Free',
    status: '접수중',
    eventDate: '2025-01-01',
    image: event03,
    imageSrc: event03,
    imageAlt: '새해맞이 금산',
  },
  {
    id: 'namwon-chunhyang-2025',
    title: '2025 남원 춘향 전국 마라톤대회',
    subtitle: '춘향과 이도령의 도시',
    date: '2025.11.23(일) 08시~12시',
    price: '60,000원~',
    status: '접수중',
    eventDate: '2025-11-23',
    image: event04,
    imageSrc: event04,
    imageAlt: '2025 남원 춘향 전국 마라톤대회',
  },
  {
    id: 'daejeon-worldrun-2025',
    title: '2025 대전 월드런',
    subtitle: '전마협 창단 24주년 기념',
    date: '2025.06.01(일) 07시~11시',
    price: '70,000원~',
    status: '접수중',
    eventDate: '2025-06-01',
    image: event05,
    imageSrc: event05,
    imageAlt: '2025 대전 월드런',
  },
  {
    id: 'busan-marine-2025',
    title: '2025 부산 해양 마라톤',
    subtitle: '해운대 해변 코스',
    date: '2025.08.15(금) 06시~10시',
    price: '65,000원~',
    status: '접수중',
    eventDate: '2025-08-15',
    image: event01,
    imageSrc: event01,
    imageAlt: '2025 부산 해양 마라톤',
  },
  {
    id: 'seoul-international-2025',
    title: '2025 서울 국제 마라톤',
    subtitle: '한강변 코스',
    date: '2025.10.12(일) 08시~12시',
    price: '75,000원~',
    status: '접수중',
    eventDate: '2025-10-12',
    image: event02,
    imageSrc: event02,
    imageAlt: '2025 서울 국제 마라톤',
  },
  {
    id: 'incheon-songdo-2025',
    title: '2025 인천 송도 마라톤',
    subtitle: '송도 센트럴파크',
    date: '2025.07.20(일) 07시~11시',
    price: '55,000원~',
    status: '접수중',
    eventDate: '2025-07-20',
    image: event03,
    imageSrc: event03,
    imageAlt: '2025 인천 송도 마라톤',
  },
  {
    id: 'gwangju-mudeungsan-2025',
    title: '2025 광주 무등산 마라톤',
    subtitle: '무등산 등산로',
    date: '2025.05.18(일) 06시~10시',
    price: '45,000원~',
    status: '접수중',
    eventDate: '2025-05-18',
    image: event04,
    imageSrc: event04,
    imageAlt: '2025 광주 무등산 마라톤',
  },
  {
    id: 'daegu-palgongsan-2025',
    title: '2025 대구 팔공산 마라톤',
    subtitle: '팔공산 자연휴양림',
    date: '2025.04.27(일) 07시~11시',
    price: '50,000원~',
    status: '접수중',
    eventDate: '2025-04-27',
    image: event05,
    imageSrc: event05,
    imageAlt: '2025 대구 팔공산 마라톤',
  },
] as const
