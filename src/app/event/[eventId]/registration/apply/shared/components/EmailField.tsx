// 이메일 입력 필드 컴포넌트
import React from 'react';
import Dropdown from './Dropdown';
import { emailDomains } from '../types/constants';

interface EmailFieldProps {
  email1: string;
  emailDomain: string;
  onEmail1Change: (value: string) => void;
  onEmailDomainChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function EmailField({
  email1,
  emailDomain,
  onEmail1Change,
  onEmailDomainChange,
  isOpen,
  onToggle
}: EmailFieldProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2 min-w-0">
      <input
        type="text"
        placeholder="이메일"
        value={email1}
        onChange={(e) => onEmail1Change(e.target.value)}
        className="w-20 sm:w-32 md:w-48 px-2 sm:px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm md:text-base"
      />
      
      <span className="text-gray-400 text-xs sm:text-sm md:text-base">@</span>
      
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <input
          type="text"
          placeholder="도메인"
          value={emailDomain}
          onChange={(e) => onEmailDomainChange(e.target.value)}
          className="w-20 sm:w-24 md:w-40 px-2 sm:px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm md:text-base"
        />
        
        <div className="w-20 sm:w-24 md:w-40">
          <Dropdown
            value={emailDomain}
            placeholder="선택"
            options={emailDomains}
            isOpen={isOpen}
            onToggle={onToggle}
            onSelect={onEmailDomainChange}
            className="w-full"
            buttonClassName="text-xs sm:text-sm md:text-base"
            dropdownClassName="w-32 sm:w-40"
          />
        </div>
      </div>
    </div>
  );
}
