// 클라이언트/서버 공용 DOMPurify
// - HTML 주입 전 필수로 정제하여 XSS를 예방합니다.
// - 스크립트/이벤트 핸들러/위험한 URI(data:, javascript:)를 제거합니다.
import DOMPurify from 'isomorphic-dompurify';

/**
 * HTML 정제 함수
 * - script/style/iframe/object/embed 태그 제거
 * - on* 이벤트 속성 제거 (onclick 등)
 * - javascript:, data: URI 제거
 * - ARIA 속성 허용, 일반 HTML 프로필 사용
 */
export function sanitizeHtml(dirty: string): string {
  try {
    return DOMPurify.sanitize(dirty, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: [/^on/i],
      ALLOW_ARIA_ATTR: true,
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i,
    });
  } catch {
    return '';
  }
}


