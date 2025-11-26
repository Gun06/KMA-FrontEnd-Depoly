import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 기본 CSP 설정
  // - 인라인 스크립트 차단(script-src 'self')
  // - Tailwind 사용을 위해 스타일은 인라인 허용(style-src 'self' 'unsafe-inline')
  // - 이미지/폰트/연결 대상 도메인은 필요 시 아래 지시어에 추가
  const csp = [
    "default-src 'self'",            // 기본은 동일 출처만 허용
    "base-uri 'self'",               // <base> 제한
    "frame-ancestors 'none'",        // clickjacking 방지
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'", // 스크립트는 금지, 스타일만 인라인 허용
    "script-src 'self'",             // 인라인/평가(eval) 금지
    "connect-src 'self' https:",     // API/XHR 허용 도메인
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  // 보안 헤더 설정
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


