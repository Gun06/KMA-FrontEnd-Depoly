/**
 * 이미지 압축 유틸리티
 */

export interface CompressImageOptions {
  maxWidth?: number;
  quality?: number;
}

/**
 * 이미지를 압축하는 함수
 * @param file 원본 이미지 파일
 * @param maxWidth 최대 너비 (기본: 1920px)
 * @param quality 품질 (0-1, 기본: 0.8)
 * @returns 압축된 이미지 파일
 */
export const compressImage = (
  file: File,
  options: CompressImageOptions = {}
): Promise<File> => {
  const { maxWidth = 1920, quality = 0.8 } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.createElement('img');
    
    img.onload = () => {
      // 원본 비율 유지하면서 크기 조정
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;
      
      canvas.width = width;
      canvas.height = height;
      
      // 이미지 그리기
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 압축된 이미지를 Blob으로 변환
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // 압축 실패 시 원본 반환
        }
      }, 'image/jpeg', quality);
    };
    
    img.onerror = () => {
      resolve(file); // 로드 실패 시 원본 반환
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 이미지 파일 크기가 특정 크기 이상인지 확인
 * @param file 파일
 * @param maxSizeMB 최대 크기 (MB, 기본: 2MB)
 * @returns 크기 초과 여부
 */
export const shouldCompressImage = (file: File, maxSizeMB: number = 2): boolean => {
  return file.size > maxSizeMB * 1024 * 1024;
};
