"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GroupRegistrationConfirmData } from "./types";
import { fetchGroupRegistrationConfirm, createEditData } from "./api";

// Mock 데이터 (API 연결 전까지 사용)
const mockGroupApplicationData: GroupRegistrationConfirmData = {
  registrationDate: "2025-09-18",
  organizationName: "전마협과아이들",
  organizationAccount: "kjk0626",
  birth: "2000-06-26",
  address: "서울 중랑구 겸재로 237 (망우동), 2층",
  zipCode: "02175",
  phNum: "010-1234-5678",
  email: "ko0626@naver.com",
  sumAmount: 99000,
  organizationHeadCount: 2,
  paymentType: "ACCOUNT_TRANSFER",
  paymenterName: "고재건",
  paymentStatus: "UNPAID",
  innerUserRegistrationList: [
    {
      registrationId: "REG001",
      personalAccount: "kjk0626",
      name: "고재건",
      gender: "M",
      birth: "2000-06-26",
      phNum: "010-1234-5678",
      eventCategoryName: "Full Marathon(t-shirts + cup)",
      souvenir: [
        {
          souvenirName: "1301",
          souvenirSize: "S"
        }
      ],
      amount: 50000
    },
    {
      registrationId: "REG002",
      personalAccount: "kjk0626_2",
      name: "김마라톤",
      gender: "F",
      birth: "1995-03-15",
      phNum: "010-9876-5432",
      eventCategoryName: "Half Marathon",
      souvenir: [
        {
          souvenirName: "1",
          souvenirSize: "사이즈 없음"
        }
      ],
      amount: 49000
    }
  ]
};

export default function GroupApplicationConfirmResultPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [groupApplicationData, setGroupApplicationData] = useState<GroupRegistrationConfirmData>(mockGroupApplicationData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL 파라미터에서 데이터 가져오기
  const dataParam = searchParams.get('data');

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        setGroupApplicationData(decodedData);
      } catch (err) {
        setError('데이터를 불러올 수 없습니다.');
      }
    } else {
      setError('신청 정보가 없습니다.');
    }
    setIsLoading(false);
  }, [dataParam]);

  const handleBackToList = () => {
    router.push(`/event/${params.eventId}/registration/confirm`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getGenderLabel = (gender: "M" | "F") => {
    return gender === "M" ? "남성" : "여성";
  };

  const getPaymentTypeLabel = (paymentType: "CARD" | "ACCOUNT_TRANSFER") => {
    return paymentType === "CARD" ? "카드결제" : "계좌이체";
  };

  const getPaymentStatusLabel = (status: "UNPAID" | "PAID") => {
    return status === "PAID" ? "입금완료" : "입금대기";
  };

  const getPaymentStatusColor = (status: "UNPAID" | "PAID") => {
    return status === "PAID" ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={params.eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">단체신청 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  if (error) {
    return (
      <SubmenuLayout 
        eventId={params.eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 확인 결과"
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

  return (
    <SubmenuLayout 
      eventId={params.eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "단체 신청 확인 결과"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* 신청 정보 카드 */}
          <div className="bg-white mb-8">

            {/* 신청 정보 섹션 */}
            <div className="p-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4">신청 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">신청일시</label>
                  <span className="text-base text-black">
                    {groupApplicationData.registrationDate}
                  </span>
                </div>
              </div>
            </div>

            {/* 단체 정보 섹션 */}
            <div className="p-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4">단체 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">단체명</label>
                  <span className="text-base text-black">{groupApplicationData.organizationName}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">단체 ID</label>
                  <span className="text-base text-black">{groupApplicationData.organizationAccount}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">대표자명</label>
                  <span className="text-base text-black">{groupApplicationData.innerUserRegistrationList[0]?.name || "정보 없음"}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">대표자 생년월일</label>
                  <span className="text-base text-black">{groupApplicationData.birth}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">우편번호</label>
                  <span className="text-base text-black">{groupApplicationData.zipCode}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4">
                  <label className="text-base font-medium text-black">주소</label>
                  <span className="text-base text-black">
                    {groupApplicationData.address}
                  </span>
                </div>
              </div>
            </div>

            {/* 연락처 정보 섹션 */}
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4 pt-8">연락처 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">휴대폰번호</label>
                  <span className="text-base text-black">{groupApplicationData.phNum}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4">
                  <label className="text-base font-medium text-black">이메일</label>
                  <span className="text-base text-black">{groupApplicationData.email}</span>
                </div>
              </div>
            </div>

            {/* 참가자 정보 섹션 */}
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4 pt-8">참가자 정보</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupApplicationData.innerUserRegistrationList.map((participant, index) => (
                  <div key={participant.registrationId} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    {/* 참가자 헤더 */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <h4 className="text-lg font-bold text-black">{participant.name}</h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {getGenderLabel(participant.gender)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {participant.amount.toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    {/* 참가자 상세 정보 */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">생년월일</span>
                        <span className="text-black font-semibold">
                          {participant.birth}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">전마협 ID</span>
                        <span className="text-black font-semibold">{participant.personalAccount || "없음"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">기념품</span>
                        <span className="text-black font-semibold">
                          {participant.souvenir.length > 0 
                            ? `${participant.souvenir[0].souvenirName} (${participant.souvenir[0].souvenirSize})`
                            : '없음'
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">연락처</span>
                        <span className="text-black font-semibold">{participant.phNum}</span>
                      </div>
                    </div>

                    {/* 비용 상세 정보 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">종목&비용 상세</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">참가종목</span>
                          <span className="text-black">{participant.eventCategoryName}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">기념품</span>
                          <span className="text-black">
                            {participant.souvenir.length > 0 
                              ? participant.souvenir[0].souvenirName
                              : '없음'
                            }
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">사이즈</span>
                          <span className="text-black">
                            {participant.souvenir.length > 0 
                              ? participant.souvenir[0].souvenirSize
                              : '없음'
                            }
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-700">총금액</span>
                            <span className="text-blue-600">{participant.amount.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 정보 섹션 */}
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4 pt-8">결제 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">참가인원</label>
                  <span className="text-base text-black">{groupApplicationData.organizationHeadCount}명</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">총 참가비</label>
                  <span className="text-base text-black">
                    {groupApplicationData.sumAmount.toLocaleString()}원
                  </span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">결제방법</label>
                  <span className="text-base text-black">{getPaymentTypeLabel(groupApplicationData.paymentType)}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">입금자명</label>
                  <span className="text-base text-black">{groupApplicationData.paymenterName}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4">
                  <label className="text-base font-medium text-black">결제상태</label>
                  <span className={`text-base font-semibold ${getPaymentStatusColor(groupApplicationData.paymentStatus)}`}>
                    {getPaymentStatusLabel(groupApplicationData.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => {
                const editData = createEditData(groupApplicationData);
                const queryString = `?mode=edit&data=${encodeURIComponent(JSON.stringify(editData))}`;
                router.push(`/event/${params.eventId}/registration/apply/group${queryString}`);
              }}
              className="min-w-[120px] md:min-w-[140px] px-6 md:px-8 py-3 md:py-4 bg-white text-black border-2 border-black rounded-lg font-medium text-sm md:text-base hover:bg-gray-100 transition-colors"
            >
              수정하기
            </button>
            <button
              onClick={handleBackToList}
              className="min-w-[120px] md:min-w-[140px] px-6 md:px-8 py-3 md:py-4 bg-black text-white rounded-lg font-medium text-sm md:text-base hover:bg-gray-800 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
