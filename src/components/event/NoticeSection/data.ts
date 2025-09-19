export interface NoticeData {
  category: string;
  title: string;
  categoryColor?: string;
}

export interface NoticeEventData {
  id: string;
  notices: NoticeData[];
}

export const noticeEvents: Record<string, NoticeEventData> = {
  marathon2025: {
    id: "marathon2025",
    notices: [
      {
        category: "공지",
        title: "2025 청주 마라톤 대회 코스 안내",
        categoryColor: "text-red-600"
      },
      {
        category: "공지",
        title: "2025 청주 마라톤 대회 유의사항 안내",
        categoryColor: "text-red-600"
      },
      {
        category: "공지",
        title: "2025 청주 마라톤 대회 참가자 안내",
        categoryColor: "text-red-600"
      },
      {
        category: "공지",
        title: "2025 청주 마라톤 대회 기념품 안내",
        categoryColor: "text-red-600"
      },
      {
        category: "공지",
        title: "2025 청주 마라톤 대회 교통편 안내",
        categoryColor: "text-red-600"
      }
    ]
  },
  // 추가 이벤트들을 여기에 정의할 수 있습니다
  // example2026: {
  //   id: "example2026",
  //   notices: [
  //     {
  //       category: "안내",
  //       title: "2026 예시 마라톤 대회 안내",
  //       categoryColor: "text-blue-600"
  //     }
  //   ]
  // }
};

export function getNoticeEventData(eventId: string): NoticeEventData | null {
  return noticeEvents[eventId] || null;
}

export function getEventNotice(eventId: string, index: number = 0): NoticeData | null {
  const event = getNoticeEventData(eventId);
  if (!event?.notices || !event.notices[index]) {
    return null;
  }
  return event.notices[index];
}
