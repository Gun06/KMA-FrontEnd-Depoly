import { useCallback, useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CustomImage, CustomTextStyle, TextAlign } from '../extensions';
import { compressHtml } from '../utils/compressHtml';
import { compressImage, shouldCompressImage } from '../utils/imageCompression';
import type { TextEditorProps } from '../types';

export const useTextEditor = (props: TextEditorProps) => {
  const {
    initialContent = "",
    placeholder = "내용을 작성해주세요...",
    onChange,
    onEditorReady,
    imageDomainType = 'NOTICE',
  } = props;

  const [isMounted, setIsMounted] = useState(false);
  const [fontSize, setFontSize] = useState("default");
  const [textColor, setTextColor] = useState("default");

  // 클라이언트 사이드에서만 마운트 상태를 true로 설정
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomTextStyle,
      Color,
      TextAlign,
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: initialContent || '<p></p>',
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-6",
        'data-placeholder': placeholder,
        style: "white-space: pre-wrap;",
      },
      transformPastedHTML(html) {
        // 붙여넣기된 HTML의 공백 보존
        return html;
      },
      transformPastedText(text) {
        // 붙여넣기된 텍스트의 공백 보존
        // 연속된 공백을 &nbsp;로 변환하여 보존
        return text.replace(/  +/g, (spaces: string): string => {
          return ' ' + '\u00A0'.repeat(spaces.length - 1);
        });
      },
    },
    onUpdate: ({ editor, transaction }) => {
      // 입력 중에도 공백을 보존하기 위해 실시간으로 변환
      if (transaction.docChanged) {
        // 문서가 변경되었을 때만 처리
        const html = editor.getHTML();
        const compressedHtml = compressHtml(html);
        // onChange 호출 (부모 컴포넌트에 알림)
        onChange?.(compressedHtml);
      }
    },
    // SSR 오류 방지를 위한 설정
    immediatelyRender: false,
  });

  // 에디터가 준비되면 콜백 호출
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // initialContent 변경 시 동기화 (외부에서 강제로 변경된 경우만)
  useEffect(() => {
    if (!editor) return;
    
    const current = editor.getHTML();
    const targetContent = initialContent || '<p></p>';
    
    // 내용이 실제로 변경되었을 때만 업데이트
    // 단, 사용자가 입력 중일 때는 업데이트하지 않음 (커서 위치 보존)
    if (current !== targetContent) {
      // 에디터가 포커스되어 있으면 업데이트하지 않음 (사용자가 입력 중)
      if (!editor.isFocused) {
        // 포커스되어 있지 않을 때만 외부에서 변경된 내용으로 업데이트
        editor.commands.setContent(targetContent);
      }
    }
  }, [editor, initialContent]);

  // 선택 상태와 UI 동기화
  useEffect(() => {
    if (!editor) return;
    
    const updateUI = () => {
      const attrs = editor.getAttributes("textStyle");
      setFontSize(attrs.fontSize ?? "default");
      
      // color는 별도로 확인
      const colorMark = editor.getAttributes("color");
      setTextColor(colorMark.color ?? "default");
    };
    
    editor.on("selectionUpdate", updateUI);
    editor.on("transaction", updateUI);
    
    return () => {
      editor.off("selectionUpdate", updateUI);
      editor.off("transaction", updateUI);
    };
  }, [editor]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0 && editor) {
        // 병렬 업로드 처리
        const uploadPromises = Array.from(files).map(async (file) => {
          try {
            // 이미지 압축 (2MB 이상인 경우만)
            const processedFile = shouldCompressImage(file) 
              ? await compressImage(file) 
              : file;
            
            // 새로운 이미지 업로드 API 사용
            const { uploadImage } = await import('@/services/imageUpload');
            
            const result = await uploadImage(processedFile, imageDomainType as 'QUESTION');
            
            // 업로드된 이미지 URL로 에디터에 삽입
            const imageUrl: string = result.imgSrc;
            if (imageUrl) {
              return {
                src: imageUrl,
                alt: file.name || '이미지'
              };
            } else {
              throw new Error('서버에서 이미지 URL을 반환하지 않았습니다.');
            }
            
          } catch (error) {
            // API 실패 시 Base64 방식으로 폴백
            return new Promise<{src: string, alt: string}>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                if (src) {
                  resolve({
                    src: src,
                    alt: file.name || '이미지'
                  });
                }
              };
              reader.readAsDataURL(file);
            });
          }
        });
        
        // 모든 업로드 완료 후 에디터에 삽입
        const results = await Promise.all(uploadPromises);
        results.forEach((result) => {
          if (result) {
            (editor.chain().focus() as unknown as { 
              setImage: (options: { src: string; alt?: string }) => { run: () => void } 
            }).setImage(result).run();
          }
        });
        
        // 파일 입력 초기화
        event.target.value = "";
      }
    },
    [editor, imageDomainType],
  );

  const setFontSizeHandler = useCallback(
    (size: string) => {
      setFontSize(size);
      if (!editor) return;

      if (size === "default") {
        editor.chain().focus().updateAttributes("textStyle", { fontSize: null }).run();
      } else {
        editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
      }
    },
    [editor],
  );

  const setTextColorHandler = useCallback(
    (color: string) => {
      setTextColor(color);
      if (!editor) return;

      if (color === "default") {
        editor.chain().focus().unsetColor().run();
      } else {
        editor.chain().focus().setColor(color).run();
      }
    },
    [editor],
  );

  return {
    editor,
    isMounted,
    fontSize,
    textColor,
    handleImageUpload,
    setFontSizeHandler,
    setTextColorHandler,
  };
};
