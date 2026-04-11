import { NextResponse } from 'next/server';

/**
 * 인기/마감임박 advertise — GET /api/v1/public/main-page/advertise/approach
 * (배열·단건 등 백엔드 형식 그대로 전달, 프런트에서 최대 3건 카드 + 사이드 배너에 사용)
 * 동일 출처 프록시 (CORS·포트 이슈 완화).
 */
export async function GET() {
  const base = (
    process.env.NEXT_PUBLIC_API_BASE_URL_USER ||
    process.env.API_BASE_URL_USER ||
    'http://localhost:8080'
  ).replace(/\/$/, '');

  const url = `${base}/api/v1/public/main-page/advertise/approach`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        return NextResponse.json(
          { error: 'Upstream returned non-JSON' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json(null, { status: 502 });
  }
}
