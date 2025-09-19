// 전화번호 입력 필드 컴포넌트
import React from 'react';
import Dropdown from './Dropdown';
import { phonePrefixes } from '../types/constants';

interface PhoneFieldProps {
  phone1: string;
  phone2: string;
  phone3: string;
  onPhone1Change: (value: string) => void;
  onPhone2Change: (value: string) => void;
  onPhone3Change: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PhoneField({
  phone1,
  phone2,
  phone3,
  onPhone1Change,
  onPhone2Change,
  onPhone3Change,
  isOpen,
  onToggle
}: PhoneFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 sm:w-20">
        <Dropdown
          value={phone1}
          placeholder="010"
          options={phonePrefixes}
          isOpen={isOpen}
          onToggle={onToggle}
          onSelect={onPhone1Change}
          className="w-full"
          buttonClassName="text-center"
        />
      </div>
      
      <span className="text-gray-400 text-sm sm:text-base">-</span>
      
      <input
        type="text"
        maxLength={4}
        value={phone2}
        onChange={(e) => onPhone2Change(e.target.value)}
        className="w-16 sm:w-20 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center"
        placeholder="0000"
      />
      
      <span className="text-gray-400 text-sm sm:text-base">-</span>
      
      <input
        type="text"
        maxLength={4}
        value={phone3}
        onChange={(e) => onPhone3Change(e.target.value)}
        className="w-16 sm:w-20 px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-center"
        placeholder="0000"
      />
    </div>
  );
}
