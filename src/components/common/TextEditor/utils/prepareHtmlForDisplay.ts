/**
 * 읽기를 위해 HTML을 준비하는 함수
 * 빈 <p> 태그를 <p><br></p>로 변환하여 개행 표시
 * 링크는 새 탭에서 열리도록 target/_blank 보강
 */

const LINK_REL = 'noopener noreferrer nofollow';

/** 모든 <a>에 target="_blank" + 안전한 rel을 보장합니다. */
export const ensureLinksOpenInNewTab = (html: string): string => {
  if (!html) return html;

  return html.replace(/<a\b([^>]*)>/gi, (_match, rawAttrs: string) => {
    let attrs = rawAttrs;

    if (/\btarget\s*=/i.test(attrs)) {
      attrs = attrs.replace(/\btarget\s*=\s*(['"]).*?\1/i, 'target="_blank"');
      attrs = attrs.replace(/\btarget\s*=\s*[^\s>'"]+/i, 'target="_blank"');
    } else {
      attrs += ' target="_blank"';
    }

    if (/\brel\s*=/i.test(attrs)) {
      attrs = attrs.replace(/\brel\s*=\s*(['"])(.*?)\1/i, (_m, q, value: string) => {
        const parts = new Set(
          String(value)
            .split(/\s+/)
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean)
        );
        LINK_REL.split(' ').forEach((token) => parts.add(token));
        return `rel=${q}${Array.from(parts).join(' ')}${q}`;
      });
    } else {
      attrs += ` rel="${LINK_REL}"`;
    }

    return `<a${attrs}>`;
  });
};

export const prepareHtmlForDisplay = (html: string): string => {
  if (!html) return html;

  const withNewTabLinks = ensureLinksOpenInNewTab(html);

  if (typeof window === 'undefined') return withNewTabLinks;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(withNewTabLinks, 'text/html');

    // 모든 <p> 태그를 순회하며 빈 태그만 처리
    const allParagraphs = Array.from(doc.body.querySelectorAll('p'));
    allParagraphs.forEach((p) => {
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

    doc.body.querySelectorAll('a').forEach((a) => {
      a.setAttribute('target', '_blank');
      const relParts = new Set(
        (a.getAttribute('rel') || '')
          .split(/\s+/)
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean)
      );
      LINK_REL.split(' ').forEach((token) => relParts.add(token));
      a.setAttribute('rel', Array.from(relParts).join(' '));
    });

    return doc.body.innerHTML;
  } catch {
    // 파싱 실패 시 링크만 보강한 원본 반환
    return withNewTabLinks;
  }
};
