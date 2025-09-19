'use client'

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import GuideHeader from '@/components/main/registration/GuideHeader'

export default function RegistrationGuidePage() {
  const steps = [
    {
      icon: '📋',
      title: '대회선택',
      description: '참가를 원하는 대회 페이지로 이동'
    },
    {
      icon: '📖',
      title: '참가신청',
      description: '코스 및 참가 정보 입력 뒤 참가신청 버튼을 클릭'
    },
    {
      icon: '✏️',
      title: '정보입력',
      description: '참가자 정보 정확히 입력 (이름, 생년월일, 연락처 등)'
    },
    {
      icon: '💰',
      title: '결제진행',
      description: '계좌이체로 참가비 결제'
    },
    {
      icon: '✅',
      title: '신청 완료 확인',
      description: '문자 또는 이메일로 알림 발송'
    },
    {
      icon: '🏃',
      title: '대회 참가',
      description: '대회 일정 및 장소 확인 후 행사 당일에 참가'
    }
  ]

  const paymentInfo = [
    '참가비 결제는 무통장입금으로만 진행됩니다.',
    '신청자 성함과 동일한 이름으로 입금해 주세요.',
    '입금 확인은 영업일 기준 1~2일 소요될 수 있으며, 입금 확인 후 신청이 완료됩니다.',
    '입금 마감일 이후 미입금 시 자동 신청 취소됩니다.',
    '계좌정보는 각 대회별 안내 페이지에서 확인하실 수 있습니다.'
  ]

  const refundInfo = [
    '입금 후 환불 요청은 대회 신청 마감일 전까지만 가능합니다.',
    '신청 마감 이후에는 참가 물품 제작 및 행사 준비로 인해 환불이 불가합니다.',
    '환불 시 발생하는 이체 수수료는 참가자 부담입니다.',
    '환불 신청은 각 대회별 고객센터를 통해 접수해 주세요.'
  ]

  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "접수안내",
        subMenu: "참가신청 가이드"
      }}
    >
      {/* 헤더 섹션 - 기존 컴포넌트 사용 */}
      <GuideHeader />

      {/* 참가 절차 안내 */}
      <div className="bg-white rounded-lg p-4 lg:p-6 mb-6 lg:mb-8 shadow-sm border border-gray-100">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
          <span className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs lg:text-sm font-bold">1</span>
          참가 절차 안내
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center p-4 lg:p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-blue-200 group">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 text-xl lg:text-2xl group-hover:scale-110 transition-transform duration-200">
                {step.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{step.title}</h3>
              <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 참가비 결제 안내 */}
      <div className="bg-white rounded-lg p-4 lg:p-6 mb-6 lg:mb-8 shadow-sm border border-gray-100">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
          <span className="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs lg:text-sm font-bold">2</span>
          참가비 결제 안내
        </h2>
        <div className="space-y-3 lg:space-y-4">
          {paymentInfo.map((info, index) => (
            <div key={index} className="flex items-start gap-3 lg:gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 text-sm lg:text-base">{info}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 환불 규정 안내 */}
      <div className="bg-white rounded-lg p-4 lg:p-6 mb-6 lg:mb-8 shadow-sm border border-gray-100">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
          <span className="w-6 h-6 lg:w-8 lg:h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs lg:text-sm font-bold">3</span>
          환불 규정 안내
        </h2>
        <div className="space-y-3 lg:space-y-4">
          {refundInfo.map((info, index) => (
            <div key={index} className="flex items-start gap-3 lg:gap-4 p-3 bg-red-50 rounded-lg">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 text-sm lg:text-base">{info}</p>
            </div>
          ))}
        </div>
      </div>
    </SubmenuLayout>
  )
}
