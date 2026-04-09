'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Plus, Eye, EyeOff } from 'lucide-react';
import {
  CashReceiptInfo,
  CashReceiptPreset,
  CashReceiptIdentifierType,
  CASH_RECEIPT_PRESETS,
  CASH_RECEIPT_IDENTIFIER_TYPE_LABEL,
  CASH_RECEIPT_PURPOSE_LABEL,
  CASH_RECEIPT_REQUESTER_TYPE_LABEL,
  CASH_RECEIPT_STATUS_LABEL,
  CASH_RECEIPT_STATUS_COLOR,
  validateCashReceiptValue,
} from '../types/cashReceipt';
import { fetchCashReceipt, submitCashReceipt } from '../api/cashReceipt';

interface CashReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  targetId: string;
  targetType: 'registration' | 'organization';
  initialMode?: 'request' | 'view';
}

export default function CashReceiptModal({
  isOpen,
  onClose,
  eventId,
  targetId,
  targetType,
  initialMode = 'request',
}: CashReceiptModalProps) {
  const [mode, setMode] = useState<'request' | 'view'>(initialMode);
  const [receipts, setReceipts] = useState<CashReceiptInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [_isLoading, _setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [preset, setPreset] = useState<CashReceiptPreset>('individual_income');
  const [identifierType, setIdentifierType] = useState<CashReceiptIdentifierType>('PHONE_NUMBER');
  const [value, setValue] = useState('');
  const [memo, setMemo] = useState('');
  const [password, setPassword] = useState('');
  const [valueError, setValueError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loadReceipts = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchCashReceipt(eventId, targetId, targetType);
      setReceipts(data.cashReceiptInfo || []);
      if (data.isCashReceiptExist && data.cashReceiptInfo?.length > 0) {
        setMode('view');
        setCurrentPage(0);
      }
    } catch {
      // 조회 실패 시 무시 (신청 폼은 계속 표시)
    }
  }, [eventId, targetId, targetType]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
      resetForm();
      loadReceipts();
    }
  }, [isOpen, initialMode, loadReceipts]);

  const resetForm = () => {
    setPreset('individual_income');
    setIdentifierType('PHONE_NUMBER');
    setValue('');
    setMemo('');
    setPassword('');
    setValueError(null);
  };

  const handlePresetChange = (newPreset: CashReceiptPreset) => {
    setPreset(newPreset);
    const presetConfig = CASH_RECEIPT_PRESETS[newPreset];
    setIdentifierType(presetConfig.identifierTypes[0]);
    setValue('');
    setValueError(null);
  };

  const handleValueChange = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '');
    setValue(digitsOnly);
    if (digitsOnly) {
      setValueError(validateCashReceiptValue(identifierType, digitsOnly));
    } else {
      setValueError(null);
    }
  };

  const handleSubmit = async () => {
    if (!value) {
      setValueError('값을 입력해주세요.');
      return;
    }
    const validationError = validateCashReceiptValue(identifierType, value);
    if (validationError) {
      setValueError(validationError);
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const presetConfig = CASH_RECEIPT_PRESETS[preset];

    try {
      await submitCashReceipt(eventId, targetId, targetType, {
        purpose: presetConfig.purpose,
        requesterType: presetConfig.requesterType,
        type: identifierType,
        value,
        memo: memo || undefined,
        rawPassword: password,
      });
      setSuccessMessage('현금영수증 신청이 완료되었습니다.');
      resetForm();
      await loadReceipts();
      setMode('view');
      if (receipts.length > 0) {
        setCurrentPage(receipts.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const currentReceipt = receipts[currentPage];
  const currentStatus = normalizeCashReceiptStatus(currentReceipt?.status);
  const presetConfig = CASH_RECEIPT_PRESETS[preset];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col" style={{ maxWidth: '448px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            {mode === 'request' ? '현금영수증 신청' : '현금영수증 내역'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {successMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              {successMessage}
            </div>
          )}

          {mode === 'view' && receipts.length > 0 ? (
            <>
              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 mb-5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-600 tabular-nums">
                  {currentPage + 1} / {receipts.length}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(receipts.length - 1, p + 1))}
                  disabled={currentPage === receipts.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {currentReceipt && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">상태</span>
                    <span className={`font-semibold ${currentStatus ? CASH_RECEIPT_STATUS_COLOR[currentStatus] : 'text-gray-800'}`}>
                      {currentStatus ? CASH_RECEIPT_STATUS_LABEL[currentStatus] : currentReceipt.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">발급 목적</span>
                    <span className="text-gray-800">
                      {CASH_RECEIPT_PURPOSE_LABEL[currentReceipt.purpose] || currentReceipt.purpose}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">신청자 구분</span>
                    <span className="text-gray-800">
                      {CASH_RECEIPT_REQUESTER_TYPE_LABEL[currentReceipt.requesterType] || currentReceipt.requesterType}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">식별값 유형</span>
                    <span className="text-gray-800">
                      {CASH_RECEIPT_IDENTIFIER_TYPE_LABEL[currentReceipt.type] || currentReceipt.type}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">식별값</span>
                    <span className="text-gray-800 font-mono">{currentReceipt.value}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">신청일시</span>
                    <span className="text-gray-800">{formatDateTime(currentReceipt.requestedTime)}</span>
                  </div>
                  {currentReceipt.memo && (
                    <div className="py-2.5 border-b border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">메모</span>
                      <span className="text-gray-800 whitespace-pre-line">{currentReceipt.memo}</span>
                    </div>
                  )}
                  {currentReceipt.adminAnswer ? (
                    <div className="py-2.5">
                      <span className="text-gray-500 font-medium block mb-1">관리자 답변</span>
                      <span className="text-gray-800 whitespace-pre-line">{currentReceipt.adminAnswer}</span>
                      {currentReceipt.completedTime && (
                        <p className="mt-1.5 text-xs text-gray-400">{formatDateTime(currentReceipt.completedTime)} 처리</p>
                      )}
                    </div>
                  ) : currentReceipt.completedTime ? (
                    <div className="py-2.5">
                      <p className="text-xs text-gray-400">{formatDateTime(currentReceipt.completedTime)} 처리</p>
                    </div>
                  ) : null}
                </div>
              )}

            </>
          ) : mode === 'request' ? (
            <>
              {receipts.length > 0 && (
                <button
                  onClick={() => {
                    setMode('view');
                    setError(null);
                  }}
                  className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  신청 내역 보기
                </button>
              )}

              <div className="space-y-4">
                {/* Preset tab */}
                <div className="relative border-b border-gray-200">
                  <div className="flex">
                    {(Object.entries(CASH_RECEIPT_PRESETS) as [CashReceiptPreset, typeof CASH_RECEIPT_PRESETS[CashReceiptPreset]][]).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePresetChange(key)}
                        className={`flex-1 pb-2.5 text-sm font-medium text-center transition-colors ${
                          preset === key
                            ? 'text-blue-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                  <div
                    className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-200"
                    style={{
                      width: `${100 / Object.keys(CASH_RECEIPT_PRESETS).length}%`,
                      left: preset === 'individual_income' ? '0%' : '50%',
                    }}
                  />
                </div>

                {/* Identifier type */}
                {presetConfig.identifierTypes.length > 1 && (
                  <div className="grid grid-cols-2 gap-2">
                    {presetConfig.identifierTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setIdentifierType(type);
                          setValue('');
                          setValueError(null);
                        }}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          identifierType === type
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {CASH_RECEIPT_IDENTIFIER_TYPE_LABEL[type]}
                      </button>
                    ))}
                  </div>
                )}

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {CASH_RECEIPT_IDENTIFIER_TYPE_LABEL[identifierType]}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => handleValueChange(e.target.value)}
                    maxLength={getMaxLength(identifierType)}
                    placeholder={getPlaceholder(identifierType)}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                      valueError
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                    }`}
                  />
                  {valueError && (
                    <p className="mt-1.5 text-xs text-red-500">{valueError}</p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">숫자만 입력 (하이픈 없이)</p>
                </div>

                {/* Memo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메모 <span className="text-gray-400 font-normal">(선택)</span>
                  </label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="현금영수증 신청과 관련해 남길 메모를 입력해주세요"
                    rows={2}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      placeholder="신청 시 입력한 비밀번호"
                      className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-1.5 text-xs text-red-500">{extractErrorMessage(error)}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !value || !password}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? '신청 중...' : '신청하기'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">현금영수증 신청 내역이 없습니다.</p>
              <button
                onClick={() => setMode('request')}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                신청하기
              </button>
            </div>
          )}
        </div>

        {/* 추가 신청하기 - 스크롤 밖 고정 하단 */}
        {mode === 'view' && currentReceipt && (currentStatus === 'COMPLETED' || currentStatus === 'CANCELED') && (
          <div className="px-5 pb-5 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setMode('request');
                setSuccessMessage(null);
                setError(null);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              추가 신청하기
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function extractErrorMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.message) return parsed.message;
    if (parsed.code) return parsed.code.replace(/_/g, ' ');
  } catch {
    // not JSON
  }
  return raw;
}

function getMaxLength(type: CashReceiptIdentifierType): number {
  switch (type) {
    case 'PHONE_NUMBER': return 11;
    case 'BUSINESS_REG_NO': return 10;
    case 'CASH_RECEIPT_CARD_NO': return 19;
  }
}

function getPlaceholder(type: CashReceiptIdentifierType): string {
  switch (type) {
    case 'PHONE_NUMBER': return '01012345678';
    case 'BUSINESS_REG_NO': return '1234567890';
    case 'CASH_RECEIPT_CARD_NO': return '1234567890123';
  }
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function normalizeCashReceiptStatus(status: string | undefined): 'REQUESTED' | 'COMPLETED' | 'CANCELED' | null {
  if (!status) return null;
  const s = status.trim().toUpperCase();
  if (s === 'REQUESTED' || s === '처리 대기'.toUpperCase()) return 'REQUESTED';
  if (s === 'COMPLETED' || s === '발급 완료'.toUpperCase()) return 'COMPLETED';
  if (s === 'CANCELED' || s === 'CANCELLED' || s === '발급 취소'.toUpperCase()) return 'CANCELED';
  return null;
}
