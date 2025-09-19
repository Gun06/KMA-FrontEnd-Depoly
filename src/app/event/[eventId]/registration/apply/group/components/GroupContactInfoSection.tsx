// 단체 연락처 정보 섹션 컴포넌트
import React from 'react';
import FormField from '../../shared/components/FormField';
import PhoneField from '../../shared/components/PhoneField';
import EmailField from '../../shared/components/EmailField';
import { GroupFormData, OpenDropdown } from '../../shared/types/group';

interface GroupContactInfoSectionProps {
  formData: GroupFormData;
  openDropdown: OpenDropdown;
  onInputChange: (field: keyof GroupFormData, value: string) => void;
  onDropdownToggle: (dropdown: OpenDropdown) => void;
  refs: {
    phone1Ref: React.RefObject<HTMLDivElement>;
    emailDomainRef: React.RefObject<HTMLDivElement>;
  };
}

export default function GroupContactInfoSection({
  formData,
  openDropdown,
  onInputChange,
  onDropdownToggle,
  refs
}: GroupContactInfoSectionProps) {
  return (
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
        <FormField label="이메일" required>
          <EmailField
            email1={formData.email1}
            emailDomain={formData.emailDomain}
            onEmail1Change={(value) => onInputChange('email1', value)}
            onEmailDomainChange={(value) => onInputChange('emailDomain', value)}
            isOpen={openDropdown === 'emailDomain'}
            onToggle={() => onDropdownToggle(openDropdown === 'emailDomain' ? null : 'emailDomain')}
          />
        </FormField>
        <hr className="border-gray-200" />
      </div>
    </div>
  );
}
