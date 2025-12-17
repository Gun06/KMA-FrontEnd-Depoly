"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { IndividualRegistrationResponse } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import { getRegistrationDetail } from "@/services/registration";
import { convertPaymentStatusToKorean } from "@/types/registration";

export default function IndividualApplicationConfirmResultPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationData, setRegistrationData] = useState<IndividualRegistrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [virtualAccount, setVirtualAccount] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // registrationId를 쿼리 파라미터에서 가져오기 (새로운 방식)
        let registrationIdParam = searchParams.get('registrationId');
        
        // 하위 호환성을 위해 기존 data 파라미터도 확인
        const dataParam = searchParams.get('data');
        
        let baseData: IndividualRegistrationResponse | null = null;
        
        if (registrationIdParam) {
          // 새로운 방식: registrationId만 받아서 sessionStorage에서 데이터 가져오기
          registrationIdParam = decodeURIComponent(registrationIdParam);
          
          // 세션 스토리지에서 저장된 데이터와 비밀번호 가져오기
          const storageKey = `individual_registration_data_${params.eventId}_${registrationIdParam}`;
          try {
            const storedDataString = sessionStorage.getItem(storageKey);
            if (storedDataString) {
              const parsed = JSON.parse(storedDataString);
              // 비밀번호 필드 제거하고 나머지 데이터 사용
              delete parsed._password;
              baseData = parsed as IndividualRegistrationResponse;
              // 저장된 데이터가 있으면 먼저 표시 (사용자 경험 개선)
              if (baseData) {
                setRegistrationData(baseData);
                setIsLoading(false);
              }
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
          } catch {
            setError('데이터를 파싱할 수 없습니다.');
            setIsLoading(false);
            return;
          }
        }
        
        // 저장된 데이터가 없으면 에러 표시
        if (!baseData) {
          setError('신청 정보를 불러올 수 없습니다. 다시 확인해주세요.');
          setIsLoading(false);
          return;
        }
        
        // registrationId가 있으면 최신 결제 상태 가져오기 시도
        if (registrationIdParam && baseData) {
          try {
            // 세션 스토리지에서 비밀번호 가져오기
            const storageKey = `individual_registration_data_${params.eventId}_${registrationIdParam}`;
            let storedPassword = '';
            try {
              const storedDataString = sessionStorage.getItem(storageKey);
              if (storedDataString) {
                const parsed = JSON.parse(storedDataString);
                storedPassword = parsed._password || '';
              }
            } catch (e) {
              // 세션 스토리지 접근 실패 시 무시
            }
            
            // tokenService를 사용하여 관리자 토큰 확인
            const { tokenService } = await import('@/utils/tokenService');
            const adminToken = tokenService.getAdminAccessToken();
            
            // 관리자 토큰이 있으면 최신 데이터 가져오기
            if (adminToken) {
              try {
                const latestData = await getRegistrationDetail(registrationIdParam);
                
                // 결제 상태: 백엔드 enum을 그대로 사용 (PAID/UNPAID로 변환하지 않음)
                const paymentStatus = latestData.paymentStatus || 'UNPAID';
                
                // 기념품 정보 변환: souvenirListDetail을 souvenir 형식으로 변환
                const souvenirs = latestData.souvenirListDetail?.map((s) => ({
                  souvenirId: s.id,
                  souvenirName: s.name,
                  souvenirSize: s.size,
                })) || baseData.souvenir || [];
                
                // 참가종목 정보 업데이트
                const eventCategoryName = latestData.eventCategory || latestData.categoryName || baseData.eventCategoryName;
                const eventCategoryId = latestData.souvenirListDetail?.[0]?.eventCategoryId || baseData.eventCategoryId;
                
                // 최신 데이터로 업데이트 (결제 상태, 참가종목, 기념품, 주소 포함)
                const updatedData: IndividualRegistrationResponse = {
                  ...baseData,
                  paymentStatus,
                  eventCategoryName,
                  eventCategoryId,
                  souvenir: souvenirs,
                  address: latestData.address || baseData.address || '',
                  addressDetail: latestData.addressDetail || baseData.addressDetail || '',
                  // zipCode는 baseData에서만 가져옴 (getRegistrationDetail에는 없음)
                  zipCode: baseData.zipCode || '',
                };
                setRegistrationData(updatedData);
                
                // API 호출 성공 후 sessionStorage 삭제
                try {
                  sessionStorage.removeItem(storageKey);
                } catch (e) {
                  // 무시
                }
                
                return; // 성공하면 여기서 종료
              } catch (apiError) {
                // API 호출 실패 시 기존 데이터 사용 (fallback)
              }
            } else {
              // 관리자 토큰이 없으면 기존 데이터 사용 (일반 사용자)
              // sessionStorage 삭제
              try {
                const storageKey = `individual_registration_data_${params.eventId}_${registrationIdParam}`;
                sessionStorage.removeItem(storageKey);
              } catch (e) {
                // 무시
              }
            }
          } catch (tokenError) {
            // 토큰 확인 실패 시 기존 데이터 사용
          }
        }
        
        // registrationId가 없거나 API 호출 실패 시 기존 데이터 사용
        if (baseData) {
          setRegistrationData(baseData);
        } else {
          setError('신청 정보가 없습니다.');
        }
      } catch (err) {
        setError('데이터를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

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
        // Fallback: 이벤트 기본 정보에서 계좌 정보 추출
        const eventRes = await fetch(`${base}/api/v1/public/event/${eventId}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!eventRes.ok) return;
        const eventData = await eventRes.json();
        if (!ignore && eventData?.eventInfo) {
          setBankName(String(eventData.eventInfo.bank || ''));
          setVirtualAccount(String(eventData.eventInfo.virtualAccount || ''));
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

  const handleEdit = () => {
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
          <div className="mb-6">
            {registrationData.paymentStatus === 'UNPAID' ? (
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
              ) : registrationData.paymentStatus === 'PAID' || registrationData.paymentStatus === 'COMPLETED' ? (
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
              ) : (
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
              )}
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
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <label className="text-base font-medium text-black">참가종목</label>
                  <span className="text-base text-black">{registrationData.eventCategoryName || '-'}</span>
                </div>
                
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
                
                <div className="flex items-center justify-between pb-4">
                  <label className="text-base font-medium text-black">결제상태</label>
                  <span className={`text-base font-medium ${getPaymentStatusColor(registrationData.paymentStatus)}`}>
                    {getPaymentStatusText(registrationData.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-center gap-4 mt-8">
            {/* TODO: 결제상태에 따른 수정하기 버튼 비활성화 조건 일시적으로 주석처리 - 모든 경우에 수정 가능 */}
            {/* disabled={registrationData.paymentStatus !== 'UNPAID' && registrationData.paymentStatus !== 'PAID'} */}
            <button
              onClick={handleEdit}
              className={`min-w-[120px] md:min-w-[140px] px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-sm md:text-base transition-colors ${
                // registrationData.paymentStatus === 'UNPAID' || registrationData.paymentStatus === 'PAID'
                //   ? 'bg-white text-black border-2 border-black hover:bg-gray-100'
                //   : 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed opacity-50'
                'bg-white text-black border-2 border-black hover:bg-gray-100'
              }`}
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
