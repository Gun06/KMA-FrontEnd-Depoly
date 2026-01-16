'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { checkPaymentUpload, finalizePaymentUpload } from '@/services/registration';
import type { PaymentUploadDeal, PaymentUploadCheckResponse, PaymentUploadRegistration } from './api/paymentUpload';
import UploadButton from '@/components/common/Upload/UploadButton';
import RegistrationDetailDrawer from './RegistrationDetailDrawer';
import { getRegistrationDetail } from '@/services/registration';
import type { RegistrationItem } from '@/types/registration';
import Coachmark, { type CoachmarkStep } from '@/components/common/Coachmark/Coachmark';

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
  const [showCoachmark, setShowCoachmark] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  // 코치마크 단계 정의
  const coachmarkSteps: CoachmarkStep[] = [
    {
      id: 'upload',
      target: '[data-coachmark="upload-button"]',
      title: '1단계: 파일 업로드',
      description: '엑셀 파일을 선택하여 업로드하세요. 입금 내역이 포함된 Excel 파일(.xlsx, .xls)만 업로드 가능합니다.',
      position: 'bottom',
    },
    {
      id: 'check',
      target: '[data-coachmark="check-button"]',
      title: '2단계: 매칭 확인',
      description: '업로드한 파일을 클릭하면 입금 내역과 신청 정보를 자동으로 매칭합니다. 매칭 결과를 확인할 수 있습니다.',
      position: 'bottom',
    },
    {
      id: 'result',
      target: '[data-coachmark="first-deal-row"]',
      title: '3단계: 결과 확인 및 수정',
      description: '매칭된 신청 정보를 확인하고, 체크박스를 통해 입금 완료 여부를 선택할 수 있습니다. 불일치는 빨간색, 매칭안됨은 노란색 배경으로 표시됩니다.',
      position: 'top',
    },
    {
      id: 'send',
      target: '[data-coachmark="send-button"]',
      title: '4단계: 최종 전송',
      description: '모든 확인이 완료되면 전송 버튼을 클릭하여 입금 내역을 저장합니다. 체크된 건만 "입금완료"로 처리됩니다.',
      position: 'bottom',
    },
  ];

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
    setIsUploadComplete(false); // 새 파일 선택 시 업로드 완료 상태 초기화
  };

  // 체크 API 호출
  const handleCheck = async () => {
    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    setIsChecking(true);
    try {
      const result: PaymentUploadCheckResponse = await checkPaymentUpload(eventId, file);
      // 각 신청자에 checked 필드 초기값 설정 (없으면 false)
      const normalizedResult: PaymentUploadCheckResponse = result.map((deal: PaymentUploadDeal) => ({
        ...deal,
        registrationList: deal.registrationList.map((reg: PaymentUploadRegistration) => ({
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
      setIsUploadComplete(true);
      onSuccess?.();
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
    setIsUploadComplete(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* 배경 오버레이 - 클릭해도 닫히지 않음 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
      />

      {/* 모달 컨테이너 - 사이드 패널처럼 오른쪽에 고정 */}
      <div className="relative bg-white shadow-xl w-[90vw] max-w-[1600px] h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">입금 내역 업로드</h2>
            <button
              onClick={() => setShowCoachmark(true)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="사용 가이드 보기"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 상단: 파일 업로드 및 전송 버튼 */}
          <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-4 bg-gray-50">
            <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-4" data-coachmark="upload-button">
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
            {!checkResult && (
              <>
                <button
                  data-coachmark="check-button"
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
            )}
            {checkResult && (
              <>
                <button
                  data-coachmark="send-button"
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

          {/* 주의사항 */}
          {checkResult && (() => {
            // 전체 거래 건수
            const totalDeals = checkResult.length;

            // 매칭된 신청자의 checked 상태 기준으로 계산
            const allRegistrations = checkResult.flatMap(deal => deal.registrationList);
            const checkedCount = allRegistrations.filter(reg => reg.checked).length;
            const uncheckedCount = allRegistrations.filter(reg => !reg.checked).length;

            // 매칭되지 않은 거래 건수 (registrationList가 비어있는 거래)
            const unmatchedDeals = checkResult.filter(deal => deal.registrationList.length === 0).length;

            return (
              <div className="px-6 py-2 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-red-600">
                      * 이제는 체크된 건만 &apos;입금완료&apos;로 되며 나머지 경우는 매칭로그만 저장됩니다.
                    </p>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p>
                        <span className="font-semibold">- 불일치:</span> 입금 내역과 신청 정보가 매칭되었지만 체크 해제된 경우 (입금자명, 금액 등이 일치하지 않거나 수동으로 확인이 필요한 경우)
                      </p>
                      {unmatchedDeals > 0 && (
                        <p>
                          <span className="font-semibold">- 매칭안됨:</span> 입금 내역에 해당하는 신청 정보를 찾을 수 없는 경우 (입금자명이나 금액이 일치하는 신청이 없는 경우)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm text-gray-700 whitespace-nowrap">
                      (전체: {totalDeals}건, 일치: {checkedCount}건, 불일치: {uncheckedCount}건{unmatchedDeals > 0 ? `, 매칭안됨: ${unmatchedDeals}건` : ''})
                    </p>
                    <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                      <span className="inline-block w-3 h-3 bg-red-50 border border-red-200 rounded mr-1 align-middle"></span>
                      불일치
                      {unmatchedDeals > 0 && (
                        <>
                          <span className="inline-block w-3 h-3 bg-yellow-50 border border-yellow-200 rounded mr-1 ml-3 align-middle"></span>
                          매칭안됨
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
              <div data-coachmark="result-area" className="border border-gray-300 rounded-lg overflow-hidden">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-12 gap-4 bg-gray-100 px-4 py-3 border-b border-gray-300 font-semibold text-sm text-gray-700">
                  <div className="col-span-4">입금 내역</div>
                  <div className="col-span-8 pl-4">신청 정보</div>
                </div>

                {/* 테이블 본문 */}
                <div className="divide-y divide-gray-200">
                  {checkResult.map((deal, dealIndex) => {
                    // 매칭 상태 판단
                    const isUnmatched = deal.registrationList.length === 0; // 매칭안됨
                    const isMismatched = deal.registrationList.length > 0 && deal.registrationList.every(reg => !reg.checked); // 불일치 (매칭되었지만 모두 체크 해제)

                    // 배경색 결정
                    let bgColor = '';
                    if (isUnmatched) {
                      bgColor = 'bg-yellow-50'; // 매칭안됨: 연한 노란색
                    } else if (isMismatched) {
                      bgColor = 'bg-red-50'; // 불일치: 연한 빨간색
                    }

                    return (
                      <div
                        key={dealIndex}
                        className={`grid grid-cols-12 gap-4 px-4 py-4 ${bgColor} hover:opacity-90 transition-opacity`}
                        data-coachmark={dealIndex === 0 ? 'first-deal-row' : undefined}
                      >
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
                                  .filter(reg => reg.checked)
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
                    );
                  })}
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

      {/* 코치마크 */}
      {isOpen && (
        <Coachmark
          steps={coachmarkSteps}
          storageKey={`payment-upload-coachmark-${eventId}`}
          forceShow={showCoachmark}
          onComplete={() => {
            setShowCoachmark(false);
          }}
          onSkip={() => {
            setShowCoachmark(false);
          }}
        />
      )}
    </div>
  );
}

