// isomorphic-dompurify 타입 선언 (패키지 타입 미설치 시 TS 오류 방지)
declare module 'isomorphic-dompurify' {
  const DOMPurify: {
    sanitize: (html: string, options?: Record<string, unknown>) => string
  };
  export default DOMPurify;
}


