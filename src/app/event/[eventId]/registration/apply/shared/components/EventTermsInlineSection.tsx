"use client";

import { useMemo, useState } from "react";
import { isEffectivelyRequired, type PublicEventTerm } from "../api/terms";

export function getEventTermKey(term: PublicEventTerm, idx: number) {
  return term.id ?? `idx-${idx}`;
}

type Props = {
  terms: PublicEventTerm[];
  allAgreeLabel: string;
  checkedTermIds: Record<string, boolean>;
  onToggleAll: (checked: boolean) => void;
  onToggleTerm: (term: PublicEventTerm, idx: number, checked: boolean) => void;
};

export default function EventTermsInlineSection({
  terms,
  allAgreeLabel,
  checkedTermIds,
  onToggleAll,
  onToggleTerm,
}: Props) {
  const [openDetailKey, setOpenDetailKey] = useState<string | null>(null);

  const allChecked = useMemo(
    () =>
      terms.length > 0 &&
      terms.every((t, i) => checkedTermIds[getEventTermKey(t, i)] === true),
    [terms, checkedTermIds]
  );

  if (terms.length === 0) return null;

  const masterLabel =
    allAgreeLabel.trim() ||
    "[전체동의] 아래 약관 항목에 모두 동의합니다.";

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-200 px-4 sm:px-5 py-3 sm:py-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          대회 약관 동의
        </h3>
      </div>

      <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-3 bg-white">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-neutral-50 px-3 py-3 sm:py-3.5">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => onToggleAll(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm sm:text-[15px] leading-relaxed text-gray-800">
            {masterLabel}
          </span>
        </label>

        <div className="mt-1 space-y-0.5 pl-3 sm:pl-5 ml-2.5 sm:ml-4">
          {terms.map((term, idx) => {
            const key = getEventTermKey(term, idx);
            const checked = checkedTermIds[key] ?? false;
            const isOpen = openDetailKey === key;
            const mustAgree = isEffectivelyRequired(term);

            return (
              <div key={key} className="rounded-lg">
                <div className="flex items-start gap-2 py-2.5 pr-0 sm:pr-1">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        onToggleTerm(term, idx, e.target.checked)
                      }
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {mustAgree ? (
                      <span className="mt-0.5 shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                        필수
                      </span>
                    ) : (
                      <span className="mt-0.5 shrink-0 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                        선택
                      </span>
                    )}
                    <span className="min-w-0 flex-1 text-[13px] sm:text-sm font-medium leading-snug text-gray-800">
                      {term.termsLabel || `약관 ${idx + 1}`}
                    </span>
                  </label>
                  {term.content ? (
                    <button
                      type="button"
                      onClick={() => setOpenDetailKey(isOpen ? null : key)}
                      className="mt-0.5 h-8 shrink-0 rounded px-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 sm:px-3"
                    >
                      보기
                    </button>
                  ) : null}
                </div>
                {isOpen && term.content ? (
                  <div className="mb-2 mt-0.5 rounded-lg bg-neutral-100 p-3 sm:p-4">
                    <div className="max-h-[min(50vh,360px)] overflow-y-auto whitespace-pre-wrap text-[13px] sm:text-sm leading-relaxed text-gray-700">
                      {term.content}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
