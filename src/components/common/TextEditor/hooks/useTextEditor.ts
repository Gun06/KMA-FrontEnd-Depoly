import { useCallback, useState, useEffect, useRef } from 'react';
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
    imageServerType = 'admin',
  } = props;

  const [isMounted, setIsMounted] = useState(false);
  const [fontSize, setFontSize] = useState("default");
  const [textColor, setTextColor] = useState("default");
  const isColorChangingRef = useRef(false);

  // 클라이언트 사이드에서만 마운트 상태를 true로 설정
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // HardBreak를 명시적으로 활성화하여 개행 처리 개선
        hardBreak: {
          keepMarks: true, // 색상 등 마크 유지
        },
        paragraph: {
          HTMLAttributes: {
            style: 'white-space: pre-wrap;',
          },
        },
      }),
      CustomTextStyle,
      Color, // Color extension (기본 설정 사용)
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
      handleKeyDown: (view, event) => {
        // Enter 키 처리: 일반적인 텍스트 에디터처럼 동작
        // 기존 마크(색상 등)를 유지하면서 개행
        if (event.key === 'Enter' && !event.shiftKey) {
          // 기본 동작은 그대로 두되, 마크는 유지되도록 설정됨
          return false; // false 반환 시 기본 동작 실행 (hardBreak keepMarks로 마크 유지)
        }
        return false;
      },
    },
    onUpdate: ({ editor, transaction }) => {
      // 입력 중에도 공백을 보존하기 위해 실시간으로 변환
      if (transaction.docChanged) {
        // 색상 변경 중일 때는 onChange를 호출하지 않음 (개행 중복 방지)
        if (isColorChangingRef.current) {
          return;
        }
        
        // 문서가 변경되었을 때만 처리
        // onChange에서는 빈 <p> 태그 처리를 스킵 (개행 중복 방지)
        // 공백 보존만 수행
        const html = editor.getHTML();
        const compressedHtml = compressHtml(html, true);
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
            
            const result = await uploadImage(
              processedFile, 
              imageDomainType as 'QUESTION',
              imageServerType
            );
            
            // 업로드된 이미지 URL로 에디터에 삽입
            // 서버 타입에 따라 다른 필드명 사용 (admin: url, user: imgSrc)
            const imageUrl: string = result.url || result.imgSrc || '';
            if (imageUrl) {
              return {
                src: imageUrl,
                alt: file.name || '이미지'
              };
            } else {
              throw new Error('서버에서 이미지 URL을 반환하지 않았습니다.');
            }
            
          } catch (error) {
            // API 실패 시 에러 표시 (base64 폴백 제거)
            console.error('❌ 이미지 업로드 실패:', {
              fileName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
              fileType: file.type,
              serverType: imageServerType,
              error: error
            });
            
            alert(`이미지 업로드에 실패했습니다: ${file.name}\n\n` +
                  `서버: ${imageServerType}\n` +
                  `크기: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\n` +
                  `다시 시도하거나 관리자에게 문의하세요.`);
            
            return null;
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
    [editor, imageDomainType, imageServerType],
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
      if (!editor) return;

      // 색상 변경 시작 플래그 설정 (개행 중복 방지)
      isColorChangingRef.current = true;
      
      // 현재 선택 영역과 커서 위치 저장 (색상 변경 전)
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      
      setTextColor(color);

      // 일반적인 텍스트 에디터처럼 동작:
      // 1. 선택된 텍스트가 있으면 해당 영역에 색상만 적용 (개행 유지)
      // 2. 선택된 텍스트가 없으면 다음에 입력할 텍스트에 색상 적용
      if (color === "default") {
        if (hasSelection) {
          // 선택된 텍스트가 있으면 색상만 제거 (선택 영역은 그대로 유지)
          editor.chain().focus().unsetColor().run();
        } else {
          // 선택된 텍스트가 없으면 다음 입력에 기본 색상 적용
        editor.chain().focus().unsetColor().run();
        }
      } else {
        if (hasSelection) {
          // 선택된 텍스트가 있으면 색상만 적용 (개행 중복 방지)
          editor.chain().focus().setColor(color).run();
        } else {
          // 선택된 텍스트가 없으면 다음에 입력할 텍스트에 색상 적용
        editor.chain().focus().setColor(color).run();
      }
      }
      
      // 색상 변경 후 플래그 해제 및 최종 HTML 정리
      // 여러 번의 transaction을 처리하기 위해 충분한 딜레이
      setTimeout(() => {
        isColorChangingRef.current = false;
        
        // 색상 변경이 완료된 후 최종 HTML 정리 및 onChange 호출
        const finalHtml = editor.getHTML();
        const compressedHtml = compressHtml(finalHtml, false);
        onChange?.(compressedHtml);
      }, 200);
    },
    [editor, onChange],
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
