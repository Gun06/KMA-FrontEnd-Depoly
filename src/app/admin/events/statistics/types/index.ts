/**
 * 통계 페이지 타입 정의
 */

export interface ParsedCategoryData {
  total: number;
  male: number;
  female: number;
  paid: number;
  unpaid: number;
  refund: number;
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
  todayParticipants?: string; // 옵셔널로 변경 (API에서 제거됨)
  eventCategoryParticipants: EventCategoryParticipant[];
  totalCompletedParticipants: string;
  totalUnpaidParticipants: string;
  totalOrganizations: string;
  totalRefunded?: string; // 환불 완료
  totalNeedRefunded?: string; // 전액 환불 요청
  totalNeedPartitialRefunded?: string; // 차액 환불 요청
  group1to19?: string; // 1~19인 단체 수
  group20to29?: string; // 20~29인 단체 수
  group30over?: string; // 30인 이상 단체 수
  todayRefundRequest?: string; // 오늘 환불 요청자 수
  sideBannerImageUrl?: string; // 사이드 배너 이미지 URL
}
