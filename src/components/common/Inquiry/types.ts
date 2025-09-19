export interface InquiryItem {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status: 'pending' | 'answered' | 'closed';
  category: string;
  priority: 'low' | 'medium' | 'high';
}

export interface InquiryFilter {
  status?: string;
  category?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface InquiryFormData {
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

export interface InquiryResponse {
  id: string;
  inquiryId: string;
  content: string;
  author: string;
  createdAt: string;
  isAdmin: boolean;
}
