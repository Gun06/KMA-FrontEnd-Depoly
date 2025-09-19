import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

type InquiryType = "개인" | "단체";

export default function RecordInquiryForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const eventId = params.eventId as string;
  const [inquiryType, setInquiryType] = useState<InquiryType>("개인");
  const [openDropdown, setOpenDropdown] = useState<'year' | 'month' | 'day' | null>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.includes('/group')) {
      setInquiryType("단체");
    } else {
      setInquiryType("개인");
    }
  }, [pathname]);

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
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTabChange = (type: InquiryType) => {
    if (type === "개인") {
      router.push(`/event/${eventId}/records`);
    } else {
      router.push(`/event/${eventId}/records/group`);
    }
  };

  const handleSubmit = () => {
    // 폼 유효성 검사
    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
      alert('생년월일을 모두 선택해주세요.');
      return;
    }
    if (!formData.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    // 폼 데이터를 쿼리 파라미터로 전달
    const searchParams = new URLSearchParams({
      name: formData.name,
      birthDate: `${formData.birthYear}.${formData.birthMonth}.${formData.birthDay}`,
      password: formData.password
    });
    
    console.log('Form submitted:', formData);
    router.push(`/event/${eventId}/records/result?${searchParams.toString()}`);
  };

  const handlePasswordFind = () => {
    // 비밀번호 찾기 로직
    console.log('Password find clicked');
  };

  const years = Array.from({ length: 100 }, (_, i) => 2025 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 탭 네비게이션 */}
      <div className="flex mb-8 justify-center">
        <div className="flex">
          <button
            onClick={() => handleTabChange("개인")}
            className={`px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl font-black text-black transition-colors ${
              inquiryType === "개인" ? "border-b-4 border-black" : "text-gray-400 border-b border-gray-200"
            }`}
            style={{ fontWeight: 900 }}
          >
            개인
          </button>
          <button
            onClick={() => handleTabChange("단체")}
            className={`px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl font-black text-black transition-colors ${
              inquiryType === "단체" ? "border-b-4 border-black" : "text-gray-400 border-b border-gray-200"
            }`}
            style={{ fontWeight: 900 }}
          >
            단체
          </button>
        </div>
      </div>

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
            이름
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

        {/* 비밀번호 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <label className="w-full sm:w-24 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
            비밀번호
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

      {/* 제출 버튼 */}
      <div className="mt-6 sm:mt-8 text-center">
        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-base sm:text-lg"
        >
          다음
        </button>
      </div>
      
      {/* 스폰서와의 여백 */}
      <div className="h-12 sm:h-16"></div>
    </div>
  );
}
