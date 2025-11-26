"use client";

import { useParams, useSearchParams } from "next/navigation";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { Suspense, useState } from "react";
import type { RecordResponse } from "@/services/record";

function GroupRecordContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const [showAll, setShowAll] = useState(false);
  
  // API에서 받은 실제 데이터 추출
  const resultsParam = searchParams.get('results');
  
  let records: RecordResponse[] = [];
  try {
    if (resultsParam) {
      records = JSON.parse(resultsParam);
    }
  } catch (error) {
    // 단체 기록 데이터 파싱 실패
  }
  
  // 데이터가 없으면 에러 표시
  if (!resultsParam || records.length === 0) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "기록조회",
          subMenu: "단체 기록 조회 결과"
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-medium mb-2">
              단체 기록 조회에 실패했습니다
            </div>
            <p className="text-gray-600 mb-4">
              입력하신 정보로 단체 기록을 찾을 수 없습니다.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              다시 조회하기
            </button>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 시간 포맷팅 함수
  const formatTime = (timeObj: any) => {
    if (typeof timeObj === 'string') {
      return timeObj;
    }
    if (timeObj.hour !== undefined && timeObj.minute !== undefined && timeObj.second !== undefined) {
      return `${String(timeObj.hour).padStart(2, '0')}:${String(timeObj.minute).padStart(2, '0')}:${String(timeObj.second).padStart(2, '0')}`;
    }
    return '00:00:00';
  };

  const displayedRecords = showAll ? records : records.slice(0, 5);
  
  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "기록조회",
        subMenu: "단체 기록 조회 결과"
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 단체 정보 섹션 */}
        <div className="bg-white mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
              단체 정보
            </h2>
            
            <div className="space-y-4">
              <div className="flex border-b border-gray-200 pb-3">
                <div className="w-24 text-sm font-medium text-gray-700 bg-white px-3 py-2">
                  단체명
                </div>
                <div className="flex-1 text-sm text-gray-900 px-3 py-2">
                  {records[0]?.orgName || '개인'}
                </div>
              </div>
              
              <div className="flex border-b border-gray-200 pb-3">
                <div className="w-24 text-sm font-medium text-gray-700 bg-white px-3 py-2">
                  참가인원
                </div>
                <div className="flex-1 text-sm text-gray-900 px-3 py-2">
                  {records.length}명
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 참가자 목록 섹션 */}
        <div className="bg-white mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
              참가자 목록
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">순번</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">이름</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">생년월일</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">참가부문</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">참가번호</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">기록</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">기록증</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRecords.map((record, index) => (
                    <tr key={record.resultId} className="border-b border-gray-200">
                      <td className="text-sm text-gray-900 py-3 px-2">{index + 1}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{record.name}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{record.birth}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{record.course}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{record.number}</td>
                      <td className="text-sm text-gray-900 py-3 px-2 font-semibold">{formatTime(record.resultTime)}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">
                        <div className="flex items-center">
                          <span className="text-xs">기록증.pdf</span>
                          <button className="ml-2 w-5 h-5 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">
                            <Download className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 더보기 버튼 */}
        {records.length > 5 && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  더보기 ({records.length - 5}명 더)
                </>
              )}
            </button>
          </div>
        )}

        {/* 전체 기록증 다운로드 섹션 */}
        <div className="bg-white">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
              전체 기록증
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">전체 기록증 다운로드</p>
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

export default function GroupRecordsResultPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">단체 기록을 조회하는 중...</p>
        </div>
      </div>
    }>
      <GroupRecordContent />
    </Suspense>
  );
}