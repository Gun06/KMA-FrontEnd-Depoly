export interface NoticeItem {
  id: string;
  date: string;
  category?: '대회' | '이벤트' | '안내';
  title: string;
  description: string;
  link?: string;
}
