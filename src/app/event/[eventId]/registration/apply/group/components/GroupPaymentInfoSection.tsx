// 단체 결제 정보 섹션 컴포넌트
import React from 'react';
import FormField from '../../shared/components/FormField';
import { GroupFormData } from '../../shared/types/group';

interface GroupPaymentInfoSectionProps {
  formData: GroupFormData;
  onInputChange: (field: keyof GroupFormData, value: string) => void;
  eventId?: string;
}

export default function GroupPaymentInfoSection({
  formData,
  onInputChange,
  eventId
}: GroupPaymentInfoSectionProps) {
  const [bankName, setBankName] = React.useState<string>('');
  const [virtualAccount, setVirtualAccount] = React.useState<string>('');

  React.useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        if (!eventId) return;
        const base = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        
        // 먼저 전용 결제 정보 API 시도
        try {
          const res = await fetch(`${base}/api/v1/public/event/${eventId}/payment-info`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            if (!ignore) {
              setBankName(String(data?.bankName || ''));
              setVirtualAccount(String(data?.virtualAccount || ''));
            }
            return; // 성공하면 종료
          }
        } catch (e) {
          // 결제 정보 API 실패 시 무시하고 fallback으로 진행
        }
        
        // Fallback: 메인 이벤트 정보 API에서 가져오기
        const res = await fetch(`${base}/api/v1/public/event/${eventId}`, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore && data?.eventInfo) {
          setBankName(String(data.eventInfo.bank || ''));
          setVirtualAccount(String(data.eventInfo.virtualAccount || ''));
        }
      } catch (error) {
        // 결제 정보 로드 실패 시 무시
      }
    };
    load();
    return () => { ignore = true; };
  }, [eventId]);
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">결제 정보</h2>
        <hr className="border-black border-[1.5px] mt-2" />
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* 계좌번호 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2 text-sm text-gray-600">
            <p>※ 아래 계좌번호로 입금해주시기 바랍니다.</p>
            <p>
              계좌번호 :{' '}
              <span className="bg-yellow-300 font-bold">
                {bankName ? `${bankName} ${virtualAccount}` : '계좌 정보 준비 중'}
              </span>
            </p>
            <p>※ 입금자명을 정확히 입력해주세요.</p>
          </div>
        </div>
        
        {/* 결제방법 */}
        <FormField label="결제방법" required>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={formData.paymentMethod === "bank_transfer"}
                onChange={(e) => onInputChange('paymentMethod', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm sm:text-base">계좌이체</span>
            </label>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 입금자명 */}
        <FormField label="입금자명" required>
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="입금자명을 입력해주세요"
              value={formData.depositorName}
              onChange={(e) => onInputChange('depositorName', e.target.value)}
              className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </FormField>
        <hr className="border-gray-200" />
      </div>
    </div>
  );
}
