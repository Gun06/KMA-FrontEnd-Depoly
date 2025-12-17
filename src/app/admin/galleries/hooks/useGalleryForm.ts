import React from 'react';
import type { GalleryFormState } from '../types/gallery';
import type { Gallery } from '../data/types';

// 공통 갤러리 폼 상태 관리 훅

export function useGalleryForm(initial: Gallery) {
  const [value, setValue] = React.useState<GalleryFormState>(initial);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    setValue(initial);
    setThumbnailFile(null);
  }, [initial]);

  return {
    value,
    setValue,
    thumbnailFile,
    setThumbnailFile,
    isUploading,
    setIsUploading,
  };
}

