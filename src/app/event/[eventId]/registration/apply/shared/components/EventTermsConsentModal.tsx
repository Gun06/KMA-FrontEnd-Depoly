"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import type { PublicEventTerm } from "../api/terms";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  terms: PublicEventTerm[];
  allAgreeLabel: string;
  checkedTermIds: Record<string, boolean>;
  getTermKey: (term: PublicEventTerm, idx: number) => string;
  onToggleAll: (checked: boolean) => void;
  onToggleTerm: (term: PublicEventTerm, idx: number, checked: boolean) => void;
  hasRequiredTerms: boolean;
  isRequiredTermsChecked: boolean;
  onConfirm: () => void;
  onSkip: () => void;
};

export default function EventTermsConsentModal({
  isOpen,
  onClose,
  terms,
  allAgreeLabel,
  checkedTermIds,
  getTermKey,
  onToggleAll,
  onToggleTerm,
  hasRequiredTerms,
  isRequiredTermsChecked,
  onConfirm,
  onSkip,
}: Props) {
  const [detailTerm, setDetailTerm] = useState<PublicEventTerm | null>(null);

  const allChecked = useMemo(
    () => terms.length > 0 && terms.every((t, i) => checkedTermIds[getTermKey(t, i)] === true),
    [terms, checkedTermIds, getTermKey]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[121] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:w-[calc(100%-2rem)] sm:max-w-2xl h-auto max-h-[70vh] sm:max-h-none bg-white rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            {detailTerm ? (
              <button
                type="button"
                onClick={() => setDetailTerm(null)}
                className="h-10 w-10 inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : null}
            <h3 className="text-[16px] sm:text-[18px] font-bold text-gray-900">
              {detailTerm ? detailTerm.termsLabel || "약관 상세" : "대회 약관 동의"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!detailTerm ? (
          <>
            <div className="px-4 sm:px-5 py-4 max-h-[56vh] sm:max-h-[70vh] overflow-y-auto bg-white space-y-3">
              <label className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-3 sm:py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  className="h-5 w-5 sm:h-4 sm:w-4"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  {allAgreeLabel || "약관 내용을 이해하였으며, 약관에 동의합니다."}
                </span>
              </label>
              <div className="space-y-2">
                {terms.map((term, idx) => (
                  <div
                    key={`modal-${term.id ?? `api-term-${idx}`}`}
                    className="bg-white rounded-lg px-2 sm:px-3 py-2 ml-3 sm:ml-5"
                  >
                    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                      <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedTermIds[getTermKey(term, idx)] ?? false}
                          onChange={(e) => onToggleTerm(term, idx, e.target.checked)}
                          className="h-5 w-5 sm:h-4 sm:w-4 shrink-0"
                        />
                        {term.required ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-semibold shrink-0">
                            필수
                          </span>
                        ) : null}
                        <p className="text-[12px] sm:text-[13px] font-medium text-gray-800 line-clamp-2 sm:line-clamp-1">
                          {term.termsLabel || `약관 ${idx + 1}`}
                        </p>
                      </label>
                      {term.content ? (
                        <button
                          type="button"
                          onClick={() => setDetailTerm(term)}
                          className="h-8 px-3 text-[11px] font-medium rounded text-neutral-600 hover:bg-gray-100 transition-colors shrink-0"
                        >
                          보기
                        </button>
                      ) : (
                        <span />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white px-4 sm:px-5 py-3 sm:py-4 border-t border-neutral-200 flex justify-end">
              {!hasRequiredTerms ? (
                <button
                  type="button"
                  onClick={onSkip}
                  className="h-10 px-4 mr-2 text-[13px] font-medium rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                >
                  동의 없이 신청하기
                </button>
              ) : null}
              <button
                type="button"
                onClick={onConfirm}
                disabled={hasRequiredTerms && !isRequiredTermsChecked}
                className="h-10 px-4 text-[13px] font-semibold rounded bg-black text-white disabled:bg-gray-300 disabled:text-gray-500"
              >
                {hasRequiredTerms ? "필수 동의 후 계속" : "동의하고 계속"}
              </button>
            </div>
          </>
        ) : (
          <div className="px-4 sm:px-5 py-4 max-h-[64vh] sm:max-h-[70vh] overflow-y-auto bg-white">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="space-y-2 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {detailTerm.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
