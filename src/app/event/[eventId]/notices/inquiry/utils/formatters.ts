/**
 * 날짜 포맷팅 (ISO 8601 -> YYYY-MM-DD)
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch (error) {
    return '2025-01-01';
  }
};

/**
 * 작성자 이름 표시 (마스킹 제거)
 */
export const maskAuthorName = (authorName: string, currentUserId?: string | null): string => {
  if (!authorName) return authorName;
  
  // 마스킹 없이 전체 이름 표시
  return authorName;
};
