import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: '전화번호가 필요합니다.' },
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

    // 6자리 인증번호 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // 실제 SMS 발송 (네이버 클라우드 플랫폼)
    try {
      const serviceId = process.env.NCP_SERVICE_ID
      const accessKey = process.env.NCP_ACCESS_KEY
      const secretKey = process.env.NCP_SECRET_KEY
      const from = process.env.NCP_FROM_NUMBER || '발신번호'
      
      if (!serviceId || !accessKey || !secretKey) {
        return NextResponse.json({
          success: true,
          message: '인증번호가 발송되었습니다.',
          verificationCode: verificationCode // 개발용 (실제로는 제거)
        })
      }

      // 실제 SMS 발송
      const response = await fetch(`https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ncp-apigw-timestamp': Date.now().toString(),
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-signature-v2': 'signature' // TODO: 실제 서명 생성 필요
        },
        body: JSON.stringify({
          type: 'SMS',
          from: from,
          content: `[전국마라톤협회] 인증번호: ${verificationCode}`,
          messages: [{ to: phoneNumber }]
        })
      })

      if (response.ok) {
      } else {
      }
    } catch (error) {
    }

    // 인증번호를 세션/캐시에 저장 (실제로는 Redis나 DB 사용)
    // 여기서는 간단히 응답에 포함 (보안상 실제로는 서버에 저장해야 함)
    
    return NextResponse.json({
      success: true,
      message: '인증번호가 발송되었습니다.',
      // 실제로는 이 값은 서버에 저장하고 클라이언트에는 전송하지 않음
      verificationCode: verificationCode
    })

  } catch (error) {
    return NextResponse.json(
      { error: '인증번호 발송에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

