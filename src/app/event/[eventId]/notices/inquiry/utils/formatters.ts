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
 * 이름 마스킹 (본인 글은 전체 이름, 관리자와 다른 사람 글은 성만 표시)
 */
export const maskAuthorName = (authorName: string, currentUserId?: string | null): string => {
  if (!authorName || authorName.length < 2) return authorName;
  
  // 관리자 계정은 마스킹하지 않음
  if (authorName === '총관리자' || authorName === '관리자') {
    return authorName;
  }
  
  // 본인이 작성한 글인지 확인
  if (currentUserId && authorName === currentUserId) {
    return authorName; // 본인 글은 전체 이름 표시
  }
  
  // 다른 사람 글은 성만 표시
  return authorName.charAt(0) + '*'.repeat(authorName.length - 1);
};
