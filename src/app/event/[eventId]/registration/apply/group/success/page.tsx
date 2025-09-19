"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function GroupApplySuccessPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupName = searchParams.get('groupName') || '단체';
  const participantCount = searchParams.get('participantCount') || '0';

  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "단체신청"
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* 신청 완료 메시지 박스 */}
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center max-w-2xl mx-auto">
            {/* 성공 아이콘 */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* 메인 제목 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4">
              {groupName} 님!
            </h1>
            
            {/* 신청 완료 메시지 */}
            <p className="text-xl sm:text-2xl font-bold text-black mb-6">
              총 {participantCount}분의 마라톤 신청이 완료되었습니다.
            </p>
            
            {/* 안내 메시지 1 */}
            <p className="text-base sm:text-lg text-gray-700 mb-3">
              신청하신 현황은 참가신청 &gt; 신청확인 메뉴에서 확인 하실 수 있습니다.
            </p>
            
            {/* 안내 메시지 2 */}
            <p className="text-base sm:text-lg text-gray-700 mb-8">
              궁금하신 점은 언제든지{' '}
              <Link href={`/event/${params.eventId}/notices/inquiry`} className="underline cursor-pointer hover:text-blue-600">
                문의사항
              </Link>
              와{' '}
              <Link href={`/event/${params.eventId}/notices/faq`} className="underline cursor-pointer hover:text-blue-600">
                FAQ
              </Link>
              를 확인해주시기 바랍니다.
            </p>
            
            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              {/* 신청확인 버튼 */}
              <Link
                href={`/event/${params.eventId}/registration/confirm`}
                className="inline-block px-8 sm:px-12 py-3 sm:py-4 bg-white border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-base sm:text-lg"
              >
                신청확인
              </Link>
              
              {/* 대회홈 버튼 */}
              <Link
                href={`/event/${params.eventId}`}
                className="inline-block px-8 sm:px-12 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base sm:text-lg"
              >
                대회홈
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
