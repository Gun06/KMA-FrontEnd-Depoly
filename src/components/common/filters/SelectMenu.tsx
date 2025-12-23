import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import Portal from "@/components/common/portal"; // 대소문자 주의!

type Opt = { label: string; value: string };

type Props = {
  label: string;
  value: string;                 // ""면 버튼 텍스트는 라벨 보이게
  onChange: (v: string) => void;
  options: Opt[];
  className?: string;
  buttonTextMode?: "label" | "current";
  menuMaxHeight?: number;        // 최대 높이(넘치면 내부 스크롤)
  safeTop?: number;              // 고정 헤더 높이 등(기본 64)
  autoCloseOnScrollOut?: boolean;// 트리거가 화면 밖이면 닫기
};

export default function SelectMenu({
  label,
  value,
  onChange,
  options,
  className,
  buttonTextMode = "current",
  menuMaxHeight = 260,
  safeTop = 64,
  autoCloseOnScrollOut = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; maxH: number }>({
    left: 0, top: 0, width: 120, maxH: menuMaxHeight,
  });

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const recalc = () => {
    const el = btnRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 8;

    // 트리거가 화면에서 완전히 벗어나면 닫기
    if (autoCloseOnScrollOut && (r.bottom < safeTop || r.top > vh)) {
      setOpen(false);
      return;
    }

    // 버튼 넓이에 맞추되, 최소 넓이를 충분히 보장 (차액환불요청 등 긴 텍스트 대응)
    const width = Math.max(160, r.width);
    const left = Math.min(Math.max(8, r.left), vw - width - 8);

    // 상/하 가용 공간 계산(상단은 safeTop 고려)
    const spaceAbove = Math.max(0, r.top - safeTop - gap);
    const spaceBelow = Math.max(0, vh - r.bottom - gap);

    // 아래로 열 수 있으면 아래, 아니면 위로
    const openBelow = spaceBelow >= Math.min(menuMaxHeight, 200);
    const maxH = Math.min(menuMaxHeight, openBelow ? spaceBelow : spaceAbove);

    const top = openBelow
      ? Math.min(vh - gap, r.bottom + gap)
      : Math.max(safeTop + gap, r.top - maxH - gap);

    setPos({ left, top, width, maxH });
  };

  useLayoutEffect(() => {
    if (open) recalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, menuMaxHeight, safeTop]);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => recalc();
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };

    // capture=true로 모든 스크롤 변화에 반응
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const currentOption = options.find((o) => o.value === value);
  const currentLabel = currentOption?.label ?? "";
  // value가 빈 문자열이고 currentLabel이 "전체"인 경우, 버튼에는 label을 표시
  const buttonText = buttonTextMode === "label" 
    ? label 
    : (value === "" && currentLabel === "전체" ? label : (currentLabel || label));

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className={cn(
          "h-10 min-w-[120px] rounded-[5px] border px-3 bg-white",
          open ? "border-[#256EF4]" : "border-[#58616A]",
          "inline-flex items-center justify-between gap-2"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span className="text-[15px] leading-[26px] text-[#1E2124] whitespace-nowrap">{buttonText}</span>
        <ChevronDown className={cn("w-5 h-5 text-[#33363D] transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <Portal>
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              width: pos.width,
              maxHeight: pos.maxH,         // ⬅️ 가용 영역으로 동적 클램프
              overflowY: "auto",
            }}
            className="z-[99999] rounded-md border border-[#CDD1D5] bg-white p-2 shadow-lg"
            role="listbox"
            aria-label={label}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => e.stopPropagation()} // 클릭버블 방지
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    "w-full rounded-md px-2 py-2 text-left text-[15px] leading-[26px] text-[#1E2124]",
                    active ? "bg-[#EEF2F7]" : "hover:bg-gray-50"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </div>
  );
}
