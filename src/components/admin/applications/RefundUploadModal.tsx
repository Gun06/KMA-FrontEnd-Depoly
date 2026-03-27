'use client';

import React, { useRef, useState } from 'react';
import { X, Upload, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { checkRefundUpload, finalizeRefundUpload, getRegistrationDetail } from '@/services/registration';
import type { RefundUploadCheckResponse, RefundUploadItem } from './api/refundUpload';
import type { RegistrationItem } from '@/types/registration';
import UploadButton from '@/components/common/Upload/UploadButton';
import RegistrationDetailDrawer from './RegistrationDetailDrawer';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess?: () => void;
};

export default function RefundUploadModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkResult, setCheckResult] = useState<RefundUploadCheckResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [selectedRegistrationItem, setSelectedRegistrationItem] = useState<RegistrationItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Excel 파일만 업로드 가능합니다.');
      return;
    }
    setFile(selectedFile);
    setCheckResult(null);
  };

  const handleCheck = async () => {
    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkRefundUpload(eventId, file);
      const normalized: RefundUploadCheckResponse = result.map((item: RefundUploadItem) => ({
        ...item,
        check: item.check ?? false,
        matchingLog: item.matchingLog ?? '',
        matchingRegistration: item.matchingRegistration ?? null,
      }));
      setCheckResult(normalized);
      toast.success('체크가 완료되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '체크에 실패했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleFinalize = async () => {
    if (!checkResult || checkResult.length === 0) {
      toast.error('업로드할 데이터가 없습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await finalizeRefundUpload(eventId, checkResult);
      toast.success('환불 내역이 성공적으로 업로드되었습니다.');
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '업로드에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCheckResult(null);
    setIsChecking(false);
    setIsSubmitting(false);
    setSelectedRegistrationId(null);
    setSelectedRegistrationItem(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleRegistrationClick = async (registrationId: string) => {
    setSelectedRegistrationId(registrationId);
    setIsDetailLoading(true);
    try {
      const detail = await getRegistrationDetail(registrationId);
      setSelectedRegistrationItem(detail);
    } catch (_error) {
      toast.error('신청자 정보를 불러오는데 실패했습니다.');
      setSelectedRegistrationId(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleMatchingLogChange = (index: number, value: string) => {
    if (!checkResult) return;
    const updated = [...checkResult];
    updated[index] = {
      ...updated[index],
      matchingLog: value,
    };
    setCheckResult(updated);
  };

  const handleToggleCheck = (index: number) => {
    if (!checkResult) return;
    const updated = [...checkResult];
    updated[index] = {
      ...updated[index],
      check: !updated[index].check,
    };
    setCheckResult(updated);
  };

  if (!isOpen) return null;

  const checkedCount = checkResult?.filter(item => item.check).length ?? 0;
  const unmatchedCount = checkResult?.filter(item => !item.matchingRegistration).length ?? 0;
  const uncheckedCount = checkResult?.filter(item => !item.check).length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <div className="relative bg-white shadow-xl w-[90vw] max-w-[1600px] h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">환불 내역 업로드</h2>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-4 bg-gray-50">
            <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-4">
              <div className="flex-shrink-0">
                <UploadButton
                  label="파일 업로드"
                  accept=".xlsx,.xls"
                  multiple={false}
                  onFilesSelected={(files) => handleFileSelect(files)}
                />
              </div>
              {file && (
                <p className="text-sm text-gray-600 whitespace-nowrap">
                  선택된 파일: {file.name}
                </p>
              )}
            </div>

            {!checkResult ? (
              <>
                <button
                  onClick={handleCheck}
                  disabled={!file || isChecking || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isChecking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      체크 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      체크
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  disabled={isChecking || isSubmitting}
                >
                  <X className="w-4 h-4" />
                  닫기
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleFinalize}
                  disabled={isSubmitting || isChecking}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      전송
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  disabled={isSubmitting || isChecking}
                >
                  <X className="w-4 h-4" />
                  화면 닫기
                </button>
              </>
            )}
          </div>

          {checkResult && (
            <div className="px-6 py-2 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-red-600">
                    * 체크된 건만 환불처리 되며 나머지 경우는 매칭로그만 저장됩니다.
                  </p>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p>
                      <span className="font-semibold">- 불일치:</span> 환불 내역과 신청 정보가 매칭되었지만 체크 해제된 경우
                      (계좌정보, 예금주, 금액 등이 일치하지 않거나 수동 확인이 필요한 경우)
                    </p>
                    <p>
                      <span className="font-semibold">- 매칭안됨:</span> 환불 내역에 해당하는 신청 정보를 찾을 수 없는 경우
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm text-gray-700 whitespace-nowrap">
                    (전체: {checkResult.length}건, 일치: {checkedCount}건, 불일치: {uncheckedCount}건, 매칭안됨: {unmatchedCount}건)
                  </p>
                  <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                    <span className="inline-block w-3 h-3 bg-red-50 border border-red-200 rounded mr-1 align-middle"></span>
                    불일치
                    <>
                      <span className="inline-block w-3 h-3 bg-yellow-50 border border-yellow-200 rounded mr-1 ml-3 align-middle"></span>
                      매칭안됨
                    </>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto px-6 py-4">
            {!checkResult ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">파일을 업로드하고 체크 버튼을 눌러주세요.</p>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 bg-gray-100 px-4 py-3 border-b border-gray-300 font-semibold text-sm text-gray-700">
                  <div className="col-span-4">환불 내역</div>
                  <div className="col-span-8 pl-4">매칭 신청 정보</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {checkResult.map((item, index) => {
                    const isUnmatched = !item.matchingRegistration;
                    const rowBg = isUnmatched ? 'bg-yellow-50' : item.check ? '' : 'bg-red-50';
                    const reg = item.matchingRegistration;

                    return (
                      <div key={index} className={`grid grid-cols-12 gap-4 px-4 py-4 ${rowBg}`}>
                        <div className="col-span-4 space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 min-w-[90px]">은행:</span>
                              <span className="text-sm text-gray-900">{item.paymenterBank || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 min-w-[90px]">계좌번호:</span>
                              <span className="text-sm text-gray-900">{item.accountNumber || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 min-w-[90px]">예금주:</span>
                              <span className="text-sm text-gray-900">{item.accountHolderName || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 min-w-[90px]">신청자명:</span>
                              <span className="text-sm text-gray-900">{item.name || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 min-w-[90px]">환불 금액:</span>
                              <span className="text-sm font-bold text-blue-600">
                                {Number(item.amount || 0).toLocaleString()}원
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.check}
                              onChange={() => handleToggleCheck(index)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm text-gray-700">최종 반영 대상</span>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                              매칭 로그 (수정 가능)
                            </label>
                            <textarea
                              value={item.matchingLog}
                              onChange={(e) => handleMatchingLogChange(index, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                              rows={3}
                              placeholder="매칭 로그를 입력하세요..."
                            />
                          </div>
                        </div>

                        <div className="col-span-8 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-semibold text-gray-500">
                              매칭된 신청 목록 ({reg ? 1 : 0}건)
                            </label>
                            {reg && (
                              <span className="text-xs font-semibold text-blue-600">
                                총 금액: {Number(reg.amount || 0).toLocaleString()}원
                              </span>
                            )}
                          </div>
                          {!reg ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 p-3 rounded-md border border-gray-200">
                              <p className="text-sm text-gray-400 py-2 text-center">매칭된 신청이 없습니다.</p>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleRegistrationClick(reg.registrationId)}
                              className="bg-white border border-gray-200 rounded-md p-4 text-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <div><span className="text-gray-500">신청자명:</span> <span className="font-medium">{reg.name || '-'}</span></div>
                                <div><span className="text-gray-500">입금상태:</span> <span className="font-medium">{reg.paymentStatus || '-'}</span></div>
                                <div><span className="text-gray-500">은행:</span> <span className="font-medium">{reg.paymenterBank || '-'}</span></div>
                                <div><span className="text-gray-500">계좌번호:</span> <span className="font-medium">{reg.accountNumber || '-'}</span></div>
                                <div><span className="text-gray-500">예금주:</span> <span className="font-medium">{reg.accountHolderName || '-'}</span></div>
                                <div><span className="text-gray-500">생년월일:</span> <span className="font-medium">{reg.birth || '-'}</span></div>
                                <div><span className="text-gray-500">전화번호:</span> <span className="font-medium">{reg.phNum || '-'}</span></div>
                                <div>
                                  <span className="text-gray-500">금액:</span>{' '}
                                  <span className="font-medium text-blue-600">{Number(reg.amount || 0).toLocaleString()}원</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <RegistrationDetailDrawer
        open={!!selectedRegistrationId}
        item={selectedRegistrationItem}
        isLoading={isDetailLoading}
        eventId={eventId}
        onClose={() => {
          setSelectedRegistrationId(null);
          setSelectedRegistrationItem(null);
        }}
        onSave={async () => {
          if (!selectedRegistrationId) return;
          try {
            const refreshed = await getRegistrationDetail(selectedRegistrationId);
            setSelectedRegistrationItem(refreshed);
          } catch (_error) {
            // ignore
          }
        }}
      />
    </div>
  );
}
