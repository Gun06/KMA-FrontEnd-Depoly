// 연락처 정보 섹션 컴포넌트
import React from 'react';
import FormField from '../../shared/components/FormField';
import PhoneField from '../../shared/components/PhoneField';
import EmailField from '../../shared/components/EmailField';
import { IndividualFormData, OpenDropdown } from '../../shared/types/individual';

interface ContactInfoSectionProps {
  formData: IndividualFormData;
  openDropdown: OpenDropdown;
  onInputChange: (field: keyof IndividualFormData, value: string) => void;
  onDropdownToggle: (dropdown: OpenDropdown) => void;
  guardianDisabled?: boolean;
  showGuardianSection?: boolean;
  guardianHeaderRight?: React.ReactNode;
  hideGuardianFields?: boolean;
  guardianHelpTextOff?: string;
  guardianHelpTextOn?: string;
  refs: {
    phone1Ref: React.RefObject<HTMLDivElement>;
    guardianPhone1Ref: React.RefObject<HTMLDivElement>;
    emailDomainRef: React.RefObject<HTMLDivElement>;
  };
}

export default function ContactInfoSection({
  formData,
  openDropdown,
  onInputChange,
  onDropdownToggle,
  guardianDisabled = false,
  showGuardianSection = true,
  guardianHeaderRight,
  hideGuardianFields = false,
  guardianHelpTextOff = '선택사항이지만, 응급 상황에 대비해 가능하면 입력해 주세요.',
  guardianHelpTextOn = '단체장 정보로 위임 중입니다. 직접 입력하려면 위임 체크를 해제해 주세요.',
  refs
}: ContactInfoSectionProps) {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 연락처 정보 */}
      <div className="space-y-6 sm:space-y-8">
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-black text-left">연락처 정보</h2>
          <hr className="border-black border-[1.5px] mt-2" />
        </div>
        
        <div className="space-y-4 sm:space-y-6">
        {/* 휴대폰번호 */}
        <FormField label="휴대폰번호" required>
          <PhoneField
            phone1={formData.phone1}
            phone2={formData.phone2}
            phone3={formData.phone3}
            onPhone1Change={(value) => onInputChange('phone1', value)}
            onPhone2Change={(value) => onInputChange('phone2', value)}
            onPhone3Change={(value) => onInputChange('phone3', value)}
            isOpen={openDropdown === 'phone1'}
            onToggle={() => onDropdownToggle(openDropdown === 'phone1' ? null : 'phone1')}
          />
        </FormField>
        <hr className="border-gray-200" />
        
        {/* 이메일 */}
        <FormField label="이메일 (선택)">
          <EmailField
            email1={formData.email1}
            emailDomain={formData.emailDomain}
            onEmail1Change={(value) => onInputChange('email1', value)}
            onEmailDomainChange={(value) => onInputChange('emailDomain', value)}
            isOpen={openDropdown === 'emailDomain'}
            onToggle={() => onDropdownToggle(openDropdown === 'emailDomain' ? null : 'emailDomain')}
          />
        </FormField>
        </div>
      </div>

      {/* 보호자 정보 (선택) */}
      {showGuardianSection && (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-black text-left">보호자 정보 (선택)</h2>
            {guardianHeaderRight}
          </div>
          <hr className="border-black border-[1.5px] mt-2" />
        </div>

        {/* 안내문 */}
        <p className="text-sm text-blue-700 leading-relaxed">
          {guardianDisabled ? guardianHelpTextOn : guardianHelpTextOff}
        </p>

        {!hideGuardianFields && (
        <div className={guardianDisabled ? 'opacity-60 pointer-events-none' : ''}>
          <FormField label="보호자 연락처">
            <div ref={refs.guardianPhone1Ref}>
              <PhoneField
                phone1={formData.guardianPhone1}
                phone2={formData.guardianPhone2}
                phone3={formData.guardianPhone3}
                onPhone1Change={(value) => onInputChange('guardianPhone1', value)}
                onPhone2Change={(value) => onInputChange('guardianPhone2', value)}
                onPhone3Change={(value) => onInputChange('guardianPhone3', value)}
                isOpen={openDropdown === 'guardianPhone1'}
                onToggle={() => onDropdownToggle(openDropdown === 'guardianPhone1' ? null : 'guardianPhone1')}
              />
            </div>
          </FormField>
          <div className="h-4" />

          <FormField label="본인과의 관계">
            <input
              type="text"
              placeholder="가족, 친구, 지인, 기타"
              value={formData.guardianRelationship}
              onChange={(e) => onInputChange('guardianRelationship', e.target.value)}
              className="w-full sm:w-96 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </FormField>
        </div>
        )}
      </div>
      )}
    </div>
  );
}
