import { useState } from "react";
import { useRouter } from "next/navigation";

// API 함수
const verifyGroupRegistration = async (eventId: string, data: any) => {
  try {
    const requestBody = {
      id: data.groupName,
      orgPw: data.password
    };
    
    console.log('API 요청 URL:', `https://kma-user.duckdns.org/api/v1/public/event/${eventId}/registration/view-registration-info/organization`);
    console.log('API 요청 Body:', requestBody);
    
    const response = await fetch(`https://kma-user.duckdns.org/api/v1/public/event/${eventId}/registration/view-registration-info/organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 오류 응답:', errorText);
      throw new Error(`인증 실패: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API 성공 응답:', result);
    return result;
  } catch (error) {
    console.error('단체신청 인증 오류:', error);
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
      setError('단체 ID를 입력해주세요.');
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
      console.log('단체신청 인증 시도:', formData);
      
      const response = await verifyGroupRegistration(eventId, formData);
      
      if (response && response.organizationAccount) {
        console.log('인증 성공:', response);
        // 인증 성공 시 결과 페이지로 이동 (데이터를 URL 파라미터로 전달)
        const encodedData = encodeURIComponent(JSON.stringify(response));
        router.push(`/event/${eventId}/registration/confirm/group/result?data=${encodedData}`);
      } else {
        throw new Error('인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('단체신청 인증 오류:', error);
      setError(error instanceof Error ? error.message : '인증에 실패했습니다. 입력 정보를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordFind = () => {
    // 비밀번호 찾기 로직
    console.log('Password find clicked');
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
        <p className="text-sm sm:text-base text-black leading-relaxed mb-1 font-bold">
          신청 내역을 확인하기 위해 신청서와 동일한 정보를 입력한 후, 확인하기를 클릭하세요.
        </p>
        <p className="text-sm sm:text-base text-black leading-relaxed font-bold">
          비밀번호를 잊어버린 경우, 비밀번호 찾기를 클릭하시면 입력하신 이메일 주소로 비밀번호를 보내드립니다.
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
            단체 ID
          </label>
          <input
            type="text"
            value={formData.groupName}
            onChange={(e) => handleInputChange("groupName", e.target.value)}
            placeholder="띄어쓰기 없이 입력해주세요."
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
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-[500px]">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="단체 비밀번호를 입력해주세요."
              className="w-full sm:flex-1 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={handlePasswordFind}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm sm:text-base"
            >
              비밀번호 찾기
            </button>
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
