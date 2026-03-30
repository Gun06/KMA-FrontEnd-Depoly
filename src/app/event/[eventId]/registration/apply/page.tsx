"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { getAgreementData } from "../agreement/data";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import { checkStatusToRequest } from "./shared/api/event";
import { fetchPublicEventTerms, type PublicEventTerm } from "./shared/api/terms";
import MarathonApplyStaticTerms from "./shared/components/MarathonApplyStaticTerms";

export default function ApplyPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const agreementData = getAgreementData(params.eventId);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [possibleToRequest, setPossibleToRequest] = useState<boolean | null>(null);
  const [requestReason, setRequestReason] = useState<string | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [eventStatus, setEventStatus] = useState<string | null>(null);
  const [apiTerms, setApiTerms] = useState<PublicEventTerm[]>([]);
  const [termsLoading, setTermsLoading] = useState(true);

  useEffect(() => {
    // 페이지 로딩 완료 시 로딩 상태 해제
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 대회 신청 가능 여부 조회 (새로운 API 사용)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsStatusLoading(true);
        const statusResponse = await checkStatusToRequest(params.eventId, 'CREATE');
        setPossibleToRequest(statusResponse.possibleToRequest);
        setRequestReason(statusResponse.reason || null);
      } catch {
        // 무시: 상태를 못 불러와도 기본 동작은 유지
      } finally {
        setIsStatusLoading(false);
      }
    };

    fetchStatus();
  }, [params.eventId]);

  // 이벤트 상태 명시적으로 로드 (접수마감/내부마감 구분용)
  useEffect(() => {
    const loadEventStatus = async () => {
      const eventId = params.eventId;
      if (!eventId) return;
      const base = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      try {
        const eventRes = await fetch(`${base}/api/v1/public/event/${eventId}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!eventRes.ok) return;
        const eventData = await eventRes.json();
        // 이벤트 상태 추출
        if (eventData?.eventInfo?.eventStatus) {
          setEventStatus(eventData.eventInfo.eventStatus);
        } else if (eventData?.eventStatus) {
          setEventStatus(eventData.eventStatus);
        }
      } catch {
        // 실패 시 무시
      }
    };

    loadEventStatus();
  }, [params.eventId]);

  useEffect(() => {
    let cancelled = false;
    const loadTerms = async () => {
      setTermsLoading(true);
      try {
        const list = await fetchPublicEventTerms(params.eventId);
        if (!cancelled) setApiTerms(list);
      } catch {
        if (!cancelled) setApiTerms([]);
      } finally {
        if (!cancelled) setTermsLoading(false);
      }
    };
    loadTerms();
    return () => {
      cancelled = true;
    };
  }, [params.eventId]);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleApplyClick = (kind: "individual" | "group") => {
    if (!isAgreed) {
      showAlert("약관에 동의하셔야 신청이 가능합니다.");
      return;
    }

    // 내부마감 체크 (최우선)
    if (eventStatus === 'FINAL_CLOSED') {
      showAlert("현재 대회 신청 및 수정 일정이 마감되어 신청할 수 없습니다.");
      return;
    }

    // 접수마감 체크
    if (eventStatus === 'CLOSED') {
      showAlert("현재 접수가 마감되어 신청할 수 없습니다.");
      return;
    }

    // possibleToRequest API 체크
    if (possibleToRequest === false) {
      const reason = requestReason || "현재 신청이 불가능합니다.";
      showAlert(reason);
      return;
    }

    // 상태를 아직 못 불러온 경우에는 기본적으로 진행 허용
    if (possibleToRequest === null && isStatusLoading) {
      router.push(
        `/event/${params.eventId}/registration/apply/${kind === "individual" ? "individual" : "group"}`
      );
      return;
    }

    // 신청 가능한 경우 신청 페이지로 이동
    router.push(
      `/event/${params.eventId}/registration/apply/${kind === "individual" ? "individual" : "group"}`
    );
  };

  // 로딩 중일 때 로딩 스피너 표시
  if (isPageLoading) {
    return (
      <SubmenuLayout
        eventId={params.eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "신청하기"
        }}
      >
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">잠시만 기다려주세요</p>
              </div>
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
        subMenu: "신청하기",
      }}
    >
      {/* 신청 불가 안내 모달 */}
      <ErrorModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="신청이 불가능합니다"
        message={alertMessage}
        confirmText="확인"
      />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* 상단 면책조항 박스 */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-center">
              나는 {agreementData.eventName}에 참가하면서, {agreementData.organizationName}가 규정하는 참가자 동의사항에 대해 다음과 같이 동의하고 확인합니다.
            </p>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="bg-white p-6 mb-6">
            {/* 헤더 섹션 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 sm:mb-0">
                참가자 유의사항
              </h1>
            </div>

            <hr className="border-black mb-6" style={{ borderWidth: '1.7px' }} />

            {/* 상세 내용 */}
            <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">천재지변(자연재해) 및 전쟁, 국가비상상태, 재난(전염병(질병)) 등으로 인하여 대회가 취소될시 참가금 환불 안됨. (단, 기념품은 발송)</span>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">고혈압, 심근검색, 심장병, 당뇨, 기타질병으로 인하여 대회 사망시 주최측에서 책임을 지지 않으며, 보험혜택을 받을 수 없습니다.</span>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">종목별 제한시간이 초과 된 경우 시상에서 제외됩니다.</span>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">애완동물 동반 참가불가</span>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">택배배송 : 주최측 부담일 경우 기념품, 책자, 배번호, 칩 일괄배송(대회 사정상 변경될 수 있습니다.)</span>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-gray-700 flex-shrink-0">•</span>
                <span className="text-gray-700">수신자 부담일 경우 대회당일 현장 배부 (대회 미참가 시 수신자 부담으로 기념품 배송)</span>
              </div>
            </div>
          </div>

          {/* 약관 섹션 */}
          <div className="bg-white p-6 mb-6">
            {/* 약관 헤더 */}
            <div className="text-left mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">약관</h2>
              <hr className="border-black mb-3" style={{ borderWidth: '1.7px' }} />
            </div>

            <p className="text-sm sm:text-base text-gray-900">※ 마라톤대회 신청 약관(필독)</p>
            {/* 안전 안내 (고정 블록) */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[250px]">
              <p className="font-bold text-gray-800 mb-4">
                안전한 레이스를 위한 안내 사항 (필독)!!!
              </p>

              <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>
                  뛰는 동안 자신의 몸 상태를 확인하고 이상이 있는 경우 뛰는 것을 바로 멈춰야 합니다.<br />
                  (달리는 도중 어지러움, 가슴 통증, 심한 숨 가쁨, 극심한 피로감, 근육 경련, 탈수 등의 증상)<br />
                  무리하게 달리면 심각한 경우 쓰러지거나 심근경색 등 심혈관계 질환의 가능성이 있으므로<br />
                  달리기를 멈추고 즉시 의료진의 도움을 받아야 합니다.<br />
                  훈련이 제대로 되지 않은 상태에서는 자신의 체력과 능력을 고려하고 속도를 조절하며 달려주세요.<br />
                  달리기 전 준비 운동과 충분한 수분 섭취 필수! 달린 후 충분한 휴식을 가지는 것이 중요!
                </p>
                <p className="font-semibold text-gray-800">
                  위와 같이 안전한 레이스를 지키지 않거나 질병이나 본인의 과실로 인한 사고는 보험 적용이 되지 않습니다.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-2 font-pretendard">
              참가 신청 약관 안내
            </p>
            <div className="bg-gray-100 rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <MarathonApplyStaticTerms />
            </div>

            {!termsLoading && apiTerms.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-2 font-pretendard mt-4">
                  대회 약관
                </p>
                <div className="bg-gray-100 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                    {apiTerms.map((term, idx) => (
                      <div key={term.id ?? `api-term-${idx}`}>
                        {term.title ? (
                          <p className="font-bold text-gray-800 mb-2">{term.title}</p>
                        ) : null}
                        <p className="whitespace-pre-wrap">{term.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* 동의 및 신청 섹션 */}
          <div className="bg-white p-6">
            {/* 동의 체크박스 */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="agreement-checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="agreement-checkbox" className="text-sm sm:text-base text-gray-700">
                  약관 내용을 이해하였으며, 약관에 동의합니다.
                </label>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-row gap-3 justify-center">
              <button
                type="button"
                className={`px-8 py-3 rounded font-semibold transition-colors ${isAgreed &&
                    possibleToRequest !== false &&
                    eventStatus !== 'CLOSED' &&
                    eventStatus !== 'FINAL_CLOSED'
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-pointer"
                  }`}
                onClick={() => handleApplyClick("individual")}
              >
                개인신청
              </button>
              <button
                type="button"
                className={`px-8 py-3 rounded font-semibold transition-colors ${isAgreed &&
                    possibleToRequest !== false &&
                    eventStatus !== 'CLOSED' &&
                    eventStatus !== 'FINAL_CLOSED'
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-pointer"
                  }`}
                onClick={() => handleApplyClick("group")}
              >
                단체신청
              </button>
            </div>
          </div>
        </div>
      </div>
    </SubmenuLayout>
  );
}
