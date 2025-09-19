// 공통 폼 필드 컴포넌트
import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({ 
  label, 
  required = false, 
  children, 
  className = "w-full sm:w-40" 
}: FormFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <label 
        className={`${className} text-base sm:text-lg font-black text-black whitespace-nowrap`} 
        style={{ fontWeight: 900 }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
