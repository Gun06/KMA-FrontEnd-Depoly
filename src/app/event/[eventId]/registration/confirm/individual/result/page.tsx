"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { IndividualRegistrationResponse } from "@/app/event/[eventId]/registration/apply/shared/types/common";

export default function IndividualApplicationConfirmResultPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationData, setRegistrationData] = useState<IndividualRegistrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        setRegistrationData(decodedData);
      } catch (err) {
        setError('데이터를 불러올 수 없습니다.');
      }
    } else {
      setError('신청 정보가 없습니다.');
    }
    setIsLoading(false);
  }, [searchParams]);

  const handleBackToList = () => {
    router.push(`/event/${params.eventId}/registration/confirm/individual`);
  };

  const handleEdit = () => {
    // 수정 모드로 개인신청 페이지로 이동 (기존 데이터와 함께)
    const encodedData = encodeURIComponent(JSON.stringify(registrationData));
    router.push(`/event/${params.eventId}/registration/apply/individual?mode=edit&data=${encodedData}`);
  };

  // 성별 한글 변환
  const getGenderText = (gender: string) => {
    return gender === 'M' ? '남성' : '여성';
  };

  // 결제 방식 한글 변환
  const getPaymentTypeText = (paymentType: string) => {
    return paymentType === 'CARD' ? '카드' : '계좌이체';
  };

  // 결제 상태 한글 변환
  const getPaymentStatusText = (paymentStatus: string) => {
    return paymentStatus === 'PAID' ? '입금완료' : '미입금';
  };

  // 날짜 형식 변환 (YYYY-MM-DD -> YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={params.eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "개인 신청 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">신청 정보를 불러오는 중...</p>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  if (error || !registrationData) {
    return (
      <SubmenuLayout 
        eventId={params.eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "개인 신청 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 mb-4">{error || '신청 정보를 찾을 수 없습니다.'}</p>
              <button
                onClick={handleBackToList}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                돌아가기
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
        subMenu: "개인 신청 확인 결과"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* 신청 정보 카드 */}
          <div className="bg-white mb-8 shadow-lg rounded-lg overflow-hidden">

            {/* 신청 기본 정보 섹션 */}
            <div className="p-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4">신청 기본 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">신청일시</label>
                  <span className="text-base text-black">{formatDate(registrationData.registrationDate)}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4">
                  <label className="text-base font-medium text-black">개인계좌</label>
                  <span className="text-base text-black">
                    {registrationData.personalAccount || "없음"}
                  </span>
                </div>
              </div>
            </div>

            {/* 개인정보 섹션 */}
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4 pt-8">개인정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">이름</label>
                  <span className="text-base text-black">{registrationData.name}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">생년월일</label>
                  <span className="text-base text-black">{registrationData.birth}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">성별</label>
                  <span className="text-base text-black">{getGenderText(registrationData.gender)}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">휴대폰번호</label>
                  <span className="text-base text-black">{registrationData.phNum}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">이메일</label>
                  <span className="text-base text-black">{registrationData.email}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4">
                  <label className="text-base font-medium text-black">주소</label>
                  <span className="text-base text-black">
                    {registrationData.address}
                    {registrationData.zipCode && ` (${registrationData.zipCode})`}
                  </span>
                </div>
              </div>
            </div>

            {/* 신청 정보 섹션 */}
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4 pt-8">신청 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">참가종목</label>
                  <span className="text-base text-black">{registrationData.eventCategoryName}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">기념품</label>
                  <div className="text-base text-black text-right">
                    {registrationData.souvenir.map((item, index) => (
                      <div key={index}>
                        {item.souvenirName}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">사이즈</label>
                  <div className="text-base text-black text-right">
                    {registrationData.souvenir.map((item, index) => (
                      <div key={index}>
                        {item.souvenirSize !== "사이즈 없음" ? item.souvenirSize : "-"}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-4">
                  <label className="text-base font-medium text-black">비용</label>
                  <span className="text-base text-black">{registrationData.amount.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            {/* 결제 정보 섹션 */}
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4 pt-8">결제 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">결제 방식</label>
                  <span className="text-base text-black">{getPaymentTypeText(registrationData.paymentType)}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">입금자명</label>
                  <span className="text-base text-black">{registrationData.paymenterName}</span>
                </div>
                
                <div className="flex items-center justify-between pb-4">
                  <label className="text-base font-medium text-black">결제상태</label>
                  <span className={`text-base font-medium ${
                    registrationData.paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getPaymentStatusText(registrationData.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleEdit}
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
