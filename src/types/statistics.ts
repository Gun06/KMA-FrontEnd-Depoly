/**
 * 대회별 신청내역 통계 API 타입 정의
 */

export interface EventCategoryParticipant {
  categoryName: string;
  totalParticipants: string;
}

export interface EventStatisticsResponse {
  eventName: string;
  totalParticipants: string;
  totalGenderPercentage: string;
  todayParticipants: string;
  eventCategoryParticipants: EventCategoryParticipant[];
  totalCompletedParticipants: string;
  totalUnpaidParticipants: string;
  totalOrganizations: string;
  totalRefunded?: string; // 환불 완료
  totalNeedRefunded?: string; // 전액 환불 요청
  totalNeedPartitialRefunded?: string; // 차액 환불 요청
}
