"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { IndividualRegistrationResponse } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import { convertPaymentStatusToKorean } from "@/types/registration";
import RefundModal from "@/components/event/Registration/RefundModal";
import { requestIndividualRefund } from "@/app/event/[eventId]/registration/apply/shared/api/individual";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import { fetchIndividualRegistrationConfirm } from "./api";
import { checkStatusToRequest } from "@/app/event/[eventId]/registration/apply/shared/api/event";
import PasswordResetRequestModal from "@/components/event/Registration/PasswordResetRequestModal";
import PasswordResetOtpModal from "@/components/event/Registration/PasswordResetOtpModal";
import { 
  requestIndividualPasswordReset, 
  reissueIndividualOtp, 
  changeIndividualPassword 
} from "@/app/event/[eventId]/registration/apply/shared/api/passwordReset";

export default function IndividualApplicationConfirmResultPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationData, setRegistrationData] = useState<IndividualRegistrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [virtualAccount, setVirtualAccount] = useState('');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isRefundLoading, setIsRefundLoading] = useState(false);
  const [isUnpaidAlertOpen, setIsUnpaidAlertOpen] = useState(false);
  const [isEditDisabledAlertOpen, setIsEditDisabledAlertOpen] = useState(false);
  const [isFinalClosedAlertOpen, setIsFinalClosedAlertOpen] = useState(false);
  const [possibleToRequest, setPossibleToRequest] = useState<boolean | null>(null);
  const [requestReason, setRequestReason] = useState<string | null>(null);
  const [eventStatus, setEventStatus] = useState<string | null>(null);
  const [isPasswordResetRequestModalOpen, setIsPasswordResetRequestModalOpen] = useState(false);
  const [isPasswordResetOtpModalOpen, setIsPasswordResetOtpModalOpen] = useState(false);
  const [passwordResetToken, setPasswordResetToken] = useState<string | null>(null);
  const [passwordResetUniqueInfo, setPasswordResetUniqueInfo] = useState<{ name: string; phNum: string; birth: string } | null>(null);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [isOtpReissuing, setIsOtpReissuing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // registrationId를 쿼리 파라미터에서 가져오기 (새로운 방식)
        let registrationIdParam = searchParams.get('registrationId');

        // 하위 호환성을 위해 기존 data 파라미터도 확인
        const dataParam = searchParams.get('data');

        let baseData: IndividualRegistrationResponse | null = null;
        let storedPassword = '';

        if (registrationIdParam) {
          // 새로운 방식: registrationId만 받아서 sessionStorage에서 데이터 가져오기
          registrationIdParam = decodeURIComponent(registrationIdParam);

          // 세션 스토리지에서 저장된 데이터와 비밀번호 가져오기
          const storageKey = `individual_registration_data_${params.eventId}_${registrationIdParam}`;
          try {
            const storedDataString = sessionStorage.getItem(storageKey);
            if (storedDataString) {
              const parsed = JSON.parse(storedDataString);
              storedPassword = parsed._password || '';
              // 비밀번호 필드 제거하고 나머지 데이터 사용
              delete parsed._password;
              baseData = parsed as IndividualRegistrationResponse;
              // 저장된 데이터가 있으면 먼저 표시 (사용자 경험 개선)
              if (baseData) {
                setRegistrationData(baseData);
                setIsLoading(false);
              }
              // 사용 후 즉시 삭제하지 않고 API 호출 성공 후 삭제 (보안)
            }
          } catch (e) {
            // 세션 스토리지 접근 실패 시 무시
          }
        } else if (dataParam) {
          // 기존 방식: data 파라미터에서 파싱 (하위 호환성)
          try {
            baseData = JSON.parse(decodeURIComponent(dataParam));
            // data 파라미터에서 registrationId를 추출하여 사용
            if (!registrationIdParam && baseData?.registrationId) {
              registrationIdParam = baseData.registrationId;
            }
            // data 파라미터로 받은 경우도 먼저 표시
            if (baseData) {
              setRegistrationData(baseData);
              setIsLoading(false);
            }
          } catch {
            setError('데이터를 파싱할 수 없습니다.');
            setIsLoading(false);
            return;
          }
        }

        // 저장된 데이터가 없으면 에러 표시
        if (!baseData) {
          setError('신청 정보를 불러올 수 없습니다. 신청 확인 페이지에서 다시 인증해주세요.');
          setIsLoading(false);
          return;
        }

        // API 호출하여 최신 데이터 가져오기 (비밀번호가 있으면 사용)
        try {
          // baseData에서 API 호출에 필요한 정보 추출
          const name = baseData.name;
          const phNum = baseData.phNum;
          const birth = baseData.birth;

          if (name && phNum && birth && storedPassword) {
            // 최신 데이터 가져오기
            const latestData = await fetchIndividualRegistrationConfirm(
              params.eventId,
              name,
              phNum,
              birth,
              storedPassword
            );

            // API 호출 성공 후 sessionStorage 삭제
            if (registrationIdParam) {
              try {
                const storageKey = `individual_registration_data_${params.eventId}_${registrationIdParam}`;
                sessionStorage.removeItem(storageKey);
              } catch (e) {
                // 무시
              }
            }

            // 최신 데이터로 업데이트
            setRegistrationData(latestData);
            setIsLoading(false);
            return; // 성공하면 여기서 종료
          }
        } catch (apiError) {
          // API 호출 실패 시 저장된 데이터를 사용 (이미 표시되어 있음)
          // 추가 업데이트만 시도
          try {
            if (registrationIdParam) {
              const storageKey = `individual_registration_data_${params.eventId}_${registrationIdParam}`;
              sessionStorage.removeItem(storageKey);
            }
          } catch (e) {
            // 무시
          }

          // baseData가 이미 표시되어 있으므로 추가 처리만 수행
          // API 호출 실패는 무시하고 저장된 데이터 사용
        }
      } catch (err) {
        setError('데이터를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams, params.eventId]);

  // 신청 가능 여부 조회 (새로운 API 사용)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusResponse = await checkStatusToRequest(params.eventId, 'UPDATE');
        setPossibleToRequest(statusResponse.possibleToRequest);
        setRequestReason(statusResponse.reason || null);
      } catch {
        // 무시: 상태를 못 불러와도 기본 동작은 유지
      }
    };

    fetchStatus();
  }, [params.eventId]);

  // 이벤트 상태 명시적으로 로드 (내부마감 체크용)
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
      } catch (error) {
        // 실패 시 무시
      }
    };

    loadEventStatus();
  }, [params.eventId]);

  // 결제 계좌 정보 로드 (신청하기와 동일한 방식)
  useEffect(() => {
    let ignore = false;
    const loadPaymentInfo = async () => {
      const eventId = params.eventId;
      if (!eventId) return;
      const base = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      try {
        // 1순위: 전용 결제 정보 API
        const infoRes = await fetch(`${base}/api/v1/public/event/${eventId}/payment-info`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (infoRes.ok) {
          const data = await infoRes.json();
          if (!ignore) {
            setBankName(String(data?.bankName || ''));
            setVirtualAccount(String(data?.virtualAccount || ''));
          }
          return;
        }
      } catch (error) {
        // 무시하고 fallback
      }

      try {
        // Fallback: 이벤트 기본 정보에서 계좌 정보 및 이벤트 상태 추출
        const eventRes = await fetch(`${base}/api/v1/public/event/${eventId}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!eventRes.ok) return;
        const eventData = await eventRes.json();
        if (!ignore) {
          if (eventData?.eventInfo) {
            setBankName(String(eventData.eventInfo.bank || ''));
            setVirtualAccount(String(eventData.eventInfo.virtualAccount || ''));
          }
          // 이벤트 상태 추출
          if (eventData?.eventInfo?.eventStatus) {
            setEventStatus(eventData.eventInfo.eventStatus);
          } else if (eventData?.eventStatus) {
            setEventStatus(eventData.eventStatus);
          }
        }
      } catch (error) {
        // 실패 시 계좌 정보 표시하지 않음
      }
    };
    loadPaymentInfo();
    return () => {
      ignore = true;
    };
  }, [params.eventId]);

  const handleBackToList = () => {
    router.push(`/event/${params.eventId}/registration/confirm/individual`);
  };

  // 비밀번호 초기화 요청 핸들러
  const handlePasswordResetRequest = async (data: { name?: string; phNum?: string; birth?: string; organizationAccount?: string }) => {
    setIsPasswordResetLoading(true);
    try {
      const result = await requestIndividualPasswordReset(params.eventId, {
        name: data.name!,
        phNum: data.phNum!,
        birth: data.birth!
      });
      
      if (result.token) {
        // 이전 타이머 정보 초기화 (새로운 요청이므로)
        sessionStorage.removeItem('passwordResetTimer');
        sessionStorage.removeItem('passwordResetTimerStart');
        sessionStorage.removeItem('passwordResetReissueCount');
        
        setPasswordResetToken(result.token);
        // uniqueInfo 저장 (OTP 재발급 시 필요)
        setPasswordResetUniqueInfo({
          name: data.name!,
          phNum: data.phNum!,
          birth: data.birth!
        });
        setIsPasswordResetRequestModalOpen(false);
        setIsPasswordResetOtpModalOpen(true);
      } else {
        throw new Error('토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  // OTP 재발급 핸들러
  const handleOtpReissue = async () => {
    if (!passwordResetToken || !passwordResetUniqueInfo) {
      throw new Error('토큰 또는 인증 정보가 없습니다.');
    }
    setIsOtpReissuing(true);
    try {
      await reissueIndividualOtp(params.eventId, { 
        token: passwordResetToken,
        uniqueInfo: passwordResetUniqueInfo
      });
    } finally {
      setIsOtpReissuing(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async (otp: string, newPassword: string) => {
    if (!passwordResetToken) {
      throw new Error('토큰이 없습니다.');
    }
    await changeIndividualPassword(params.eventId, {
      token: passwordResetToken,
      otp,
      newPassword
    });
  };

  // 비밀번호 변경 성공 핸들러
  const handlePasswordResetSuccess = () => {
    setPasswordResetToken(null);
    setPasswordResetUniqueInfo(null);
    // 신청 확인 페이지로 이동
    router.push(`/event/${params.eventId}/registration/confirm`);
  };

  const handleEdit = (e?: React.MouseEvent) => {
    // 이벤트 전파 차단
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 내부마감 상태를 가장 먼저 확인 (결제 상태보다 우선)
    const isFinalClosed = eventStatus === 'FINAL_CLOSED';
    if (isFinalClosed) {
      setIsFinalClosedAlertOpen(true);
      return;
    }

    // 결제 상태 확인: 미결제 또는 결제완료 상태일 때만 수정 가능
    const paymentStatus = registrationData?.paymentStatus?.toUpperCase();
    const canEdit = paymentStatus === 'UNPAID' || paymentStatus === 'PAID' || paymentStatus === 'COMPLETED';

    if (!canEdit) {
      // 수정 불가 상태일 때 커스텀 알림 모달 표시
      setIsEditDisabledAlertOpen(true);
      return;
    }

    // 수정 모드로 개인신청 페이지로 이동 (기존 데이터와 함께)
    if (!registrationData) return; // null 체크

    // 주소에서 우편번호 제거하여 전달
    const editData = {
      ...registrationData,
      address: cleanAddress(registrationData.address || '', registrationData.zipCode),
    };

    // sessionStorage에 editData 저장
    if (registrationData.registrationId) {
      const storageKey = `individual_edit_data_${params.eventId}_${registrationData.registrationId}`;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(editData));
        // registrationId만 URL에 전달
        router.push(`/event/${params.eventId}/registration/apply/individual?mode=edit&registrationId=${encodeURIComponent(registrationData.registrationId)}`);
        return;
      } catch (e) {
        // sessionStorage 접근 실패 시 기존 방식으로 fallback
      }
    }

    // fallback: 기존 방식 (URL 파라미터로 전달)
    const encodedData = encodeURIComponent(JSON.stringify(editData));
    router.push(`/event/${params.eventId}/registration/apply/individual?mode=edit&data=${encodedData}`);
  };

  const handleRefundSubmit = async (rawPassword: string, bankName: string, accountNumber: string, accountHolderName: string) => {
    if (!registrationData?.registrationId) {
      throw new Error('신청 정보를 찾을 수 없습니다.');
    }

    setIsRefundLoading(true);
    try {
      await requestIndividualRefund(
        params.eventId,
        registrationData.registrationId,
        rawPassword,
        bankName,
        accountNumber,
        accountHolderName
      );
      // 성공 시 모달에서 성공 메시지 표시 (페이지 새로고침하지 않음)
    } catch (error) {
      setIsRefundLoading(false);
      throw error;
    } finally {
      setIsRefundLoading(false);
    }
  };

  const handleRefundSuccess = () => {
    // 환불 신청 성공 후 신청확인 페이지로 이동
    setIsRefundModalOpen(false);
    router.push(`/event/${params.eventId}/registration/confirm/individual`);
  };

  // 성별 한글 변환
  const getGenderText = (gender: string) => {
    return gender === 'M' ? '남성' : '여성';
  };

  // 결제 방식 한글 변환
  const getPaymentTypeText = (paymentType: string) => {
    return paymentType === 'CARD' ? '카드' : '계좌이체';
  };

  // 결제 상태 한글 변환 (관리자 쪽과 동일한 로직)
  const getPaymentStatusText = (paymentStatus: string) => {
    // PAID/UNPAID 형식인 경우 백엔드 enum으로 변환
    if (paymentStatus === 'PAID') {
      return '결제완료';
    }
    if (paymentStatus === 'UNPAID') {
      return '미결제';
    }
    // 백엔드 enum 형식인 경우 관리자 쪽 함수 사용
    const koreanStatus = convertPaymentStatusToKorean(paymentStatus);
    // 관리자 쪽은 '미결제'를 사용하지만 유저 쪽은 '미입금'을 사용
    return koreanStatus === '미결제' ? '미입금' : koreanStatus;
  };

  // 결제 상태에 따른 색상
  const getPaymentStatusColor = (paymentStatus: string) => {
    const status = paymentStatus.toUpperCase();
    if (status === 'PAID' || status === 'COMPLETED') {
      return 'text-green-600';
    }
    if (status === 'UNPAID') {
      return 'text-red-600';
    }
    if (status === 'MUST_CHECK' || status === 'NEED_REFUND' || status === 'NEED_PARTITIAL_REFUND') {
      return 'text-orange-600';
    }
    if (status === 'REFUNDED') {
      return 'text-gray-600';
    }
    return 'text-gray-600';
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

  // 주소에서 우편번호 제거 (끝에 있는 우편번호 패턴 제거)
  const cleanAddress = (address: string, zipCode?: string) => {
    if (!address) return '';
    let cleaned = address;

    // zipCode가 있으면 주소 끝에서 해당 우편번호 패턴 제거
    if (zipCode) {
      // 다양한 패턴: "_06794", " (06794)", "-06794", "06794"
      const patterns = [
        new RegExp(`[\\s_\\-]${zipCode.replace(/\d/g, '\\d')}$`), // 끝에 오는 우편번호 패턴
        new RegExp(`${zipCode.replace(/\d/g, '\\d')}$`), // 그냥 끝에 우편번호
        new RegExp(`[\\s_\\-]\\d{5}$`), // 5자리 우편번호 패턴
      ];

      for (const pattern of patterns) {
        cleaned = cleaned.replace(pattern, '').trim();
      }
    }

    // 일반적인 우편번호 패턴도 제거 (끝에 5자리 숫자)
    cleaned = cleaned.replace(/[_\-\s]?\d{5}$/, '').trim();

    return cleaned;
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

          {/* 안내문구 섹션 */}
          <div className="mb-6 mx-8">
            {(() => {
              const isFinalClosed = eventStatus === 'FINAL_CLOSED';

              // 내부마감일 때 안내 문구 표시
              if (isFinalClosed) {
                return (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 text-center">
                      현재 대회 신청 및 수정 일정이 마감되어 수정할 수 없습니다.
                    </p>
                  </div>
                );
              }

              // 미결제일 때 안내 문구 표시
              if (registrationData.paymentStatus === 'UNPAID') {
                return (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <span className="font-medium">입금 대기 중입니다.</span> 입금 확인까지 최대 1-2일 소요될 수 있습니다. 입금 완료 후 신청 정보 수정이 불가능합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (registrationData.paymentStatus === 'PAID' || registrationData.paymentStatus === 'COMPLETED') {
                return (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          <span className="font-medium">입금이 확인되었습니다.</span> 신청이 정상적으로 완료되었습니다. 입금 완료 후 신청 정보 수정이 불가능합니다. 대회 당일 참석 부탁드립니다.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-orange-700">
                        <span className="font-medium">결제 상태: {getPaymentStatusText(registrationData.paymentStatus)}</span> 관리자 확인이 필요합니다.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

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
                  <label className="text-base font-medium text-black">회원구분</label>
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
                  <span className="text-base text-black">
                    {registrationData.email && !registrationData.email.includes('TEMP_EMAIL') && registrationData.email.trim() !== ''
                      ? registrationData.email
                      : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">우편번호</label>
                  <span className="text-base text-black">
                    {registrationData.zipCode || '-'}
                  </span>
                </div>

                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">주소</label>
                  <span className="text-base text-black text-right">
                    {cleanAddress(registrationData.address || '', registrationData.zipCode) || '-'}
                  </span>
                </div>

                <div className="flex items-start justify-between pb-4">
                  <label className="text-base font-medium text-black">상세주소</label>
                  <span className="text-base text-black">
                    {registrationData.addressDetail || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 신청 정보 섹션 */}
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-black mb-6 border-b-2 border-black pb-4 pt-8">신청 정보</h3>
              <div className="space-y-4">
                {(() => {
                  // eventCategoryName을 | 기준으로 분리
                  const categoryName = registrationData.eventCategoryName || '';
                  const parts = categoryName.split('|').map(p => p.trim());
                  const distance = parts[0] || '';
                  const detailCategory = parts.length > 1 ? parts.slice(1).join(' | ') : '';

                  return (
                    <>
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <label className="text-base font-medium text-black">참가종목</label>
                        <span className="text-base text-black">{distance || '-'}</span>
                      </div>

                      {detailCategory && (
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                          <label className="text-base font-medium text-black">참가종목 상세</label>
                          <span className="text-base text-black">{detailCategory}</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">기념품</label>
                  <div className="text-base text-black text-right">
                    {registrationData.souvenir && registrationData.souvenir.length > 0 ? (
                      registrationData.souvenir.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.souvenirName} {item.souvenirSize ? `(${item.souvenirSize})` : ''}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">기념품 없음</span>
                    )}
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

              {/* 계좌 안내 문구 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm text-gray-700">
                  <p>※ 아래 계좌번호로 입금해주시기 바랍니다.</p>
                  <p>
                    계좌번호 :{' '}
                    <span className="bg-yellow-200 font-semibold px-2 py-1 rounded">
                      {bankName && virtualAccount ? `${bankName} ${virtualAccount}` : '계좌 정보 준비 중입니다.'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">결제 방식</label>
                  <span className="text-base text-black">{getPaymentTypeText(registrationData.paymentType)}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">입금자명</label>
                  <span className="text-base text-black">{registrationData.paymenterName}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">결제상태</label>
                  <span className={`text-base font-medium ${getPaymentStatusColor(registrationData.paymentStatus)}`}>
                    {getPaymentStatusText(registrationData.paymentStatus)}
                  </span>
                </div>

                {(registrationData.paymenterBank || registrationData.accountNumber) && (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <label className="text-base font-medium text-black">환불 은행명</label>
                      <span className="text-base text-black">
                        {registrationData.paymenterBank || '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-4">
                      <label className="text-base font-medium text-black">환불 계좌번호</label>
                      <span className="text-base text-black">
                        {registrationData.accountNumber || '-'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-row justify-center gap-2 sm:gap-4 mt-8">
            {/* 수정 가능 여부 판단: possibleToRequest와 결제 상태 모두 확인 */}
            {(() => {
              const paymentStatus = registrationData.paymentStatus?.toUpperCase();
              const canEditByPayment = paymentStatus === 'UNPAID' || paymentStatus === 'PAID' || paymentStatus === 'COMPLETED';
              const isFinalClosed = eventStatus === 'FINAL_CLOSED';
              // eventStatus가 로드되었고 FINAL_CLOSED가 아니어야 수정 가능
              // eventStatus가 null이면 안전하게 비활성화
              const canEdit = canEditByPayment && (possibleToRequest !== false) && !isFinalClosed && eventStatus !== null;
              const disabledMessage = !canEdit
                ? (isFinalClosed
                  ? '현재 대회 신청 및 수정 일정이 마감되어 수정할 수 없습니다.'
                  : (possibleToRequest === false && requestReason ? requestReason : '현재 신청 정보를 수정할 수 없습니다.'))
                : '';

              return (
                <div className="relative group">
                  <button
                    onClick={(e) => {
                      // 내부마감 상태를 가장 먼저 체크 (결제 상태보다 우선)
                      const currentIsFinalClosed = eventStatus === 'FINAL_CLOSED';
                      if (currentIsFinalClosed) {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsFinalClosedAlertOpen(true);
                        return;
                      }

                      // disabled 상태이면 클릭 무시
                      if (!canEdit || currentIsFinalClosed) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }

                      handleEdit(e);
                    }}
                    disabled={!canEdit || isFinalClosed || eventStatus === null}
                    title={disabledMessage}
                    className={`min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors ${canEdit && !isFinalClosed && eventStatus !== null
                      ? 'bg-white text-black border-2 border-black hover:bg-gray-100'
                      : 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed opacity-50'
                      }`}
                  >
                    수정하기
                  </button>
                  {/* 툴팁: 비활성화 상태일 때만 표시 */}
                  {!canEdit && disabledMessage && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-64 text-center">
                      {disabledMessage}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {/* 환불하기 버튼: possibleToRequest 및 내부마감 확인 */}
            {(() => {
              const isFinalClosed = eventStatus === 'FINAL_CLOSED';
              // eventStatus가 로드되었고 FINAL_CLOSED이거나, eventStatus가 null이면 비활성화
              const isRefundDisabled = possibleToRequest === false || isFinalClosed || eventStatus === null;
              const refundDisabledMessage = isFinalClosed
                ? '현재 대회 신청 및 수정 일정이 마감되어 환불할 수 없습니다.'
                : (possibleToRequest === false && requestReason ? requestReason : undefined);

              return (
                <div className="relative group">
                  <button
                    onClick={(e) => {
                      // 이벤트 전파 차단
                      e.preventDefault();
                      e.stopPropagation();

                      // 내부마감 상태를 가장 먼저 체크 (결제 상태보다 우선)
                      const currentIsFinalClosed = eventStatus === 'FINAL_CLOSED';
                      if (currentIsFinalClosed) {
                        setIsFinalClosedAlertOpen(true);
                        return;
                      }

                      // disabled 상태이면 클릭 무시
                      if (isRefundDisabled) {
                        return;
                      }

                      // 미결제 상태인 경우 알림 모달 표시
                      if (registrationData.paymentStatus === 'UNPAID') {
                        setIsUnpaidAlertOpen(true);
                      } else {
                        // 그 외 상태는 환불 모달 열기
                        setIsRefundModalOpen(true);
                      }
                    }}
                    disabled={isRefundDisabled}
                    title={refundDisabledMessage}
                    className={`min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors ${isRefundDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                  >
                    환불하기
                  </button>
                  {/* 툴팁: 비활성화 상태일 때만 표시 */}
                  {isRefundDisabled && refundDisabledMessage && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-64 text-center">
                      {refundDisabledMessage}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {/* 비밀번호 초기화 버튼 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPasswordResetRequestModalOpen(true);
              }}
              className="min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors bg-[#D9D9D9] text-black hover:bg-[#C0C0C0]"
            >
              비밀번호 초기화
            </button>
            {/* 확인 버튼 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/event/${params.eventId}/registration/confirm`);
              }}
              className="min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors bg-black text-white hover:bg-gray-800"
            >
              확인
            </button>
          </div>
        </div>
      </div>

      {/* 환불 모달 */}
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onSubmit={handleRefundSubmit}
        isLoading={isRefundLoading}
        onSuccess={handleRefundSuccess}
      />

      {/* 미결제 상태 알림 모달 */}
      <ErrorModal
        isOpen={isUnpaidAlertOpen}
        onClose={() => setIsUnpaidAlertOpen(false)}
        title="환불 요청 불가"
        message="결제내역이 확인되지 않아 현재는 환불요청이 불가합니다. 입금 확인은 3~5일 소요됩니다!"
        confirmText="확인"
      />

      {/* 수정 불가 안내 모달 */}
      <ErrorModal
        isOpen={isEditDisabledAlertOpen}
        onClose={() => setIsEditDisabledAlertOpen(false)}
        title="수정 불가"
        message="현재 결제 상태에서는 신청 정보를 수정할 수 없습니다. 미결제 또는 결제완료 상태에서만 수정이 가능합니다."
        confirmText="확인"
      />

      {/* 내부마감 안내 모달 */}
      <ErrorModal
        isOpen={isFinalClosedAlertOpen}
        onClose={() => setIsFinalClosedAlertOpen(false)}
        title="신청 및 수정 불가"
        message="현재 대회 신청 및 수정 일정이 마감되어 수정 및 환불할 수 없습니다."
        confirmText="확인"
      />

      {/* 비밀번호 초기화 요청 모달 */}
      <PasswordResetRequestModal
        isOpen={isPasswordResetRequestModalOpen}
        onClose={() => {
          setIsPasswordResetRequestModalOpen(false);
          setPasswordResetToken(null);
          setPasswordResetUniqueInfo(null);
        }}
        onSubmit={handlePasswordResetRequest}
        isLoading={isPasswordResetLoading}
        type="individual"
      />

      {/* 비밀번호 초기화 OTP 모달 */}
      <PasswordResetOtpModal
        isOpen={isPasswordResetOtpModalOpen}
        onClose={() => {
          setIsPasswordResetOtpModalOpen(false);
          setPasswordResetToken(null);
          setPasswordResetUniqueInfo(null);
          sessionStorage.removeItem('passwordResetTimer');
          sessionStorage.removeItem('passwordResetTimerStart');
          sessionStorage.removeItem('passwordResetReissueCount');
        }}
        onBack={() => {
          setIsPasswordResetOtpModalOpen(false);
          setIsPasswordResetRequestModalOpen(true);
        }}
        onSubmit={handlePasswordChange}
        onReissue={handleOtpReissue}
        isLoading={isPasswordResetLoading}
        isReissuing={isOtpReissuing}
        onSuccess={handlePasswordResetSuccess}
        phoneNumber={registrationData?.phNum}
      />
    </SubmenuLayout>
  );
}
