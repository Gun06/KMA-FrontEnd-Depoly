// 작성자 이름 마스킹 함수
export const maskAuthorName = (authorName: string, isSecret: boolean = false): string => {
  if (!authorName || authorName.length < 2) return authorName;
  
  // 관리자는 마스킹하지 않음
  if (authorName === '총관리자' || authorName === '관리자') {
    return authorName;
  }
  
  // 비밀글이 아닌 경우 마스킹하지 않음
  if (!isSecret) {
    return authorName;
  }
  
  // 비밀글인 경우 마스킹 (김** 형태)
  return authorName.charAt(0) + '*'.repeat(authorName.length - 1);
};

// 비밀글 제목 처리 함수
export const getSecretTitle = (originalTitle: string, isSecret: boolean = false): string => {
  if (!isSecret) {
    return originalTitle;
  }
  
  return '비밀글입니다.';
};

// 비밀글 접근 권한 체크 함수 (서버에서 JWT로 검증)
export const canAccessSecretPost = (isSecret: boolean): boolean => {
  if (!isSecret) {
    return true;
  }
  
  // 서버에서 JWT로 권한 검증하므로 클라이언트에서는 단순히 true 반환
  // 실제 권한은 서버에서 403 에러로 처리
  return true;
};
