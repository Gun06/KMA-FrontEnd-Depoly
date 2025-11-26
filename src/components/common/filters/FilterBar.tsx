'use client';

import { useEffect, useState, type ReactNode } from "react";
import SelectMenu from "./SelectMenu";
import SearchBox from "./SearchBox";
import Button from "@/components/common/Button/Button";
import { RotateCcw } from "lucide-react";
import { Dropdown } from "@/components/common/Dropdown/Dropdown";

type Opt = { label: string; value: string };
export type FilterButtonMenuItem = { label: string; value: string };

export type FilterButtonSpec = {
  label: string;
  tone?: "primary" | "dark" | "neutral";
  iconRight?: boolean;
  iconLeft?: ReactNode;
  onClick?: () => void;
  menu?: FilterButtonMenuItem[]; // 드롭다운 메뉴 버튼일 때만 설정
};

export type FilterBarProps = {
  fields?: { label: string; options: Opt[]; menuMaxHeight?: number }[];
  searchPlaceholder?: string;
  className?: string;
  buttonTextMode?: "label" | "current";
  buttons?: FilterButtonSpec[];
  showReset?: boolean;
  initialValues?: string[]; // 필드별 초기값
  onFieldChange?: (label: string, value: string) => void;
  onSearch?: (q: string) => void;
  onActionClick?: (labelOrValue: string) => void; // 메뉴 value도 전달
  onReset?: () => void;
};

export default function FilterBar({
  fields = [],
  searchPlaceholder = "검색어를 입력해주세요.",
  className = "",
  buttonTextMode = "current",
  buttons = [],
  showReset = false,
  initialValues,
  onFieldChange,
  onSearch,
  onActionClick,
  onReset,
}: FilterBarProps) {
  const [values, setValues] = useState<string[]>(
    initialValues && initialValues.length === fields.length
      ? initialValues
      : fields.map(() => "")
  );
  const [q, setQ] = useState("");

  useEffect(() => {
    if (initialValues && initialValues.length === fields.length) {
      setValues(initialValues);
    } else {
      setValues(fields.map(() => ""));
    }
  }, [fields, initialValues]);

  const handleChange = (i: number, v: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    onFieldChange?.(fields[i].label, v);
  };

  const handleReset = () => {
    // initialValues가 있으면 사용하고, 없으면 빈 문자열로 리셋
    if (initialValues && initialValues.length === fields.length) {
      setValues(initialValues);
    } else {
      setValues(fields.map(() => ""));
    }
    setQ("");
    onReset?.();
  };

  return (
    <div className={`flex items-start gap-5 ${className}`}>
      {/* 필터 Selects */}
      {fields.map((f, i) => (
        <SelectMenu
          key={`${f.label}-${i}`}
          label={f.label}
          value={values[i]}
          onChange={(v) => handleChange(i, v)}
          options={f.options}
          buttonTextMode={buttonTextMode}
          menuMaxHeight={f.menuMaxHeight}
        />
      ))}

      {/* 검색 */}
      <SearchBox
        value={q}
        onChange={setQ}
        onEnter={(v) => onSearch?.(v)}
        placeholder={searchPlaceholder}
      />

      {/* 오른쪽 버튼들 */}
      {buttons.map((b, i) => {
        const hasMenu = Array.isArray(b.menu) && b.menu.length > 0;

        if (!hasMenu) {
          return (
            <Button
              key={`${b.label}-${i}`}
              type="button"
              tone={b.tone ?? "primary"}
              size="sm"
              widthType="pager"
              iconRight={b.iconRight}
              iconLeft={b.iconLeft}
              onClick={
                b.onClick
                  ? b.onClick
                  : () => {
                      if (b.label === "검색") onSearch?.(q);
                      else onActionClick?.(b.label);
                    }
              }
              className="shrink-0"
            >
              {b.label}
            </Button>
          );
        }

        // 공용 Dropdown 사용 (버튼 아래 중앙 정렬)
        return (
          <Dropdown
            key={`${b.label}-${i}`}
            align="center"
            trigger={
              <Button
                type="button"
                tone={b.tone ?? "primary"}
                size="sm"
                widthType="pager"
                iconRight     // “Excel >” 유지
                className="shrink-0"
              >
                {b.label}
              </Button>
            }
            options={b.menu!.map((item) => ({
              label: item.label,
              onClick: () => {
                // 에러 레벨 로그 제거 (문제 패널 증가 방지)
                onActionClick?.(item.value);
              },
            }))}
            className="shrink-0"
          />
        );
      })}

      {/* 초기화(맨 끝) */}
      {showReset && (
        <Button
          type="button"
          tone="neutral"
          size="xs"
          widthType="compact"
          iconLeft={<RotateCcw className="w-4 h-4" aria-hidden />}
          onClick={handleReset}
          className="shrink-0"
        >
          초기화
        </Button>
      )}
    </div>
  );
}
