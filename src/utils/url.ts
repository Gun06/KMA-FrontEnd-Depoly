const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const ensureProtocol = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`);
const join = (...parts: Array<string | number>) =>
  parts
    .map(String)
    .map((p, i) => (i === 0 ? stripTrailingSlash(p) : p.replace(/^\/+/, "")))
    .join("/");

const isServer = typeof window === "undefined";

/** 공개 웹(사용자 사이트) 베이스 URL */
export function getUserWebBaseUrl(): string {
  // 1) 명시적 설정 우선
  const web = process.env.NEXT_PUBLIC_USER_WEB_BASE_URL?.trim();
  if (web) return stripTrailingSlash(ensureProtocol(web));

  // 2) 혹시 사용자 API 베이스가 같은 도메인이고 '/api'만 다른 경우를 위해 보정
  const apiUser = process.env.NEXT_PUBLIC_API_BASE_URL_USER?.trim();
  if (apiUser) {
    const norm = stripTrailingSlash(ensureProtocol(apiUser));
    // 끝에 /api 또는 /api/ 가 붙어있으면 제거
    return norm.replace(/\/api\/?$/i, "");
  }

  // 3) 클라이언트에선 현재 오리진으로
  if (!isServer && typeof window !== "undefined") return window.location.origin;

  // 4) 서버 기본값
  return "http://localhost:3000";
}

/** 이벤트(대회) 공개 URL */
export function buildEventUrl(eventId: number | string) {
  // 경로가 /events/[id]가 아니라 /event/[id]라면 여기만 바꿔주면 됨
  return join(getUserWebBaseUrl(), "events", eventId);
}
