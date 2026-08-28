// 결제 정보 섹션 컴포넌트
import React from 'react';
import FormField from '../../shared/components/FormField';
import { IndividualFormData } from '../../shared/types/individual';
import { useEventPaymentDisplayInfo } from '@/hooks/usePublicEventData';

interface PaymentInfoSectionProps {
  formData: IndividualFormData;
  onInputChange: (field: keyof IndividualFormData, value: string) => void;
  eventId?: string;
}

export default function PaymentInfoSection({
  formData,
  onInputChange,
  eventId
}: PaymentInfoSectionProps) {
  const { bankName, virtualAccount, accountHolderName } =
    useEventPaymentDisplayInfo(eventId, { prefer: 'event' });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">결제 정보</h2>
        <hr className="border-black border-[1.5px] mt-2" />
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2 text-sm text-gray-600">
            <p>※ 아래 계좌번호로 입금해주시기 바랍니다.</p>
            {accountHolderName ? (
              <p>
                예금주명 :{' '}
                <span className="bg-yellow-300 font-bold">
                  {accountHolderName}
                </span>
              </p>
            ) : null}
            <p>
              계좌번호 :{' '}
              <span className="bg-yellow-300 font-bold">
                {bankName ? `${bankName} ${virtualAccount}` : '계좌 정보 준비 중'}
              </span>
            </p>
            <p>※ 입금자명을 정확히 입력해주세요.</p>
          </div>
        </div>
        
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
