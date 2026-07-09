export type InquirySearchMode = 'all' | 'name' | 'post';

export type InquiryListQuery = {
  page?: number;
  keyword?: string;
  searchKey?: InquirySearchMode;
  isAnswered?: boolean;
};

type SearchParamsLike = {
  get: (key: string) => string | null;
};

const SEARCH_MODE_VALUES = new Set<InquirySearchMode>(['all', 'name', 'post']);

export function parseInquiryListQuery(searchParams: SearchParamsLike): InquiryListQuery {
  const pageValue = searchParams.get('page');
  const parsedPage = pageValue ? Number(pageValue) : undefined;

  const keyword = searchParams.get('keyword')?.trim() || undefined;

  const searchKeyRaw = searchParams.get('searchKey');
  const searchKey =
    searchKeyRaw && SEARCH_MODE_VALUES.has(searchKeyRaw as InquirySearchMode)
      ? (searchKeyRaw as InquirySearchMode)
      : undefined;

  const isAnsweredValue = searchParams.get('isAnswered');
  let isAnswered: boolean | undefined;
  if (isAnsweredValue === 'true') isAnswered = true;
  else if (isAnsweredValue === 'false') isAnswered = false;

  return {
    page: parsedPage && !Number.isNaN(parsedPage) && parsedPage > 0 ? parsedPage : undefined,
    keyword,
    searchKey,
    isAnswered,
  };
}

export function buildInquiryListQueryString(
  query: InquiryListQuery,
  baseParams?: URLSearchParams
): string {
  const params = new URLSearchParams(baseParams?.toString() ?? '');

  params.delete('page');
  params.delete('keyword');
  params.delete('searchKey');
  params.delete('isAnswered');

  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.keyword?.trim()) params.set('keyword', query.keyword.trim());
  if (query.searchKey && query.searchKey !== 'all') params.set('searchKey', query.searchKey);
  if (query.isAnswered === true) params.set('isAnswered', 'true');
  else if (query.isAnswered === false) params.set('isAnswered', 'false');

  return params.toString();
}

export function appendInquiryListQuery(basePath: string, query: InquiryListQuery): string {
  const qs = buildInquiryListQueryString(query);
  return qs ? `${basePath}?${qs}` : basePath;
}

export function buildInquiryListReturnUrl(
  listPath: string,
  searchParams: SearchParamsLike
): string {
  return appendInquiryListQuery(listPath, parseInquiryListQuery(searchParams));
}
