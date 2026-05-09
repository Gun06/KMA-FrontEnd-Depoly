"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { getAgreementData } from "../agreement/data";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import { checkStatusToRequest } from "./shared/api/event";
import {
  fetchPublicEventTerms,
  isEffectivelyRequired,
  type PublicEventTerm,
} from "./shared/api/terms";
import MarathonApplyStaticTerms from "./shared/components/MarathonApplyStaticTerms";
import EventTermsInlineSection, {
  getEventTermKey,
} from "./shared/components/EventTermsInlineSection";
import {
  buildEventTermsAgreeRequestList,
  saveEventTermsAgreement,
} from "./shared/utils/eventTermsAgreement";

export default function ApplyPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const agreementData = getAgreementData(params.eventId);
  const [isFinalAgreed, setIsFinalAgreed] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [possibleToRequest, setPossibleToRequest] = useState<boolean | null>(null);
  const [requestReason, setRequestReason] = useState<string | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [eventStatus, setEventStatus] = useState<string | null>(null);
  const [apiTerms, setApiTerms] = useState<PublicEventTerm[]>([]);
  const [allAgreeLabel, setAllAgreeLabel] = useState("");
  const [termsLoading, setTermsLoading] = useState(true);
  const [isStaticTermsAgreed, setIsStaticTermsAgreed] = useState(false);
  const [checkedTermIds, setCheckedTermIds] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (apiTerms.length === 0) {
      setCheckedTermIds({});
      return;
    }
    setCheckedTermIds((prev) => {
      const next: Record<string, boolean> = {};
      apiTerms.forEach((term, idx) => {
        const key = getEventTermKey(term, idx);
        next[key] = prev[key] ?? false;
      });
      return next;
    });
  }, [apiTerms]);

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
        const result = await fetchPublicEventTerms(params.eventId);
        if (!cancelled) {
          setApiTerms(result.eventTerms);
          setAllAgreeLabel(result.allAgreeLabel);
        }
      } catch {
        if (!cancelled) {
          setApiTerms([]);
          setAllAgreeLabel("");
        }
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

  const requiredApiTermsOk = useMemo(
    () =>
      apiTerms.length === 0 ||
      apiTerms.every((term, idx) =>
        isEffectivelyRequired(term)
          ? checkedTermIds[getEventTermKey(term, idx)] === true
          : true
      ),
    [apiTerms, checkedTermIds]
  );

  const requiredApiTermKeys = useMemo(
    () =>
      apiTerms
        .map((term, idx) => ({ term, key: getEventTermKey(term, idx) }))
        .filter(({ term }) => isEffectivelyRequired(term))
        .map(({ key }) => key),
    [apiTerms]
  );

  const areRequiredApiTermsChecked = useMemo(
    () =>
      requiredApiTermKeys.length === 0 ||
      requiredApiTermKeys.every((key) => checkedTermIds[key] === true),
    [requiredApiTermKeys, checkedTermIds]
  );

  const hasCustomEventTerms = apiTerms.length > 0;
  const showFinalAgreementCheckbox = !termsLoading && !hasCustomEventTerms;

  useEffect(() => {
    setIsFinalAgreed(isStaticTermsAgreed && areRequiredApiTermsChecked);
  }, [isStaticTermsAgreed, areRequiredApiTermsChecked]);

  const handleToggleAllApiTerms = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    apiTerms.forEach((term, idx) => {
      next[getEventTermKey(term, idx)] = checked;
    });
    setCheckedTermIds(next);
    setIsStaticTermsAgreed(checked);
    setIsFinalAgreed(checked);
  };

  const handleToggleOneApiTerm = (
    term: PublicEventTerm,
    idx: number,
    checked: boolean
  ) => {
    const key = getEventTermKey(term, idx);
    setCheckedTermIds((prev) => ({ ...prev, [key]: checked }));
  };

  const agreementComplete =
    hasCustomEventTerms || termsLoading
      ? isStaticTermsAgreed && requiredApiTermsOk
      : isFinalAgreed;

  const canSubmitApply =
    agreementComplete &&
    possibleToRequest !== false &&
    eventStatus !== "CLOSED" &&
    eventStatus !== "FINAL_CLOSED";

  const handleToggleFinalAgreement = (checked: boolean) => {
    setIsStaticTermsAgreed(checked);
    setCheckedTermIds((prev) => {
      const next = { ...prev };
      requiredApiTermKeys.forEach((key) => {
        next[key] = checked;
      });
      return next;
    });
    setIsFinalAgreed(checked);
  };

  const proceedApply = (kind: "individual" | "group") => {
    const termsAgreeRequestList = buildEventTermsAgreeRequestList(
      apiTerms,
      checkedTermIds,
      getEventTermKey
    );
    saveEventTermsAgreement(params.eventId, termsAgreeRequestList);

    router.push(
      `/event/${params.eventId}/registration/apply/${kind === "individual" ? "individual" : "group"}`
    );
  };

  const handleApplyClick = (kind: "individual" | "group") => {
    if (!isStaticTermsAgreed) {
      showAlert("필수 약관에 동의해 주세요.");
      return;
    }

    if (apiTerms.length > 0 && !requiredApiTermsOk) {
      showAlert("필수 대회 약관에 동의해 주세요.");
      return;
    }
    if (!hasCustomEventTerms && !termsLoading && !isFinalAgreed) {
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

    // 상태를 아직 못 불러온 경우에도 동의만 완료되었으면 신청 페이지로 이동
    if (possibleToRequest === null && isStatusLoading) {
      proceedApply(kind);
      return;
    }

    proceedApply(kind);
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
            <div className="space-y-5 text-sm sm:text-base text-gray-700 leading-relaxed">
              <div>
                <p className="font-semibold text-gray-900 mb-1">1. 건강 상태 확인</p>
                <p>
                  참가자는 건강 상태 및 기저질환(고혈압, 심장질환, 당뇨 등)을 사전에 확인하고, 참가 가능 여부를 스스로 판단해야 합니다.
                  이를 고려하지 않고 발생한 사고(사망 포함)에 대해 주최 측은 책임을 지지 않으며, 보험 혜택도 적용되지 않습니다.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-1">2. 출전 제한</p>
                <p>
                  걸을 수 있는 유아부터 참가 신청이 가능하며, 유아차/킥보드/전동 휠체어로 참여하는 것은 불가합니다.
                  풀코스는 만 18세 이상 성인만 신청할 수 있습니다.
                </p>
                <p className="mt-2">
                  반려동물과 동반 참가는 불가합니다. 엘리트 선수(현역 또는 해지 후 4년 미만 경과자)는 대회 참여는 가능하나 시상 제외 처리가 필요하므로
                  대회 전 미리 연락 바랍니다.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-1">3. 신청·입금·취소</p>
                <p>
                  참가 신청, 입금, 변경, 취소/환불은 각 마감일(선착순 조기 마감을 포함)까지만 가능하며, 마감일 이후 요청 사항은 처리되지 않습니다.
                  자세한 일정은 공지사항을 확인하시기 바랍니다.
                </p>
              </div>
            </div>
          </div>

          {/* 약관 섹션 */}
          <div className="bg-white p-6 mb-6">
            {/* 약관 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 sm:mb-0">
                약관
              </h2>
            </div>
            <hr className="border-black mb-3" style={{ borderWidth: '1.7px' }} />

            <EventTermsInlineSection
              terms={apiTerms}
              allAgreeLabel={allAgreeLabel}
              checkedTermIds={checkedTermIds}
              onToggleAll={handleToggleAllApiTerms}
              onToggleTerm={handleToggleOneApiTerm}
              showMasterCheckbox={true}
              showTermItems={false}
            />

            <label className="mb-2 inline-flex cursor-pointer items-center gap-1.5 px-0 py-1 text-sm sm:text-[15px] font-semibold text-gray-900">
              <input
                type="checkbox"
                checked={isStaticTermsAgreed}
                onChange={(e) => setIsStaticTermsAgreed(e.target.checked)}
                className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                필수
              </span>
              <span>[대회신청 약관 안내 동의]</span>
            </label>
            {/* 안전 안내 (고정 블록) */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-bold text-gray-800 mb-4">
                안전한 레이스를 위한 안내 사항 (필독)
              </p>

              <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p
                  style={{
                    fontWeight: 400,
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  레이스 중 이상 증상이 느껴지면 즉시 중단하고 진행 요원이나 의료진의 도움을 받으시기 바랍니다.<br />
                  (예: 어지러움, 가슴 통증, 숨 가쁨, 극심한 피로, 근육 경련 등)<br />
                  체력과 운동 능력을 고려해 적절한 속도 유지가 필요하며, 충분한 준비 운동과 레이스 후 휴식을 권장합니다.
                </p>
                <p className="font-semibold text-gray-800">
                  건강 상태 미고려, 기저 질환 등으로 발생한 본인 과실 사고는 보험 적용 대상에서 제외됩니다.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-2 font-pretendard">
              참가 신청 약관 안내
            </p>
            <div className="bg-gray-100 rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <MarathonApplyStaticTerms />
            </div>

            <EventTermsInlineSection
              terms={apiTerms}
              allAgreeLabel={allAgreeLabel}
              checkedTermIds={checkedTermIds}
              onToggleAll={handleToggleAllApiTerms}
              onToggleTerm={handleToggleOneApiTerm}
              showMasterCheckbox={false}
              showTermItems={true}
            />
          </div>

          {/* 동의 및 신청 섹션 */}
          <div className="bg-white p-6">
            {showFinalAgreementCheckbox ? (
              <div className="mb-6 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="agreement-checkbox"
                    checked={isFinalAgreed}
                    onChange={(e) =>
                      handleToggleFinalAgreement(e.target.checked)
                    }
                    className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="agreement-checkbox"
                    className="text-sm text-gray-700 sm:text-base"
                  >
                    약관 내용을 이해하였으며, 약관에 동의합니다.
                  </label>
                </div>
              </div>
            ) : null}

            {/* 버튼 그룹 */}
            <div className="flex flex-row gap-3 justify-center">
              <button
                type="button"
                className={`px-8 py-3 rounded font-semibold transition-colors ${canSubmitApply
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-pointer"
                  }`}
                onClick={() => handleApplyClick("individual")}
              >
                개인신청
              </button>
              <button
                type="button"
                className={`px-8 py-3 rounded font-semibold transition-colors ${canSubmitApply
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
