// 대회별 FAQ 데이터
export interface EventFaqItem {
  eventId: string;
  question: string;
  answer: string;
}

export const eventFaqData: EventFaqItem[] = [
  // marathon2025 FAQ
  {
    eventId: "marathon2025",
    question: "2025 청주 마라톤 참가 신청은 어떻게 하나요?",
    answer: "대회 페이지의 '참가신청' 버튼을 클릭하여 온라인으로 신청하실 수 있습니다. 개인 정보 입력 후 참가비 결제까지 완료하시면 신청이 완료됩니다."
  },
  {
    eventId: "marathon2025",
    question: "마라톤 코스는 어떻게 구성되어 있나요?",
    answer: "청주 시내를 중심으로 한 42.195km 풀코스와 21.0975km 하프코스로 구성되어 있습니다. 상세한 코스맵과 고도 정보는 '코스 안내' 페이지에서 확인하실 수 있습니다."
  },
  {
    eventId: "marathon2025",
    question: "대회 당일 준비물은 무엇인가요?",
    answer: "신분증, 참가 확인증(모바일 가능), 러닝화, 개인 물품을 준비해 주세요. 날씨에 따른 방한용품이나 우비도 미리 준비하시는 것을 권장합니다."
  },
  {
    eventId: "marathon2025",
    question: "기록 측정은 어떻게 이루어지나요?",
    answer: "참가자 배번호에 부착된 RFID 칩을 통해 자동으로 기록이 측정됩니다. 출발선, 중간 지점, 결승선에서 각각 측정되어 정확한 기록을 제공합니다."
  },
  {
    eventId: "marathon2025",
    question: "완주 후 기록증은 언제 받을 수 있나요?",
    answer: "대회 종료 후 약 1주일 이내에 홈페이지 '기록 조회' 페이지에서 개인 기록을 확인하고 기록증을 다운로드 받으실 수 있습니다."
  },
  {
    eventId: "marathon2025",
    question: "급수대는 몇 개나 있나요?",
    answer: "풀코스 기준 약 2.5km마다 급수대가 설치되어 총 16개소에서 물과 스포츠음료를 제공합니다. 하프코스는 8개소에 설치됩니다."
  },
  {
    eventId: "marathon2025",
    question: "대회 참가비에는 무엇이 포함되나요?",
    answer: "참가비에는 기념 티셔츠, 배번호, 기록 측정, 완주메달, 간식 및 음료, 기록증 발급 서비스가 포함되어 있습니다."
  },
  {
    eventId: "marathon2025",
    question: "대회 당일 주차는 어떻게 하나요?",
    answer: "청주종합운동장 및 주변 공영주차장을 이용하실 수 있습니다. 주차 공간이 제한적이므로 가급적 대중교통 이용을 권장합니다."
  },
  {
    eventId: "marathon2025",
    question: "날씨가 좋지 않으면 대회가 취소되나요?",
    answer: "안전상 문제가 없는 한 우천 시에도 대회는 정상 진행됩니다. 태풍이나 극심한 악천후의 경우 대회 전날 공지사항을 통해 안내해 드립니다."
  },
  {
    eventId: "marathon2025",
    question: "응급상황 발생 시 어떻게 대처하나요?",
    answer: "코스 전 구간에 의료진이 배치되어 있으며, 응급차량이 순회합니다. 응급상황 발생 시 가까운 스태프나 의료진에게 즉시 신고해 주세요."
  },
  {
    eventId: "marathon2025",
    question: "참가 취소 및 환불은 가능한가요?",
    answer: "대회 2주 전까지는 취소 수수료 10%를 제외하고 환불 가능합니다. 1주 전까지는 50%, 그 이후는 환불이 불가능합니다."
  },
  {
    eventId: "marathon2025",
    question: "가족이나 친구들의 응원은 어디서 할 수 있나요?",
    answer: "출발점과 결승점 주변에 응원 구역이 마련되어 있습니다. 코스 중간 지점에서도 안전한 구역에서 응원하실 수 있습니다."
  },

  // 다른 대회 예시 데이터 (확장 가능)
  {
    eventId: "example2026",
    question: "2026 예시 마라톤은 언제 개최되나요?",
    answer: "2026년 봄에 개최될 예정입니다. 정확한 일정은 추후 공지사항을 통해 안내해 드리겠습니다."
  },
  {
    eventId: "example2026",
    question: "예시 마라톤의 참가 자격은 어떻게 되나요?",
    answer: "만 18세 이상 누구나 참가 가능하며, 건강상태가 마라톤 참가에 적합한 분들을 대상으로 합니다."
  },
];

export function getEventFaqData(eventId: string): EventFaqItem[] {
  return eventFaqData.filter(faq => faq.eventId === eventId);
}

export function getEventFaqById(eventId: string, index: number): EventFaqItem | undefined {
  const eventFaqs = getEventFaqData(eventId);
  return eventFaqs[index];
}
