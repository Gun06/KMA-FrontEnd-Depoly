// 공통 폼 필드 컴포넌트
import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  labelHint?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({ 
  label, 
  required = false,
  labelHint,
  children, 
  className = "w-full sm:w-40" 
}: FormFieldProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 ${labelHint ? 'sm:items-start' : 'sm:items-center'}`}>
      <div className={`flex flex-col gap-0.5 ${className}`}>
        <label 
          className="text-base sm:text-lg font-black text-black whitespace-nowrap" 
          style={{ fontWeight: 900 }}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {labelHint ? (
          <span className="text-xs text-gray-500 leading-snug">{labelHint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
