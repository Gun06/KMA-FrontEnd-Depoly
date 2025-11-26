import { AttachmentInfo } from '../types';

export const handleDownload = (attachment: AttachmentInfo) => {
  
  try {
    // 새 창에서 파일 다운로드
    window.open(attachment.url, '_blank');
  } catch (error) {
  }
};
