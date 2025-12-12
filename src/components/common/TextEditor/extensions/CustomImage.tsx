import Image from "@tiptap/extension-image";

/**
 * 커스텀 이미지 확장
 * 이미지 크기 조절, 정렬 기능을 제공합니다.
 */
export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null as number | null,
        parseHTML: (element) => {
          const w = element.getAttribute("width") || (element as HTMLElement).style?.width;
          return w ? parseInt(String(w).replace("px", ""), 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            style: `width: ${attributes.width}px;`,
          };
        },
      },
      height: {
        default: null as number | null,
        parseHTML: (element) => {
          const h = element.getAttribute("height") || (element as HTMLElement).style?.height;
          return h ? parseInt(String(h).replace("px", ""), 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            style: `height: ${attributes.height}px;`,
          };
        },
      },
      align: {
        default: 'left',
        parseHTML: (element) => {
          const align = element.getAttribute("data-align") || (element as HTMLElement).style?.float || 'left';
          return align;
        },
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === 'left') {
            return {};
          }
          return {
            'data-align': attributes.align,
            style: `float: ${attributes.align}; margin: 0 ${attributes.align === 'center' ? 'auto' : attributes.align === 'right' ? '0 0 0 1rem' : '1rem 0 0 0'};`,
          };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement("div");
      container.className = "image-container";
      
      // 정렬에 따라 컨테이너 스타일 설정
      const getContainerStyle = (align: string) => {
        const baseStyle = "position: relative; display: block; max-width: 100%; margin: 1rem 0;";
        switch (align) {
          case 'center':
            return `${baseStyle} text-align: center;`;
          case 'right':
            return `${baseStyle} text-align: right;`;
          default:
            return `${baseStyle} text-align: left;`;
        }
      };
      
      container.style.cssText = getContainerStyle(node.attrs.align);
      container.draggable = false;

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.style.cssText = "display: inline-block; max-width: 100%; height: auto; cursor: pointer; position: relative;";

      if (node.attrs.width) {
        img.style.width = node.attrs.width + "px";
      }
      if (node.attrs.height) {
        img.style.height = node.attrs.height + "px";
      }

      // 이미지 정렬 속성 설정
      if (node.attrs.align) {
        img.setAttribute('data-align', node.attrs.align);
      }

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let aspectRatio = 1;

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
      };

      const createHandle = (position: string) => {
        const handle = document.createElement("div");
        handle.className = `resize-handle resize-handle-${position}`;
        
        const getHandlePosition = (pos: string) => {
          switch (pos) {
            case "nw": return "top: -6px; left: -6px;";
            case "ne": return "top: -6px; right: -6px;";
            case "sw": return "bottom: -6px; left: -6px;";
            case "se": return "bottom: -6px; right: -6px;";
            case "n": return "top: -6px; left: 50%; transform: translateX(-50%);";
            case "s": return "bottom: -6px; left: 50%; transform: translateX(-50%);";
            case "w": return "top: 50%; left: -6px; transform: translateY(-50%);";
            case "e": return "top: 50%; right: -6px; transform: translateY(-50%);";
            default: return "";
          }
        };

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
          ${getHandlePosition(position)}
        `;

        // 이벤트 핸들러 참조를 저장하여 나중에 제거할 수 있도록 함
        const handlePointerDown = (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = img.offsetWidth;
          startHeight = img.offsetHeight;
          aspectRatio = startWidth / startHeight;

          const handlePointerMove = (e: PointerEvent) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            let newWidth = startWidth;
            let newHeight = startHeight;

            if (position.includes("e")) newWidth = startWidth + deltaX;
            if (position.includes("w")) newWidth = startWidth - deltaX;
            if (position.includes("s")) newHeight = startHeight + deltaY;
            if (position.includes("n")) newHeight = startHeight - deltaY;

            // 최소/최대 크기 제한
            newWidth = Math.max(100, Math.min(800, newWidth));
            newHeight = Math.max(100, Math.min(600, newHeight));

            if (e.shiftKey || ["nw", "ne", "sw", "se"].includes(position)) {
              if (position.includes("e") || position.includes("w")) {
                newHeight = newWidth / aspectRatio;
              } else {
                newWidth = newHeight * aspectRatio;
              }
            }

            img.style.transition = "none";
            img.style.width = newWidth + "px";
            img.style.height = newHeight + "px";
          };

          const handlePointerUp = () => {
            if (isDragging) {
              isDragging = false;
              let pos: number | null = null;
              try {
                const p = getPos?.();
                pos = typeof p === "number" ? p : null;
              } catch {
                pos = null;
              }
              
              if (pos != null) {
                // 크기 조절 완료 후 부드러운 전환
                img.style.transition = "all 0.2s ease";
                editor
                  .chain()
                  .focus()
                  .setNodeSelection(pos)
                  .updateAttributes("image", {
                    width: img.offsetWidth,
                    height: img.offsetHeight,
                  })
                  .run();
              }
            }
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
          };

          document.addEventListener("pointermove", handlePointerMove);
          document.addEventListener("pointerup", handlePointerUp);
        };

        // 마우스 이벤트도 지원 (기존 호환성)
        const handleMouseDown = (e: MouseEvent) => {
          handlePointerDown(e as unknown as PointerEvent);
        };

        handle.addEventListener("pointerdown", handlePointerDown);
        handle.addEventListener("mousedown", handleMouseDown);

        // 호버 효과 추가
        handle.addEventListener("mouseenter", () => {
          handle.style.transform = "scale(1.2)";
          handle.style.background = "#2563eb";
        });
        handle.addEventListener("mouseleave", () => {
          handle.style.transform = "scale(1)";
          handle.style.background = "#3b82f6";
        });

        return handle;
      };

      const handles = ["nw", "ne", "sw", "se", "n", "s", "w", "e"].map(createHandle);
      handles.forEach((handle) => container.appendChild(handle));

      const showHandles = () => {
        container.style.outline = "2px solid #3b82f6";
        handles.forEach((handle) => (handle.style.display = "block"));
      };

      const hideHandles = () => {
        container.style.outline = "none";
        handles.forEach((handle) => (handle.style.display = "none"));
      };

      // 클릭 이벤트 핸들러 참조 저장
      const handleImageClick = (e: Event) => {
        e.preventDefault();
        showHandles();
        let pos: number | null = null;
        try {
          const p = getPos?.();
          pos = typeof p === "number" ? p : null;
        } catch {
          pos = null;
        }
        
        if (pos != null) {
          editor.commands.setNodeSelection(pos);
        }
      };

      const handleSelectionUpdate = () => {
        const { from, to } = editor.state.selection;
        let currentPos: number | null = null;
        try {
          const p = getPos?.();
          currentPos = typeof p === "number" ? p : null;
        } catch {
          currentPos = null;
        }

        if (currentPos != null && (from !== currentPos || to !== currentPos + 1)) {
          hideHandles();
        }
      };

      const handleEditorClick = () => {
        setTimeout(() => {
          const { from, to } = editor.state.selection;
          let currentPos: number | null = null;
          try {
            const p = getPos?.();
            currentPos = typeof p === "number" ? p : null;
          } catch {
            currentPos = null;
          }

          if (currentPos != null && (from !== currentPos || to !== currentPos + 1)) {
            hideHandles();
          }
        }, 10);
      };

      editor.on("selectionUpdate", handleSelectionUpdate);
      editor.on("focus", handleEditorClick);

      img.addEventListener("click", handleImageClick);
      container.appendChild(img);

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;

          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || "";

          if (updatedNode.attrs.width) {
            img.style.width = updatedNode.attrs.width + "px";
          }
          if (updatedNode.attrs.height) {
            img.style.height = updatedNode.attrs.height + "px";
          }

          // 컨테이너 정렬 업데이트
          container.style.cssText = getContainerStyle(updatedNode.attrs.align);

          // 이미지 정렬 속성 업데이트
          if (updatedNode.attrs.align) {
            img.setAttribute('data-align', updatedNode.attrs.align);
          }

          return true;
        },
        destroy: () => {
          editor.off("selectionUpdate", handleSelectionUpdate);
          editor.off("focus", handleEditorClick);
          img.removeEventListener("click", handleImageClick);
        },
      };
    };
  },
  addCommands() {
    return {
      setImage: (options: { src: string; alt?: string }) => ({ commands }: { commands: { insertContent: (content: { type: string; attrs: { src: string; alt?: string } }) => boolean } }) => {
        return commands.insertContent({
          type: 'image',
          attrs: options,
        });
      },
      setImageAlign: (align: string) => ({ commands }: { commands: { updateAttributes: (type: string, attrs: { align: string }) => boolean } }) => {
        return commands.updateAttributes('image', { align });
      },
    };
  },
});
