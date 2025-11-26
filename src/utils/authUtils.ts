import { tokenService } from './tokenService';
import { decodeToken } from './jwt';

/**
 * 비밀글 접근 권한 확인 (서버에서 JWT로 검증)
 * @param isSecret - 비밀글 여부
 * @returns 접근 가능 여부
 */
export function canAccessSecretPost(isSecret: boolean): boolean {
  // 비밀글이 아니면 접근 가능
  if (!isSecret) return true;

  // 로그인되어 있으면 서버에서 권한 검증
  return tokenService.isTokenValid();
}

/**
 * 글쓰기 권한 확인
 * @returns 글쓰기 가능 여부
 */
export function canWritePost(): boolean {
  return tokenService.isTokenValid();
}

/**
 * 현재 사용자 ID 가져오기
 * @returns 사용자 ID 또는 null
 */
export function getCurrentUserId(): string | null {
  try {
    const token = tokenService.getAccessToken();
    if (!token) return null;
    
    const payload = decodeToken(token);
    if (payload && typeof payload === 'object' && 'sub' in payload) {
      return payload.sub as string;
    }
    return null;
  } catch {
    return null;
  }
}
