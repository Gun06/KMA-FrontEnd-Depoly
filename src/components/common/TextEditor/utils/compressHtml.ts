/**
 * HTML 내용을 압축하는 함수 (공백 및 줄바꿈 보존)
 * 연속된 공백을 &nbsp;로 변환하고, 빈 줄을 보존합니다.
 * @param html - 압축할 HTML 문자열
 * @param skipEmptyP - 빈 <p> 태그 처리를 스킵할지 여부 (색상 변경 시 사용)
 */
export const compressHtml = (html: string, skipEmptyP: boolean = false): string => {
  // 공백 보존: 연속된 공백을 &nbsp;로 변환하여 보존
  // 단, 시작과 끝의 공백만 제거 (전체 HTML 구조 유지)
  let result = html.trim();
  
  // DOM 파서를 사용하여 텍스트 노드의 공백을 보존
  if (typeof window !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(result, 'text/html');
      
      // 모든 텍스트 노드를 찾아서 공백 보존
      const walker = document.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      const textNodes: Text[] = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          textNodes.push(node as Text);
        }
      }
      
      // 텍스트 노드의 공백 보존
      textNodes.forEach(textNode => {
        if (textNode.textContent) {
          // 연속된 공백을 모두 &nbsp;로 변환하여 보존
          // 첫 번째 공백은 일반 공백으로 유지하고, 나머지는 &nbsp;로 변환
          const originalText = textNode.textContent;
          // 공백 2개 이상을 찾아서 변환
          const preservedText = originalText.replace(/  +/g, (spaces: string): string => {
            // 첫 번째 공백은 일반 공백, 나머지는 &nbsp;
            return ' ' + '\u00A0'.repeat(spaces.length - 1);
          });
          // 단일 공백도 보존하기 위해, 단일 공백이 연속으로 나오는 경우도 처리
          // 하지만 단일 공백은 HTML에서 기본적으로 보존되므로, 연속된 공백만 처리
          if (preservedText !== originalText) {
            textNode.textContent = preservedText;
          }
        }
      });
      
      // 색상 변경으로 생성된 빈 <p> 태그 처리 (개행 중복 방지)
      // skipEmptyP가 true일 때만 수행 (색상 변경 시)
      if (skipEmptyP) {
        // 색상 변경으로 생성된 빈 <p> 태그를 제거하거나 정리
        const paragraphsToProcess: HTMLParagraphElement[] = [];
        doc.body.querySelectorAll('p').forEach(p => {
          const textContent = p.textContent?.trim() || '';
          const innerHTML = p.innerHTML.trim();
          const hasBr = p.querySelector('br') !== null;
          
          // 텍스트가 없고 <br>이 없는 빈 <p> 태그만 처리
          if (textContent === '' && !hasBr) {
            // 색상이 있는 span만 있는지 확인
            const spans = p.querySelectorAll('span[style*="color"]');
            const hasColorSpans = spans.length > 0;
            
            if (hasColorSpans) {
              // 색상이 있는 span만 있는 경우 - 모두 비어있는지 확인
              const allSpansEmpty = Array.from(spans).every(span => {
                return !span.textContent?.trim();
              });
              
              if (allSpansEmpty) {
                // 색상이 있는 빈 span만 있는 경우 제거 (색상 변경으로 생성된 빈 태그)
                paragraphsToProcess.push(p);
              }
            } else if (innerHTML === '' || innerHTML === '&nbsp;') {
              // 색상이 없고 완전히 빈 경우는 제거하지 않음
              // (사용자가 엔터를 친 경우일 수 있지만, 색상 변경 중이므로 스킵)
            }
          }
        });
        paragraphsToProcess.forEach(p => p.remove());
      }
      
      // 연속된 <br> 태그만 제거 (개행 중복 방지, 하지만 기존 개행은 보존)
      // 색상 변경 시 생성된 중복만 처리하고, 사용자가 입력한 개행은 절대 건드리지 않음
      doc.body.querySelectorAll('p').forEach(p => {
        const childNodes = Array.from(p.childNodes);
        let prevIsBr = false;
        
        childNodes.forEach((node) => {
          if (node.nodeName === 'BR') {
            if (prevIsBr) {
              // 연속된 <br> 태그만 제거 (하나만 남김) - 사용자가 엔터를 여러 번 친 경우만 처리
              node.remove();
            } else {
              prevIsBr = true;
            }
          } else {
            // 텍스트나 다른 요소가 있으면 <br> 리셋
            prevIsBr = false;
          }
        });
      });
      
      // 빈 <p> 태그를 <p><br></p>로 변환하여 개행 보존 (사용자가 엔터를 친 경우만)
      // skipEmptyP가 true면 빈 <p> 태그 처리를 스킵 (색상 변경 시 개행 중복 방지)
      if (!skipEmptyP) {
        const allParagraphs = Array.from(doc.body.querySelectorAll('p'));
        allParagraphs.forEach(p => {
        // 이미 <br>이 있으면 건너뛰기 (개행 이미 존재)
        if (p.querySelector('br')) {
          return;
        }
        
        // 실제로 비어있는지 확인
        const textContent = p.textContent?.trim() || '';
        const innerHTML = p.innerHTML.trim();
        
        // 색상이 있는 span만 있는 경우는 색상 변경으로 인한 것이므로 처리하지 않음
        const spans = p.querySelectorAll('span[style*="color"]');
        if (spans.length > 0) {
          const allSpansEmpty = Array.from(spans).every(span => {
            return !span.textContent?.trim();
          });
          // 색상이 있는 빈 span만 있는 경우는 색상 변경으로 인한 것이므로 건너뛰기
          if (allSpansEmpty && textContent === '') {
            return;
          }
        }
        
        // 완전히 빈 <p> 태그인 경우만 <br> 추가 (사용자가 엔터를 친 경우)
        // 단, 색상이 있는 요소가 있으면 제외 (색상 변경으로 인한 것)
        if (textContent === '' && (innerHTML === '' || innerHTML === '&nbsp;')) {
          // 색상 관련 스타일이 있는지 확인
          const hasColorStyle = p.querySelector('[style*="color"]');
          if (!hasColorStyle) {
          p.innerHTML = '<br>';
          }
          return;
        }
        
        // &nbsp;만 있는 경우도 빈 줄로 처리 (단, 색상 스타일이 없을 때만)
        if (textContent === '' && innerHTML.replace(/&nbsp;/g, '').replace(/\s/g, '') === '') {
          const hasColorStyle = p.querySelector('[style*="color"]');
          if (!hasColorStyle) {
          p.innerHTML = '<br>';
          }
          return;
        }
        
        // 텍스트가 없는 경우 - span 등 인라인 요소만 있는지 확인
        if (textContent === '') {
          // 색상이 있는 요소가 있으면 색상 변경으로 인한 것이므로 건너뛰기
          const hasColorStyle = p.querySelector('[style*="color"]');
          if (hasColorStyle) {
            return;
          }
          
          // 모든 자식 요소가 텍스트 없이 비어있는지 확인
          const children = Array.from(p.childNodes);
          const hasOnlyEmptyElements = children.every(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              return !node.textContent?.trim();
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
              const elem = node as Element;
              return !elem.textContent?.trim();
            }
            return false;
          });
          
          if (hasOnlyEmptyElements) {
            // 모든 요소가 비어있고 색상 스타일이 없을 때만 개행 보존을 위해 <br> 추가
          p.innerHTML = '<br>';
          }
        }
      });
      }
      
      result = doc.body.innerHTML;
    } catch (e) {
      // 파싱 실패 시 정규식 방식으로 폴백
      result = result.replace(/(>)([^<]+)(<)/g, (match: string, openTag: string, text: string, closeTag: string): string => {
        const preservedText = text.replace(/  +/g, (spaces: string): string => {
          return ' ' + '&nbsp;'.repeat(spaces.length - 1);
        });
        return openTag + preservedText + closeTag;
      });
      // 연속된 <br> 태그만 제거 (정규식으로 처리)
      // <p> 태그 안의 연속된 <br> 태그를 하나로 통합 (기존 개행은 보존)
      result = result.replace(/(<p[^>]*>)(.*?)(<\/p>)/gi, (match, openTag, content, closeTag) => {
        // 연속된 <br> 태그를 하나로 통합 (사용자가 여러 번 엔터를 친 경우만 처리)
        const cleanedContent = content.replace(/(<br\s*\/?>){2,}/gi, '<br>');
        return openTag + cleanedContent + closeTag;
      });
      
      // 빈 <p> 태그를 <p><br></p>로 변환하여 개행 보존 (사용자가 엔터를 친 경우만)
      // skipEmptyP가 true면 빈 <p> 태그 처리를 스킵 (색상 변경 시 개행 중복 방지)
      if (!skipEmptyP) {
        result = result.replace(/<p[^>]*>\s*<\/p>/gi, '<p><br></p>');
        // &nbsp;만 있는 경우는 색상 span이 있을 수 있으므로 처리하지 않음 (DOM 파서에서 처리)
      }
    }
  } else {
    // 서버 사이드에서는 정규식 방식 사용
    result = result.replace(/(>)([^<]+)(<)/g, (match: string, openTag: string, text: string, closeTag: string): string => {
      const preservedText = text.replace(/  +/g, (spaces: string): string => {
        return ' ' + '&nbsp;'.repeat(spaces.length - 1);
      });
      return openTag + preservedText + closeTag;
    });
    // 연속된 <br> 태그만 제거 (기존 개행은 보존)
    result = result.replace(/(<p[^>]*>)(.*?)(<\/p>)/gi, (match, openTag, content, closeTag) => {
      // 연속된 <br> 태그를 하나로 통합 (사용자가 여러 번 엔터를 친 경우만 처리)
      const cleanedContent = content.replace(/(<br\s*\/?>){2,}/gi, '<br>');
      return openTag + cleanedContent + closeTag;
    });
    // 서버 사이드에서는 정규식으로 정확한 확인이 어려우므로
    // skipEmptyP가 true면 빈 <p> 태그 처리를 스킵 (색상 변경 시 개행 중복 방지)
    if (!skipEmptyP) {
      result = result.replace(/<p[^>]*>\s*<\/p>/gi, '<p><br></p>');
      // &nbsp;만 있는 경우는 색상 span이 있을 수 있으므로 처리하지 않음
    }
  }
  
  return result;
};
