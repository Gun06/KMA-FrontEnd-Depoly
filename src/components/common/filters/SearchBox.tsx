type Props = {
  value?: string;
  onChange?: (v: string) => void;
  onEnter?: (v: string) => void;          // ✅ Enter로 검색 이벤트 보고
  placeholder?: string;
  width?: number; // 기본 368px (flexGrow일 때 무시)
  /** 부모가 flex row일 때 남는 가로를 채움 */
  flexGrow?: boolean;
  wrapperClassName?: string;
};

export default function SearchBox({
  value,
  onChange,
  onEnter,
  placeholder = "검색어를 입력해주세요.",
  width = 368,
  flexGrow = false,
  wrapperClassName = '',
}: Props) {
  return (
    <div
      className={`h-10 rounded-[5px] border border-[#898989] px-[15px] py-3 flex items-center justify-between ${
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
        className="text-[15px] font-semibold tracking-[-0.08px] outline-none w-full pr-2"
      />
    </div>
  );
}
