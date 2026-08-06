/** 마감임박 기준 타입 — REGISTRATION: 신청 마감일, D_DAY: 대회 시작일 */
export type ClosingMarathonType = 'REGISTRATION' | 'D_DAY';

/** GET /api/v1/closing-marathon */
export interface ClosingMarathonResponse {
  /** 현재 메인 표기 대상 타입 */
  type: ClosingMarathonType;
  designatedEventId: string | null;
  designatedEventName: string | null;
  displayEventId: string | null;
  displayEventName: string | null;
}

export const CLOSING_MARATHON_TYPE_LABEL: Record<ClosingMarathonType, string> = {
  D_DAY: '개최 임박',
  REGISTRATION: '신청 마감 임박',
};

/** API가 ordinal(0/1) 또는 문자열로 줄 수 있어 정규화 */
export function normalizeClosingMarathonType(
  value: unknown
): ClosingMarathonType | null {
  if (value === 'D_DAY' || value === 1 || value === '1') return 'D_DAY';
  if (value === 'REGISTRATION' || value === 0 || value === '0')
    return 'REGISTRATION';
  return null;
}

export function normalizeClosingMarathonResponse(
  raw: ClosingMarathonResponse | (Omit<ClosingMarathonResponse, 'type'> & { type: unknown })
): ClosingMarathonResponse {
  const type = normalizeClosingMarathonType(raw.type) ?? 'D_DAY';
  return { ...raw, type };
}
