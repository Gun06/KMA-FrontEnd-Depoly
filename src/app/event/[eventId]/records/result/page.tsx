"use client";

import { useParams, useSearchParams } from "next/navigation";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { Download } from "lucide-react";
import { Suspense } from "react";

// 임시 데이터 (실제로는 API에서 가져와야 함)
const mockPersonalRecord = {
  participationNumber: "10Km",
  participationCode: "1360", 
  record: "00:50:32:20"
};

function RecordContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  
  // 쿼리 파라미터에서 데이터 추출
  const name = searchParams.get('name') || "홍길동";
  const birthDate = searchParams.get('birthDate') || "1988.08.18";
  
  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "기록조회",
        subMenu: "기록 조회 결과"
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 기본 정보 섹션 */}
        <div className="bg-white mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
              기본 정보
            </h2>
            
            <div className="space-y-4">
              <div className="flex border-b border-gray-200 pb-3">
                <div className="w-24 text-sm font-medium text-gray-700 bg-white px-3 py-2">
                  이름
                </div>
                <div className="flex-1 text-sm text-gray-900 px-3 py-2">
                  {name}
                </div>
              </div>
              
              <div className="flex border-b border-gray-200 pb-3">
                <div className="w-24 text-sm font-medium text-gray-700 bg-white px-3 py-2">
                  생년월일
                </div>
                <div className="flex-1 text-sm text-gray-900 px-3 py-2">
                  {birthDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 참가 정보 섹션 */}
        <div className="bg-white mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
              참가 정보
            </h2>
            
            <div className="space-y-4">
              <div className="flex border-b border-gray-200 pb-3">
                <div className="w-24 text-sm font-medium text-gray-700 bg-white px-3 py-2">
                  참가부문
                </div>
                <div className="flex-1 text-sm text-gray-900 px-3 py-2">
                  {mockPersonalRecord.participationNumber}
                </div>
              </div>
              
              <div className="flex border-b border-gray-200 pb-3">
                <div className="w-24 text-sm font-medium text-gray-700 bg-white px-3 py-2">
                  참가번호
                </div>
                <div className="flex-1 text-sm text-gray-900 px-3 py-2">
                  {mockPersonalRecord.participationCode}
                </div>
              </div>
              
              <div className="flex border-b border-gray-200 pb-3">
                <div className="w-24 text-sm font-medium text-gray-700 bg-white px-3 py-2">
                  참가기록
                </div>
                <div className="flex-1 text-sm text-gray-900 px-3 py-2 font-semibold">
                  {mockPersonalRecord.record}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 기록증 섹션 */}
        <div className="bg-white">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
              기록증
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">기록증 다운로드</p>
                  <p className="text-xs text-gray-500">PDF 형태로 다운로드 가능합니다</p>
                </div>
              </div>
              
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                다운로드
              </button>
            </div>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}

export default function RecordsResultPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">기록을 조회하는 중...</p>
        </div>
      </div>
    }>
      <RecordContent />
    </Suspense>
  );
}
