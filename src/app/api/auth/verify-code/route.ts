import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json()

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: '전화번호와 인증번호가 필요합니다.' },
        { status: 400 }
      )
    }

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 인증번호 형식 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: '올바른 인증번호 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // TODO: 실제로는 서버에 저장된 인증번호와 비교
    // 여기서는 간단히 콘솔에 출력 (실제로는 Redis나 DB에서 조회)

    // 실제 인증번호 확인 로직:
    // 1. Redis/DB에서 phoneNumber로 저장된 인증번호 조회
    // 2. 만료 시간 확인
    // 3. 인증번호 일치 여부 확인
    // 4. 인증 성공 시 해당 데이터 삭제

    // 임시로 성공 처리 (실제로는 위 로직 구현 필요)
    const isVerified = true

    if (isVerified) {
      return NextResponse.json({
        success: true,
        message: '인증이 완료되었습니다.'
      })
    } else {
      return NextResponse.json(
        { error: '인증번호가 올바르지 않거나 만료되었습니다.' },
        { status: 400 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { error: '인증번호 확인에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
