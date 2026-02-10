"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { GroupRegistrationConfirmData, InnerUserRegistration } from "./types";
import { fetchGroupRegistrationConfirm, createEditData } from "./api";
import { convertPaymentStatusToKorean } from "@/types/registration";
import RefundModal from "@/components/event/Registration/RefundModal";
import GroupRefundOptionModal from "@/components/event/Registration/GroupRefundOptionModal";
import GroupRefundUserSelectModal from "@/components/event/Registration/GroupRefundUserSelectModal";
import { requestGroupRefund, BatchValidationErrorResponse, BatchValidationError } from "@/app/event/[eventId]/registration/apply/shared/api/group";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import { checkStatusToRequest } from "@/app/event/[eventId]/registration/apply/shared/api/event";


export default function GroupApplicationConfirmResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const [groupApplicationData, setGroupApplicationData] = useState<GroupRegistrationConfirmData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(10); // 초기 표시 개수
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 더보기 로딩 중
  const [loadedParticipantsMap, setLoadedParticipantsMap] = useState<Map<string, InnerUserRegistration>>(new Map()); // 상세 정보가 로드된 참가자들 (registrationId를 키로)
  const [bankName, setBankName] = useState('');
  const [virtualAccount, setVirtualAccount] = useState('');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isRefundLoading, setIsRefundLoading] = useState(false);
  const [isUnpaidAlertOpen, setIsUnpaidAlertOpen] = useState(false);
  const [isRefundOptionModalOpen, setIsRefundOptionModalOpen] = useState(false);
  const [isUserSelectModalOpen, setIsUserSelectModalOpen] = useState(false);
  const [selectedRegistrationIds, setSelectedRegistrationIds] = useState<string[]>([]);
  const [refundMode, setRefundMode] = useState<'group' | 'individual'>('group'); // 'group': 단체 전체, 'individual': 개별
  const [possibleToRequest, setPossibleToRequest] = useState<boolean | null>(null);
  const [requestReason, setRequestReason] = useState<string | null>(null);
  const [eventStatus, setEventStatus] = useState<string | null>(null);
  const [isFinalClosedAlertOpen, setIsFinalClosedAlertOpen] = useState(false);

  // 참가자 상세 정보 로드 함수
  const loadParticipantDetails = useCallback(async (participants: InnerUserRegistration[], startIndex: number, count: number): Promise<Map<string, InnerUserRegistration>> => {
    const participantsToLoad = participants.slice(startIndex, startIndex + count);

    // 함수형 업데이트로 최신 값을 가져와서 처리
    return new Promise((resolve) => {
      setLoadedParticipantsMap(prev => {
        const newMap = new Map(prev); // 항상 최신 prev 값 사용

        // 참가자 정보 처리 (동기적으로 처리)
        participantsToLoad.forEach((participant) => {
          const registrationId = participant.registrationId;
          if (!registrationId || newMap.has(registrationId)) {
            return;
          }

          // 사용자 페이지에서는 관리자 API를 사용하지 않고 기존 데이터만 사용
          // participant에 이미 모든 정보가 포함되어 있음
          const updatedParticipant: InnerUserRegistration = {
            ...participant,
            registrationId: registrationId,
            paymentStatus: participant.paymentStatus || 'UNPAID',
            souvenir: participant.souvenir || [{
              souvenirId: '0',
              souvenirName: '기념품 없음',
              souvenirSize: '사이즈 없음'
            }]
          };

          newMap.set(registrationId, updatedParticipant);
        });

        // Promise를 resolve하여 반환값 제공
        setTimeout(() => resolve(newMap), 0);
        return newMap; // 업데이트된 맵 반환
      });
    });
  }, []);

  // 더보기 버튼 클릭 핸들러
  const handleLoadMore = async () => {
    if (!groupApplicationData || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const currentParticipants = groupApplicationData.innerUserRegistrationList || [];
      await loadParticipantDetails(currentParticipants, displayedCount, 10);
      setDisplayedCount(prev => prev + 10);
    } catch (_error) {
      // 에러 처리
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 전체보기 버튼 클릭 핸들러
  const handleLoadAll = async () => {
    if (!groupApplicationData || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const currentParticipants = groupApplicationData.innerUserRegistrationList || [];
      const totalCount = currentParticipants.length;
      const remainingCount = totalCount - displayedCount;

      // 남은 참가자들 모두 로드
      if (remainingCount > 0) {
        await loadParticipantDetails(currentParticipants, displayedCount, remainingCount);
      }

      // 전체 개수로 표시 개수 설정
      setDisplayedCount(totalCount);
    } catch (_error) {
      // 에러 처리
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // organizationAccount를 쿼리 파라미터에서 가져오기 (새로운 방식)
        const orgAccount = searchParams.get('orgAccount');

        // 하위 호환성을 위해 기존 data 파라미터도 확인
        const dataParam = searchParams.get('data');

        let organizationAccount: string | null = null;
        let baseData: GroupRegistrationConfirmData | null = null;

        if (orgAccount) {
          // 새로운 방식: organizationAccount만 받아서 API 호출
          organizationAccount = decodeURIComponent(orgAccount);
        } else if (dataParam) {
          // 기존 방식: data 파라미터에서 파싱 (하위 호환성)
          try {
            baseData = JSON.parse(decodeURIComponent(dataParam));
            organizationAccount = baseData?.organizationAccount || null;
          } catch {
            setError('데이터를 파싱할 수 없습니다.');
            setIsLoading(false);
            return;
          }
        } else {
          setError('신청 정보가 없습니다.');
          setIsLoading(false);
          return;
        }

        if (!organizationAccount) {
          setError('단체신청용 ID를 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }

        // 세션 스토리지에서 저장된 데이터와 비밀번호 가져오기
        const storageKey = `group_registration_data_${eventId}_${organizationAccount}`;
        let storedData: GroupRegistrationConfirmData | null = null;
        let storedPassword = '';
        try {
          const storedDataString = sessionStorage.getItem(storageKey);
          if (storedDataString) {
            const parsed = JSON.parse(storedDataString);
            storedPassword = parsed._password || '';
            // 비밀번호 필드 제거하고 나머지 데이터 사용
            delete parsed._password;
            storedData = parsed as GroupRegistrationConfirmData;
            // 저장된 데이터가 있으면 먼저 표시 (사용자 경험 개선)
            if (storedData) {
              setGroupApplicationData(storedData);
              setIsLoading(false);
            }
            // 사용 후 즉시 삭제하지 않고 API 호출 성공 후 삭제 (보안)
          }
        } catch (_e) {
          // 세션 스토리지 접근 실패 시 무시
        }

        // orgAccount가 있으면 API를 직접 호출 시도 (sessionStorage에 데이터가 없어도 가능)
        try {
          // 최신 데이터 가져오기 (비밀번호가 있으면 사용)
          const latestGroupData = await fetchGroupRegistrationConfirm(eventId, organizationAccount, storedPassword);

          // API 호출 성공 후 sessionStorage 삭제
          try {
            sessionStorage.removeItem(storageKey);
          } catch (_e) {
            // 무시
          }

          // 초기에는 처음 10명의 참가자 상세 정보만 로드 (더보기 방식)
          const participantsToUpdate = latestGroupData.innerUserRegistrationList || [];
          const initialLoadCount = Math.min(10, participantsToUpdate.length);

          // 처음 10명의 상세 정보만 로드
          const loadedDetails = await loadParticipantDetails(participantsToUpdate, 0, initialLoadCount);

          // 로드된 상세 정보를 맵에 저장
          const initialMap = new Map<string, InnerUserRegistration>();
          loadedDetails.forEach((detail) => {
            const registrationId = detail.registrationId;
            if (registrationId) {
              initialMap.set(registrationId, detail);
            }
          });
          setLoadedParticipantsMap(initialMap);

          // 전체 참가자 목록은 기본 데이터를 유지하되, 로드된 참가자는 업데이트된 정보 사용
          const updatedParticipants: InnerUserRegistration[] = participantsToUpdate.map(participant => {
            const registrationId = participant.registrationId;
            if (registrationId && initialMap.has(registrationId)) {
              const loaded = initialMap.get(registrationId);
              return loaded || participant;
            }
            return participant;
          }).filter((p): p is InnerUserRegistration => p !== undefined);

          // 단체 전체 결제 상태 확인: 모든 참가자의 결제 상태를 확인 (기본 정보 기준)
          // 모두가 COMPLETED → COMPLETED, 모두가 UNPAID → UNPAID, 모두가 MUST_CHECK → MUST_CHECK
          // 그 외 섞여 있을 때 → MUST_CHECK (부분 진행 중으로 표시)
          let overallPaymentStatus: "UNPAID" | "PAID" | "MUST_CHECK" | "NEED_REFUND" | "NEED_PARTITIAL_REFUND" | "COMPLETED" | "REFUNDED" = 'UNPAID';
          let isMixedStatus = false; // 섞여 있는 상태인지 여부

          // 전체 참가자 목록의 기본 paymentStatus로 계산 (상세 정보는 점진적으로 업데이트)
          if (participantsToUpdate.length > 0) {
            const participantStatuses = participantsToUpdate.map(p => p.paymentStatus || 'UNPAID');

            // 모든 가능한 상태에 대해 모두 같은 상태인지 확인
            const allUnpaid = participantStatuses.every(status => status === 'UNPAID');
            const allPaid = participantStatuses.every(status => status === 'PAID');
            const allMustCheck = participantStatuses.every(status => status === 'MUST_CHECK');
            const allNeedRefund = participantStatuses.every(status => status === 'NEED_REFUND');
            const allNeedPartialRefund = participantStatuses.every(status => status === 'NEED_PARTITIAL_REFUND');
            const allCompleted = participantStatuses.every(status => status === 'COMPLETED');
            const allRefunded = participantStatuses.every(status => status === 'REFUNDED');

            if (allUnpaid) {
              overallPaymentStatus = 'UNPAID';
            } else if (allPaid) {
              overallPaymentStatus = 'PAID';
            } else if (allMustCheck) {
              overallPaymentStatus = 'MUST_CHECK';
            } else if (allNeedRefund) {
              overallPaymentStatus = 'NEED_REFUND';
            } else if (allNeedPartialRefund) {
              overallPaymentStatus = 'NEED_PARTITIAL_REFUND';
            } else if (allCompleted) {
              overallPaymentStatus = 'COMPLETED';
            } else if (allRefunded) {
              overallPaymentStatus = 'REFUNDED';
            } else {
              // 섞여 있는 경우
              overallPaymentStatus = 'MUST_CHECK';
              isMixedStatus = true;
            }
          } else {
            // 참가자 목록이 없으면 latestGroupData의 결제 상태 사용
            overallPaymentStatus = (latestGroupData.paymentStatus || 'UNPAID') as typeof overallPaymentStatus;
          }

          // 최신 데이터로 업데이트 (단체 전체 결제 상태, 참가자별 코스/기념품/사이즈, 주소 포함)
          // 섞여 있는 상태 정보를 저장하기 위해 임시로 데이터에 추가
          const updatedData: GroupRegistrationConfirmData & { _isMixedStatus?: boolean } = {
            ...latestGroupData,
            paymentStatus: overallPaymentStatus,
            innerUserRegistrationList: updatedParticipants,
            address: latestGroupData.address || baseData?.address || '',
            addressDetail: latestGroupData.addressDetail || baseData?.addressDetail || '',
            zipCode: latestGroupData.zipCode || baseData?.zipCode || '',
            _isMixedStatus: isMixedStatus,
          };

          setGroupApplicationData(updatedData);
          setIsLoading(false);
          return; // 성공하면 여기서 종료
        } catch (_apiError) {
          // API 호출 실패 시 처리
          try {
            sessionStorage.removeItem(storageKey);
          } catch (_e) {
            // 무시
          }

          // storedData가 있으면 이미 표시되어 있으므로 추가 처리만 수행
          if (storedData) {
            // 저장된 데이터를 baseData로 설정하여 추가 처리
            baseData = storedData;

            // 참가자 결제 상태 확인 시도 (registrationId가 있는 경우)
            if (baseData.innerUserRegistrationList && baseData.innerUserRegistrationList.length > 0) {
              try {
                // 초기에는 처음 10명만 로드
                const participantsToUpdate = baseData.innerUserRegistrationList;
                const initialLoadCount = Math.min(10, participantsToUpdate.length);

                // 처음 10명의 상세 정보만 로드
                const loadedDetails = await loadParticipantDetails(participantsToUpdate, 0, initialLoadCount);

                // 로드된 상세 정보를 맵에 저장
                const initialMap = new Map<string, InnerUserRegistration>();
                loadedDetails.forEach((detail) => {
                  const registrationId = detail.registrationId;
                  if (registrationId) {
                    initialMap.set(registrationId, detail);
                  }
                });
                setLoadedParticipantsMap(initialMap);

                // 전체 참가자 목록은 기본 데이터를 유지하되, 로드된 참가자는 업데이트된 정보 사용
                const updatedParticipants: InnerUserRegistration[] = participantsToUpdate.map(participant => {
                  const registrationId = participant.registrationId;
                  if (registrationId && initialMap.has(registrationId)) {
                    const loaded = initialMap.get(registrationId);
                    return loaded || participant;
                  }
                  return participant;
                }).filter((p): p is InnerUserRegistration => p !== undefined);

                // 모든 가능한 상태에 대해 모두 같은 상태인지 확인
                // 그 외 섞여 있을 때 → MUST_CHECK (부분 진행 중으로 표시)
                const participantStatuses = updatedParticipants.map(p => p.paymentStatus || 'UNPAID');
                if (participantStatuses.length > 0) {
                  const allUnpaid = participantStatuses.every(status => status === 'UNPAID');
                  const allPaid = participantStatuses.every(status => status === 'PAID');
                  const allMustCheck = participantStatuses.every(status => status === 'MUST_CHECK');
                  const allNeedRefund = participantStatuses.every(status => status === 'NEED_REFUND');
                  const allNeedPartialRefund = participantStatuses.every(status => status === 'NEED_PARTITIAL_REFUND');
                  const allCompleted = participantStatuses.every(status => status === 'COMPLETED');
                  const allRefunded = participantStatuses.every(status => status === 'REFUNDED');

                  let overallPaymentStatus: "UNPAID" | "PAID" | "MUST_CHECK" | "NEED_REFUND" | "NEED_PARTITIAL_REFUND" | "COMPLETED" | "REFUNDED";
                  let isMixedStatus = false;

                  if (allUnpaid) {
                    overallPaymentStatus = 'UNPAID';
                  } else if (allPaid) {
                    overallPaymentStatus = 'PAID';
                  } else if (allMustCheck) {
                    overallPaymentStatus = 'MUST_CHECK';
                  } else if (allNeedRefund) {
                    overallPaymentStatus = 'NEED_REFUND';
                  } else if (allNeedPartialRefund) {
                    overallPaymentStatus = 'NEED_PARTITIAL_REFUND';
                  } else if (allCompleted) {
                    overallPaymentStatus = 'COMPLETED';
                  } else if (allRefunded) {
                    overallPaymentStatus = 'REFUNDED';
                  } else {
                    // 섞여 있는 경우
                    overallPaymentStatus = 'MUST_CHECK';
                    isMixedStatus = true;
                  }
                  baseData.paymentStatus = overallPaymentStatus;
                  // 섞여 있는 상태 정보 저장
                  (baseData as GroupRegistrationConfirmData & { _isMixedStatus?: boolean })._isMixedStatus = isMixedStatus;
                }

                // 각 참가자의 결제 상태 업데이트
                baseData.innerUserRegistrationList = updatedParticipants;
              } catch (_error) {
                // 참가자 결제 상태 확인 실패 시 무시
              }
            }
            setGroupApplicationData(baseData);
            setIsLoading(false);
            return;
          } else {
            // storedData도 없고 API 호출도 실패한 경우
            setError('신청 정보를 불러올 수 없습니다. 다시 확인해주세요.');
            setIsLoading(false);
            return;
          }
        }
      } catch (_err) {
        // 최상위 에러 처리: API 호출 자체가 실패한 경우
        // storedData가 없으면 에러 표시
        setError('신청 정보를 불러올 수 없습니다. 다시 확인해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, eventId]);

  // 신청 가능 여부 조회 (새로운 API 사용)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusResponse = await checkStatusToRequest(eventId, 'UPDATE');
        setPossibleToRequest(statusResponse.possibleToRequest);
        setRequestReason(statusResponse.reason || null);
      } catch {
        // 무시: 상태를 못 불러와도 기본 동작은 유지
      }
    };

    if (eventId) {
      fetchStatus();
    }
  }, [eventId]);

  // 이벤트 상태 명시적으로 로드 (내부마감 체크용)
  useEffect(() => {
    const loadEventStatus = async () => {
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
      } catch (_error) {
        // 실패 시 무시
      }
    };

    if (eventId) {
      loadEventStatus();
    }
  }, [eventId]);

  // 결제 계좌 정보 로드 (신청하기와 동일한 방식)
  useEffect(() => {
    let ignore = false;
    const loadPaymentInfo = async () => {
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
      } catch (_error) {
        // 무시하고 fallback
      }

      try {
        // Fallback: 이벤트 기본 정보에서 계좌 정보 추출
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
      } catch (_error) {
        // 실패 시 계좌 정보 표시하지 않음
      }
    };
    loadPaymentInfo();
    return () => {
      ignore = true;
    };
  }, [eventId]);

  const handleBackToList = () => {
    router.push(`/event/${eventId}/registration/confirm`);
  };

  // 개별 환불 처리 (선택한 사용자들에 대해) - 단체 환불 API 사용
  const handleIndividualRefundSubmit = async (rawPassword: string, bankName: string, accountNumber: string, accountHolderName: string) => {
    if (selectedRegistrationIds.length === 0) {
      throw new Error('환불할 참가자를 선택해주세요.');
    }

    if (!groupApplicationData?.organizationId) {
      throw new Error('단체 신청 정보를 찾을 수 없습니다. (organizationId가 없습니다)');
    }

    setIsRefundLoading(true);
    try {
      // 단체 환불 API를 사용하되, 선택한 사용자들의 registrationIds를 전달
      await requestGroupRefund(
        eventId,
        groupApplicationData.organizationId,
        rawPassword,
        bankName,
        accountNumber,
        accountHolderName,
        selectedRegistrationIds // 선택한 사용자들의 registrationId 배열
      );
      // 성공 시 모달에서 성공 메시지 표시 (페이지 새로고침하지 않음)
    } catch (error) {
      setIsRefundLoading(false);

      // 배치 검증 에러인 경우 이름으로 변환
      if (error && typeof error === 'object' && 'isBatchError' in error) {
        const batchError = error as BatchValidationErrorResponse & { isBatchError?: boolean };
        if (batchError.code === 'BATCH_VALIDATION_FAILED' && batchError.errors) {
          // 참가자 목록에서 registrationId로 이름 찾기
          const participants = groupApplicationData?.innerUserRegistrationList || [];
          const participantMap = new Map<string, string>();

          // 기본 참가자 목록에서 이름 매핑
          participants.forEach(participant => {
            const registrationId = participant.registrationId;
            if (registrationId) {
              participantMap.set(registrationId, participant.name);
            }
          });

          // loadedParticipantsMap도 확인
          loadedParticipantsMap.forEach((participant, registrationId) => {
            if (participant && typeof participant === 'object' && 'name' in participant) {
              const name = participant.name as string;
              if (name) {
                participantMap.set(registrationId, name);
              }
            }
          });

          // 에러 메시지에 이름 포함
          const errorMessages = batchError.errors.map((err: BatchValidationError) => {
            const name = participantMap.get(err.rejectedValue) || '알 수 없음';
            return `${err.row}번째 사용자 (${name}, ID: ${err.rejectedValue}): ${err.message}`;
          });

          const errorMessage = `${batchError.message}\n\n${errorMessages.join('\n')}`;
          throw new Error(errorMessage);
        }
      }

      throw error;
    } finally {
      setIsRefundLoading(false);
    }
  };

  // 단체 전체 환불 처리 (기존 로직, 호환성을 위해 유지)
  const handleRefundSubmit = async (rawPassword: string, bankName: string, accountNumber: string, accountHolderName: string) => {
    if (!groupApplicationData?.organizationId) {
      throw new Error('단체 신청 정보를 찾을 수 없습니다. (organizationId가 없습니다)');
    }

    // 모든 참가자의 registrationId 수집 (결제 완료 상태인 참가자만)
    const participants = groupApplicationData.innerUserRegistrationList || [];
    const allRegistrationIds: string[] = [];

    participants.forEach(participant => {
      const registrationId = participant.registrationId;
      if (registrationId) {
        const detailedParticipant: InnerUserRegistration = loadedParticipantsMap.has(registrationId)
          ? (loadedParticipantsMap.get(registrationId) || participant)
          : participant;
        const paymentStatus = detailedParticipant.paymentStatus || 'UNPAID';
        // 결제 완료 상태인 참가자만 포함
        if (paymentStatus === 'COMPLETED' || paymentStatus === 'PAID') {
          allRegistrationIds.push(registrationId);
        }
      }
    });

    // 모든 참가자가 결제 완료 상태인지 확인
    if (allRegistrationIds.length !== participants.length) {
      throw new Error('전체 환불은 모든 참가자가 결제 완료 상태여야 합니다.');
    }

    setIsRefundLoading(true);
    try {
      // 전체 환불 시 모든 참가자의 registrationId를 전달
      await requestGroupRefund(
        eventId,
        groupApplicationData.organizationId, // DB PK 값 사용
        rawPassword,
        bankName,
        accountNumber,
        accountHolderName,
        allRegistrationIds // 모든 참가자의 registrationId 배열
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
    setSelectedRegistrationIds([]);
    router.push(`/event/${eventId}/registration/confirm/group`);
  };

  // 환불 옵션 선택: 단체 전체 환불
  const handleSelectGroupRefund = () => {
    setRefundMode('group');
    setSelectedRegistrationIds([]);
    // 바로 환불 정보 기입 모달 열기
    setIsRefundModalOpen(true);
  };

  // 환불 옵션 선택: 개별 환불
  const handleSelectIndividualRefund = () => {
    setRefundMode('individual');
    // 사용자 선택 모달 열기
    setIsUserSelectModalOpen(true);
  };

  // 사용자 선택 모달에서 확인 버튼 클릭 시
  const handleUserSelectConfirm = (registrationIds: string[]) => {
    setSelectedRegistrationIds(registrationIds);
    setIsUserSelectModalOpen(false);
    // 환불 정보 기입 모달 열기
    setIsRefundModalOpen(true);
  };

  // const handlePrint = () => {
  //   window.print();
  // };

  const getGenderLabel = (gender: "M" | "F") => {
    return gender === "M" ? "남성" : "여성";
  };

  const getPaymentTypeLabel = (paymentType: "CARD" | "ACCOUNT_TRANSFER") => {
    return paymentType === "CARD" ? "카드결제" : "계좌이체";
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

  // 결제 상태 한글 변환 (관리자 쪽과 동일한 로직)
  const getPaymentStatusLabel = (status: string, isOverallStatus: boolean = false, isMixedStatus: boolean = false) => {
    // 전체 결제 상태인 경우 특별 처리
    if (isOverallStatus) {
      // 섞여 있는 경우 → "부분 진행 중"
      if (isMixedStatus) {
        return '부분 진행 중';
      }

      // 모두가 같은 상태인 경우 → 각 상태를 그대로 한글 변환
      if (status === 'COMPLETED') {
        return '결제완료';
      }
      if (status === 'UNPAID') {
        return '미결제';
      }
      if (status === 'PAID') {
        return '결제완료';
      }
      // 백엔드 enum 형식인 경우 관리자 쪽 함수 사용
      const koreanStatus = convertPaymentStatusToKorean(status);
      // 관리자 쪽은 '미결제'를 사용하지만 전체 상태에서는 '미결제' 사용
      return koreanStatus;
    }

    // 개별 참가자 상태인 경우
    // PAID/UNPAID 형식인 경우 백엔드 enum으로 변환
    if (status === 'PAID') {
      return '결제완료';
    }
    if (status === 'UNPAID') {
      return '미입금';
    }
    // 백엔드 enum 형식인 경우 관리자 쪽 함수 사용
    const koreanStatus = convertPaymentStatusToKorean(status);
    // 관리자 쪽은 '미결제'를 사용하지만 유저 쪽은 '미입금'을 사용
    return koreanStatus === '미결제' ? '미입금' : koreanStatus;
  };

  // 결제 상태에 따른 색상
  const getPaymentStatusColor = (status: string, isOverallStatus: boolean = false) => {
    const statusUpper = status.toUpperCase();

    // 전체 결제 상태인 경우 특별 처리 (부분 결제는 주황색)
    if (isOverallStatus && statusUpper === 'MUST_CHECK') {
      return 'text-orange-600';
    }

    if (statusUpper === 'PAID' || statusUpper === 'COMPLETED') {
      return 'text-green-600';
    }
    if (statusUpper === 'UNPAID') {
      return 'text-red-600';
    }
    if (statusUpper === 'MUST_CHECK' || statusUpper === 'NEED_REFUND' || statusUpper === 'NEED_PARTITIAL_REFUND') {
      return 'text-orange-600';
    }
    if (statusUpper === 'REFUNDED') {
      return 'text-gray-600';
    }
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <SubmenuLayout
        eventId={eventId}
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
        eventId={eventId}
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


  // 데이터가 로드되지 않은 경우 로딩 표시
  if (!groupApplicationData) {
    return (
      <SubmenuLayout
        eventId={eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
              </div>
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
        subMenu: "단체 신청 확인 결과"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

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

              const paymentStatus = groupApplicationData.paymentStatus || 'UNPAID';
              const isMixedStatus = (groupApplicationData as GroupRegistrationConfirmData & { _isMixedStatus?: boolean })._isMixedStatus || false;

              // 섞여 있는 경우 (부분 진행 중)
              if (isMixedStatus) {
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
                          <span className="font-medium">부분 진행 중입니다.</span> 참가자별로 결제 상태가 다릅니다. 결제 완료 상태의 참가자도 같은 금액 내에서 기념품 변경이 가능합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              // 결제 상태별 메시지
              switch (paymentStatus) {
                case 'UNPAID':
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

                case 'MUST_CHECK':
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
                            <span className="font-medium">결제 확인이 필요합니다.</span> 입금 확인 중입니다. 확인 완료 후 신청 정보 수정이 불가능합니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                case 'NEED_REFUND':
                  return (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">환불이 필요합니다.</span> 관리자에게 문의해주세요. 환불 처리 중에는 신청 정보 수정이 불가능합니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                case 'NEED_PARTITIAL_REFUND':
                  return (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">부분 환불이 필요합니다.</span> 관리자에게 문의해주세요. 환불 처리 중에는 신청 정보 수정이 불가능합니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                case 'COMPLETED':
                case 'PAID':
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

                case 'REFUNDED':
                  return (
                    <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">환불이 완료되었습니다.</span> 신청이 취소되었습니다. 추가 문의사항이 있으시면 관리자에게 연락해주세요.
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                default:
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
            })()}
          </div>

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
                  <label className="text-base font-medium text-black">단체신청용 ID</label>
                  <span className="text-base text-black">{groupApplicationData.organizationAccount}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">대표자명</label>
                  <span className="text-base text-black">{(groupApplicationData as GroupRegistrationConfirmData & { leaderName?: string }).leaderName || groupApplicationData.innerUserRegistrationList[0]?.name || "정보 없음"}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">대표자 생년월일</label>
                  <span className="text-base text-black">{(groupApplicationData as GroupRegistrationConfirmData & { leaderBirth?: string }).leaderBirth || groupApplicationData.birth || "정보 없음"}</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">우편번호</label>
                  <span className="text-base text-black">{groupApplicationData.zipCode || '-'}</span>
                </div>

                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">주소</label>
                  <span className="text-base text-black text-right">
                    {cleanAddress(groupApplicationData.address || '', groupApplicationData.zipCode) || '-'}
                  </span>
                </div>

                <div className="flex items-start justify-between pb-4">
                  <label className="text-base font-medium text-black">상세주소</label>
                  <span className="text-base text-black">
                    {groupApplicationData.addressDetail || '-'}
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
                  <span className="text-base text-black">{(groupApplicationData as GroupRegistrationConfirmData & { leaderPhNum?: string }).leaderPhNum || groupApplicationData.phNum || "정보 없음"}</span>
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
                {groupApplicationData.innerUserRegistrationList.slice(0, displayedCount).map((participant, index) => {
                  // 상세 정보가 로드된 참가자는 업데이트된 정보 사용
                  const registrationId = participant.registrationId;
                  const detailedParticipant: InnerUserRegistration = registrationId && loadedParticipantsMap.has(registrationId)
                    ? (loadedParticipantsMap.get(registrationId) || participant)
                    : participant;

                  return (
                    <div key={detailedParticipant.registrationId || index} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* 참가자 헤더 */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <h4 className="text-lg font-bold text-black">{detailedParticipant.name}</h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {getGenderLabel(detailedParticipant.gender)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {detailedParticipant.amount.toLocaleString()}원
                          </div>
                        </div>
                      </div>

                      {/* 참가자 상세 정보 */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">생년월일</span>
                          <span className="text-black font-semibold">
                            {detailedParticipant.birth}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">전마협 ID</span>
                          <span className="text-black font-semibold">{detailedParticipant.personalAccount || "없음"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">연락처</span>
                          <span className="text-black font-semibold">{detailedParticipant.phNum}</span>
                        </div>
                      </div>

                      {/* 비용 상세 정보 */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">종목&비용 상세</h5>
                        <div className="space-y-2 text-sm">
                          {(() => {
                            // eventCategoryName을 | 기준으로 분리
                            const categoryName = detailedParticipant.eventCategoryName || '';
                            const parts = categoryName.split('|').map((p: string) => p.trim());
                            const distance = parts[0] || '';
                            const detailCategory = parts.length > 1 ? parts.slice(1).join(' | ') : '';

                            return (
                              <>
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
                              </>
                            );
                          })()}

                          <div className="flex justify-between">
                            <span className="text-gray-600">기념품</span>
                            <div className="text-black text-right">
                              {detailedParticipant.souvenir && detailedParticipant.souvenir.length > 0
                                ? detailedParticipant.souvenir.map((item, idx: number) => {
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
                              <span className="text-blue-600">{detailedParticipant.amount.toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 결제 상태 - 각 참가자별 결제 상태 표시 */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">결제상태</span>
                          <span className={`text-sm font-semibold ${getPaymentStatusColor(detailedParticipant.paymentStatus || 'UNPAID')}`}>
                            {getPaymentStatusLabel(detailedParticipant.paymentStatus || 'UNPAID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 더보기 / 전체보기 버튼 */}
              {groupApplicationData.innerUserRegistrationList.length > displayedCount && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className={`px-8 py-3 rounded-lg font-medium text-base transition-colors w-full sm:w-auto ${isLoadingMore
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2 justify-center">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        로딩 중...
                      </span>
                    ) : (
                      `더보기 (${displayedCount}/${groupApplicationData.innerUserRegistrationList.length})`
                    )}
                  </button>
                  <button
                    onClick={handleLoadAll}
                    disabled={isLoadingMore}
                    className={`px-8 py-3 rounded-lg font-medium text-base transition-colors w-full sm:w-auto ${isLoadingMore
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    전체보기
                  </button>
                </div>
              )}
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
                  <span className={`text-base font-semibold ${getPaymentStatusColor(groupApplicationData.paymentStatus, true)}`}>
                    {getPaymentStatusLabel(groupApplicationData.paymentStatus, true, (groupApplicationData as GroupRegistrationConfirmData & { _isMixedStatus?: boolean })._isMixedStatus || false)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-row justify-center gap-2 sm:gap-4 mt-8">
            <button
              onClick={async (e) => {
                // 이벤트 전파 차단
                e.preventDefault();
                e.stopPropagation();

                // 내부마감 상태를 가장 먼저 체크 (결제 상태보다 우선)
                const isFinalClosed = eventStatus === 'FINAL_CLOSED';
                if (isFinalClosed) {
                  setIsFinalClosedAlertOpen(true);
                  return;
                }

                // 수정하기 버튼 클릭 시 모든 참가자 정보를 먼저 로드
                const allParticipants = groupApplicationData.innerUserRegistrationList || [];

                // 아직 로드되지 않은 참가자 정보가 있으면 먼저 로드
                // 모든 참가자를 확실하게 로드하기 위해 처음부터 다시 로드
                setIsLoadingMore(true);
                try {
                  // 모든 참가자의 상세 정보를 확실하게 로드
                  const allLoadedParticipants = await loadParticipantDetails(allParticipants, 0, allParticipants.length);

                  // 로드된 결과를 맵으로 변환하여 사용
                  const loadedMap = new Map<string, InnerUserRegistration>();
                  allLoadedParticipants.forEach((loadedParticipant) => {
                    const registrationId = loadedParticipant.registrationId;
                    if (registrationId) {
                      loadedMap.set(registrationId, loadedParticipant);
                    }
                  });

                  // 로드된 참가자 정보로 업데이트된 데이터 생성
                  const updatedParticipants: InnerUserRegistration[] = allParticipants.map(participant => {
                    const registrationId = participant.registrationId;
                    if (registrationId && loadedMap.has(registrationId)) {
                      const loaded = loadedMap.get(registrationId);
                      return loaded || participant;
                    }
                    return participant;
                  }).filter((p): p is InnerUserRegistration => p !== undefined);

                  // 주소에서 우편번호 제거하여 수정 페이지로 전달
                  const editData = createEditData({
                    ...groupApplicationData,
                    innerUserRegistrationList: updatedParticipants,
                    address: cleanAddress(groupApplicationData.address || '', groupApplicationData.zipCode),
                  });

                  // sessionStorage에 수정 데이터 저장 (URL 길이 문제 해결)
                  const storageKey = `group_edit_data_${eventId}_${groupApplicationData.organizationAccount}`;
                  try {
                    sessionStorage.setItem(storageKey, JSON.stringify(editData));
                  } catch (_e) {
                    // sessionStorage 접근 실패 시 기존 방식으로 fallback
                    const queryString = `?mode=edit&data=${encodeURIComponent(JSON.stringify(editData))}`;
                    router.push(`/event/${eventId}/registration/apply/group${queryString}`);
                    return;
                  }

                  // sessionStorage에 저장 후 mode만 쿼리 파라미터로 전달
                  router.push(`/event/${eventId}/registration/apply/group?mode=edit&orgAccount=${encodeURIComponent(groupApplicationData.organizationAccount)}`);
                  return;
                } catch (_error) {
                  // 에러 발생 시에도 진행 (기존 정보 사용)
                } finally {
                  setIsLoadingMore(false);
                }

                // 에러 발생 시 기존 방식으로 진행
                const updatedParticipants: InnerUserRegistration[] = allParticipants.map(participant => {
                  const registrationId = participant.registrationId;
                  if (registrationId && loadedParticipantsMap.has(registrationId)) {
                    const loaded = loadedParticipantsMap.get(registrationId);
                    return loaded || participant;
                  }
                  return participant;
                }).filter((p): p is InnerUserRegistration => p !== undefined);

                // 주소에서 우편번호 제거하여 수정 페이지로 전달
                const editData = createEditData({
                  ...groupApplicationData,
                  innerUserRegistrationList: updatedParticipants,
                  address: cleanAddress(groupApplicationData.address || '', groupApplicationData.zipCode),
                });

                // sessionStorage에 수정 데이터 저장 (URL 길이 문제 해결)
                const storageKey = `group_edit_data_${eventId}_${groupApplicationData.organizationAccount}`;
                try {
                  sessionStorage.setItem(storageKey, JSON.stringify(editData));
                } catch (_e) {
                  // sessionStorage 접근 실패 시 기존 방식으로 fallback
                  const queryString = `?mode=edit&data=${encodeURIComponent(JSON.stringify(editData))}`;
                  router.push(`/event/${eventId}/registration/apply/group${queryString}`);
                  return;
                }

                // sessionStorage에 저장 후 mode만 쿼리 파라미터로 전달
                router.push(`/event/${eventId}/registration/apply/group?mode=edit&orgAccount=${encodeURIComponent(groupApplicationData.organizationAccount)}`);
              }}
              // disabled={(() => {
              //   // 전체 참가자 목록에서 paymentStatus 확인 (로드된 참가자는 업데이트된 정보 사용)
              //   const participants = groupApplicationData.innerUserRegistrationList || [];
              //   const allCompleted = participants.every(participant => {
              //     const registrationId = participant.registrationId;
              //     const detailedParticipant = registrationId && loadedParticipantsMap.has(registrationId)
              //       ? loadedParticipantsMap.get(registrationId)
              //       : participant;
              //     return detailedParticipant.paymentStatus === 'COMPLETED';
              //   });
              //   const allRefunded = participants.every(participant => {
              //     const registrationId = participant.registrationId;
              //     const detailedParticipant = registrationId && loadedParticipantsMap.has(registrationId)
              //       ? loadedParticipantsMap.get(registrationId)
              //       : participant;
              //     return detailedParticipant.paymentStatus === 'REFUNDED';
              //   });
              //   // 모두가 COMPLETED이거나 모두가 REFUNDED인 경우 비활성화
              //   return allCompleted || allRefunded;
              // })()}
              disabled={(() => {
                const isFinalClosed = eventStatus === 'FINAL_CLOSED';
                return possibleToRequest === false || isFinalClosed;
              })()}
              title={(() => {
                const isFinalClosed = eventStatus === 'FINAL_CLOSED';
                if (isFinalClosed) return '현재 대회 신청 및 수정 일정이 마감되어 수정할 수 없습니다.';
                return possibleToRequest === false && requestReason ? requestReason : undefined;
              })()}
              className={`min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors ${(() => {
                const isFinalClosed = eventStatus === 'FINAL_CLOSED';
                return possibleToRequest === false || isFinalClosed || eventStatus === null;
              })()
                ? 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed opacity-50'
                : 'bg-white text-black border-2 border-black hover:bg-gray-100'
                }`}
            // className={`min-w-[120px] md:min-w-[140px] px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-sm md:text-base transition-colors ${
            //   (() => {
            //     // 전체 참가자 목록에서 paymentStatus 확인 (로드된 참가자는 업데이트된 정보 사용)
            //     const participants = groupApplicationData.innerUserRegistrationList || [];
            //     const allCompleted = participants.every(participant => {
            //       const registrationId = participant.registrationId;
            //       const detailedParticipant = registrationId && loadedParticipantsMap.has(registrationId)
            //         ? loadedParticipantsMap.get(registrationId)
            //         : participant;
            //       return detailedParticipant.paymentStatus === 'COMPLETED';
            //     });
            //     const allRefunded = participants.every(participant => {
            //       const registrationId = participant.registrationId;
            //       const detailedParticipant = registrationId && loadedParticipantsMap.has(registrationId)
            //         ? loadedParticipantsMap.get(registrationId)
            //         : participant;
            //       return detailedParticipant.paymentStatus === 'REFUNDED';
            //     });
            //     // 모두가 COMPLETED이거나 모두가 REFUNDED가 아닌 경우에만 활성화
            //     return !allCompleted && !allRefunded;
            //   })()
            //     ? 'bg-white text-black border-2 border-black hover:bg-gray-100'
            //     : 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed opacity-50'
            // }`}
            >
              수정하기
            </button>
            {/* 환불하기 버튼: 항상 표시 */}
            <button
              onClick={(e) => {
                // 이벤트 전파 차단
                e.preventDefault();
                e.stopPropagation();

                // 내부마감 상태를 가장 먼저 체크 (결제 상태보다 우선)
                const isFinalClosed = eventStatus === 'FINAL_CLOSED';
                if (isFinalClosed) {
                  setIsFinalClosedAlertOpen(true);
                  return;
                }

                // disabled 상태이면 클릭 무시
                if (possibleToRequest === false || isFinalClosed || eventStatus === null) {
                  return;
                }

                // 환불 옵션 선택 모달 열기
                const participants = groupApplicationData?.innerUserRegistrationList || [];

                // 참가자가 없는 경우 처리
                if (participants.length === 0) {
                  setIsUnpaidAlertOpen(true);
                  return;
                }

                // 단체 전체 환불의 경우: 모든 참가자가 결제완료인지 확인
                const allCompleted = participants.every(participant => {
                  const registrationId = participant.registrationId;
                  const detailedParticipant: InnerUserRegistration = registrationId && loadedParticipantsMap.has(registrationId)
                    ? (loadedParticipantsMap.get(registrationId) || participant)
                    : participant;
                  const paymentStatus = detailedParticipant.paymentStatus || 'UNPAID';
                  return paymentStatus === 'COMPLETED' || paymentStatus === 'PAID';
                });

                // 개별 환불의 경우: 결제 완료 상태의 참가자가 있는지 확인
                const updatedParticipants = participants.map(participant => {
                  const registrationId = participant.registrationId;
                  if (registrationId && loadedParticipantsMap.has(registrationId)) {
                    const detailed = loadedParticipantsMap.get(registrationId);
                    return detailed || participant;
                  }
                  return participant;
                });

                const hasEligibleParticipants = updatedParticipants.some(participant => {
                  const paymentStatus = participant.paymentStatus || 'UNPAID';
                  return paymentStatus === 'COMPLETED' || paymentStatus === 'PAID';
                });

                // 환불 가능한 상태가 없으면 알림 모달 표시
                if (!allCompleted && !hasEligibleParticipants) {
                  setIsUnpaidAlertOpen(true);
                  return;
                }

                // 환불 옵션 선택 모달 열기
                setIsRefundOptionModalOpen(true);
              }}
              disabled={(() => {
                const isFinalClosed = eventStatus === 'FINAL_CLOSED';
                // eventStatus가 로드되었고 FINAL_CLOSED이거나, eventStatus가 null이면 비활성화
                return possibleToRequest === false || isFinalClosed || eventStatus === null;
              })()}
              title={(() => {
                const isFinalClosed = eventStatus === 'FINAL_CLOSED';
                if (isFinalClosed) return '현재 대회 신청 및 수정 일정이 마감되어 환불할 수 없습니다.';
                return possibleToRequest === false && requestReason ? requestReason : undefined;
              })()}
              className={`min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors ${(() => {
                const isFinalClosed = eventStatus === 'FINAL_CLOSED';
                return possibleToRequest === false || isFinalClosed || eventStatus === null;
              })()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              환불하기
            </button>
            {/* 확인 버튼 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/event/${eventId}/registration/confirm`);
              }}
              className="min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors bg-black text-white hover:bg-gray-800"
            >
              확인
            </button>
          </div>
        </div>
      </div>

      {/* 환불 옵션 선택 모달 */}
      <GroupRefundOptionModal
        isOpen={isRefundOptionModalOpen}
        onClose={() => setIsRefundOptionModalOpen(false)}
        onSelectGroupRefund={handleSelectGroupRefund}
        onSelectIndividualRefund={handleSelectIndividualRefund}
        allCompleted={(() => {
          const participants = groupApplicationData?.innerUserRegistrationList || [];
          return participants.length > 0 && participants.every(participant => {
            const registrationId = participant.registrationId;
            const detailedParticipant: InnerUserRegistration = registrationId && loadedParticipantsMap.has(registrationId)
              ? (loadedParticipantsMap.get(registrationId) || participant)
              : participant;
            const paymentStatus = detailedParticipant.paymentStatus || 'UNPAID';
            return paymentStatus === 'COMPLETED' || paymentStatus === 'PAID';
          });
        })()}
      />

      {/* 사용자 선택 모달 (개별 환불용) */}
      <GroupRefundUserSelectModal
        isOpen={isUserSelectModalOpen}
        onClose={() => setIsUserSelectModalOpen(false)}
        participants={
          groupApplicationData?.innerUserRegistrationList.map(participant => {
            const registrationId = participant.registrationId;
            if (registrationId && loadedParticipantsMap.has(registrationId)) {
              const detailed = loadedParticipantsMap.get(registrationId);
              return detailed || participant;
            }
            return participant;
          }) || []
        }
        onConfirm={handleUserSelectConfirm}
      />

      {/* 환불 정보 기입 모달 */}
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setSelectedRegistrationIds([]);
          setRefundMode('group');
        }}
        onSubmit={refundMode === 'individual' && selectedRegistrationIds.length > 0 ? handleIndividualRefundSubmit : handleRefundSubmit}
        isLoading={isRefundLoading}
        onSuccess={handleRefundSuccess}
      />

      {/* 환불 요청 불가 알림 모달 */}
      <ErrorModal
        isOpen={isUnpaidAlertOpen}
        onClose={() => setIsUnpaidAlertOpen(false)}
        title="환불 요청 불가"
        message={
          <>
            결제 완료 상태의 참가자가 없습니다.<br />
            환불 신청은 결제 완료 상태의 참가자만 가능합니다.
          </>
        }
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
    </SubmenuLayout>
  );
}