"use client";

import { useMemo, useState } from "react";
import { PRESETS } from "@/components/common/filters/presets";
import Button from "@/components/common/Button/Button";
import TextField from "@/components/common/TextField/TextField";

type Field = { label: string; options: { label: string; value: string }[] };

export default function NoticeFilterBar({
  presetKey = "관리자 / 대회_공지사항",
  onChange,
}: {
  presetKey?: keyof typeof PRESETS;
  onChange?: (values: Record<string, string>) => void; // {sort, kind, visibility, q}
}) {
  const preset = useMemo(() => PRESETS[presetKey] as any, [presetKey]);
  const fields: Field[] = preset?.props?.fields ?? [];
  const [values, setValues] = useState<Record<string, string>>({
    sort: fields?.[0]?.options?.[0]?.value ?? "new",
  });
  const [q, setQ] = useState("");

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {fields.map((f) => (
        <div key={f.label} className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{f.label}</label>
          <select
            className="h-9 rounded border px-2"
            onChange={(e) => {
              // 라벨→키 매핑
              const key = f.label === "정렬" ? "sort" : f.label === "유형" ? "kind" : f.label === "공개여부" ? "visibility" : f.label;
              set(key, e.target.value);
            }}
          >
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      ))}

      <div className="ml-auto flex items-center gap-2">
        <TextField
          placeholder={preset?.props?.searchPlaceholder ?? "검색"}
          value={q}
          onChange={(e: any) => setQ(e.target.value)}
        />
        <Button
          tone="dark"
          onClick={() => onChange?.({ ...values, q })}
        >
          {preset?.props?.buttons?.[0]?.label ?? "검색"}
        </Button>
        {preset?.props?.showReset }
      </div>
    </div>
  );
}
