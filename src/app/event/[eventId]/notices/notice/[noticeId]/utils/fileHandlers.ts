/**
 * 첨부파일 다운로드 함수
 */
export const handleDownload = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * URL에서 파일명 추출 함수
 */
export const extractFilename = (url: string, index: number): string => {
  return url.split('/').pop() || `첨부파일_${index + 1}`;
};
