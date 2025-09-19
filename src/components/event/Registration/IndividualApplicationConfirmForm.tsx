import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { IndividualRegistrationResponse } from "@/app/event/[eventId]/registration/apply/shared/types/common";

export default function IndividualApplicationConfirmForm({ eventId }: { eventId: string }) {
  const router = useRouter();
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

  const [formData, setFormData] = useState({
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    password: "",
    phone1: "010",
    phone2: "",
    phone3: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!formData.name || !formData.birthYear || !formData.birthMonth || !formData.birthDay || !formData.password) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (!formData.phone1 || !formData.phone2 || !formData.phone3) {
      setError('전화번호를 완성해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 생년월일을 YYYY-MM-DD 형식으로 변환
      const birth = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;
      
      // 전화번호를 010-1234-5678 형식으로 변환
      const phNum = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;

      const requestData = {
        name: formData.name,
        phNum: phNum,
        birth: birth,
        eventPw: formData.password
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/view-registration-info`;

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result: IndividualRegistrationResponse = await response.json();
        
        // 성공 시 결과 페이지로 이동 (데이터와 함께)
        const encodedData = encodeURIComponent(JSON.stringify(result));
        router.push(`/event/${eventId}/registration/confirm/individual/result?data=${encodedData}`);
      } else {
        const errorText = await response.text();
        
        // 404 에러인 경우 사용자 친화적인 메시지
        if (response.status === 404) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
              setError(errorData.message);
            } else {
              setError('해당 정보로 신청 내역을 찾을 수 없습니다. 입력 정보를 다시 확인해주세요.');
            }
          } catch {
            setError('해당 정보로 신청 내역을 찾을 수 없습니다. 입력 정보를 다시 확인해주세요.');
          }
        } else {
          throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
        }
      }
    } catch (error) {
      // 404 에러는 이미 setError로 처리되었으므로 추가 처리 불필요
      if (error instanceof Error && !error.message.includes('404')) {
        setError('신청 내역을 확인할 수 없습니다. 입력 정보를 다시 확인해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordFind = () => {
    // 비밀번호 찾기 페이지로 이동
    router.push(`/event/${eventId}/registration/confirm/individual/password-find`);
  };

  const years = Array.from({ length: 100 }, (_, i) => 2025 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">


      {/* 섹션 제목 */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">개인 참가자 정보</h2>
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

      {/* 폼 */}
      <div className="space-y-4 sm:space-y-6">
        {/* 이름 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <label className="w-full sm:w-24 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="띄어쓰기 없이 입력해주세요."
            className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* 구분선 */}
        <hr className="border-gray-200" />

        {/* 생년월일 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <label className="w-full sm:w-24 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
            생년월일 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-1">
            {/* 년도 선택 */}
            <div className="relative" ref={yearRef}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                className="w-20 sm:w-24 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
              >
                <span>{formData.birthYear || "년도"}</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              </button>
              
              {openDropdown === 'year' && (
                <div className="absolute top-full left-0 mt-1 w-20 sm:w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        handleInputChange("birthYear", year.toString());
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base text-center hover:bg-blue-50 transition-colors ${
                        year.toString() === formData.birthYear ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
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
                <span>{formData.birthMonth || "월"}</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              </button>
              
              {openDropdown === 'month' && (
                <div className="absolute top-full left-0 mt-1 w-18 sm:w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {months.map(month => (
                    <button
                      key={month}
                      onClick={() => {
                        handleInputChange("birthMonth", month.toString().padStart(2, '0'));
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base text-center hover:bg-blue-50 transition-colors ${
                        month.toString().padStart(2, '0') === formData.birthMonth ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
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
                <span>{formData.birthDay || "일"}</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              </button>
              
              {openDropdown === 'day' && (
                <div className="absolute top-full left-0 mt-1 w-18 sm:w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {days.map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        handleInputChange("birthDay", day.toString().padStart(2, '0'));
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base text-center hover:bg-blue-50 transition-colors ${
                        day.toString().padStart(2, '0') === formData.birthDay ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'
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

        {/* 전화번호 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <label className="w-full sm:w-24 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
            전화번호 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={formData.phone1}
              onChange={(e) => handleInputChange('phone1', e.target.value)}
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
            <span className="text-gray-500 text-lg sm:text-xl font-bold self-center">-</span>
            <input
              type="text"
              placeholder=""
              value={formData.phone2}
              onChange={(e) => handleInputChange('phone2', e.target.value)}
              className="w-16 sm:w-20 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center"
              maxLength={4}
            />
            <span className="text-gray-500 text-lg sm:text-xl font-bold self-center">-</span>
            <input
              type="text"
              placeholder=""
              value={formData.phone3}
              onChange={(e) => handleInputChange('phone3', e.target.value)}
              className="w-16 sm:w-20 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center"
              maxLength={4}
            />
          </div>
        </div>

        {/* 구분선 */}
        <hr className="border-gray-200" />

        {/* 비밀번호 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <label className="w-full sm:w-24 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
            비밀번호 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-[500px]">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="입력해주세요."
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

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
