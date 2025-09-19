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

  return (
    <div className="flex-1 max-w-md">
      <input
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
          <div className={`flex items-center text-xs ${value.length >= 10 && value.length <= 64 ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${value.length >= 10 && value.length <= 64 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            길이: 10~64자 ({value.length}/64)
          </div>
          <div className={`flex items-center text-xs ${/[a-z]/.test(value) ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(value) ? 'bg-green-500' : 'bg-red-500'}`}></span>
            소문자 포함
          </div>
          <div className={`flex items-center text-xs ${/\d/.test(value) ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(value) ? 'bg-green-500' : 'bg-red-500'}`}></span>
            숫자 포함
          </div>
          <div className={`flex items-center text-xs ${/[~!@#$%^&*()_+\-={}\[\]\\|:;"'<>,.?/]/.test(value) ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${/[~!@#$%^&*()_+\-={}\[\]\\|:;"'<>,.?/]/.test(value) ? 'bg-green-500' : 'bg-red-500'}`}></span>
            특수문자 포함
          </div>
        </div>
      )}
      
      {/* 비밀번호 규칙 안내 */}
      <p className="text-xs text-gray-500 mt-2">
        비밀번호는 10~64자이며 소문자, 숫자, 특수문자를 각각 1자 이상 포함해야 합니다.
      </p>
    </div>
  );
}
