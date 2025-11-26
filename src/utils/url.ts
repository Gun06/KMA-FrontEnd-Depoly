const stripTrailingSlash = (s: string) => s.replace(/\/+$/, "");
const join = (...parts: Array<string | number>) =>
  parts
    .map(String)
    .map((p, i) => (i === 0 ? stripTrailingSlash(p) : p.replace(/^\/+/, "")))
    .join("/");

/** 공개 웹(사용자 사이트) 베이스 URL */
export function getUserWebBaseUrl(): string {
  // 강제로 newrun1080.com 사용
  return "https://www.newrun1080.com";
}

/** 이벤트(대회) 공개 URL */
export function buildEventUrl(eventId: number | string) {
  // 경로가 /events/[id]가 아니라 /event/[id]라면 여기만 바꿔주면 됨
  return join(getUserWebBaseUrl(), "event", eventId);
}
