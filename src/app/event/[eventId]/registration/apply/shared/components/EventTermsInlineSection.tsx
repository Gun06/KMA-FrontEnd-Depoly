"use client";

import { useMemo, useState } from "react";
import { isEffectivelyRequired, type PublicEventTerm } from "../api/terms";

export function getEventTermKey(term: PublicEventTerm, idx: number) {
  return term.id ?? `idx-${idx}`;
}

function normalizeTermLabel(label: string) {
  return label.replace(/\s*\((필수|선택)\)\s*$/g, "").trim();
}

type Props = {
  terms: PublicEventTerm[];
  allAgreeLabel: string;
  checkedTermIds: Record<string, boolean>;
  onToggleAll: (checked: boolean) => void;
  onToggleTerm: (term: PublicEventTerm, idx: number, checked: boolean) => void;
  showMasterCheckbox?: boolean;
  showTermItems?: boolean;
};

export default function EventTermsInlineSection({
  terms,
  allAgreeLabel,
  checkedTermIds,
  onToggleAll,
  onToggleTerm,
  showMasterCheckbox = true,
  showTermItems = true,
}: Props) {
  const [openDetailKeys, setOpenDetailKeys] = useState<Record<string, boolean>>(
    {}
  );

  const allChecked = useMemo(
    () =>
      terms.length > 0 &&
      terms.every((t, i) => checkedTermIds[getEventTermKey(t, i)] === true),
    [terms, checkedTermIds]
  );

  if (terms.length === 0) return null;

  const masterLabel =
    allAgreeLabel.trim() ||
    "[전체동의] 아래 모든 약관 및 안내 항목에 모두 동의합니다.";

  return (
    <div className="mt-3">
      <div className="space-y-2.5">
        {showMasterCheckbox ? (
          <label className="mb-3 flex cursor-pointer items-center gap-2.5 px-0 py-1">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => onToggleAll(e.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-base sm:text-[17px] font-bold leading-relaxed text-gray-900">
              {masterLabel}
            </span>
          </label>
        ) : null}

        <div className={showTermItems ? "space-y-1" : "hidden"}>
          {terms.map((term, idx) => {
            const key = getEventTermKey(term, idx);
            const checked = checkedTermIds[key] ?? false;
            const isOpen = openDetailKeys[key] === true;
            const mustAgree = isEffectivelyRequired(term);

            return (
              <div key={key} className="rounded-md">
                <div className="flex items-start gap-2 py-2">
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
                    <span
                      className="min-w-0 flex-1 text-[13px] sm:text-sm leading-snug text-gray-800"
                      style={{ fontWeight: 400 }}
                    >
                      {normalizeTermLabel(term.termsLabel || `약관 ${idx + 1}`)}
                    </span>
                  </label>
                  {term.content ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDetailKeys((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className="mt-0.5 h-8 shrink-0 rounded px-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 sm:px-2.5"
                    >
                      보기
                    </button>
                  ) : null}
                </div>
                {isOpen && term.content ? (
                  <div className="mb-2 mt-0.5 rounded-lg bg-gray-100 p-4">
                    <div
                      className="max-h-[600px] overflow-y-auto whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-gray-700"
                      style={{
                        fontWeight: 400,
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
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
