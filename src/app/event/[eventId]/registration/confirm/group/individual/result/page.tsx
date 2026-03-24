"use client";

import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { IndividualGroupRegistrationData } from "../../types";
import { fetchIndividualGroupRegistration, fetchOwnedRegistrationView } from "../../api";
import IndividualGroupConfirmResult from "@/components/event/Registration/IndividualGroupConfirmResult";
import OwnedRegistrationAuthModal from "@/components/event/Registration/OwnedRegistrationAuthModal";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import PasswordResetRequestModal from "@/components/event/Registration/PasswordResetRequestModal";
import PasswordResetOtpModal from "@/components/event/Registration/PasswordResetOtpModal";
import { requestOwnedPasswordReset, reissueOwnedOtp, changeOwnedPassword } from "@/app/event/[eventId]/registration/apply/shared/api/passwordReset";

export default function IndividualGroupConfirmResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const [individualData, setIndividualData] = useState<IndividualGroupRegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPasswordResetInfoModal, setShowPasswordResetInfoModal] = useState(false);
  const [showPasswordResetRequestModal, setShowPasswordResetRequestModal] = useState(false);
  const [showPasswordResetOtpModal, setShowPasswordResetOtpModal] = useState(false);
  const [passwordResetToken, setPasswordResetToken] = useState<string | null>(null);
  const [passwordResetUniqueInfo, setPasswordResetUniqueInfo] = useState<{ name: string; phNum: string; birth: string } | null>(null);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [isOtpReissuing, setIsOtpReissuing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 쿼리 파라미터에서 인증 정보 가져오기
      const orgAccount = searchParams.get('orgAccount');
      const name = searchParams.get('name');
      const phNum = searchParams.get('phNum');
      const birth = searchParams.get('birth');

      if (!orgAccount || !name || !phNum || !birth) {
        setError('인증 정보가 누락되었습니다. 다시 확인해주세요.');
        setIsLoading(false);
        return;
      }

      // API 호출하여 개별 확인 데이터 가져오기
      const response = await fetchIndividualGroupRegistration(eventId, {
        orgAccount: decodeURIComponent(orgAccount),
        name: decodeURIComponent(name),
        phNum: decodeURIComponent(phNum),
        birth: decodeURIComponent(birth),
      });

      setIndividualData(response);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
      setIsLoading(false);
    }
  }, [searchParams, eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBackToList = () => {
    router.push(`/event/${eventId}/registration/confirm/group`);
  };

  const handleAuthSubmit = async (data: { name: string; birth: string; phNum: string; password: string }) => {
    if (!individualData) {
      throw new Error('신청 정보를 불러올 수 없습니다.');
    }

    setIsAuthLoading(true);
    try {
      // 소유 신청 인증: 소유 신청 수정 화면 구성용 API 사용 (비밀번호 포함)
      const ownedData = await fetchOwnedRegistrationView(eventId, {
        name: data.name,
        phNum: data.phNum,
        birth: data.birth,
        eventPw: data.password
      });

      // 인증 성공 시 비밀번호를 sessionStorage에 임시 저장 (수정 페이지에서 사용)
      // 페이지 새로고침 시에도 사용할 수 있도록 삭제하지 않음
      const storageKey = `owned_auth_${eventId}_${ownedData.registrationId}`;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({
          password: data.password,
          timestamp: Date.now()
        }));
      } catch (_e) {
        // sessionStorage 저장 실패 시 무시
      }

      // 인증 성공 시 수정 페이지로 이동
      router.push(`/event/${eventId}/registration/apply/owned/${ownedData.registrationId}?name=${encodeURIComponent(data.name)}&birth=${encodeURIComponent(data.birth)}&phNum=${encodeURIComponent(data.phNum)}`);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '인증에 실패했습니다. 정보를 확인해주세요.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 수정하기 버튼 클릭 핸들러
  const handleEditClick = () => {
    if (individualData?.checkOwned) {
      // 소유 신청인 경우 바로 인증 모달 표시
      setShowAuthModal(true);
    } else {
      // 소유 신청이 아닌 경우 안내 모달 표시
      setShowPasswordResetInfoModal(true);
    }
  };

  // 비밀번호 초기화 요청 핸들러
  const handlePasswordResetRequest = async (data: { name?: string; phNum?: string; birth?: string }) => {
    setIsPasswordResetLoading(true);
    try {
      if (!data.name || !data.phNum || !data.birth) {
        throw new Error('이름, 전화번호, 생년월일을 모두 입력해주세요.');
      }
      
      const result = await requestOwnedPasswordReset(eventId, {
        name: data.name,
        phNum: data.phNum,
        birth: data.birth
      });
      
      if (result.token) {
        // 이전 타이머 정보 초기화
        sessionStorage.removeItem('passwordResetTimer');
        sessionStorage.removeItem('passwordResetTimerStart');
        sessionStorage.removeItem('passwordResetReissueCount');
        
        setPasswordResetToken(result.token);
        setPasswordResetUniqueInfo({
          name: data.name,
          phNum: data.phNum,
          birth: data.birth
        });
        setShowPasswordResetRequestModal(false);
        setShowPasswordResetOtpModal(true);
      } else {
        throw new Error('토큰을 받지 못했습니다.');
      }
    } catch (err) {
      throw err;
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  // OTP 재전송 핸들러
  const handleOtpReissue = async () => {
    if (!passwordResetToken || !passwordResetUniqueInfo) {
      throw new Error('토큰 또는 인증 정보가 없습니다.');
    }
    setIsOtpReissuing(true);
    try {
      await reissueOwnedOtp(eventId, {
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
    await changeOwnedPassword(eventId, {
      token: passwordResetToken,
      otp,
      newPassword
    });
  };

  // 비밀번호 변경 성공 핸들러
  const handlePasswordResetSuccess = () => {
    setPasswordResetToken(null);
    setPasswordResetUniqueInfo(null);
    // 백엔드에서 비밀번호 변경 완료 시 checkOwned가 true로 변경됨
    // 데이터를 다시 불러와서 checkOwned 상태 업데이트 확인
    loadData();
  };

  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 개별 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">개별 신청 정보를 불러오는 중...</p>
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
          subMenu: "단체 신청 개별 확인 결과"
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

  if (!individualData) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "참가신청",
          subMenu: "단체 신청 개별 확인 결과"
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-4">데이터를 불러올 수 없습니다.</p>
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

  return (
    <SubmenuLayout 
      eventId={eventId}
      breadcrumb={{
        mainMenu: "참가신청",
        subMenu: "단체 신청 개별 확인 결과"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 개별 확인 결과 컴포넌트 */}
          <IndividualGroupConfirmResult data={individualData} />

          {/* 버튼 그룹 */}
          <div className="flex flex-row justify-center gap-2 sm:gap-4 mt-8">
            <button
              onClick={handleEditClick}
              className="min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors bg-white text-black border-2 border-black hover:bg-gray-100"
            >
              수정하기
            </button>
            {/* 목록으로 돌아가기 버튼 */}
            <button
              onClick={handleBackToList}
              className="min-w-[70px] sm:min-w-[120px] md:min-w-[140px] px-2 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-colors bg-black text-white hover:bg-gray-800"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>

      {/* 소유 신청 수정 인증 모달 */}
      <OwnedRegistrationAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSubmit={handleAuthSubmit}
        isLoading={isAuthLoading}
      />

      {/* 비밀번호 초기화 필요 안내 모달 */}
      <ConfirmModal
        isOpen={showPasswordResetInfoModal}
        onClose={() => setShowPasswordResetInfoModal(false)}
        onConfirm={() => {
          setShowPasswordResetInfoModal(false);
          setShowPasswordResetRequestModal(true);
        }}
        title="비밀번호 초기화 필요"
        message={`신청 내역을 수정하려면 먼저 비밀번호를 초기화하여
소유 신청으로 전환해야 합니다.

비밀번호 초기화를 진행하시겠습니까?`}
        confirmText="비밀번호 초기화 진행"
        cancelText="취소"
        variant="default"
        centerAlign={true}
        multiline={true}
      />

      {/* 비밀번호 초기화 요청 모달 */}
      <PasswordResetRequestModal
        isOpen={showPasswordResetRequestModal}
        onClose={() => {
          setShowPasswordResetRequestModal(false);
          setPasswordResetToken(null);
          setPasswordResetUniqueInfo(null);
        }}
        onSubmit={handlePasswordResetRequest}
        isLoading={isPasswordResetLoading}
        type="individual"
        isOwned={true}
      />

      {/* OTP 인증 및 비밀번호 변경 모달 */}
      <PasswordResetOtpModal
        isOpen={showPasswordResetOtpModal}
        onClose={() => {
          setShowPasswordResetOtpModal(false);
          setPasswordResetToken(null);
          setPasswordResetUniqueInfo(null);
          sessionStorage.removeItem('passwordResetTimer');
          sessionStorage.removeItem('passwordResetTimerStart');
          sessionStorage.removeItem('passwordResetReissueCount');
        }}
        onBack={() => {
          setShowPasswordResetOtpModal(false);
          setShowPasswordResetRequestModal(true);
        }}
        onSubmit={handlePasswordChange}
        onReissue={handleOtpReissue}
        isLoading={isPasswordResetLoading}
        isReissuing={isOtpReissuing}
        onSuccess={handlePasswordResetSuccess}
      />
    </SubmenuLayout>
  );
}


