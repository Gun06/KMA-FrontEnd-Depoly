// 비밀번호 입력 필드 컴포넌트
import React from 'react';
import { isPasswordValid } from '../utils/validation';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PasswordField({ 
  value, 
  onChange, 
  placeholder = "비밀번호를 입력해주세요.",
  className = "w-full px-3 sm:px-4 py-3 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
}: PasswordFieldProps) {
  const isValid = isPasswordValid(value);
  const hasValue = value && value.length > 0;

  const hasNoSpace = !/\s/.test(value || '');
  const lengthOk = (value || '').length >= 6;

  return (
    <div className="flex-1 max-w-md">
      <input
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        name="no-autofill-password"
        className={`${className} ${
          hasValue
            ? isValid
              ? 'border-green-500 focus:ring-green-500'
              : 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        }`}
        required
      />
      
      {/* 비밀번호 유효성 검사 안내 */}
      {value && (
        <div className="mt-2 space-y-1">
          <div className={`flex items-center text-xs ${lengthOk ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${lengthOk ? 'bg-green-500' : 'bg-red-500'}`}></span>
            길이: 최소 6자리 ({value.length}자)
          </div>
          <div className={`flex items-center text-xs ${hasNoSpace ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${hasNoSpace ? 'bg-green-500' : 'bg-red-500'}`}></span>
            공백 없음
          </div>
        </div>
      )}
      
      {/* 비밀번호 규칙 안내 */}
      <p className="text-xs text-gray-500 mt-2">
        비밀번호는 최소 6자리, 공백 없이 입력해주세요.
      </p>
    </div>
  );
}
