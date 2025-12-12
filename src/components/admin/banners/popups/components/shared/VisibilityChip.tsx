export function VisibilityChip({ value }: { value: boolean }) {
  const base = 'inline-flex items-center rounded-full px-2.5 h-7 text-[12px] font-medium border';
  return value
    ? <span className={`${base} bg-[#1E5EFF] border-[#1E5EFF] text-white`}>공개</span>
    : <span className={`${base} bg-[#EF4444] border-[#EF4444] text-white`}>비공개</span>;
}

