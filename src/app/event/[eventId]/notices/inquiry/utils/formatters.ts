/**
 * 날짜 포맷팅 (ISO 8601 -> YYYY-MM-DD, 서버/클라 TZ와 무관하게 문자열 앞부분 우선)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const head = dateString.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  if (head) return head[1];
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
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
