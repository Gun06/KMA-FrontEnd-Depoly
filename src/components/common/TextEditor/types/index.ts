import type { useEditor } from "@tiptap/react";

export interface TextEditorProps {
  /** 초기 내용 */
  initialContent?: string;
  /** 에디터 높이 (기본: 400px) */
  height?: string;
  /** 서식 도구 표시 여부 (기본: true) */
  showFormatting?: boolean;
  /** 글씨 크기 도구 표시 여부 (기본: true) */
  showFontSize?: boolean;
  /** 글씨 색상 도구 표시 여부 (기본: true) */
  showTextColor?: boolean;
  /** 이미지 삽입 도구 표시 여부 (기본: true) */
  showImageUpload?: boolean;
  /** 이미지 업로드 도메인 타입 (기본: NOTICE) */
  imageDomainType?: 'NOTICE' | 'ANSWER' | 'FAQ' | 'COURSE' | 'QUESTION' | 'EVENT' | 'MAIN_BANNER' | 'MAIN_SPONSOR';
  /** 이미지 업로드 서버 타입 (기본: admin) */
  imageServerType?: 'admin' | 'user';
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 에디터 내용 변경 시 콜백 */
  onChange?: (content: string) => void;
  /** 에디터가 준비되었을 때 콜백 */
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void;
}
