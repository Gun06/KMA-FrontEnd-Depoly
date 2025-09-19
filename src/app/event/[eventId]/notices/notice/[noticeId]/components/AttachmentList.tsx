import { Download } from 'lucide-react';
import { handleDownload, extractFilename } from '../utils/fileHandlers';

interface AttachmentListProps {
  attachmentUrls: string[];
}

export const AttachmentList = ({ attachmentUrls }: AttachmentListProps) => {
  if (!attachmentUrls || attachmentUrls.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">첨부파일</h3>
      <div className="space-y-2">
        {attachmentUrls.map((url, index) => {
          const filename = extractFilename(url, index);
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors gap-3"
            >
              <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                {filename}
              </span>
              <button
                onClick={() => handleDownload(url, filename)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                다운로드
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
