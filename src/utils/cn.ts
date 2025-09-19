// src/utils/cn.ts
// 작은 classnames 유틸: 문자열/조건부 객체/중첩 배열 지원
type Falsy = false | null | undefined | "" | 0;
type ClassDict = Record<string, boolean | undefined | null>;
type ClassInput = string | number | Falsy | ClassDict | ClassInput[];

export function cn(...inputs: ClassInput[]): string {
  const out: string[] = [];

  const push = (v: ClassInput) => {
    if (!v) return;
    if (typeof v === "string" || typeof v === "number") {
      if (v !== "" && v !== 0) out.push(String(v));
      return;
    }
    if (Array.isArray(v)) {
      for (const i of v) push(i as ClassInput);
      return;
    }
    // object (조건부 클래스)
    for (const [k, val] of Object.entries(v as ClassDict)) {
      if (val) out.push(k);
    }
  };

  for (const i of inputs) push(i);
  return out.join(" ");
}
