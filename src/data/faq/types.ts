export type FaqFile = {
    id: string | number;
    name: string;
    sizeMB: number;
    url?: string;
    mime?: string;
  };
  
  export type FaqAnswer = {
    content: string;   // HTML
    author: string;    // 보통 '관리자'
    date: string;      // YYYY.MM.DD
    files?: FaqFile[];
  };
  
  export type Faq = {
    id: number;
    title: string;         // 게시글명
    author: string;        // 작성자
    date: string;          // YYYY.MM.DD
    views: number;
    question: string;      // HTML
    files?: FaqFile[];
    answer?: FaqAnswer | null;
  };
  
  export type FaqFilter = {
    sort?: "new" | "old" | "hit" | "name";
    searchMode?: "post" | "name";
    q?: string;
  };
  
  export type Paged<T> = {
    rows: T[];
    total: number;
  };
  