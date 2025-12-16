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
}
