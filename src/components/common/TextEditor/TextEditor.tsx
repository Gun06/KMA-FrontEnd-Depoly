"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Placeholder } from "@tiptap/extension-placeholder"
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  ImageIcon, 
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  MoveLeft,
  MoveRight,
  Circle
} from "lucide-react"

// HTML 내용을 압축하는 함수
const compressHtml = (html: string): string => {
  // 압축 제거: 모든 공백과 줄바꿈을 완전히 보존
  // 단, 시작과 끝의 공백만 제거 (전체 HTML 구조 유지)
  return html.trim();
};

// 커스텀 이미지 확장
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null as number | null,
        parseHTML: (element) => {
          const w = element.getAttribute("width") || (element as HTMLElement).style?.width
          return w ? parseInt(String(w).replace("px", ""), 10) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            style: `width: ${attributes.width}px;`,
          }
        },
      },
      height: {
        default: null as number | null,
        parseHTML: (element) => {
          const h = element.getAttribute("height") || (element as HTMLElement).style?.height
          return h ? parseInt(String(h).replace("px", ""), 10) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return {
            style: `height: ${attributes.height}px;`,
          }
        },
      },
      align: {
        default: 'left',
        parseHTML: (element) => {
          const align = element.getAttribute("data-align") || (element as HTMLElement).style?.float || 'left'
          return align
        },
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === 'left') {
            return {}
          }
          return {
            'data-align': attributes.align,
            style: `float: ${attributes.align}; margin: 0 ${attributes.align === 'center' ? 'auto' : attributes.align === 'right' ? '0 0 0 1rem' : '1rem 0 0 0'};`,
          }
        },
      },
    }
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement("div")
      container.className = "image-container"
      
      // 정렬에 따라 컨테이너 스타일 설정
      if (node.attrs.align === 'center') {
        container.style.cssText = "position: relative; display: block; max-width: 100%; text-align: center; margin: 1rem 0;"
      } else if (node.attrs.align === 'right') {
        container.style.cssText = "position: relative; display: block; max-width: 100%; text-align: right; margin: 1rem 0;"
      } else {
        container.style.cssText = "position: relative; display: block; max-width: 100%; text-align: left; margin: 1rem 0;"
      }
      
      container.draggable = false

      const img = document.createElement("img")
      img.src = node.attrs.src
      img.alt = node.attrs.alt || ""
      img.style.cssText = "display: inline-block; max-width: 100%; height: auto; cursor: pointer; position: relative;"

      if (node.attrs.width) {
        img.style.width = node.attrs.width + "px"
      }
      if (node.attrs.height) {
        img.style.height = node.attrs.height + "px"
      }

      // 이미지 정렬 속성 설정
      if (node.attrs.align) {
        img.setAttribute('data-align', node.attrs.align)
      }

      let isDragging = false
      let startX = 0
      let startY = 0
      let startWidth = 0
      let startHeight = 0
      let aspectRatio = 1

      // 커서 방향 매핑
      const cursorMap: Record<string, string> = {
        nw: "nwse-resize",
        ne: "nesw-resize",
        sw: "nesw-resize",
        se: "nwse-resize",
        n: "ns-resize",
        s: "ns-resize",
        w: "ew-resize",
        e: "ew-resize",
      }

      const createHandle = (position: string) => {
        const handle = document.createElement("div")
        handle.className = `resize-handle resize-handle-${position}`
        handle.style.cssText = `
          position: absolute;
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          cursor: ${cursorMap[position]};
          display: none;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        `

        switch (position) {
          case "nw":
            handle.style.cssText += "top: -6px; left: -6px;"
            break
          case "ne":
            handle.style.cssText += "top: -6px; right: -6px;"
            break
          case "sw":
            handle.style.cssText += "bottom: -6px; left: -6px;"
            break
          case "se":
            handle.style.cssText += "bottom: -6px; right: -6px;"
            break
          case "n":
            handle.style.cssText += "top: -6px; left: 50%; transform: translateX(-50%);"
            break
          case "s":
            handle.style.cssText += "bottom: -6px; left: 50%; transform: translateX(-50%);"
            break
          case "w":
            handle.style.cssText += "top: 50%; left: -6px; transform: translateY(-50%);"
            break
          case "e":
            handle.style.cssText += "top: 50%; right: -6px; transform: translateY(-50%);"
            break
        }

        // 이벤트 핸들러 참조를 저장하여 나중에 제거할 수 있도록 함
        const handlePointerDown = (e: PointerEvent) => {
          e.preventDefault()
          e.stopPropagation()
          isDragging = true
          startX = e.clientX
          startY = e.clientY
          startWidth = img.offsetWidth
          startHeight = img.offsetHeight
          aspectRatio = startWidth / startHeight

          const handlePointerMove = (e: PointerEvent) => {
            if (!isDragging) return

            const deltaX = e.clientX - startX
            const deltaY = e.clientY - startY
            let newWidth = startWidth
            let newHeight = startHeight

            if (position.includes("e")) newWidth = startWidth + deltaX
            if (position.includes("w")) newWidth = startWidth - deltaX
            if (position.includes("s")) newHeight = startHeight + deltaY
            if (position.includes("n")) newHeight = startHeight - deltaY

            // 최소/최대 크기 제한
            newWidth = Math.max(100, Math.min(800, newWidth))
            newHeight = Math.max(100, Math.min(600, newHeight))

            if (e.shiftKey || ["nw", "ne", "sw", "se"].includes(position)) {
              if (position.includes("e") || position.includes("w")) {
                newHeight = newWidth / aspectRatio
              } else {
                newWidth = newHeight * aspectRatio
              }
            }

            img.style.transition = "none"
            img.style.width = newWidth + "px"
            img.style.height = newHeight + "px"
          }

          const handlePointerUp = () => {
            if (isDragging) {
              isDragging = false
              let pos: number | null = null
              try {
                const p = getPos?.()
                pos = typeof p === "number" ? p : null
              } catch {
                pos = null
              }
              
              if (pos != null) {
                // 크기 조절 완료 후 부드러운 전환
                img.style.transition = "all 0.2s ease"
                editor
                  .chain()
                  .focus()
                  .setNodeSelection(pos)
                  .updateAttributes("image", {
                    width: img.offsetWidth,
                    height: img.offsetHeight,
                  })
                  .run()
              }
            }
            document.removeEventListener("pointermove", handlePointerMove)
            document.removeEventListener("pointerup", handlePointerUp)
          }

          document.addEventListener("pointermove", handlePointerMove)
          document.addEventListener("pointerup", handlePointerUp)
        }

        // 마우스 이벤트도 지원 (기존 호환성)
        const handleMouseDown = (e: MouseEvent) => {
          handlePointerDown(e as unknown as PointerEvent)
        }

        handle.addEventListener("pointerdown", handlePointerDown)
        handle.addEventListener("mousedown", handleMouseDown)

        // 호버 효과 추가
        handle.addEventListener("mouseenter", () => {
          handle.style.transform = "scale(1.2)"
          handle.style.background = "#2563eb"
        })
        handle.addEventListener("mouseleave", () => {
          handle.style.transform = "scale(1)"
          handle.style.background = "#3b82f6"
        })

        return handle
      }

      const handles = ["nw", "ne", "sw", "se", "n", "s", "w", "e"].map(createHandle)
      handles.forEach((handle) => container.appendChild(handle))

      const showHandles = () => {
        container.style.outline = "2px solid #3b82f6"
        handles.forEach((handle) => (handle.style.display = "block"))
      }

      const hideHandles = () => {
        container.style.outline = "none"
        handles.forEach((handle) => (handle.style.display = "none"))
      }

      // 클릭 이벤트 핸들러 참조 저장
      const handleImageClick = (e: Event) => {
        e.preventDefault()
        showHandles()
        let pos: number | null = null
        try {
          const p = getPos?.()
          pos = typeof p === "number" ? p : null
        } catch {
          pos = null
        }
        
        if (pos != null) {
          editor.commands.setNodeSelection(pos)
        }
      }

      const handleSelectionUpdate = () => {
        const { from, to } = editor.state.selection
        let currentPos: number | null = null
        try {
          const p = getPos?.()
          currentPos = typeof p === "number" ? p : null
        } catch {
          currentPos = null
        }

        if (currentPos != null && (from !== currentPos || to !== currentPos + 1)) {
          hideHandles()
        }
      }

      const handleEditorClick = () => {
        setTimeout(() => {
          const { from, to } = editor.state.selection
          let currentPos: number | null = null
          try {
            const p = getPos?.()
            currentPos = typeof p === "number" ? p : null
          } catch {
            currentPos = null
          }

          if (currentPos != null && (from !== currentPos || to !== currentPos + 1)) {
            hideHandles()
          }
        }, 10)
      }

      editor.on("selectionUpdate", handleSelectionUpdate)
      editor.on("focus", handleEditorClick)

      img.addEventListener("click", handleImageClick)
      container.appendChild(img)

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false

          img.src = updatedNode.attrs.src
          img.alt = updatedNode.attrs.alt || ""

          if (updatedNode.attrs.width) {
            img.style.width = updatedNode.attrs.width + "px"
          }
          if (updatedNode.attrs.height) {
            img.style.height = updatedNode.attrs.height + "px"
          }

          // 컨테이너 정렬 업데이트
          if (updatedNode.attrs.align === 'center') {
            container.style.cssText = "position: relative; display: block; max-width: 100%; text-align: center; margin: 1rem 0;"
          } else if (updatedNode.attrs.align === 'right') {
            container.style.cssText = "position: relative; display: block; max-width: 100%; text-align: right; margin: 1rem 0;"
          } else {
            container.style.cssText = "position: relative; display: block; max-width: 100%; text-align: left; margin: 1rem 0;"
          }

          // 이미지 정렬 속성 업데이트
          if (updatedNode.attrs.align) {
            img.setAttribute('data-align', updatedNode.attrs.align)
          }

          return true
        },
        destroy: () => {
          editor.off("selectionUpdate", handleSelectionUpdate)
          editor.off("focus", handleEditorClick)
          img.removeEventListener("click", handleImageClick)
        },
      }
    }
  },
  addCommands() {
    return {
      setImage: (options: { src: string; alt?: string }) => ({ commands }: { commands: { insertContent: (content: { type: string; attrs: { src: string; alt?: string } }) => boolean } }) => {
        return commands.insertContent({
          type: 'image',
          attrs: options,
        })
      },
      setImageAlign: (align: string) => ({ commands }: { commands: { updateAttributes: (type: string, attrs: { align: string }) => boolean } }) => {
        return commands.updateAttributes('image', { align })
      },
    }
  },
})

