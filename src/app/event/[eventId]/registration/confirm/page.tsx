"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useRouter } from "next/navigation";

export default function ConfirmPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();

  const handleIndividualConfirm = () => {
    router.push(`/event/${params.eventId}/registration/confirm/individual`);
  };

  const handleGroupConfirm = () => {
    router.push(`/event/${params.eventId}/registration/confirm/group`);
  };

  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "신청 확인"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* 선택 카드들 */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* 개인 신청 확인 */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer"
                 onClick={handleIndividualConfirm}>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base md:text-xl font-bold text-black mb-2 sm:mb-3 md:mb-4">개인 신청 확인</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6">개인으로 신청한 참가 내역을 확인할 수 있습니다</p>
                <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                  <p>• 개인 정보 확인</p>
                  <p>• 참가 종목 및 기념품</p>
                  <p>• 결제 상태 확인</p>
                </div>
              </div>
            </div>

            {/* 단체 신청 확인 */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer"
                 onClick={handleGroupConfirm}>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base md:text-xl font-bold text-black mb-2 sm:mb-3 md:mb-4">단체 신청 확인</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6">단체로 신청한 참가 내역을 확인할 수 있습니다</p>
                <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                  <p>• 단체 정보 확인</p>
                  <p>• 참가자 목록 및 정보</p>
                  <p>• 총 결제 금액 확인</p>
                </div>
              </div>
            </div>
          </div>

          {/* 안내사항 */}
          <div className="mt-8 sm:mt-10 md:mt-12 bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">안내사항</h3>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
              <p>• 신청 시 입력한 정보와 동일하게 입력해주세요</p>
              <p>• 개인 신청의 경우 이름, 생년월일, 휴대폰번호를 입력하세요</p>
              <p>• 단체 신청의 경우 단체명, 단체신청용 ID, 단체 비밀번호를 입력하세요</p>
              <p>• 비밀번호를 잊어버린 경우 이메일로 찾기 서비스를 이용하세요</p>
            </div>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
