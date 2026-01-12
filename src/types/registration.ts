// 신청자 관리 관련 타입 정의
export interface RegistrationItem {
  registrationId: string;        // 서버에서 내려주는 registrationId
  no?: number;                    // 서버에서 내려주는 번호 (페이지네이션 기준)
  id: string;                     // 기존 호환성 유지
  account?: string;               // 계정 (아이디)
  email?: string;
  userName?: string;               // 목록 API용
  name: string;                   // 서버에서 내려주는 name (필수)
  eventName?: string;
  categoryName?: string;          // 목록 API용
  eventCategoryName?: string;     // 서버에서 내려주는 eventCategoryName
  eventCategory?: string;         // 상세 API용
  birth: string;
  gender: string;                 // 'M' | 'F' 또는 '남' | '여'
  phNum: string;                  // 서버에서 내려주는 phNum
  registrationDate: string;       // 서버에서 내려주는 registrationDate
  amount: number;                 // 서버에서 내려주는 amount
  depositFlag?: boolean;           // 목록 API용 (optional로 변경)
  organizationName: string;       // 서버에서 내려주는 organizationName
  organizationId?: string; // 단체 식별자(organizationId 또는 organizationAccount)
  organizationAccount?: string; // 백엔드 필드 호환
  leaderName?: string;
  paymenterName?: string;         // 입금자명
  paymentStatus: 'UNPAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED';
  address?: string;
  addressDetail?: string;
  // 목록 API용
  souvenirList?: Array<{ souvenirId: string; selectedSize: string }>;
  // 상세 API용
  souvenirListDetail?: Array<{
    id: string;
    name: string;
    size: string;
    eventCategoryId: string;
    eventCategoryName: string;
  }>;
  note?: string;                  // 사용자 비고 (읽기 전용)
  memo?: string;                  // 관리자 메모 (편집 가능)
  detailMemo?: string;            // 상세 메모
  matchingLog?: string;           // 매칭 로그
  eventId?: string;               // 대회 ID (코스 정보 조회용)
  paymenterBank?: string;         // 환불 은행명
  accountNumber?: string;         // 환불 계좌번호
  accountHolderName?: string;     // 예금주명
  refundRequestedAt?: string;     // 환불요청시각 (ISO 8601 형식)
}

