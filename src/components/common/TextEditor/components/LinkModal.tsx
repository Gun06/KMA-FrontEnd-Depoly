'use client';

import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState } from 'react';
import { Link2, X } from 'lucide-react';

export type LinkModalSubmitPayload = {
  href: string;
  underline: boolean;
};

function normalizeLinkUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^\/\S+$/.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}([\/?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}

type LinkModalProps = {
  isOpen: boolean;
  initialUrl?: string;
  initialUnderline?: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onSubmit: (payload: LinkModalSubmitPayload) => void;
  onRemove?: () => void;
};

export default function LinkModal({
  isOpen,
  initialUrl = '',
  initialUnderline = true,
  isEditing = false,
  onClose,
  onSubmit,
  onRemove,
}: LinkModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [underline, setUnderline] = useState(initialUnderline);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    setUrl(initialUrl);
    setUnderline(initialUnderline);
    setError('');
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(t);
  }, [isOpen, initialUrl, initialUnderline]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeLinkUrl(url);
    if (!normalized) {
      setError(
        url.trim()
          ? '올바른 URL을 입력해 주세요. (예: https://example.com)'
          : 'URL을 입력해 주세요.'
      );
      return;
    }
    onSubmit({ href: normalized, underline });
  };

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
              <Link2 className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id={titleId} className="text-base font-semibold text-gray-900">
              {isEditing ? '링크 수정' : '링크 추가'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label htmlFor="kma-link-url" className="text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              ref={inputRef}
              id="kma-link-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoComplete="off"
            />
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 select-none">
            <input
              type="checkbox"
              checked={underline}
              onChange={(e) => setUnderline(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">밑줄 표시</span>
          </label>

          <div className="flex items-center justify-between gap-3 pt-1">
            {isEditing && onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                링크 제거
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
