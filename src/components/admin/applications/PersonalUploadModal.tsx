'use client';

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadPersonalForm } from './api/personalUpload';
import UploadButton from '@/components/common/Upload/UploadButton';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess?: () => void;
};

export default function PersonalUploadModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 파일 선택 핸들러
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Excel 파일만 업로드 가능합니다.');
      return;
    }
    setFile(selectedFile);
  };

  // 업로드 처리
  const handleUpload = async () => {
    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    try {
      await uploadPersonalForm(eventId, file);
      toast.success('개인 신청 양식이 성공적으로 업로드되었습니다.');
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 모달 닫기 및 초기화
  const handleClose = () => {
    setFile(null);
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-lg shadow-xl w-[90vw] max-w-[600px] flex flex-col mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">개인 신청 양식 업로드</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 파일 업로드 영역 */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <UploadButton
                label="Excel 파일 선택"
                accept=".xlsx,.xls"
                multiple={false}
                onFilesSelected={(files) => handleFileSelect(files)}
                className="w-full"
              />
              {file && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 안내사항 */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">안내사항</h3>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>개인 신청 양식 Excel 파일(.xlsx, .xls)만 업로드 가능합니다.</li>
                <li>양식은 먼저 다운로드하여 작성 후 업로드해주세요.</li>
                <li>업로드 후 신청자 목록에서 결과를 확인할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                업로드
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
