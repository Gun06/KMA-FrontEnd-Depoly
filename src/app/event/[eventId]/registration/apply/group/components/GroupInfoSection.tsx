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
  groupNameCheckResult: 'none' | 'available' | 'unavailable' | 'error';
  groupIdCheckResult: 'none' | 'available' | 'unavailable' | 'error';
  isEditMode?: boolean;
}

export default function GroupInfoSection({
  formData,
  onInputChange,
  onAddressSelect,
  onGroupNameCheck,
  onGroupIdCheck,
  groupNameCheckResult,
  groupIdCheckResult,
  isEditMode = false
}: GroupInfoSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">단체 정보</h2>
        <hr className="border-black border-[1.5px] mt-2" />
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* 단체명 */}
        <div>
          <FormField label="단체명" required>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="단체명을 띄어쓰기 없이 입력해주세요"
                value={formData.groupName}
                onChange={(e) => onInputChange('groupName', e.target.value)}
                className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={onGroupNameCheck}
                className="w-full sm:w-auto px-4 py-3 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap flex items-center justify-center"
              >
                단체명 중복확인 →
              </button>
            </div>
          </FormField>
          {groupNameCheckResult !== 'none' && (
            <div className="mt-3 ml-0 sm:ml-44">
              {groupNameCheckResult === 'available' && (
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-green-600 text-sm">사용 가능한 단체명입니다.</span>
                </div>
              )}
              {groupNameCheckResult === 'unavailable' && (
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-red-600 text-sm">이미 사용 중인 단체명입니다. 다른 단체명을 입력해주세요.</span>
                </div>
              )}
              {groupNameCheckResult === 'error' && (
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-red-600 text-sm">단체명 중복확인 중 오류가 발생했습니다. 다시 시도해주세요.</span>
                </div>
              )}
            </div>
          )}
        </div>
        <hr className="border-gray-200" />
        
        {/* 단체 아이디 */}
        <div>
          <FormField label="단체신청용 ID" required>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="단체신청용 ID를 입력해주세요 (5-20자, 영문/숫자/특문)"
                value={formData.groupId}
                onChange={(e) => {
                  // 5-20자, 영문대소문자/숫자/특문 허용, 한글 불허
                  const value = e.target.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
                  if (value.length <= 20) {
                    onInputChange('groupId', value);
                  }
                }}
                onKeyDown={(e) => {
                  // 한글 입력 방지
                  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={onGroupIdCheck}
                className="w-full sm:w-auto px-4 py-3 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap flex items-center justify-center"
              >
                단체ID중복확인 →
              </button>
            </div>
          </FormField>
          {formData.groupId && (
            <div className="mt-2 ml-0 sm:ml-44">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${formData.groupId.length >= 5 && formData.groupId.length <= 20 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className={formData.groupId.length >= 5 && formData.groupId.length <= 20 ? 'text-green-600' : 'text-gray-500'}>
                    5~20자 입력 ({formData.groupId.length}/20)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${!/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(formData.groupId) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={!/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(formData.groupId) ? 'text-green-600' : 'text-red-600'}>
                    한글 사용 불가
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                  <span className="text-green-600">
                    영문대소문자/숫자/특수문자 사용 가능
                  </span>
                </div>
              </div>
            </div>
          )}
          {groupIdCheckResult !== 'none' && (
            <div className="mt-3 ml-0 sm:ml-44">
              {groupIdCheckResult === 'available' && (
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-green-600 text-sm">사용 가능한 단체신청용 ID입니다.</span>
                </div>
              )}
              {groupIdCheckResult === 'unavailable' && (
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-red-600 text-sm">이미 사용 중인 단체신청용 ID입니다. 다른 ID를 입력해주세요.</span>
                </div>
              )}
              {groupIdCheckResult === 'error' && (
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-red-600 text-sm">5-20자, 영문/숫자/특문만 입력 가능합니다. 한글은 사용할 수 없습니다.</span>
                </div>
              )}
            </div>
          )}
        </div>
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
