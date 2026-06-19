/** 통합본 신청/수정 API 응답 flow 분기 */

/** 스펙 오타(COMMITED)와 실제 API 응답(COMMITTED) 모두 허용 */
export type RegistrationFlow = 'STAGED' | 'COMMITED' | 'COMMITTED';

export type RegistrationFlowOutcome =
  | { type: 'STAGED'; stagedToken: string }
  | { type: 'COMMITTED'; targetId: string };

const isCommittedFlow = (flow: unknown): boolean =>
  flow === 'COMMITED' || flow === 'COMMITTED';

/**
 * 통합본 응답 또는 레거시 응답(stagedToken 최상위)을 파싱합니다.
 */
export function parseRegistrationFlowResponse(
  response: unknown
): RegistrationFlowOutcome {
  if (!response || typeof response !== 'object') {
    throw new Error('신청 처리 응답을 확인할 수 없습니다.');
  }

  const body = response as Record<string, unknown>;
  const flow = body.flow;

  if (flow === 'STAGED') {
    const staged = body.stagedResult as { stagedToken?: unknown } | null | undefined;
    const token = staged?.stagedToken;
    if (typeof token === 'string' && token.trim()) {
      return { type: 'STAGED', stagedToken: token };
    }
    throw new Error('스테이징 토큰을 받지 못했습니다.');
  }

  if (isCommittedFlow(flow)) {
    const committed = body.committedResult as { targetId?: unknown } | null | undefined;
    const targetId = committed?.targetId;
    if (typeof targetId === 'string' && targetId.trim()) {
      return { type: 'COMMITTED', targetId };
    }
    throw new Error('신청 처리 결과를 받지 못했습니다.');
  }

  // 레거시: /stage 엔드포인트 응답 (stagedToken 최상위)
  const legacyToken = body.stagedToken;
  if (typeof legacyToken === 'string' && legacyToken.trim()) {
    return { type: 'STAGED', stagedToken: legacyToken };
  }

  throw new Error('스테이징 토큰을 받지 못했습니다.');
}
