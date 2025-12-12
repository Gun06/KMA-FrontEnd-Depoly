import React from 'react';

export function VisibilityChipsEditable({ 
  value, 
  onChange, 
  onClick 
}: { 
  value: boolean; 
  onChange: (v: boolean) => void; 
  onClick?: (e: React.MouseEvent) => void;
}) {
  const base = 'rounded-full px-2.5 h-7 text-[12px] font-medium border';
  const onCls = value 
    ? `${base} bg-[#1E5EFF] border-[#1E5EFF] text-white` 
    : `${base} bg-gray-100 border-gray-200 text-gray-600`;
  const offCls = !value 
    ? `${base} bg-[#EF4444] border-[#EF4444] text-white` 
    : `${base} bg-gray-100 border-gray-200 text-gray-600`;
  
  return (
    <div className="inline-flex items-center gap-1" onClick={onClick}>
      <button 
        type="button" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onChange(true); 
        }}  
        className={onCls}
      >
        공개
      </button>
      <button 
        type="button" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onChange(false); 
        }} 
        className={offCls}
      >
        비공개
      </button>
    </div>
  );
}

