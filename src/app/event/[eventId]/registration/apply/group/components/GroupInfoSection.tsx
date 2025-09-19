// 단체 정보 섹션 컴포넌트
import React from 'react';
import FormField from '../../shared/components/FormField';
import AddressField from '../../shared/components/AddressField';
import PasswordField from '../../shared/components/PasswordField';
import PasswordConfirmField from '../../shared/components/PasswordConfirmField';
import { GroupFormData } from '../../shared/types/group';

interface GroupInfoSectionProps {
  formData: GroupFormData;
  onInputChange: (field: keyof GroupFormData, value: string) => void;
  onAddressSelect: (postalCode: string, address: string) => void;
  onGroupNameCheck: () => void;
  onGroupIdCheck: () => void;
}

export default function GroupInfoSection({
  formData,
  onInputChange,
  onAddressSelect,
  onGroupNameCheck,
  onGroupIdCheck
}: GroupInfoSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">단체 정보</h2>
        <hr className="border-black border-[1.5px] mt-2" />
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* 단체명 */}
        <FormField label="단체명" required>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="단체명을 입력해주세요"
              value={formData.groupName}
              onChange={(e) => onInputChange('groupName', e.target.value)}
              className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={onGroupNameCheck}
              className="w-full sm:w-auto px-4 py-3 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap flex items-center justify-center"
            >
              단체명 확인 →
            </button>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 단체 아이디 */}
        <FormField label="단체 아이디" required>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="단체 아이디를 입력해주세요"
              value={formData.groupId}
              onChange={(e) => onInputChange('groupId', e.target.value)}
              className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={onGroupIdCheck}
              className="w-full sm:w-auto px-4 py-3 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap flex items-center justify-center"
            >
              아이디 확인 →
            </button>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 대표자 성명 */}
        <FormField label="대표자 성명" required>
          <input
            type="text"
            placeholder="대표자 성명을 입력해주세요"
            value={formData.leaderName}
            onChange={(e) => onInputChange('leaderName', e.target.value)}
            className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            required
          />
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 대표자 생년월일 */}
        <FormField label="대표자 생년월일" required>
          <input
            type="text"
            placeholder="YYYY-MM-DD 형식으로 입력해주세요"
            value={formData.representativeBirthDate}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
              
              // YYYY-MM-DD 형식으로 자동 포맷팅
              if (value.length >= 4) {
                value = value.slice(0, 4) + '-' + value.slice(4);
              }
              if (value.length >= 7) {
                value = value.slice(0, 7) + '-' + value.slice(7, 9);
              }
              
              onInputChange('representativeBirthDate', value);
            }}
            onKeyDown={(e) => {
              // 백스페이스 키로 삭제할 때 - 앞의 숫자도 함께 삭제되도록 처리
              if (e.key === 'Backspace') {
                const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;
                const currentValue = formData.representativeBirthDate;
                
                // 커서가 - 바로 뒤에 있을 때 - 앞의 숫자도 함께 삭제
                if (cursorPosition === 5 || cursorPosition === 8) { // YYYY-|MM-DD 또는 YYYY-MM-|DD
                  e.preventDefault();
                  const newValue = currentValue.slice(0, cursorPosition - 2) + currentValue.slice(cursorPosition);
                  onInputChange('representativeBirthDate', newValue);
                  
                  // 커서 위치 조정
                  setTimeout(() => {
                    const input = e.target as HTMLInputElement;
                    input.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
                  }, 0);
                }
              }
            }}
            maxLength={10}
            className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            required
          />
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 단체 비밀번호 */}
        <FormField label="단체 비밀번호" required>
          <PasswordField
            value={formData.groupPassword}
            onChange={(value) => onInputChange('groupPassword', value)}
            placeholder="단체 비밀번호를 입력해주세요"
            className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 단체 비밀번호 확인 */}
        <FormField label="단체 비밀번호 확인" required>
          <PasswordConfirmField
            password={formData.groupPassword}
            confirmPassword={formData.confirmGroupPassword}
            onChange={(value) => onInputChange('confirmGroupPassword', value)}
            placeholder="단체 비밀번호를 다시 입력해주세요"
            className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 주소 */}
        <FormField label="주소" required>
          <AddressField
            postalCode={formData.postalCode}
            address={formData.address}
            detailedAddress={formData.detailedAddress}
            onPostalCodeChange={(value) => onInputChange('postalCode', value)}
            onAddressChange={(value) => onInputChange('address', value)}
            onDetailedAddressChange={(value) => onInputChange('detailedAddress', value)}
            onAddressSelect={onAddressSelect}
          />
        </FormField>
        <hr className="border-gray-200" />
      </div>
    </div>
  );
}
