/**
 * 읽기를 위해 HTML을 준비하는 함수
 * 빈 <p> 태그를 <p><br></p>로 변환하여 개행 표시
 */
export const prepareHtmlForDisplay = (html: string): string => {
  if (typeof window === 'undefined') return html;
  if (!html) return html;
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 모든 <p> 태그를 순회하며 빈 태그만 처리
    const allParagraphs = Array.from(doc.body.querySelectorAll('p'));
    allParagraphs.forEach(p => {
      // 이미 <br> 태그가 있으면 건드리지 않음
      const hasBr = p.querySelector('br') !== null;
      if (hasBr) {
        return;
      }
      
      // 텍스트 내용 확인
      const textContent = (p.textContent || '').trim();
      const innerHTML = (p.innerHTML || '').trim();
      
      // 완전히 빈 <p> 태그만 처리
      if (textContent === '') {
        if (innerHTML === '' || innerHTML === '&nbsp;') {
          p.innerHTML = '<br>';
        }
      }
    });
    
    return doc.body.innerHTML;
  } catch (e) {
    // 파싱 실패 시 원본 반환
    return html;
  }
};
