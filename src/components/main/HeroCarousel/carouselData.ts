import type { StaticImageData } from 'next/image'
import banner from '@/assets/images/main/mainbanner02.png'

export interface MarathonSlide {
  id: number
  image: string | StaticImageData
  badge: string
  title: string
  subtitle: string
  date: string
  eventId?: string
  buttons: Array<{
    text: string
    variant: "default" | "outline"
  }>
}

export const marathonSlides: MarathonSlide[] = [
  {
    id: 1,
    image: banner,
    badge: "대회 안내",
    title: "부산국제마라톤",
    subtitle: "바다와 함께하는 달리기",
    date: "2024년 4월 21일",
    buttons: [
      { text: "신청하기", variant: "default" as const },
      { text: "대회 요강", variant: "outline" as const },
      { text: "신청 확인", variant: "outline" as const },
    ],
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=800&fit=crop",
    badge: "대회 안내",
    title: "서울국제마라톤",
    subtitle: "도시와 함께하는 달리기",
    date: "2024년 3월 17일",
    buttons: [
      { text: "신청하기", variant: "default" as const },
      { text: "대회 요강", variant: "outline" as const },
      { text: "신청 확인", variant: "outline" as const },
    ],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200&h=800&fit=crop",
    badge: "대회 안내",
    title: "제주올레마라톤",
    subtitle: "자연과 함께하는 달리기",
    date: "2024년 5월 12일",
    buttons: [
      { text: "신청하기", variant: "default" as const },
      { text: "대회 요강", variant: "outline" as const },
      { text: "신청 확인", variant: "outline" as const },
    ],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop",
    badge: "대회 안내",
    title: "대구국제마라톤",
    subtitle: "문화와 함께하는 달리기",
    date: "2024년 10월 20일",
    buttons: [
      { text: "신청하기", variant: "default" as const },
      { text: "대회 요강", variant: "outline" as const },
      { text: "신청 확인", variant: "outline" as const },
    ],
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=800&fit=crop",
    badge: "대회 안내",
    title: "광주마라톤",
    subtitle: "빛과 함께하는 달리기",
    date: "2024년 11월 3일",
    buttons: [
      { text: "신청하기", variant: "default" as const },
      { text: "대회 요강", variant: "outline" as const },
      { text: "신청 확인", variant: "outline" as const },
    ],
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200&h=800&fit=crop",
    badge: "대회 안내",
    title: "인천마라톤",
    subtitle: "바다와 함께하는 달리기",
    date: "2024년 9월 15일",
    buttons: [
      { text: "신청하기", variant: "default" as const },
      { text: "대회 요강", variant: "outline" as const },
      { text: "신청 확인", variant: "outline" as const },
    ],
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop",
    badge: "대회 안내",
    title: "울산마라톤",
    subtitle: "산업과 함께하는 달리기",
    date: "2024년 6월 8일",
    buttons: [
      { text: "신청하기", variant: "default" as const },
      { text: "대회 요강", variant: "outline" as const },
      { text: "신청 확인", variant: "outline" as const },
    ],
  },
]
