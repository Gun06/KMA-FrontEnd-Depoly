type Props = {
  value?: string;
  onChange?: (v: string) => void;
  onEnter?: (v: string) => void;          // ✅ Enter로 검색 이벤트 보고
  placeholder?: string;
  width?: number; // 기본 368px (flexGrow일 때 무시)
  /** 부모가 flex row일 때 남는 가로를 채움 */
  flexGrow?: boolean;
  wrapperClassName?: string;
  /** 관리자 목록 툴바: h-9, 13px */
  dense?: boolean;
};

export default function SearchBox({
  value,
  onChange,
  onEnter,
  placeholder = "검색어를 입력해주세요.",
  width = 368,
  flexGrow = false,
  wrapperClassName = '',
  dense = false,
}: Props) {
  return (
    <div
      className={`${dense ? 'h-9 px-3' : 'h-10 px-[15px] py-3'} rounded-[5px] border border-[#898989] flex items-center justify-between ${
        flexGrow ? 'min-w-0 flex-1' : ''
      } ${wrapperClassName}`.trim()}
      style={flexGrow ? undefined : { width }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.(value ?? "");
        }}
        placeholder={placeholder}
        className={`${dense ? 'text-[13px]' : 'text-[15px] font-semibold tracking-[-0.08px]'} outline-none w-full pr-2`}
      />
    </div>
  );
}
