"use client";

import { useParams, useSearchParams } from "next/navigation";
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { Suspense, useState } from "react";

// 임시 단체 데이터 (실제로는 API에서 가져와야 함)
const mockGroupRecord = {
  groupName: "전국마라톤협회",
  representative: "정영기",
  participants: [
    {
      id: 1,
      name: "홍길동",
      gender: "남",
      birthDate: "1988.08.08",
      contact: "010-8989-8989",
      category: "10km",
      record: "00:50:32:20"
    },
    {
      id: 2,
      name: "홍길동",
      gender: "남",
      birthDate: "1988.08.08",
      contact: "010-8989-8989",
      category: "10km",
      record: "00:50:32:20"
    },
    {
      id: 3,
      name: "홍길동",
      gender: "남",
      birthDate: "1988.08.08",
      contact: "010-8989-8989",
      category: "10km",
      record: "00:50:32:20"
    },
    {
      id: 4,
      name: "홍길동",
      gender: "남",
      birthDate: "1988.08.08",
      contact: "010-8989-8989",
      category: "10km",
      record: "00:50:32:20"
    },
    {
      id: 5,
      name: "홍길동",
      gender: "남",
      birthDate: "1988.08.08",
      contact: "010-8989-8989",
      category: "10km",
      record: "00:50:32:20"
    },
    {
      id: 6,
      name: "홍길동",
      gender: "남",
      birthDate: "1988.08.08",
      contact: "010-8989-8989",
      category: "10km",
      record: "00:50:32:20"
    },
    // 더보기로 표시될 추가 참가자들
    {
      id: 7,
      name: "김철수",
      gender: "남",
      birthDate: "1990.05.15",
      contact: "010-1234-5678",
      category: "10km",
      record: "00:48:15:30"
    },
    {
      id: 8,
      name: "이영희",
      gender: "여",
      birthDate: "1992.12.03",
      contact: "010-9876-5432",
      category: "10km",
      record: "00:52:45:12"
    },
    {
      id: 9,
      name: "박민수",
      gender: "남",
      birthDate: "1985.07.22",
      contact: "010-5555-6666",
      category: "10km",
      record: "00:49:30:45"
    },
    {
      id: 10,
      name: "최지영",
      gender: "여",
      birthDate: "1988.11.18",
      contact: "010-7777-8888",
      category: "10km",
      record: "00:51:20:33"
    }
  ]
};

function GroupRecordContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  
  // 쿼리 파라미터에서 데이터 추출 (실제로는 API로 조회)
  const groupName = searchParams.get('groupName') || mockGroupRecord.groupName;
  const representative = searchParams.get('representative') || mockGroupRecord.representative;
  const birthDate = searchParams.get('birthDate') || "1963.08.17";
  
  // 표시할 참가자 목록 (처음에는 6명만, 더보기 클릭 시 전체)
  const displayedParticipants = showAllParticipants 
    ? mockGroupRecord.participants 
    : mockGroupRecord.participants.slice(0, 6);
  
  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "기록조회",
        subMenu: "기록 조회 결과"
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
                  {groupName}
                </div>
              </div>
              
              <div className="flex border-b border-gray-200 pb-3">
                <div className="w-24 text-sm font-medium text-gray-700 bg-white px-3 py-2">
                  대표자명
                </div>
                <div className="flex-1 text-sm text-gray-900 px-3 py-2">
                  {representative}
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

        {/* 참가자 정보 섹션 */}
        <div className="bg-white mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
              참가자 정보
            </h2>
            
            {/* 참가자 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">번호</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">이름</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">성별</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">생년월일</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">연락처</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">참가종목</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">기록</th>
                    <th className="text-left text-sm font-medium text-gray-700 py-3 px-2">
                      기록증
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedParticipants.map((participant, index) => (
                    <tr key={participant.id} className="border-b border-gray-200">
                      <td className="text-sm text-gray-900 py-3 px-2">{index + 1}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{participant.name}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{participant.gender}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{participant.birthDate}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{participant.contact}</td>
                      <td className="text-sm text-gray-900 py-3 px-2">{participant.category}</td>
                      <td className="text-sm text-gray-900 py-3 px-2 font-semibold">{participant.record}</td>
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
        <div className="flex justify-center items-center">
          <button 
            onClick={() => setShowAllParticipants(!showAllParticipants)}
            className="px-12 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-2"
          >
            {showAllParticipants ? "접기" : "더보기"}
            {showAllParticipants ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
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
