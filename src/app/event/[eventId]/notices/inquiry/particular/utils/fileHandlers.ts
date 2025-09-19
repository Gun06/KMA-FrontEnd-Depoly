import { AttachmentInfo } from '../types';

export const handleDownload = (attachment: AttachmentInfo) => {
  
  try {
    // 새 창에서 파일 다운로드
    window.open(attachment.url, '_blank');
  } catch (error) {
    console.error('❌ 첨부파일 다운로드 실패:', {
      error: error,
      attachment
    });
  }
};