// 커스텀 텍스트 스타일 확장
const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => {
          const v = (element as HTMLElement).style?.fontSize
          return v ? v.replace(/['"]+/g, "") : null
        },
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {}
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          }
        },
      },
    }
  },
})

// 텍스트 정렬 기능을 CustomTextStyle에 통합
const TextAlign = TextStyle.extend({
  name: 'textAlign',
  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          textAlign: {
            default: 'left',
            parseHTML: (element: HTMLElement) => element.style.textAlign || 'left',
            renderHTML: (attributes: { textAlign?: string }) => {
              if (!attributes.textAlign || attributes.textAlign === 'left') {
                return {}
              }
              return { style: `text-align: ${attributes.textAlign}` }
            },
          },
        },
      },
    ]
  },
})

export interface TextEditorProps {
  /** 초기 내용 */
  initialContent?: string
  /** 에디터 높이 (기본: 400px) */
  height?: string
  /** 서식 도구 표시 여부 (기본: true) */
  showFormatting?: boolean
  /** 글씨 크기 도구 표시 여부 (기본: true) */
  showFontSize?: boolean
  /** 글씨 색상 도구 표시 여부 (기본: true) */
  showTextColor?: boolean
  /** 이미지 삽입 도구 표시 여부 (기본: true) */
  showImageUpload?: boolean
  /** 이미지 업로드 도메인 타입 (기본: NOTICE) */
  imageDomainType?: 'NOTICE' | 'ANSWER' | 'FAQ' | 'COURSE' | 'QUESTION' | 'EVENT' | 'MAIN_BANNER' | 'MAIN_SPONSOR'
  /** 이미지 업로드 서버 타입 (기본: admin) */
  imageServerType?: 'admin' | 'user'
  /** 플레이스홀더 텍스트 */
  placeholder?: string
  /** 에디터 내용 변경 시 콜백 */
  onChange?: (content: string) => void
  /** 에디터가 준비되었을 때 콜백 */
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent = "",
  height = "400px",
  showFormatting = true,
  showFontSize = true,
  showTextColor = true,
  showImageUpload = true,
  imageDomainType = 'NOTICE',
  imageServerType = 'admin',
  placeholder = "내용을 작성해주세요...",
  onChange,
  onEditorReady,
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const [fontSize, setFontSize] = useState("default")
  const [textColor, setTextColor] = useState("default")

