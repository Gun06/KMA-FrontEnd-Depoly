import { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { getOrganizationRecord, type OrganizationRecordRequest } from "@/services/record";

type InquiryType = "개인" | "단체";

export default function GroupRecordInquiryForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const eventId = params.eventId as string;
  const [inquiryType, setInquiryType] = useState<InquiryType>("단체");

  useEffect(() => {
    if (pathname.includes('/group')) {
      setInquiryType("단체");
    } else {
      setInquiryType("개인");
    }
  }, [pathname]);

  const [formData, setFormData] = useState({
    groupId: "",
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!formData.groupId.trim()) {
      alert("단체신청용 ID를 입력해주세요.");
      return;
    }
    if (!formData.password.trim()) {
      alert("단체 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsErrorVisible(false);
    
    try {
      // API 요청 데이터 구성
      const requestData: OrganizationRecordRequest = {
        id: formData.groupId,
        orgPw: formData.password
      };

      // API 호출
      const results = await getOrganizationRecord(eventId, requestData);
      
      // 결과를 쿼리 파라미터로 전달하여 결과 페이지로 이동
      const searchParams = new URLSearchParams({
        results: JSON.stringify(results)
      });
      
      router.push(`/event/${eventId}/records/group/result?${searchParams.toString()}`);
    } catch (error) {
      setError('단체 기록 조회에 실패했습니다. 정보를 다시 입력해주세요.');
      setIsErrorVisible(true);
      
      // 3초 후 에러 메시지 자동 제거 (스무스하게)
      setTimeout(() => {
        setIsErrorVisible(false);
        // 애니메이션 완료 후 에러 메시지 제거
        setTimeout(() => {
          setError(null);
        }, 300);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordFind = () => {
    // 비밀번호 찾기 로직
  };

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

      {/* 폼 */}
      <div className="space-y-4 sm:space-y-6">
        {/* 단체 ID */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <label className="w-full sm:w-32 text-base sm:text-lg font-black text-black" style={{ fontWeight: 900 }}>
            단체신청용 ID
          </label>
          <input
            type="text"
            value={formData.groupId}
            onChange={(e) => handleInputChange("groupId", e.target.value)}
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

      {/* 에러 메시지 */}
      {error && (
        <div className={`mt-4 p-4 bg-red-50 border border-red-200 rounded-lg transition-all duration-300 ease-in-out ${
          isErrorVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
        }`}>
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

      {/* 제출 버튼 - 비활성화 */}
      <div className="mt-6 sm:mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled
          className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50 font-medium text-base sm:text-lg"
        >
          다음
        </button>
      </div>
      
      {/* 스폰서와의 여백 */}
      <div className="h-12 sm:h-16"></div>
    </div>
  );
}