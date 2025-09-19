export interface HeroEventData {
  id: string;
  eventName: string;
  eventNameKo: string;
  year: string;
  showHero?: boolean;
}

export const heroEvents: Record<string, HeroEventData> = {
  marathon2025: {
    id: "marathon2025",
    eventName: "CHEONGJU MARATHON",
    eventNameKo: "청주마라톤",
    year: "2025",
    showHero: true
  },
  // 추가 이벤트들을 여기에 정의할 수 있습니다
  // example2026: {
  //   id: "example2026",
  //   eventName: "EXAMPLE MARATHON",
  //   eventNameKo: "예시마라톤",
  //   year: "2026",
  //   showHero: true
  // }
};

export function getHeroEventData(eventId: string): HeroEventData | null {
  return heroEvents[eventId] || null;
}
