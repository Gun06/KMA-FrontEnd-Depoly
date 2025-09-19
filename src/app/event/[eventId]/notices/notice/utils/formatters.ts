/**
 * 날짜 포맷팅 함수 (YYYY-MM-DD HH:MM)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 날짜 포맷팅 함수 (YYYY-MM-DD)
 */
export const formatDateOnly = (dateString: string): string => {
  return dateString ? dateString.split('T')[0] : '2025-01-01';
};
