/**
 * 통계 페이지 타입 정의
 */

export interface ParsedCategoryData {
  total: number;
  male: number;
  female: number;
  paid: number;
  unpaid: number;
}

export interface EventCategoryParticipant {
  categoryName: string;
  totalParticipants: string;
  parsed?: ParsedCategoryData; // 파싱된 데이터 (옵션)
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
