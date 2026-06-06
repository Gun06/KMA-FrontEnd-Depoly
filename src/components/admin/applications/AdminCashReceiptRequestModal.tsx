'use client';

import React from 'react';
import {
  CASH_RECEIPT_PRESETS,
  CASH_RECEIPT_IDENTIFIER_TYPE_LABEL,
  validateCashReceiptValue,
  type CashReceiptPreset,
  type CashReceiptIdentifierType,
} from '@/app/(main)/mypage/applications/cash-receipt/types/cashReceipt';
import {
  createRegistrationCashReceipt,
  updateRegistrationCashReceipt,
  toRegistrationCashReceiptRequestBody,
} from '@/services/registration';
import type { RegistrationCashReceiptRequest } from '@/types/registration';
import { toast } from 'react-toastify';

type ModalMode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode?: ModalMode;
  registrationId: string;
  defaultPhone?: string;
  initialRequest?: RegistrationCashReceiptRequest | null;
  onClose: () => void;
  onSuccess?: (request: RegistrationCashReceiptRequest) => void | Promise<void>;
};

function resolvePreset(request: RegistrationCashReceiptRequest): CashReceiptPreset {
  if (request.purpose === 'EXPENSE_PROOF' && request.requesterType === 'BUSINESS') {
    return 'business_expense';
  }
  return 'individual_income';
}

export default function AdminCashReceiptRequestModal({
  open,
  mode = 'create',
  registrationId,
  defaultPhone = '',
  initialRequest,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === 'edit';
  const [preset, setPreset] = React.useState<CashReceiptPreset>('individual_income');
  const [identifierType, setIdentifierType] = React.useState<CashReceiptIdentifierType>('PHONE_NUMBER');
  const [value, setValue] = React.useState('');
  const [adminAnswer, setAdminAnswer] = React.useState('');
  const [valueError, setValueError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const presetConfig = CASH_RECEIPT_PRESETS[preset];

  React.useEffect(() => {
    if (!open) return;

    if (isEdit && initialRequest) {
      const nextPreset = resolvePreset(initialRequest);
      setPreset(nextPreset);
      setIdentifierType(initialRequest.type);
      setValue(initialRequest.value.replace(/\D/g, ''));
      setAdminAnswer(initialRequest.adminAnswer ?? '');
      setValueError(null);
      return;
    }

    setPreset('individual_income');
    setIdentifierType('PHONE_NUMBER');
    setValue(defaultPhone.replace(/\D/g, ''));
    setAdminAnswer('');
    setValueError(null);
  }, [open, isEdit, initialRequest, defaultPhone]);

  const handlePresetChange = (newPreset: CashReceiptPreset) => {
    setPreset(newPreset);
    const config = CASH_RECEIPT_PRESETS[newPreset];
    setIdentifierType(config.identifierTypes[0]);
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

    const request: RegistrationCashReceiptRequest = {
      purpose: presetConfig.purpose,
      requesterType: presetConfig.requesterType,
      type: identifierType,
      value,
      adminAnswer: adminAnswer.trim() || null,
      status: isEdit && initialRequest ? initialRequest.status : 'REQUESTED',
    };

    const id = registrationId.trim();
    if (!id) {
      toast.error('신청 ID를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    const body = toRegistrationCashReceiptRequestBody(request);

    try {
      setSubmitting(true);
      if (isEdit) {
        await updateRegistrationCashReceipt(id, body);
      } else {
        await createRegistrationCashReceipt(id, body);
      }
      await onSuccess?.(request);
      onClose();
    } catch {
      toast.error(
        isEdit
          ? '현금영수증 수정에 실패했습니다. 다시 시도해주세요.'
          : '현금영수증 신청에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[75] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && onClose()} />
      <div className="relative bg-white rounded-md shadow-lg w-[400px] max-h-[90vh] overflow-y-auto p-5">
        <h4 className="font-semibold text-gray-900 mb-1">
          {isEdit ? '현금영수증 수정' : '현금영수증 신청'}
        </h4>
        <p className="text-xs text-gray-500 mb-4">
          {isEdit ? '잘못 입력한 현금영수증 정보를 수정합니다.' : '관리자가 대신 신청합니다.'}
        </p>

        <div className="space-y-4">
          <div className="relative border-b border-gray-200">
            <div className="flex">
              {(Object.entries(CASH_RECEIPT_PRESETS) as [CashReceiptPreset, (typeof CASH_RECEIPT_PRESETS)[CashReceiptPreset]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetChange(key)}
                    disabled={submitting}
                    className={`flex-1 pb-2.5 text-sm font-medium text-center transition-colors ${
                      preset === key ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {config.label}
                  </button>
                )
              )}
            </div>
            <div
              className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-200"
              style={{
                width: '50%',
                left: preset === 'individual_income' ? '0%' : '50%',
              }}
            />
          </div>

          {presetConfig.identifierTypes.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              {presetConfig.identifierTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={submitting}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {CASH_RECEIPT_IDENTIFIER_TYPE_LABEL[identifierType]}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              disabled={submitting}
              placeholder="숫자만 입력 (하이픈 없이)"
              className={`w-full rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 ${
                valueError ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {valueError && <p className="mt-1 text-xs text-red-500">{valueError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              관리자 메모 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              value={adminAnswer}
              onChange={(e) => setAdminAnswer(e.target.value)}
              disabled={submitting}
              rows={2}
              placeholder="관리자가 작성할 내용입니다."
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={submitting || !value}
          >
            {submitting
              ? isEdit ? '저장 중...' : '신청 중...'
              : isEdit ? '저장' : '신청하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
