// 비밀번호 확인 입력 필드 컴포넌트
import React from 'react';

interface PasswordConfirmFieldProps {
  password: string;
  confirmPassword: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PasswordConfirmField({ 
  password, 
  confirmPassword, 
  onChange, 
  placeholder = "비밀번호를 다시 입력해주세요.",
  className = "w-full px-3 sm:px-4 py-3 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
}: PasswordConfirmFieldProps) {
  const isMatch = password === confirmPassword;
  const hasValue = confirmPassword && confirmPassword.length > 0;

  return (
    <div className="flex-1 max-w-md">
      <input
        type="password"
        placeholder={placeholder}
        value={confirmPassword}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} ${
          hasValue
            ? isMatch
              ? 'border-green-500 focus:ring-green-500'
              : 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        }`}
        required
      />
      
      {/* 비밀번호 일치 여부 표시 */}
      {hasValue && (
        <div className="mt-2">
          {isMatch ? (
            <div className="flex items-center text-green-600 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              비밀번호가 일치합니다
            </div>
          ) : (
            <div className="flex items-center text-red-500 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              비밀번호가 일치하지 않습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