export interface RegistrationListResponse {
  totalElements: number;
  totalPages: number;
  pageable: {
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
    offset: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: RegistrationItem[];
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface RegistrationListRequest {
  page?: number;
  size?: number;
  eventId: string;
}

// 검색 API 관련 타입
export interface RegistrationSearchRequest {
  eventId?: string; // 단일 선택용 (하위 호환성)
  eventIds?: string[]; // 다중 선택용
  page?: number;
  size?: number;
  registrationSearchKey?: 'NAME' | 'ORGANIZATION' | 'BIRTH' | 'REGISTRATION_DATE' | 'ADDRESS' | 'PH_NUM' | 'PAYMENTER_NAME' | 'MEMO' | 'NOTE' | 'DETAIL_MEMO' | 'MATCHING_LOG';
  direction?: 'ASC' | 'DESC';
  paymentStatus?: 'UNPAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED';
  keyword?: string;
}

// 신청자 관리 관련 타입
export type SortKey = 'id' | 'name' | 'org' | 'birth';
export type PaidFilter = '' | '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료';

// 신청자 관리 테이블 행 타입
export interface ApplicantManageRow {
  id: string; // UUID로 변경
  no: number;
  eventId: string; // UUID로 변경
  name: string;
  org: string;
  course: string;
  gender: '남' | '여';
  birth: string;
  phone: string;
  eventName?: string; // 대회명
  regDate: string;
  regDateRaw?: string;
  fee: number;
  paid: boolean;
  payStatus?: '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료';
  note?: string; // 사용자 비고 (읽기 전용)
  memo?: string; // 관리자 메모 (읽기 전용)
  detailMemo?: string; // 상세 메모
  matchingLog?: string; // 매칭 로그
  account?: string; // 입금자명
  address?: string; // 주소
  souvenirList?: Array<{ souvenirId: string; selectedSize: string }>; // 기념품 목록
}

// 입금여부 수정 요청 타입
export interface PaymentStatusUpdateRequest {
  id: string;
  name: string;
  gender: string;
  birth: string;
  phNum: string;
  paymentStatus: 'UNPAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED';
}

// API 응답을 테이블 형식으로 변환하는 함수
function formatPhoneDisplay(ph?: string): string {
  const digits = String(ph ?? '').replace(/\D+/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return ph ?? '';
}
function formatBirthDisplay(b?: string): string {
  const digits = String(b ?? '').replace(/\D+/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6)}`;
  }
  return b ?? '';
}
function formatDateTimeDisplay(raw?: string): string {
  if (!raw) return '-';
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  return raw.replace('T', ' ').split('.')[0] || raw;
}
export function convertRegistrationToManageRow(item: RegistrationItem, index?: number): ApplicantManageRow {
  const normalizeGender = (g?: string): '남' | '여' => {
    const s = String(g || '').trim();
    const u = s.toUpperCase();
    if (u === 'M' || s.includes('남')) return '남';
    if (u === 'F' || s.includes('여')) return '여';
    // 알 수 없는 값인 경우 백엔드 기본 규칙에 맞춰 '여'로 표시
    return '여';
  };
  return {
    id: item.registrationId || item.id, // 서버에서 내려주는 registrationId 우선 사용
    no: item.no ?? (index !== undefined ? index + 1 : 0), // 서버에서 내려주는 no 우선 사용
    eventId: item.eventId || item.id, // eventId 우선 사용
    name: item.name || item.userName || '', // 서버에서 내려주는 name 우선 사용
    org: item.organizationName || '개인', // 서버에서 내려주는 organizationName
    course: item.eventCategoryName || item.categoryName || item.eventCategory || '', // 서버에서 내려주는 eventCategoryName 우선 사용
    gender: normalizeGender(item.gender),
    birth: formatBirthDisplay(item.birth),
    phone: formatPhoneDisplay(item.phNum), // 서버에서 내려주는 phNum
    eventName: item.eventName, // 대회명
    regDate: formatDateTimeDisplay(item.registrationDate), // 서버에서 내려주는 registrationDate
    fee: item.amount ?? 0, // 서버에서 내려주는 amount
    paid: !!item.depositFlag,
    payStatus: convertPaymentStatusToKorean(item.paymentStatus),
    note: item.note ?? '',
    memo: item.memo ?? '',
    detailMemo: item.detailMemo ?? '',
    matchingLog: item.matchingLog ?? '',
    account: (item.paymenterName?.trim() || item.leaderName?.trim() || item.userName?.trim()) || '-', // paymenterName(입금자명) 우선, 단체 신청: leaderName, 없으면 userName
    address: item.address,
    souvenirList: item.souvenirList || [], // 기념품 목록 매핑
  };
}

// 프론트엔드 필터를 API 파라미터로 변환하는 함수
export function convertFiltersToApiParams(
  searchKey: string,
  paymentStatus: PaidFilter,
  keyword: string,
  searchField?: 'name' | 'org' | 'birth' | 'tel' | 'paymenterName' | 'memo' | 'note' | 'detailMemo' | 'matchingLog' | 'all'
): Partial<RegistrationSearchRequest> {
  const apiParams: Partial<RegistrationSearchRequest> = {};
  
  // 정렬 기준 매핑 (검색 키워드가 없어도 정렬은 적용)
  const searchKeyMap: Record<string, RegistrationSearchRequest['registrationSearchKey']> = {
    'name': 'NAME',
    'org': 'ORGANIZATION',
    'birth': 'BIRTH',
    'date': 'REGISTRATION_DATE',
    'addr': 'ADDRESS',
  };
  
  // 검색 필드에 따라 registrationSearchKey 설정
  if (keyword) {
    if (searchField === 'name') {
      // 이름으로 검색
      apiParams.registrationSearchKey = 'NAME';
      apiParams.keyword = keyword;
    } else if (searchField === 'org') {
      apiParams.registrationSearchKey = 'ORGANIZATION';
      apiParams.keyword = keyword;
    } else if (searchField === 'birth') {
      apiParams.registrationSearchKey = 'BIRTH';
      apiParams.keyword = keyword.replace(/[^0-9]/g, '');
    } else if (searchField === 'tel') {
      apiParams.registrationSearchKey = 'PH_NUM';
      apiParams.keyword = keyword; // 하이픈 포함 그대로 전달 (백엔드가 하이픈 포함 형식 지원)
    } else if (searchField === 'paymenterName') {
      // 입금자명으로 검색
      apiParams.registrationSearchKey = 'PAYMENTER_NAME';
      apiParams.keyword = keyword;
    } else if (searchField === 'memo') {
      // 메모로 검색
      apiParams.registrationSearchKey = 'MEMO';
      apiParams.keyword = keyword;
    } else if (searchField === 'note') {
      // 비고로 검색
      apiParams.registrationSearchKey = 'NOTE';
      apiParams.keyword = keyword;
    } else if (searchField === 'detailMemo') {
      // 상세메모로 검색
      apiParams.registrationSearchKey = 'DETAIL_MEMO';
      apiParams.keyword = keyword;
    } else if (searchField === 'matchingLog') {
      // 매칭로그로 검색
      apiParams.registrationSearchKey = 'MATCHING_LOG';
      apiParams.keyword = keyword;
    } else {
      // 'all'인 경우 registrationSearchKey 설정하지 않음 (백엔드가 모든 필드에서 검색)
      apiParams.keyword = keyword;
    }
  } else {
    // 서버에서 정렬을 내려주므로 클라이언트에서 정렬 기준을 보내지 않음
    // 정렬은 서버에서 처리하므로 registrationSearchKey를 설정하지 않음
  }
  
  // 결제 상태 매핑
  if (paymentStatus) {
    const paymentStatusMap: Record<string, RegistrationSearchRequest['paymentStatus']> = {
      '미결제': 'UNPAID',
      '결제완료': 'COMPLETED',
      '확인필요': 'MUST_CHECK',
      '차액환불요청': 'NEED_PARTITIAL_REFUND',
      '전액환불요청': 'NEED_REFUND',
      '전액환불완료': 'REFUNDED',
    };
    apiParams.paymentStatus = paymentStatusMap[paymentStatus];
  }
  
  return apiParams;
}

// API 결제 상태를 한국어로 변환하는 함수
export function convertPaymentStatusToKorean(paymentStatus: string): '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료' {
  const statusMap: Record<string, '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료'> = {
    'UNPAID': '미결제',
    'COMPLETED': '결제완료',
    'MUST_CHECK': '확인필요',
    'NEED_PARTITIAL_REFUND': '차액환불요청',
    'NEED_REFUND': '전액환불요청',
    'REFUNDED': '전액환불완료',
  };
  return statusMap[paymentStatus] || '미결제';
}

// 한국어를 백엔드 enum으로 변환하는 함수
export function convertKoreanToPaymentStatus(koreanStatus: string): 'UNPAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED' {
  const statusMap: Record<string, 'UNPAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED'> = {
    '미결제': 'UNPAID',
    '결제완료': 'COMPLETED',
    '확인필요': 'MUST_CHECK',
    '차액환불요청': 'NEED_PARTITIAL_REFUND',
    '전액환불요청': 'NEED_REFUND',
    '전액환불완료': 'REFUNDED',
  };
  return statusMap[koreanStatus] || 'UNPAID';
}
