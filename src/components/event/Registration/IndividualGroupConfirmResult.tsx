"use client";

import { IndividualGroupRegistrationData } from "@/app/event/[eventId]/registration/confirm/group/types";

interface IndividualGroupConfirmResultProps {
  data: IndividualGroupRegistrationData;
}

export default function IndividualGroupConfirmResult({ data }: IndividualGroupConfirmResultProps) {
  const getPaymentStatusText = (status: string | undefined): string => {
    if (!status) return "미입금";
    const statusMap: Record<string, string> = {
      UNPAID: "미입금",
      PAID: "결제완료",
      MUST_CHECK: "확인필요",
      NEED_REFUND: "환불요청",
      NEED_PARTITIAL_REFUND: "부분환불요청",
      COMPLETED: "완료",
      REFUNDED: "환불완료",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: string | undefined): string => {
    if (!status) return "text-red-600";
    if (status === "PAID" || status === "COMPLETED") return "text-green-600";
    if (status === "MUST_CHECK" || status === "NEED_REFUND" || status === "NEED_PARTITIAL_REFUND") return "text-orange-600";
    if (status === "REFUNDED") return "text-gray-600";
    return "text-red-600";
  };

  const getGenderLabel = (gender: "M" | "F") => {
    return gender === "M" ? "남성" : "여성";
  };

  const getPaymentTypeLabel = (paymentType: "CARD" | "ACCOUNT_TRANSFER") => {
    return paymentType === "CARD" ? "카드결제" : "계좌이체";
  };

  const parseCategoryName = (categoryName: string) => {
    if (!categoryName) return { distance: "", detailCategory: "" };
    const parts = categoryName.split("|").map((p: string) => p.trim());
    const distance = parts[0] || "";
    const detailCategory = parts.length > 1 ? parts.slice(1).join(" | ") : "";
    return { distance, detailCategory };
  };

  const { distance, detailCategory } = parseCategoryName(data.eventCategoryName);
  const souvenirItems =
    data.souvenir && data.souvenir.length > 0
      ? data.souvenir.map((item) => {
          const hasSize = item.souvenirSize !== "사이즈 없음" && item.souvenirSize !== "기념품 없음";
          if (item.souvenirName === "기념품 없음") return "기념품 없음";
          return hasSize ? `${item.souvenirName} (${item.souvenirSize})` : item.souvenirName;
        })
      : ["기념품 없음"];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="px-5 sm:px-7 py-5 border-b border-gray-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">{data.name}</h3>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full">
                    {getGenderLabel(data.gender)}
                  </span>
                  {data.checkOwned && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      소유
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">개별 신청 정보</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-500 mb-1">총 결제금액</p>
              <p className="text-2xl font-semibold text-gray-900">{data.amount.toLocaleString()}원</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">결제상태</span>
            <span className={`font-semibold ${getPaymentStatusColor(data.paymentStatus)}`}>
              {getPaymentStatusText(data.paymentStatus)}
            </span>
            {data.paymentType && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-gray-700">
                  {getPaymentTypeLabel(data.paymentType)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-10">
          {/* 소유 신청 설명문 */}
          {data.checkOwned && (
            <section>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">소유 신청 안내</h4>
                <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-1">
                  <p>• 단체 내 개별 신청에 대해 비밀번호가 재발급되어 관리 및 소유권을 이전받은 신청은 소유 신청으로 명명합니다.</p>
                  <p>• 소유 신청으로 전환된 신청은, 단체장이 아닌 본인이 신청 내역의 수정 책임을 담당합니다.</p>
                  <p>• 소유 신청은 개인정보와 참여 정보, 기념품 배송 주소를 수정 가능합니다.</p>
                  <p>• 소유 신청은 결제 정보를 수정할 수 없습니다.</p>
                  <p>• 결제 후 종목 변경 시도 등의 동작을 위한 환불 신청이나, 단순 환불 신청은 단체장에게 문의바랍니다.</p>
                </div>
              </div>
            </section>
          )}

          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">기본 정보</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">생년월일</span>
                <span className="font-semibold text-gray-900">{data.birth}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">연락처</span>
                <span className="font-semibold text-gray-900">{data.phNum}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">전마협 ID</span>
                <span className="font-semibold text-gray-900">{data.personalAccount || "없음"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">이메일</span>
                <span className="font-semibold text-gray-900">{data.email || "없음"}</span>
              </div>
              {data.filteredAddress && (
                <div className="sm:col-span-2 flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">주소</span>
                  <span className="font-semibold text-gray-900 text-right break-all">
                    ({data.filteredAddress.zipCode}) {data.filteredAddress.address} {data.filteredAddress.addressDetail}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">참가 항목</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">참가종목</span>
                <span className="font-semibold text-gray-900">{distance || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">참가종목 상세</span>
                <span className="font-semibold text-gray-900">{detailCategory || "-"}</span>
              </div>
              <div className="sm:col-span-2 flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">기념품</span>
                <div className="flex flex-wrap justify-end gap-2 max-w-[70%]">
                  {souvenirItems.map((label, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">결제 정보</h4>
            <div className="rounded-xl border border-gray-200 p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">결제상태</span>
                <span className={`font-semibold ${getPaymentStatusColor(data.paymentStatus)}`}>
                  {getPaymentStatusText(data.paymentStatus)}
                </span>
              </div>
              {data.paymentType && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">결제 방식</span>
                  <span className="font-semibold text-gray-900">{getPaymentTypeLabel(data.paymentType)}</span>
                </div>
              )}
              {data.paymenterName && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">입금자명</span>
                  <span className="font-semibold text-gray-900">{data.paymenterName}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-gray-700 font-semibold">총금액</span>
                <span className="text-lg font-bold text-blue-700">{data.amount.toLocaleString()}원</span>
              </div>
            </div>
          </section>

          {data.note && (
            <section>
              <h4 className="text-base font-semibold text-gray-900 mb-3">비고</h4>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap">
                {data.note}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

