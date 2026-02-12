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
            <div className="bg-gray-100 rounded-lg p-4 overflow-y-auto" style={{ maxHeight: '600px' }}>
              <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                {/* 약관 서문 */}
                <div>
                  <p className="font-bold text-gray-800 mb-2">◆ 본 대회에 참가 신청을 완료한 모든 참가자는 아래의 모든 내용을 충분히 숙지하고 이해하였으며, 이에 전면적으로 동의한 것으로 간주한다.</p>
                </div>

                {/* 구분자 */}
                <hr className="border-gray-400 my-4" />

                <div>
                  <p className="font-bold text-gray-800 mb-2">제1조 (목적)</p>
                  <p className="mb-2">
                    본 약관은 마라톤대회(이하 &quot;대회&quot;라 한다)의 원활한 운영과 참가자의 안전 확보를 도모하고, 대회 참가와 관련하여 발생할 수 있는 각종 위험 요소 및 주최·주관측의 책임 범위를 명확히 규정함을 목적으로 한다.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제2조 (참가 자격 및 신청)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 참가자는 각 코스별 참가 자격 요건을 충족해야 하며, 본인의 건강 상태와 체력을 충분히 고려하여 참가 여부를 스스로 결정한다.</p>
                    <p>2. 가명, 차명, 허위 정보로 신청하거나 참가권을 타인에게 양도·대여하는 행위는 엄격히 금지한다.</p>
                    <p>3. 실제 참가자와 참가 신청자(보험 가입자)가 일치하지 않을 경우, 대회 중 발생하는 모든 사고에 대하여 어떠한 보상도 받을 수 없다.</p>
                    <p>4. 참가자 변경, 대리 참가, 참가권 양도 또는 대여 사실이 확인될 경우 즉시 실격 처리되며, 향후 주최측이 주관·주최하는 대회의 참가 제한 등 불이익이 발생할 수 있다.</p>
                    <p>5. 주최측은 참가자의 건강 상태, 안전상 우려, 의료 인력 또는 관계 기관의 판단에 따라 참가자에게 건강진단서 제출을 요구하거나 대회 참가를 제한 또는 중단시킬 수 있으며, 이에 대해 참가자는 이의를 제기할 수 없다.</p>
                    <p>6. 만 18세 미만 참가자의 경우, 주최측은 부모 또는 법정대리인의 동의서 제출을 요구할 수 있으며, 해당 동의가 없는 경우 참가를 제한할 수 있다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제3조 (건강 상태 확인 및 자기책임 원칙)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 참가자는 대회 참가 전 반드시 의료기관 또는 의사의 자문 등을 통해 본인이 신청한 종목을 무리 없이 완주할 수 있는 건강 상태임을 스스로 확인한 후 참가한다.</p>
                    <p>2. 참가자는 충분한 사전 훈련을 거쳤으며, 대회 참가에 의학적·신체적 문제가 없음을 스스로 확인한 상태에서 대회에 참가한다.</p>
                    <p>3. 참가자는 고혈압, 심근경색, 협심증, 심장질환, 당뇨, 기타 기저질환(과거 병력 포함)이 있는 경우 대회 참가가 중대한 위험을 수반할 수 있음을 인지하고, 참가 여부에 대한 최종 판단과 책임이 전적으로 본인에게 있음을 인정한다.</p>
                    <p>4. 참가자는 대회 참가 중 본인의 건강 상태, 체력, 기저질환 등 개인적 사유로 발생하는 질병, 부상, 후유장해 또는 사망 등 모든 사고에 대한 1차적 책임이 본인에게 있음을 명확히 인지하고 이에 동의한다.</p>
                    <p>5. 참가자는 대회 참가 과정에서 발생할 수 있는 다음 각 호의 위험 요소를 충분히 인지하고, 그 위험을 수인한 상태에서 대회에 참가한다.</p>
                    <div className="pl-4 space-y-1">
                      <p>• 낙상, 충돌(다른 참가자, 응원객, 일반 시민 등)</p>
                      <p>• 차량 또는 각종 이동 수단과의 접촉</p>
                      <p>• 기상 조건(더위, 추위, 비, 바람, 습도, 미세먼지 등)</p>
                      <p>• 노면 상태(미끄러움, 요철, 젖은 노면 등)</p>
                      <p>• 달리기 행위 자체로 인한 근육·관절·심혈관계 부상</p>
                      <p>• 열사병, 탈수, 저체온증 등 기후 및 환경으로 인한 질환</p>
                      <p>• 낙하물, 돌발 상황 등 예측 불가능한 외부 요인</p>
                    </div>
                    <p>6. 참가자는 레이스 전날 및 레이스 당일 과도한 운동, 과로, 과음, 음주, 카페인 섭취, 차가운 음식 섭취 등이 신체에 부담을 줄 수 있음을 인지하고 이를 스스로 관리한다.</p>
                    <p>7. 참가자는 레이스 도중에도 자신의 신체 상태를 수시로 확인해야 하며, 어지러움, 현기증, 호흡 곤란, 심장 두근거림, 탈수, 열사병 증상 등 이상 증상을 인지한 경우 즉시 레이스를 중단해야 한다.</p>
                    <p>8. 참가자가 상기 이상 증상을 인지하였음에도 불구하고 자발적으로 레이스를 지속하여 발생한 모든 사고 및 손해에 대하여는 참가자 본인에게 책임이 있으며, 주최측은 책임을 지지 않는다.</p>
                    <p>9. 참가자는 상기 위험 요소를 포함하되 이에 국한하지 않고, 대회 참가로 인해 발생하는 모든 부상, 질병, 사고에 대하여 관계 법령상 허용되는 범위 내에서, 주최측의 고의 또는 중과실이 없는 한 주최측에 민·형사상 책임을 묻지 않기로 동의한다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제4조 (안전 관리 및 응급조치)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 주최측은 대회 운영 중 참가자의 안전을 위하여 합리적이고 통상적인 범위 내에서 안전 관리 및 예방 조치를 시행하며, 주요 지점에 구급차 및 응급 의료 인력을 배치할 수 있다.</p>
                    <p>2. 대회 중 응급 상황이 발생한 경우 참가자는 가장 가까운 의료 인력 또는 진행 요원에게 즉시 알려야 한다.</p>
                    <p>3. 주최측의 책임 범위는 사고 발생 시 현장에서의 1차 응급조치 및 병원 후송까지로 한정한다.</p>
                    <p>4. 병원 이송 이후의 치료, 후유증, 추가 손해 및 손실 등에 대해서는 주최측의 고의 또는 중과실이 없는 한 주최측은 어떠한 책임도 지지 않는다.</p>
                    <p>5. 참가자의 사전 건강 관리 소홀, 무리한 레이스 진행 또는 주최측이나 의료 인력의 중단 권고를 따르지 않아 발생한 사고에 대하여는 주최측은 책임을 지지 않는다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제5조 (보험 가입 및 보상 범위)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 본 대회는 영업배상책임보험에 가입한다.</p>
                    <p>2. 대회 중 발생한 사고에 대한 보상은 해당 보험의 약관 및 보장 한도 내에서 보험사가 부담한다.</p>
                    <p>3. 보험 보장 한도를 초과하는 손해, 마라톤과 직접적인 관련이 없는 사고, 참가자의 과실 또는 개인적 사유로 발생한 사고에 대해서는 주최측은 책임을 지지 않는다.</p>
                    <p>4. 보험 미적용 또는 보상 제외 사항에 대하여 참가자는 이의를 제기할 수 없다.</p>
                    <p>5. 참가자는 본 대회 보험 외에 개인 스포츠 보험 가입이 권장되며, 개인 보험 미가입으로 인한 손해에 대하여 주최측은 책임을 지지 않는다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제6조 (집결, 출발 및 제한시간)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 참가자는 안내된 집결 시간 이전에 도착하여 충분한 준비운동을 실시한 후 출발한다.</p>
                    <p>2. 출발은 그룹별로 진행되며, 참가자는 배정된 그룹을 반드시 준수해야 한다.</p>
                    <p>3. 제한시간 이후에는 교통 통제가 해제되며, 해당 시점 이후 발생하는 모든 사고에 대하여 주최측은 책임을 지지 않는다.</p>
                    <p>4. 제한시간 초과 시 참가자는 진행 요원의 지시에 따라 회송 차량에 탑승해야 하며, 이를 거부하여 발생한 사고에 대하여 주최측은 책임을 지지 않는다.</p>
                    <p>5. 제한시간 이후 골인한 기록은 공식 기록으로 인정하지 않는다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제7조 (기록 측정 및 실격)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 기록은 기록측정용 칩을 통해 넷타임(Net-Time) 방식으로 측정한다.</p>
                    <p>2. 참가자는 기록계측칩을 대회 안내에 따라 정확히 부착하고, 지정된 기록 측정 지점(출발·중간·골인 매트 등)을 반드시 통과해야 한다.</p>
                    <p>3. 번호표 및 기록칩 미착용 또는 훼손, 변조, 대리 착용, 코스 이탈, 타인의 도움 수령, 회송 차량 이용 후 골인, 기타 부정행위 또는 부정행위로 판단되는 행위가 있을 경우 기록은 인정되지 않으며 실격 처리한다.</p>
                    <p>4. 실격 사유가 사후 확인될 경우에도 기록 취소, 시상품 회수 및 향후 참가 제한 등의 조치를 할 수 있다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제8조 (물품 보관 및 분실 책임)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 주최측은 행사 당일 탈의실 및 물품보관소를 운영할 수 있다.</p>
                    <p>2. 참가자는 행사장 내 물품 분실, 도난 또는 파손의 위험이 있음을 인지하며, 이에 대하여 주최측은 책임을 지지 않는다.</p>
                    <p>3. 전자기기, 고가 장비 및 귀중품(현금, 지갑, 고가 액세서리 등)은 원칙적으로 보관이 불가하며, 분실 또는 파손 시 주최측은 일체 책임을 지지 않는다.</p>
                    <p>4. 보관 물품은 참가자 본인의 책임 하에 관리한다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제9조 (참가 취소 및 환불)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 참가 취소 및 환불은 사전에 공지된 기한과 방법에 한하여 가능하다.</p>
                    <p>2. 접수 마감 전 취소 시 전액 환불을 원칙으로 하되, 결제 수단 및 지자체 및 금융기관의 정책에 따라 환불 시점은 달라질 수 있다.</p>
                    <p>3. 접수 마감일 이후에는 참가 취소 및 환불이 불가하며, 참가비는 전액 공제한다.</p>
                    <p>4. 환불은 주최측의 환불 처리 일정에 따라 일괄 처리될 수 있으며, 구체 일정은 공지에 따른다.</p>
                    <p>5. 참가자의 개인 사정, 부상, 질병, 출장, 감염병 등 사유로 인한 불참의 경우에도 본 조항을 따른다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제10조 (개인정보 수집 및 활용)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 주최측은 대회 운영, 보험 가입, 참가자 확인, 기록 관리, 공지 및 민원 처리 목적을 위해 개인정보를 수집·이용한다.</p>
                    <p>2. 수집 항목은 성명, 생년월일, 성별, 연락처, 이메일, 주소, 참가 부문, 기록 등이며, 보험 가입이 필요한 경우 관련 법령에 따라 고유식별정보를 추가로 수집할 수 있다.</p>
                    <p>3. 개인정보는 목적 달성 시 지체 없이 파기하되, 기록 조회 및 분쟁 대응을 위해 일정 기간 보관할 수 있다.</p>
                    <p>4. 주최측은 대회 운영을 위한 업무 위탁 범위 내에서 개인정보를 제3자에게 제공할 수 있다.</p>
                    <p>5. 참가자는 대회 관련 안내 및 홍보성 정보 수신에 동의한다.</p>
                    <p>6. 참가자는 대회 중 촬영된 사진, 영상, 기록물에 대하여 대회 운영 및 대회와 직접 관련된 홍보 목적에 한하여 주최측이 무상으로 사용할 수 있음에 동의한다.</p>
                    <p>7. 해당 활용은 참가자의 인격권 및 사생활을 현저히 침해하지 않는 범위 내에서 이루어진다.</p>
                    <p>8. 개인정보의 상세 처리 사항은 공식 개인정보처리방침에 따른다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제11조 (대회 운영 및 변경)</p>
                  <div className="pl-4 space-y-2">
                    <p>1. 주최측은 안전 및 운영상 필요 시 대회 중지, 취소, 일정 변경, 코스 변경, 출발 방식 변경, 참가 제한 또는 참가 자격 박탈 등을 결정할 수 있다.</p>
                    <p>2. 천재지변, 자연재해, 전쟁, 국가비상사태, 감염병 등 불가항력적 사유로 대회가 취소·중단·축소될 경우 참가비는 환불되지 않을 수 있으며, 기념품은 제공 방식에 따라 지급할 수 있다.</p>
                    <p>3. 참가자에게 지급되는 물품의 제공 방식은 주최측 사정에 따라 변경될 수 있다.</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-gray-800 mb-2">제12조 (준거 규정)</p>
                  <p className="mb-2">
                    본 약관에 명시되지 않은 사항은 관계 법령 및 대한육상연맹 경기규칙을 따른다.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-300">
                  <p className="font-bold text-gray-800 mb-2">◆ 참가자 최종 동의</p>
                  <div className="pl-4 space-y-2">
                    <p>
                      본인은 본 약관의 모든 내용을 충분히 숙지하고 이해하였으며, 대회 참가와 관련하여 발생할 수 있는 모든 위험과 책임이 본인에게 귀속됨을 명확히 인지하고 이에 전적으로 동의한다.
                    </p>
                    <p className="font-semibold">
                      본 동의는 대회 참가 신청과 동시에 효력을 발생한다.
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