  // 클라이언트 사이드에서만 마운트 상태를 true로 설정
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const compressedHtml = compressHtml(html);
      onChange?.(compressedHtml);
    },
    // SSR 오류 방지를 위한 설정
    immediatelyRender: false,
  })

  // 에디터가 준비되면 콜백 호출
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  // initialContent 변경 시 동기화
  useEffect(() => {
    if (!editor) return
    
    const current = editor.getHTML()
    const targetContent = initialContent || '<p></p>'
    
    // 내용이 실제로 변경되었을 때만 업데이트
    if (current !== targetContent) {
      editor.commands.setContent(targetContent)
    }
  }, [editor, initialContent])

  // 선택 상태와 UI 동기화
  useEffect(() => {
    if (!editor) return
    
    const updateUI = () => {
      const attrs = editor.getAttributes("textStyle")
      setFontSize(attrs.fontSize ?? "default")
      
      // color는 별도로 확인
      const colorMark = editor.getAttributes("color")
      setTextColor(colorMark.color ?? "default")
    }
    
    editor.on("selectionUpdate", updateUI)
    editor.on("transaction", updateUI)
    
    return () => {
      editor.off("selectionUpdate", updateUI)
      editor.off("transaction", updateUI)
    }
  }, [editor])

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files.length > 0 && editor) {
        // 이미지 압축 함수
        const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
          return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = document.createElement('img')
            
            img.onload = () => {
              // 원본 비율 유지하면서 크기 조정
              const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
              const width = img.width * ratio
              const height = img.height * ratio
              
              canvas.width = width
              canvas.height = height
              
              // 이미지 그리기
              ctx?.drawImage(img, 0, 0, width, height)
              
              // 압축된 이미지를 Blob으로 변환
              canvas.toBlob((blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  })
                  resolve(compressedFile)
                } else {
                  resolve(file) // 압축 실패 시 원본 반환
                }
              }, 'image/jpeg', quality)
            }
            
            img.src = URL.createObjectURL(file)
          })
        }
        
        // 병렬 업로드 처리
        const uploadPromises = Array.from(files).map(async (file) => {
          try {
            // 이미지 압축 (2MB 이상인 경우만)
            const processedFile = file.size > 2 * 1024 * 1024 ? await compressImage(file) : file
            
            // 새로운 이미지 업로드 API 사용
            const { uploadImage } = await import('@/services/imageUpload');
            
            const result = await uploadImage(processedFile, imageDomainType as 'QUESTION')
            
            // 업로드된 이미지 URL로 에디터에 삽입
            const imageUrl: string = result.imgSrc
            if (imageUrl) {
              return {
                src: imageUrl,
                alt: file.name || '이미지'
              }
            } else {
              throw new Error('서버에서 이미지 URL을 반환하지 않았습니다.')
            }
            
          } catch (error) {
            
            // API 실패 시 Base64 방식으로 폴백
            return new Promise<{src: string, alt: string}>((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                const src = e.target?.result as string
                if (src) {
                  resolve({
                    src: src,
                    alt: file.name || '이미지'
                  })
                }
              }
              reader.readAsDataURL(file)
            })
          }
        })
        
        // 모든 업로드 완료 후 에디터에 삽입
        const results = await Promise.all(uploadPromises)
        results.forEach((result) => {
          if (result) {
            (editor.chain().focus() as unknown as { setImage: (options: { src: string; alt?: string }) => { run: () => void } }).setImage(result).run()
          }
        })
        
        // 파일 입력 초기화
        event.target.value = ""
      }
    },
    [editor, imageDomainType, imageServerType],
  )

  const setFontSizeHandler = useCallback(
    (size: string) => {
      setFontSize(size)
      if (!editor) return

      if (size === "default") {
        editor.chain().focus().updateAttributes("textStyle", { fontSize: null }).run()
      } else {
        editor.chain().focus().setMark("textStyle", { fontSize: size }).run()
      }
    },
    [editor],
  )

  const setTextColorHandler = useCallback(
    (color: string) => {
      setTextColor(color)
      if (!editor) return

      if (color === "default") {
        editor.chain().focus().unsetColor().run()
      } else {
        editor.chain().focus().setColor(color).run()
      }
    },
    [editor],
  )

  // 클라이언트 사이드에서만 에디터 렌더링
  if (!isMounted || !editor) {
    return (
      <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-center h-32 text-gray-500">
            에디터를 불러오는 중...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* 툴바 */}
      <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* 실행 취소/다시 실행 */}
          <div className="flex items-center gap-1 mr-4">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="실행 취소"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="다시 실행"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* 구분선 */}
          <div className="w-px h-6 bg-gray-300" />

          {/* 서식 도구 */}
          {showFormatting && (
            <>
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-md transition-colors ${
                  editor.isActive("bold") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="굵게"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-md transition-colors ${
                  editor.isActive("italic") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="기울임"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded-md transition-colors ${
                  editor.isActive("strike") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="취소선"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </>
          )}

          {/* 텍스트 정렬 도구 */}
          <div className="w-px h-6 bg-gray-300" />
          <button
            onClick={() => {
              const { from: _from, to: _to } = editor.state.selection;
              editor.chain().focus().updateAttributes('paragraph', { textAlign: 'left' }).run();
            }}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('textAlign', { textAlign: 'left' }) 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="왼쪽 정렬"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const { from: _from, to: _to } = editor.state.selection;
              editor.chain().focus().updateAttributes('paragraph', { textAlign: 'center' }).run();
            }}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('textAlign', { textAlign: 'center' }) 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="가운데 정렬"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const { from: _from, to: _to } = editor.state.selection;
              editor.chain().focus().updateAttributes('paragraph', { textAlign: 'right' }).run();
            }}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('textAlign', { textAlign: 'right' }) 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="오른쪽 정렬"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const { from: _from, to: _to } = editor.state.selection;
              editor.chain().focus().updateAttributes('paragraph', { textAlign: 'justify' }).run();
            }}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('textAlign', { textAlign: 'justify' }) 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="양쪽 정렬"
          >
            <AlignJustify className="w-4 h-4" />
          </button>




          {/* 글씨 크기 도구 */}
          {showFontSize && (
            <>
              <div className="w-px h-6 bg-gray-300" />
              <select 
                value={fontSize}
                onChange={(e) => setFontSizeHandler(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="default">기본</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
              </select>
            </>
          )}

          {/* 글씨 색상 도구 */}
          {showTextColor && (
            <>
              <div className="w-px h-6 bg-gray-300" />
              <select 
                value={textColor}
                onChange={(e) => setTextColorHandler(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="default">기본</option>
                <option value="#000000">검정</option>
                <option value="#ef4444">빨강</option>
                <option value="#3b82f6">파랑</option>
                <option value="#22c55e">초록</option>
                <option value="#f59e0b">주황</option>
                <option value="#8b5cf6">보라</option>
                <option value="#ec4899">분홍</option>
                <option value="#6b7280">회색</option>
              </select>
            </>
          )}

          {/* 이미지 삽입 도구 */}
          {showImageUpload && (
            <>
              <div className="w-px h-6 bg-gray-300" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                className="cursor-pointer"
              >
                <button
                  type="button"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="이미지 삽입"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </label>
            </>
          )}

          {/* 이미지 정렬 도구 */}
          <div className="w-px h-6 bg-gray-300" />
          <button
            onClick={() => {
              if (editor.isActive('image')) {
                editor.commands.updateAttributes('image', { align: 'left' })
              }
            }}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('image', { align: 'left' }) 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="이미지 왼쪽 정렬"
          >
            <MoveLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (editor.isActive('image')) {
                editor.commands.updateAttributes('image', { align: 'center' })
              }
            }}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('image', { align: 'center' }) 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="이미지 가운데 정렬"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (editor.isActive('image')) {
                editor.commands.updateAttributes('image', { align: 'right' })
              }
            }}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('image', { align: 'right' }) 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title="이미지 오른쪽 정렬"
          >
            <MoveRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div
        className="bg-white"
        style={{ minHeight: height }}
      >
        <EditorContent
          editor={editor}
          className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none"
        />
        <style jsx global>{`
          .image-container {
            clear: both;
          }
          .image-container img {
            max-width: 100%;
            height: auto;
            vertical-align: top;
          }
          .prose img {
            max-width: 100%;
            height: auto;
          }
          .ProseMirror[data-placeholder] p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #9ca3af;
            pointer-events: none;
            height: 0;
          }
        `}</style>
      </div>
    </div>
  )
}

export default React.memo(TextEditor)