"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { IndividualGroupRegistrationData } from "../../types";
import { fetchIndividualGroupRegistration } from "../../api";
import IndividualGroupConfirmResult from "@/components/event/Registration/IndividualGroupConfirmResult";

export default function IndividualGroupConfirmResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const [individualData, setIndividualData] = useState<IndividualGroupRegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 쿼리 파라미터에서 인증 정보 가져오기
        const orgAccount = searchParams.get('orgAccount');
        const name = searchParams.get('name');
        const phNum = searchParams.get('phNum');
        const birth = searchParams.get('birth');

        if (!orgAccount || !name || !phNum || !birth) {
          setError('인증 정보가 누락되었습니다. 다시 확인해주세요.');
          setIsLoading(false);
          return;
        }

        // API 호출하여 개별 확인 데이터 가져오기
        const response = await fetchIndividualGroupRegistration(eventId, {
          orgAccount: decodeURIComponent(orgAccount),
          name: decodeURIComponent(name),
          phNum: decodeURIComponent(phNum),
          birth: decodeURIComponent(birth),
        });

        setIndividualData(response);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams, eventId]);

  const handleBackToList = () => {
    router.push(`/event/${eventId}/registration/confirm/group`);
  };

  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 개별 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">개별 신청 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  if (error) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 개별 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-lg text-red-600 mb-4">{error}</p>
              <button
                onClick={handleBackToList}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  if (!individualData) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 개별 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-4">데이터를 불러올 수 없습니다.</p>
              <button
                onClick={handleBackToList}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "단체 신청 개별 확인 결과"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 페이지 제목 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">단체 신청 개별 확인 결과</h1>
            <hr className="border-black border-[1.5px]" />
          </div>

          {/* 개별 확인 결과 컴포넌트 */}
          <IndividualGroupConfirmResult data={individualData} />

          {/* 버튼 그룹 */}
          <div className="flex flex-row justify-center gap-2 sm:gap-4 mt-8">
            {/* 목록으로 돌아가기 버튼 */}
            <button
              onClick={handleBackToList}
              className="min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors bg-black text-white hover:bg-gray-800"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}


