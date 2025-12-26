"use client";

import { IndividualGroupRegistrationData } from "@/app/event/[eventId]/registration/confirm/group/types";

interface IndividualGroupConfirmResultProps {
  data: IndividualGroupRegistrationData;
}

export default function IndividualGroupConfirmResult({ data }: IndividualGroupConfirmResultProps) {
  // 결제 상태를 한글로 변환
  const getPaymentStatusText = (status: string | undefined): string => {
    if (!status) return '미입금';
    const statusMap: Record<string, string> = {
      'UNPAID': '미입금',
      'PAID': '결제완료',
      'MUST_CHECK': '확인필요',
      'NEED_REFUND': '환불요청',
      'NEED_PARTITIAL_REFUND': '부분환불요청',
      'COMPLETED': '완료',
      'REFUNDED': '환불완료',
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: string | undefined): string => {
    if (!status) return 'text-red-600';
    if (status === 'PAID' || status === 'COMPLETED') return 'text-green-600';
    if (status === 'MUST_CHECK' || status === 'NEED_REFUND' || status === 'NEED_PARTITIAL_REFUND') return 'text-orange-600';
    if (status === 'REFUNDED') return 'text-gray-600';
    return 'text-red-600';
  };

  const getGenderLabel = (gender: "M" | "F") => {
    return gender === "M" ? "남성" : "여성";
  };

  const getPaymentTypeLabel = (paymentType: "CARD" | "ACCOUNT_TRANSFER") => {
    return paymentType === "CARD" ? "카드결제" : "계좌이체";
  };

  // 참가종목 파싱 (거리와 세부종목 분리)
  const parseCategoryName = (categoryName: string) => {
    if (!categoryName) return { distance: '', detailCategory: '' };
    const parts = categoryName.split('|').map((p: string) => p.trim());
    const distance = parts[0] || '';
    const detailCategory = parts.length > 1 ? parts.slice(1).join(' | ') : '';
    return { distance, detailCategory };
  };

  const { distance, detailCategory } = parseCategoryName(data.eventCategoryName);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 참가자 정보 카드 */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* 참가자 헤더 */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h4 className="text-lg font-bold text-black">{data.name}</h4>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {getGenderLabel(data.gender)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {data.amount.toLocaleString()}원
            </div>
          </div>
        </div>

        {/* 참가자 상세 정보 */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">생년월일</span>
            <span className="text-black font-semibold">{data.birth}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">전마협 ID</span>
            <span className="text-black font-semibold">{data.personalAccount || "없음"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">연락처</span>
            <span className="text-black font-semibold">{data.phNum}</span>
          </div>
          {data.email && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">이메일</span>
              <span className="text-black font-semibold">{data.email}</span>
            </div>
          )}
          {data.filteredAddress && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">주소</span>
              <span className="text-black font-semibold text-right">
                ({data.filteredAddress.zipCode}) {data.filteredAddress.address} {data.filteredAddress.addressDetail}
              </span>
            </div>
          )}
        </div>

        {/* 비용 상세 정보 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">종목&비용 상세</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">참가종목</span>
              <span className="text-black">{distance || '-'}</span>
            </div>
            
            {detailCategory && (
              <div className="flex justify-between">
                <span className="text-gray-600">참가종목 상세</span>
                <span className="text-black">{detailCategory}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">기념품</span>
              <div className="text-black text-right">
                {data.souvenir && data.souvenir.length > 0
                  ? data.souvenir.map((item, idx) => {
                      const size = (item.souvenirSize === '사이즈 없음' || item.souvenirSize === '기념품 없음') ? '' : ` (${item.souvenirSize})`;
                      const label = (item.souvenirName === '기념품 없음') ? '없음' : `${item.souvenirName}${size}`;
                      return (
                        <div key={idx}>{label}</div>
                      );
                    })
                  : '없음'}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-700">총금액</span>
                <span className="text-blue-600">{data.amount.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 상태 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">결제상태</span>
            <span className={`text-sm font-semibold ${getPaymentStatusColor(data.paymentStatus)}`}>
              {getPaymentStatusText(data.paymentStatus)}
            </span>
          </div>
          {data.paymentType && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600 font-medium">결제 방식</span>
              <span className="text-black font-semibold">
                {getPaymentTypeLabel(data.paymentType)}
              </span>
            </div>
          )}
          {data.paymenterName && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600 font-medium">입금자명</span>
              <span className="text-black font-semibold">{data.paymenterName}</span>
            </div>
          )}
        </div>

        {/* 비고 */}
        {data.note && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-start justify-between">
              <span className="text-gray-600 font-medium">비고</span>
              <span className="text-black text-right whitespace-pre-wrap">{data.note}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

