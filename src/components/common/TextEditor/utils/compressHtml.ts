/**
 * HTML 내용을 압축하는 함수 (공백 및 줄바꿈 보존)
 * 연속된 공백을 &nbsp;로 변환하고, 빈 줄을 보존합니다.
 */
export const compressHtml = (html: string): string => {
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
      
      // 빈 <p> 태그를 <p><br></p>로 변환하여 빈 줄 보존
      const paragraphs = Array.from(doc.body.querySelectorAll('p'));
      paragraphs.forEach(p => {
        // 텍스트가 없거나 공백만 있는 경우
        const textContent = p.textContent?.trim() || '';
        const innerHTML = p.innerHTML.trim();
        const hasBlockContent = p.querySelector('br, img');
        const hasInlineContent = p.querySelector('strong, em, span, a, code');
        
        // 완전히 빈 경우 또는 공백만 있는 경우
        if ((textContent === '' && innerHTML === '') || 
            (textContent === '' && !hasBlockContent && !hasInlineContent)) {
          // 빈 줄을 보존하기 위해 <br> 추가
          p.innerHTML = '<br>';
        } else if (textContent === '' && !hasBlockContent && hasInlineContent) {
          // 인라인 요소만 있고 텍스트가 없는 경우도 빈 줄로 처리
          p.innerHTML = '<br>';
        } else if (textContent === '' && innerHTML === '&nbsp;') {
          // &nbsp;만 있는 경우도 빈 줄로 처리
          p.innerHTML = '<br>';
        } else if (textContent === '' && innerHTML.replace(/&nbsp;/g, '').trim() === '') {
          // &nbsp;만 있는 경우도 빈 줄로 처리
          p.innerHTML = '<br>';
        }
      });
      
      result = doc.body.innerHTML;
    } catch (e) {
      // 파싱 실패 시 정규식 방식으로 폴백
      result = result.replace(/(>)([^<]+)(<)/g, (match: string, openTag: string, text: string, closeTag: string): string => {
        const preservedText = text.replace(/  +/g, (spaces: string): string => {
          return ' ' + '&nbsp;'.repeat(spaces.length - 1);
        });
        return openTag + preservedText + closeTag;
      });
      // 빈 <p> 태그 처리
      result = result.replace(/<p><\/p>/g, '<p><br></p>');
      result = result.replace(/<p>\s*<\/p>/g, '<p><br></p>');
    }
  } else {
    // 서버 사이드에서는 정규식 방식 사용
    result = result.replace(/(>)([^<]+)(<)/g, (match: string, openTag: string, text: string, closeTag: string): string => {
      const preservedText = text.replace(/  +/g, (spaces: string): string => {
        return ' ' + '&nbsp;'.repeat(spaces.length - 1);
      });
      return openTag + preservedText + closeTag;
    });
    // 빈 <p> 태그 처리
    result = result.replace(/<p><\/p>/g, '<p><br></p>');
    result = result.replace(/<p>\s*<\/p>/g, '<p><br></p>');
  }
  
  return result;
};
