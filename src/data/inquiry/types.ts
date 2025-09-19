export type InquiryFile = {
    id: string | number;
    name: string;
    sizeMB: number;
    url?: string;
    mime?: string;
  };
  
  export type InquiryAnswer = {
    content: string;       // HTML
    author: string;        // 보통 '관리자'
    date: string;          // YYYY.MM.DD
    files?: InquiryFile[]; // 답변 첨부
  };
  
  export type Inquiry = {
    id: number;
    title: string;
    author: string;
    date: string;            // YYYY.MM.DD
    views?: number;
    content?: string;        // 질문 본문(텍스트/HTML)
    files?: InquiryFile[];   // 질문 첨부
    answer?: InquiryAnswer | null; // 관리자 답변(없을 수 있음)
  };
  
  export type InquiryFilter = {
    sort?: "new" | "old" | "hit" | "name";
    searchMode?: "post" | "name";
    q?: string;
  };
  
  export type Paged<T> = {
    rows: T[];
    total: number;
  };
  