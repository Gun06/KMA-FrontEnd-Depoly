import type { SignupValidation } from '@/types/signup'

const STEP_LABELS: Record<keyof SignupValidation, string> = {
  step1: '1단계(약관동의)',
  step2: '2단계(아이디·비밀번호)',
  step3: '3단계(추가정보)',
  step4: '4단계(주소)',
}

/** step4 회원가입 시도 시, 누락된 단계별 검증 오류를 한 번에 포맷 */
export function formatSignupValidationErrors(validation: SignupValidation): string {
  const sections: string[] = []

  for (const stepKey of Object.keys(STEP_LABELS) as Array<keyof SignupValidation>) {
    const errors = [...new Set(validation[stepKey].errors)]
    if (errors.length === 0) continue

    sections.push(`[${STEP_LABELS[stepKey]}]`)
    errors.forEach(error => sections.push(`· ${error}`))
  }

  if (sections.length === 0) {
    return '모든 필수 항목을 입력해주세요.'
  }

  const hasMissingEarlierSteps =
    !validation.step1.isValid || !validation.step2.isValid || !validation.step3.isValid

  const refreshHint = hasMissingEarlierSteps
    ? '이전 단계의 필수 정보가 누락되었습니다. 페이지를 새로고침하거나 주소만 입력해 온 경우, 처음부터 다시 진행해 주세요.\n\n'
    : ''

  return `${refreshHint}${sections.join('\n')}`
}
