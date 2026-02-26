// 개인정보 섹션 컴포넌트
import React from 'react';
import FormField from '../../shared/components/FormField';
import PasswordField from '../../shared/components/PasswordField';
import PasswordConfirmField from '../../shared/components/PasswordConfirmField';
import AddressField from '../../shared/components/AddressField';
import Dropdown from '../../shared/components/Dropdown';
import { IndividualFormData, IdCheckResult, OpenDropdown } from '../../shared/types/individual';
import { genderOptions, generateYearOptions, generateMonthOptions, generateDayOptions } from '../../shared/types/constants';

interface PersonalInfoSectionProps {
  formData: IndividualFormData;
  idCheckResult?: IdCheckResult;
  openDropdown: OpenDropdown;
  onInputChange: (field: keyof IndividualFormData, value: string) => void;
  onIdCheck?: () => void;
  onAddressSelect: (postalCode: string, address: string) => void;
  onDropdownToggle: (dropdown: OpenDropdown) => void;
  onOpenIdPasswordModal: () => void;
  onLoadInfo?: () => void;
  isLoadingInfo?: boolean;
  refs: {
    yearRef: React.RefObject<HTMLDivElement>;
    monthRef: React.RefObject<HTMLDivElement>;
    dayRef: React.RefObject<HTMLDivElement>;
  };
}

export default function PersonalInfoSection({
  formData,
  idCheckResult,
  openDropdown,
  onInputChange,
  onIdCheck,
  onAddressSelect,
  onDropdownToggle,
  onOpenIdPasswordModal,
  onLoadInfo,
  isLoadingInfo = false,
  refs
}: PersonalInfoSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-black text-left">개인정보</h2>
        <hr className="border-black border-[1.5px] mt-2" />
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* 전마협 아이디 */}
        <FormField label="전마협 아이디">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="전마협 아이디는 정보 불러오기로만 입력됩니다"
              value={formData.jeonmahyupId}
              readOnly
              className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-gray-50 cursor-not-allowed"
            />
            <button
              type="button"
              onClick={onLoadInfo || onOpenIdPasswordModal}
              disabled={isLoadingInfo}
              className={`w-full sm:w-auto px-4 py-3 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoadingInfo ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoadingInfo ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  불러오는 중...
                </span>
              ) : (
                '정보 불러오기 →'
              )}
            </button>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 이름 */}
        <FormField label="이름" required>
          <input
            type="text"
            placeholder="띄어쓰기 없이 입력해주세요."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            name="no-autofill-name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            required
          />
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 생년월일 */}
        <FormField label="생년월일" required>
          <div className="flex items-center space-x-1">
            {/* 년도 선택 */}
            <div className="relative" ref={refs.yearRef}>
              <Dropdown
                value={formData.birthYear}
                placeholder="년도"
                options={generateYearOptions()}
                isOpen={openDropdown === 'year'}
                onToggle={() => onDropdownToggle(openDropdown === 'year' ? null : 'year')}
                onSelect={(value) => onInputChange('birthYear', value)}
                className="w-20 sm:w-24"
                buttonClassName="text-center"
              />
            </div>
            
            <span className="text-gray-400 text-sm sm:text-base mx-1">.</span>
            
            {/* 월 선택 */}
            <div className="relative" ref={refs.monthRef}>
              <Dropdown
                value={formData.birthMonth}
                placeholder="월"
                options={generateMonthOptions()}
                isOpen={openDropdown === 'month'}
                onToggle={() => onDropdownToggle(openDropdown === 'month' ? null : 'month')}
                onSelect={(value) => onInputChange('birthMonth', value)}
                className="w-16 sm:w-20"
                buttonClassName="text-center"
              />
            </div>
            
            <span className="text-gray-400 text-sm sm:text-base mx-1">.</span>
            
            {/* 일 선택 */}
            <div className="relative" ref={refs.dayRef}>
              <Dropdown
                value={formData.birthDay}
                placeholder="일"
                options={generateDayOptions()}
                isOpen={openDropdown === 'day'}
                onToggle={() => onDropdownToggle(openDropdown === 'day' ? null : 'day')}
                onSelect={(value) => onInputChange('birthDay', value)}
                className="w-16 sm:w-20"
                buttonClassName="text-center"
              />
            </div>
          </div>
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 비밀번호 */}
        <FormField label="비밀번호" required>
          <PasswordField
            value={formData.password}
            onChange={(value) => onInputChange('password', value)}
          />
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 비밀번호 확인 */}
        <FormField label="비밀번호 확인" required>
          <PasswordConfirmField
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onChange={(value) => onInputChange('confirmPassword', value)}
          />
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 성별 */}
        <FormField label="성별" required>
          <div className="flex items-center space-x-4">
            {genderOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={(e) => onInputChange('gender', e.target.value as 'male' | 'female')}
                  className="mr-2"
                />
                <span className="text-sm sm:text-base">{option.label}</span>
              </label>
            ))}
          </div>
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
