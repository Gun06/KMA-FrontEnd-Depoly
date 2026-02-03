"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { getAgreementData } from "../agreement/data";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import { checkStatusToRequest } from "./shared/api/event";

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
                <span className="text-gray-700">천재지변(자연재해) 및 전쟁, 국가비상상태, 재난(전염병(질병)) 등으로 인하여 대회가 취소될시 참가금 환불 안됨. (단, 기념품 배송)</span>
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
            {/* 약관 내용 */}
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

            {/* 추가 약관 내용 영역 */}
            <div className="bg-gray-100 rounded-lg p-4 h-[300px] overflow-y-auto">
              <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 참가자 건강상태 확인</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      참가자는 본인이 신청한 종목을 무리 없이 달릴 수 있는지 건강상태를 반드시 확인해야 합니다. 행사 전날 과로, 과음을 자제해 주시기 바랍니다. 특히 심한 고혈압이나 심장질환이 있으신 분께서는 미리 의료기관에서 검진을 받으시길 바라며, 절대 무리한 레이스는 피하시기 바랍니다. 경우에 따라 대회본부는 건강진단서 제출을 요구할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 참가자의 자발적 책임</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      참가자는 대회 참가에 따른 모든 위험을 자발적으로 수락하며, 건강 상태와 관련된 어떠한 불편함이나 위험에 대해 스스로 책임져야 합니다. 본인의 건강관리에 충분히 주의하시고, 달리는 중 이상을 느꼈을 때에는 즉시 레이스를 중지하시기 바랍니다.
                    </p>
                    <div className="pl-5">
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-red-500 flex-shrink-0">※</span>
                        <span className="text-red-500">특히 열사병과 같은 날씨와 관련된 질환이 발생할 경우에도 책임은 본인에게 있음을 유의하시기 바랍니다.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 응급 상황 대응 지침</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      대회 중 응급 상황이 발생할 경우, 가장 가까운 의료 지원팀이나 행사 요원에게 즉시 알리도록 안내합니다. 주최측은 응급 상황 시 신속한 의료 지원을 제공하기 위해 대기 중이지만, 참가자의 사전 건강 관리 소홀로 인한 사고에 대해서는 책임을 지지 않습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 개인 보험 권장</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      대회 참가자는 행사보험에 가입되어 있습니다. 다만, 주최 측의 과실로 인한 사고 혹은 급격하고 외래적인 부상 외에는 주최 측에서 책임을 지지 않습니다. 참가자 본인은 추가적인 개인 스포츠 보험 가입을 권장하며, 특히 기존 건강에 문제가 있는 경우나 부상 위험이 높은 경우 개인 보험을 통해 보다 안전하게 대회에 참가할 수 있도록 합니다.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 레이스 전 음식 및 음료 주의사항</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      행사 전날 및 레이스 당일에는 차가운 음식, 카페인 음료, 술은 절대 금지입니다. 이러한 음식과 음료는 신체에 부담을 주고 탈수나 소화 문제를 일으킬 수 있으므로, 참가자분들은 반드시 피하도록 합니다.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 레이스 도중 컨디션 체크</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      참가자는 레이스 도중에도 자신의 신체 상태를 주기적으로 확인하고, 어지러움, 현기증, 호흡 곤란, 심장 두근거림 등의 이상 증상을 느낄 경우 즉시 레이스를 중지하고 의료 지원을 요청해야 합니다.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 기후와 날씨 조건에 따른 유의사항</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      대회 당일 기후와 날씨 조건에 따라 참가자의 안전에 추가적인 영향을 미칠 수 있으므로, 날씨에 맞는 복장과 충분한 수분 섭취 등 대비책을 마련해 주시기 바랍니다.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 안전 장비 사용 권장</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      심장박동 측정기, GPS 추적기 등의 개인 안전 장비 사용을 권장하며, 이를 통해 자신의 상태를 실시간으로 모니터링할 수 있도록 합니다.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 참가 자격 제한</p>
                  <div className="pl-5">
                    <p className="mb-2">
                      18세 미만 참가자의 경우 주최측은 부모나 법적 보호자의 동의서를 요구할 수 있으며, 건강 상태에 따라 일부 참가자에 대해 참가를 제한할 수 있는 권한을 가지고 있음을 명시합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
