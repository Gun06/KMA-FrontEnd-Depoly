import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { GroupRegistrationResponse } from "../../../app/event/[eventId]/registration/apply/shared/types/common";
import { fetchIndividualGroupRegistration } from "../../../app/event/[eventId]/registration/confirm/group/api";
import PasswordResetRequestModal from "./PasswordResetRequestModal";
import PasswordResetOtpModal from "./PasswordResetOtpModal";
import { requestGroupPasswordReset, reissueGroupOtp } from "../../../app/event/[eventId]/registration/apply/shared/api/passwordReset";

// API 함수 (현재 API와 새로운 스키마 모두 지원)
const verifyGroupRegistration = async (eventId: string, data: { groupName: string; password: string }): Promise<GroupRegistrationResponse> => {
  try {
    const requestBody = {
      id: data.groupName,
      orgPw: data.password
    };
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
    const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/view-registration-info/organization`;
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      // 사용자 친화적 에러 메시지 매핑
      try {
        JSON.parse(errorText); // 파싱 확인용
        const status = response.status;

        if (status === 400 || status === 404) {
          throw new Error('신청정보 또는 비밀번호가 다름니다.');
        }
        if (status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        // 기타 케이스
        throw new Error('신청정보 또는 비밀번호가 다름니다.');
      } catch (_e) {
        // JSON 파싱 실패 시 기본 메시지
        if (response.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        throw new Error('신청정보 또는 비밀번호가 다름니다.');
      }
    }
    
    const result = await response.json();
    return result;
  } catch (_error) {
    throw _error;
  }
};

export default function GroupApplicationConfirmForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [individualError, setIndividualError] = useState<string | null>(null);
  const [individualLoading, setIndividualLoading] = useState(false);
  
  // 비밀번호 초기화 모달 상태
  const [showPasswordResetRequestModal, setShowPasswordResetRequestModal] = useState(false);
  const [showPasswordResetOtpModal, setShowPasswordResetOtpModal] = useState(false);
  const [passwordResetToken, setPasswordResetToken] = useState<string | null>(null);
  const [passwordResetOrganizationAccount, setPasswordResetOrganizationAccount] = useState<string | null>(null);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [isOtpReissuing, setIsOtpReissuing] = useState(false);

  const [formData, setFormData] = useState({
    groupName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [individualFormData, setIndividualFormData] = useState({
    orgAccount: "",
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    phone1: "010",
    phone2: "",
    phone3: "",
  });

  const [openDropdown, setOpenDropdown] = useState<'year' | 'month' | 'day' | null>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        yearRef.current && !yearRef.current.contains(event.target as Node) &&
        monthRef.current && !monthRef.current.contains(event.target as Node) &&
        dayRef.current && !dayRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIndividualInputChange = (field: string, value: string) => {
    setIndividualFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 입력 시 에러 초기화
    if (individualError) {
      setIndividualError(null);
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.groupName.trim()) {
      setError('단체신청용 ID를 입력해주세요.');
      return false;
    }
    if (!formData.password.trim()) {
      setError('단체 비밀번호를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await verifyGroupRegistration(eventId, formData);
      
      if (response && response.organizationAccount) {
        // 인증 성공한 데이터와 비밀번호를 sessionStorage에 임시 저장 (결과 페이지에서 사용)
        const storageKey = `group_registration_data_${eventId}_${response.organizationAccount}`;
        try {
          const dataToStore = {
            ...response,
            _password: formData.password // 비밀번호를 별도 필드로 저장
          };
          sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
        } catch (_e) {
          // sessionStorage 접근 실패 시 무시
        }
        
        // 성공 시 결과 페이지로 이동 (organizationAccount만 전달)
        router.push(`/event/${eventId}/registration/confirm/group/result?orgAccount=${encodeURIComponent(response.organizationAccount)}`);
      } else {
        setError('신청정보 또는 비밀번호가 다름니다.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '신청정보 또는 비밀번호가 다름니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 개별 확인 폼 유효성 검사
  const validateIndividualForm = () => {
    if (!individualFormData.orgAccount.trim()) {
      setIndividualError('단체신청용 ID를 입력해주세요.');
      return false;
    }
    if (!individualFormData.name.trim()) {
      setIndividualError('이름을 입력해주세요.');
      return false;
    }
    if (!individualFormData.birthYear || !individualFormData.birthMonth || !individualFormData.birthDay) {
      setIndividualError('생년월일을 모두 선택해주세요.');
      return false;
    }
    if (!individualFormData.phone1 || !individualFormData.phone2 || !individualFormData.phone3) {
      setIndividualError('연락처를 모두 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleIndividualSubmit = async () => {
    setIndividualError(null);
    
    if (!validateIndividualForm()) {
      return;
    }
    
    setIndividualLoading(true);
    
    try {
      // 생년월일을 YYYY-MM-DD 형식으로 변환
      const birth = `${individualFormData.birthYear}-${individualFormData.birthMonth.padStart(2, '0')}-${individualFormData.birthDay.padStart(2, '0')}`;
      // 전화번호를 010-1234-5678 형식으로 변환
      const phNum = `${individualFormData.phone1}-${individualFormData.phone2}-${individualFormData.phone3}`;
      
      // 인증 검증을 위해 API 호출 (실패 시 에러 표시)
      await fetchIndividualGroupRegistration(eventId, {
        orgAccount: individualFormData.orgAccount,
        name: individualFormData.name,
        phNum: phNum,
        birth: birth,
      });
      // 성공 시 결과 페이지로 이동 (쿼리 파라미터로 데이터 전달)
      const params = new URLSearchParams({
        orgAccount: individualFormData.orgAccount,
        name: individualFormData.name,
        phNum: phNum,
        birth: birth,
      });
      router.push(`/event/${eventId}/registration/confirm/group/individual/result?${params.toString()}`);
    } catch (error) {
      setIndividualError(error instanceof Error ? error.message : '신청정보 또는 비밀번호가 다름니다.');
      setIndividualLoading(false);
    }
  };

  // 비밀번호 초기화 요청 핸들러
  const handlePasswordResetRequest = async (data: { name?: string; phNum?: string; birth?: string; organizationAccount?: string }) => {
    setIsPasswordResetLoading(true);
    try {
      if (!data.organizationAccount) {
        throw new Error('단체 아이디를 입력해주세요.');
      }
      
      const result = await requestGroupPasswordReset(eventId, {
        organizationAccount: data.organizationAccount
      });
      
      if (result.token) {
        // 이전 타이머 정보 초기화 (새로운 요청이므로)
        sessionStorage.removeItem('passwordResetTimer');
        sessionStorage.removeItem('passwordResetTimerStart');
        sessionStorage.removeItem('passwordResetReissueCount');
        
        setPasswordResetToken(result.token);
        setPasswordResetOrganizationAccount(data.organizationAccount); // organizationAccount 저장
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
    if (!passwordResetToken || !passwordResetOrganizationAccount) {
      throw new Error('토큰 또는 단체 아이디가 없습니다.');
    }
    setIsOtpReissuing(true);
    try {
      await reissueGroupOtp(eventId, {
        token: passwordResetToken,
        uniqueInfo: {
          organizationAccount: passwordResetOrganizationAccount
        }
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
    const { changeGroupPassword } = await import("../../../app/event/[eventId]/registration/apply/shared/api/passwordReset");
    await changeGroupPassword(eventId, {
      token: passwordResetToken,
      otp,
      newPassword
    });
  };

  // 비밀번호 변경 성공 핸들러
  const handlePasswordResetSuccess = () => {
    setPasswordResetToken(null);
    setPasswordResetOrganizationAccount(null);
    // 단체 신청 확인 페이지로 이동
    router.push(`/event/${eventId}/registration/confirm/group`);
  };

  const [activeTab, setActiveTab] = useState<'group' | 'individual'>('group');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 탭 네비게이션 */}
      <div className="mb-12 flex justify-center gap-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('group')}
          className={`pb-3 px-1 text-base sm:text-lg font-medium transition-colors ${
            activeTab === 'group'
              ? 'text-black font-bold border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          단체신청확인
        </button>
        <button
          onClick={() => setActiveTab('individual')}
          className={`pb-3 px-1 text-base sm:text-lg font-medium transition-colors ${
            activeTab === 'individual'
              ? 'text-black font-bold border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          단체 개별 확인
        </button>
      </div>

      {/* 단체 탭 컨텐츠 */}
      {activeTab === 'group' && (
        <>
          {/* 섹션 제목 */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-black text-left">단체 참가자 정보</h2>
            <hr className="border-black border-[1.5px] mt-2" />
          </div>

          {/* 안내 문구 */}
          <div className="mb-8 sm:mb-12 text-left">
            <p className="text-sm sm:text-base text-black leading-relaxed font-bold">
              신청 내역을 확인하기 위해 신청서와 동일한 정보를 입력한 후, 확인하기를 클릭하세요.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* 폼 */}
          <div className="space-y-4 sm:space-y-6">
            {/* 단체 ID */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              <label className="w-full sm:w-32 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
                단체신청용 ID
              </label>
              <input
                type="text"
                value={formData.groupName}
                onChange={(e) => handleInputChange("groupName", e.target.value)}
                placeholder="띄어쓰기 없이 입력해주세요."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                name="no-autofill-group-id"
                className="w-full sm:w-[500px] px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* 구분선 */}
            <hr className="border-gray-200" />

            {/* 단체 비밀번호 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              <label className="w-full sm:w-32 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
                단체 비밀번호
              </label>
              <div className="w-full sm:w-[500px] relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="단체 비밀번호를 입력해주세요."
                  autoComplete="new-password"
                  name="no-autofill-group-password"
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowPasswordResetRequestModal(true)}
              type="button"
              className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-lg transition-colors font-medium text-base sm:text-lg text-black hover:bg-[#C0C0C0]"
              style={{ backgroundColor: '#D9D9D9' }}
            >
              비밀번호 초기화
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-lg transition-colors font-medium text-base sm:text-lg ${
                isLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>확인 중...</span>
                </div>
              ) : (
                '확인하기'
              )}
            </button>
          </div>
          
          {/* 스폰서와의 여백 */}
          <div className="h-12 sm:h-16"></div>
        </>
      )}

      {/* 개인 탭 컨텐츠 */}
      {activeTab === 'individual' && (
        <>
          {/* 섹션 제목 */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-black text-left">단체 신청 개별 확인</h2>
            <hr className="border-black border-[1.5px] mt-2" />
          </div>

          {/* 안내 문구 */}
          <div className="mb-8 sm:mb-12 text-left">
            <p className="text-sm sm:text-base text-black leading-relaxed font-bold">
              개별 참가자의 신청 내역을 확인하기 위해 정보를 입력한 후, 확인하기를 클릭하세요.
            </p>
          </div>

          {/* 개별 확인 폼 */}
          <div className="space-y-4 sm:space-y-6">
          {/* 단체신청용 ID */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <label className="w-full sm:w-32 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
              단체신청용 ID
            </label>
            <input
              type="text"
              value={individualFormData.orgAccount}
              onChange={(e) => handleIndividualInputChange("orgAccount", e.target.value)}
              placeholder="띄어쓰기 없이 입력해주세요."
              autoComplete="off"
              className="w-full sm:w-[500px] px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* 구분선 */}
          <hr className="border-gray-200" />

          {/* 이름 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <label className="w-full sm:w-32 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
              이름
            </label>
            <input
              type="text"
              value={individualFormData.name}
              onChange={(e) => handleIndividualInputChange("name", e.target.value)}
              placeholder="이름을 입력해주세요."
              autoComplete="off"
              className="w-full sm:w-[500px] px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* 구분선 */}
          <hr className="border-gray-200" />

          {/* 생년월일 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <label className="w-full sm:w-32 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
              생년월일
            </label>
            <div className="flex items-center space-x-1">
              {/* 년도 선택 */}
              <div className="relative" ref={yearRef}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                  className="w-20 sm:w-24 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>{individualFormData.birthYear || "년도"}</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </button>
                
                {openDropdown === 'year' && (
                  <div className="absolute top-full left-0 mt-1 w-20 sm:w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <button
                        key={year}
                        onClick={() => {
                          handleIndividualInputChange("birthYear", year.toString());
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base text-center hover:bg-blue-50 transition-colors ${
                          year.toString() === individualFormData.birthYear ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 구분자 */}
              <span className="text-gray-400 text-xs sm:text-sm mx-1">.</span>
              
              {/* 월 선택 */}
              <div className="relative" ref={monthRef}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
                  className="w-18 sm:w-20 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>{individualFormData.birthMonth || "월"}</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </button>
                
                {openDropdown === 'month' && (
                  <div className="absolute top-full left-0 mt-1 w-18 sm:w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <button
                        key={month}
                        onClick={() => {
                          handleIndividualInputChange("birthMonth", month.toString().padStart(2, '0'));
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base text-center hover:bg-blue-50 transition-colors ${
                          month.toString().padStart(2, '0') === individualFormData.birthMonth ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {String(month).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 구분자 */}
              <span className="text-gray-400 text-xs sm:text-sm mx-1">.</span>
              
              {/* 일 선택 */}
              <div className="relative" ref={dayRef}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')}
                  className="w-18 sm:w-20 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>{individualFormData.birthDay || "일"}</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </button>
                
                {openDropdown === 'day' && (
                  <div className="absolute top-full left-0 mt-1 w-18 sm:w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <button
                        key={day}
                        onClick={() => {
                          handleIndividualInputChange("birthDay", day.toString().padStart(2, '0'));
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base text-center hover:bg-blue-50 transition-colors ${
                          day.toString().padStart(2, '0') === individualFormData.birthDay ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {String(day).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <hr className="border-gray-200" />

          {/* 연락처 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <label className="w-full sm:w-32 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
              연락처
            </label>
            <div className="flex items-center gap-2">
              <select
                value={individualFormData.phone1}
                onChange={(e) => handleIndividualInputChange('phone1', e.target.value)}
                className="w-20 sm:w-24 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center bg-white hover:bg-gray-50 transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </select>
              <span className="text-black text-lg sm:text-xl font-bold self-center select-none" aria-hidden="true">-</span>
              <input
                type="text"
                placeholder=""
                value={individualFormData.phone2}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleIndividualInputChange('phone2', value);
                }}
                autoComplete="off"
                name="no-autofill-individual-phone2"
                className="w-16 sm:w-20 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center"
                maxLength={4}
              />
              <span className="text-black text-lg sm:text-xl font-bold self-center select-none" aria-hidden="true">-</span>
              <input
                type="text"
                placeholder=""
                value={individualFormData.phone3}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleIndividualInputChange('phone3', value);
                }}
                autoComplete="off"
                name="no-autofill-individual-phone3"
                className="w-16 sm:w-20 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center"
                maxLength={4}
              />
            </div>
          </div>
        </div>

          {/* 개별 확인 에러 메시지 */}
          {individualError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{individualError}</p>
            </div>
          )}

          {/* 개별 확인 제출 버튼 */}
          <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={handleIndividualSubmit}
            disabled={individualLoading}
            className={`w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-lg transition-colors font-medium text-base sm:text-lg ${
              individualLoading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {individualLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>확인 중...</span>
              </div>
            ) : (
              '확인하기'
            )}
          </button>
        </div>

        </>
      )}

      {/* 비밀번호 초기화 요청 모달 */}
      <PasswordResetRequestModal
        isOpen={showPasswordResetRequestModal}
        onClose={() => {
          setShowPasswordResetRequestModal(false);
          setPasswordResetToken(null);
          setPasswordResetOrganizationAccount(null);
        }}
        onSubmit={handlePasswordResetRequest}
        isLoading={isPasswordResetLoading}
        type="group"
      />

      {/* OTP 인증 및 비밀번호 변경 모달 */}
      <PasswordResetOtpModal
        isOpen={showPasswordResetOtpModal}
        onClose={() => {
          setShowPasswordResetOtpModal(false);
          setPasswordResetToken(null);
          setPasswordResetOrganizationAccount(null);
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
    </div>
  );
}
