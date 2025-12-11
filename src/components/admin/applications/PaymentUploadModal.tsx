'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { checkPaymentUpload, finalizePaymentUpload } from '@/services/registration';
import type { PaymentUploadDeal, PaymentUploadCheckResponse } from '@/types/paymentUpload';
import UploadButton from '@/components/common/Upload/UploadButton';
import RegistrationDetailDrawer from './RegistrationDetailDrawer';
import { getRegistrationDetail } from '@/services/registration';
import type { RegistrationItem } from '@/types/registration';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess?: () => void;
};

export default function PaymentUploadModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkResult, setCheckResult] = useState<PaymentUploadCheckResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [selectedRegistrationItem, setSelectedRegistrationItem] = useState<RegistrationItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // 파일 선택 핸들러
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Excel 파일만 업로드 가능합니다.');
      return;
    }
    setFile(selectedFile);
    setCheckResult(null); // 새 파일 선택 시 이전 결과 초기화
  };

  // 체크 API 호출
  const handleCheck = async () => {
    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkPaymentUpload(eventId, file);
      // 각 신청자에 checked 필드 초기값 설정 (없으면 false)
      const normalizedResult = result.map(deal => ({
        ...deal,
        registrationList: deal.registrationList.map(reg => ({
          ...reg,
          checked: reg.checked ?? false,
        })),
      }));
      setCheckResult(normalizedResult);
      toast.success('체크가 완료되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '체크에 실패했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  // 최종 업로드
  const handleFinalize = async () => {
    if (!checkResult || checkResult.length === 0) {
      toast.error('업로드할 데이터가 없습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await finalizePaymentUpload(eventId, checkResult);
      toast.success('입금 내역이 성공적으로 업로드되었습니다.');
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '업로드에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 및 초기화
  const handleClose = () => {
    setFile(null);
    setCheckResult(null);
    setIsChecking(false);
    setIsSubmitting(false);
    setSelectedRegistrationId(null);
    setSelectedRegistrationItem(null);
    onClose();
  };

  // 신청자 상세정보 드로어 열기
  const handleRegistrationClick = async (registrationId: string) => {
    setSelectedRegistrationId(registrationId);
    setIsDetailLoading(true);
    try {
      const detail = await getRegistrationDetail(registrationId);
      setSelectedRegistrationItem(detail);
    } catch (error) {
      toast.error('신청자 정보를 불러오는데 실패했습니다.');
      setSelectedRegistrationId(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // 드로어 닫기
  const handleDetailClose = () => {
    setSelectedRegistrationId(null);
    setSelectedRegistrationItem(null);
  };

  // 신청자별 checked 필드 수정
  const handleToggleRegistrationChecked = (dealIndex: number, regIndex: number) => {
    if (!checkResult) return;
    const updated = [...checkResult];
    const registration = updated[dealIndex].registrationList[regIndex];
    updated[dealIndex] = {
      ...updated[dealIndex],
      registrationList: updated[dealIndex].registrationList.map((reg, idx) =>
        idx === regIndex
          ? { ...reg, checked: !reg.checked }
          : reg
      ),
    };
    setCheckResult(updated);
  };

  // matchingLog 수정
  const handleMatchingLogChange = (index: number, value: string) => {
    if (!checkResult) return;
    const updated = [...checkResult];
    updated[index] = {
      ...updated[index],
      matchingLog: value,
    };
    setCheckResult(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 - 클릭해도 닫히지 않음 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-lg shadow-xl w-[85vw] max-w-[1400px] h-[85vh] max-h-[875px] flex flex-col mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">입금 내역 업로드</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 상단: 파일 업로드 및 전송 버튼 */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
            <div className="flex-1">
              <UploadButton
                label="파일 업로드"
                accept=".xlsx,.xls"
                multiple={false}
                onFilesSelected={(files) => handleFileSelect(files)}
                className="w-full"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  선택된 파일: {file.name}
                </p>
              )}
            </div>
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
            {checkResult && (
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
            )}
          </div>

          {/* 주의사항 */}
          {checkResult && (() => {
            // 모든 신청자의 checked 상태 기준으로 계산
            const allRegistrations = checkResult.flatMap(deal => deal.registrationList);
            const checkedCount = allRegistrations.filter(reg => reg.checked).length;
            const uncheckedCount = allRegistrations.filter(reg => !reg.checked).length;
            return (
              <div className="px-6 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-red-600">
                  * 체크된건은 &apos;입금완료&apos;, 체크 해제된것은 &apos;확인필요&apos; 처리되어 저장됩니다
                  <span className="ml-2 text-gray-700">
                    (일치: {checkedCount}건, 불일치: {uncheckedCount}건)
                  </span>
                </p>
              </div>
            );
          })()}

          {/* 하단: 결과 테이블 */}
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
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-12 gap-4 bg-gray-100 px-4 py-3 border-b border-gray-300 font-semibold text-sm text-gray-700">
                  <div className="col-span-4">입금 내역</div>
                  <div className="col-span-8 pl-4">신청 정보</div>
                </div>

                {/* 테이블 본문 */}
                <div className="divide-y divide-gray-200">
                  {checkResult.map((deal, dealIndex) => (
                    <div key={dealIndex} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50">
                      {/* 첫 번째 컬럼: 입금 내역 정보 + 매칭 로그 */}
                      <div className="col-span-4 space-y-3">
                        {/* 입금 내역 정보 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">입금일:</span>
                            <span className="text-sm text-gray-900">{deal.dealDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">입금자명:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900 font-medium">{deal.description}</span>
                              {deal.organization ? (
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  단체
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                  개인
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">금액:</span>
                            <span className="text-sm font-bold text-blue-600">
                              {deal.depositAmt.toLocaleString()}원
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">타입:</span>
                            <span className="text-sm text-gray-900">{deal.type}</span>
                          </div>
                        </div>

                        {/* 매칭 로그 (수정 가능) */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">
                            매칭 로그 (수정 가능)
                          </label>
                          <textarea
                            value={deal.matchingLog}
                            onChange={(e) => handleMatchingLogChange(dealIndex, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                            rows={3}
                            placeholder="매칭 로그를 입력하세요..."
                          />
                        </div>
                      </div>

                      {/* 두 번째 컬럼: 신청 목록 */}
                      <div className="col-span-8 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-semibold text-gray-500">
                            매칭된 신청 목록 ({deal.registrationList.length}건)
                          </label>
                          {deal.registrationList.length > 0 && (
                            <span className="text-xs font-semibold text-blue-600">
                              총 금액: {deal.registrationList
                                .reduce((sum, reg) => sum + reg.amount, 0)
                                .toLocaleString()}원
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 p-3 rounded-md border border-gray-200">
                          {deal.registrationList.length === 0 ? (
                            <p className="text-sm text-gray-400 py-2 text-center">매칭된 신청이 없습니다.</p>
                          ) : (
                            deal.registrationList.map((reg, regIndex) => (
                              <div
                                key={regIndex}
                                className="bg-white border border-gray-200 rounded-md p-3 text-sm hover:border-blue-500 hover:shadow-md transition-all"
                              >
                                <div className="flex items-start gap-3">
                                  {/* 체크박스 */}
                                  <input
                                    type="checkbox"
                                    checked={reg.checked ?? false}
                                    onChange={() => handleToggleRegistrationChecked(dealIndex, regIndex)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer mt-1 flex-shrink-0"
                                  />
                                  {/* 신청자 정보 */}
                                  <div
                                    onClick={() => handleRegistrationClick(reg.registrationId)}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-500">이름:</span>{' '}
                                        <span className="font-medium">{reg.name}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">입금자명:</span>{' '}
                                        <span className="font-medium">{reg.paymenterName || '-'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">단체명:</span>{' '}
                                        <span className="font-medium">
                                          {reg.organizationName || '-'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">종목:</span>{' '}
                                        <span className="font-medium">{reg.eventCategoryName}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">금액:</span>{' '}
                                        <span className="font-medium text-blue-600">
                                          {reg.amount.toLocaleString()}원
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">등록일:</span>{' '}
                                        <span className="font-medium">
                                          {new Date(reg.registrationDate).toLocaleDateString('ko-KR')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 신청자 상세정보 드로어 */}
      <RegistrationDetailDrawer
        open={!!selectedRegistrationId}
        item={selectedRegistrationItem}
        isLoading={isDetailLoading}
        eventId={eventId}
        onClose={handleDetailClose}
        onSave={async () => {
          // 저장 후 상세 정보 다시 불러오기
          if (selectedRegistrationId) {
            try {
              const refreshed = await getRegistrationDetail(selectedRegistrationId);
              setSelectedRegistrationItem(refreshed);
            } catch (error) {
              // 에러 무시
            }
          }
        }}
      />
    </div>
  );
}

