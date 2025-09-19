"use client"

import React, { useCallback, useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  ImageIcon, 
  Undo,
  Redo
} from "lucide-react"

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
    }
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement("div")
      container.className = "image-container"
      container.style.cssText = "position: relative; display: inline-block; max-width: 100%;"
      container.draggable = false

      const img = document.createElement("img")
      img.src = node.attrs.src
      img.alt = node.attrs.alt || ""
      img.style.cssText = "display: block; max-width: 100%; height: auto; cursor: pointer;"

      if (node.attrs.width) {
        img.style.width = node.attrs.width + "px"
      }
      if (node.attrs.height) {
        img.style.height = node.attrs.height + "px"
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
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border: 1px solid white;
          cursor: ${cursorMap[position]};
          display: none;
          z-index: 10;
        `

        switch (position) {
          case "nw":
            handle.style.cssText += "top: -4px; left: -4px;"
            break
          case "ne":
            handle.style.cssText += "top: -4px; right: -4px;"
            break
          case "sw":
            handle.style.cssText += "bottom: -4px; left: -4px;"
            break
          case "se":
            handle.style.cssText += "bottom: -4px; right: -4px;"
            break
          case "n":
            handle.style.cssText += "top: -4px; left: 50%; transform: translateX(-50%);"
            break
          case "s":
            handle.style.cssText += "bottom: -4px; left: 50%; transform: translateX(-50%);"
            break
          case "w":
            handle.style.cssText += "top: 50%; left: -4px; transform: translateY(-50%);"
            break
          case "e":
            handle.style.cssText += "top: 50%; right: -4px; transform: translateY(-50%);"
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

            newWidth = Math.max(50, newWidth)
            newHeight = Math.max(50, newHeight)

            if (e.shiftKey || ["nw", "ne", "sw", "se"].includes(position)) {
              if (position.includes("e") || position.includes("w")) {
                newHeight = newWidth / aspectRatio
              } else {
                newWidth = newHeight * aspectRatio
              }
            }

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
  /** 에디터 내용 변경 시 콜백 */
  onChange?: (content: string) => void
  /** 에디터가 준비되었을 때 콜백 */
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent = "<p>내용을 작성해주세요...</p>",
  height = "400px",
  showFormatting = true,
  showFontSize = true,
  showTextColor = true,
  showImageUpload = true,
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
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-6",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
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
  //useEffect(() => {
  //  if (editor && initialContent) {
  //    const current = editor.getHTML()
  //    if (current !== initialContent) {
  //      editor.commands.setContent(initialContent)
  //    }
  //  }
  //}, [initialContent, editor])
  useEffect(() => {
       if (!editor) return;
       // 초기값이 비어있어도 변경되면 반영
       const current = editor.getHTML();
       if (current !== (initialContent ?? '')) {
         editor.commands.setContent(initialContent ?? '');
       }
     }, [editor, initialContent]);

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
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('handleImageUpload 호출됨', event.target.files)
      const files = event.target.files
      if (files && files.length > 0 && editor) {
        console.log('파일 개수:', files.length)
        Array.from(files).forEach((file) => {
          console.log('처리 중인 파일:', file.name, file.type)
          const reader = new FileReader()
          reader.onload = (e) => {
            const src = e.target?.result as string
            if (src) {
              console.log('이미지 삽입 시도:', src.substring(0, 50) + '...')
              editor.chain().focus().setImage({ 
                src,
                alt: file.name || '이미지'
              }).run()
              console.log('이미지 삽입 완료')
            }
          }
          reader.onerror = () => {
            console.error('이미지 파일을 읽을 수 없습니다.')
          }
          reader.readAsDataURL(file)
        })
        // 파일 입력 초기화
        event.target.value = ""
      } else {
        console.log('파일이 없거나 에디터가 준비되지 않음')
      }
    },
    [editor],
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
      </div>
    </div>
  )
}

export default TextEditor