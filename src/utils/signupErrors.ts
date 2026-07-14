import { extractApiErrorMessage } from '@/utils/errorHandler'

const INVALID_PHONE_TOKEN_MESSAGES = [
  '전화번호 인증 토큰이 유효하지 않습니다.',
  '전화번호 인증 토큰이 존재하지 않습니다.',
]

const DUPLICATE_USER_CODE = 'DUPLICATE_USER'
const DUPLICATE_USER_MESSAGE_HINTS = ['이미 가입', '중복']

type ErrorLike = {
  code?: string
  message?: string
  data?: { code?: string; message?: string }
  response?: {
    code?: string
    message?: string
    data?: { code?: string; message?: string }
  }
}

const collectMessages = (error: unknown): string[] => {
  const messages = [extractApiErrorMessage(error)]

  if (error && typeof error === 'object') {
    const httpError = error as ErrorLike
    messages.push(
      httpError.message ?? '',
      httpError.data?.message ?? '',
      httpError.response?.message ?? '',
      httpError.response?.data?.message ?? ''
    )
  }

  return messages.filter(Boolean)
}

const collectCodes = (error: unknown): string[] => {
  if (!error || typeof error !== 'object') return []
  const httpError = error as ErrorLike
  return [
    httpError.code,
    httpError.data?.code,
    httpError.response?.code,
    httpError.response?.data?.code,
  ].filter((code): code is string => typeof code === 'string')
}

/** 회원가입 API 응답이 전화번호 인증 토큰 무효/소진인 경우에만 true */
export function isInvalidPhoneVerificationTokenError(error: unknown): boolean {
  const messages = collectMessages(error)
  return messages.some(message =>
    INVALID_PHONE_TOKEN_MESSAGES.some(needle => message.includes(needle))
  )
}

/** 회원가입 API 응답이 이미 가입된 회원(중복 가입)인 경우에만 true */
export function isDuplicateUserError(error: unknown): boolean {
  const codes = collectCodes(error)
  if (codes.includes(DUPLICATE_USER_CODE)) {
    return true
  }

  const messages = collectMessages(error)
  return messages.some(message =>
    DUPLICATE_USER_MESSAGE_HINTS.some(hint => message.includes(hint))
  )
}
