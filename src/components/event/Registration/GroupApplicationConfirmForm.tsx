import { useState } from "react";
import { useRouter } from "next/navigation";
import { GroupRegistrationResponse } from "../../../app/event/[eventId]/registration/apply/shared/types/common";

// API 함수 (현재 API와 새로운 스키마 모두 지원)
const verifyGroupRegistration = async (eventId: string, data: any): Promise<GroupRegistrationResponse | any> => {
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
        const errorJson = JSON.parse(errorText);
        const status = response.status;
        const code = errorJson?.code || '';
        const serverMsg = errorJson?.message || '';

        if (status === 400 && code === 'NOT_MATCHED_PASSWORD') {
          throw new Error('단체신청용 ID 또는 비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
        }
        if (status === 404) {
          throw new Error('해당 정보로 신청 내역을 찾을 수 없습니다. 입력한 단체신청용 ID와 비밀번호를 확인해주세요.');
        }
        if (status >= 500) {
          throw new Error('사용자 정보를 찾을 수 없습니다. 신청내역 정보를 다시 확인해주세요.');
        }
        // 기타 케이스: 서버 메시지가 있으면 노출, 없으면 기본 메시지
        throw new Error(serverMsg || '인증에 실패했습니다. 입력 정보를 확인해주세요.');
      } catch {
        // JSON 파싱 실패 시 기본 메시지
        if (response.status >= 500) {
          throw new Error('사용자 정보를 찾을 수 없습니다. 신청내역 정보를 다시 확인해주세요.');
        }
        throw new Error('인증에 실패했습니다. 입력 정보를 확인해주세요.');
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export default function GroupApplicationConfirmForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    groupName: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        } catch (e) {
          // sessionStorage 접근 실패 시 무시
        }
        
        // 성공 시 결과 페이지로 이동 (organizationAccount만 전달)
        router.push(`/event/${eventId}/registration/confirm/group/result?orgAccount=${encodeURIComponent(response.organizationAccount)}`);
      } else {
        setError('인증에 실패했습니다. 단체명과 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '인증에 실패했습니다. 입력 정보를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

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
          <div className="w-full sm:w-[500px]">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="단체 비밀번호를 입력해주세요."
              autoComplete="new-password"
              name="no-autofill-group-password"
              className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="mt-6 sm:mt-8 text-center">
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
    </div>
  );
}
