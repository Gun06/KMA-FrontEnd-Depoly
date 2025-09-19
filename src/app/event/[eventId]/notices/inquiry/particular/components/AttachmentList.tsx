import { Download } from 'lucide-react';
import { AttachmentInfo } from '../types';
import { formatFileSize } from '../utils/formatters';
import { handleDownload } from '../utils/fileHandlers';

interface AttachmentListProps {
  attachments: AttachmentInfo[];
  title?: string;
}

export const AttachmentList = ({ attachments, title = "첨부파일" }: AttachmentListProps) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="border-t border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors gap-3"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-700 truncate block">
                {attachment.originName}
              </span>
              <span className="text-xs text-gray-500">
                {formatFileSize(attachment.originMb * 1024 * 1024)}
              </span>
            </div>
            <button
              onClick={() => handleDownload(attachment)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
