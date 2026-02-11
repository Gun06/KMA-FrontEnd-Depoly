import { useGetQuery, useApiMutation } from '@/hooks/useFetch';
import type { UserListResponse, UserRegistrationListResponse, OrganizationListResponse, OrganizationMemberListResponse, OrganizationDetailResponse, UpdateOrganizationRequest } from '@/types/user';

// 개인 회원 목록 조회 API (검색 API 사용)
export function useIndividualUsersList(params: {
  page?: number;
  size?: number;
  auth?: 'USER' | 'GUEST';
  searchKey?: 'NAME' | 'BIRTH' | 'NO';
  direction?: 'ASC' | 'DESC';
  keyword?: string;
}) {
  const { page = 1, size = 20, auth, searchKey, direction, keyword } = params;
  
  // URL 파라미터 구성
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('size', String(size));
  if (auth) {
    searchParams.set('auth', auth);
  }
  if (searchKey) {
    searchParams.set('searchKey', searchKey);
  }
  if (direction) {
    searchParams.set('direction', direction);
  }
  if (keyword && keyword.trim()) {
    searchParams.set('keyword', keyword.trim());
  }
  
  return useGetQuery<UserListResponse>(
    ['admin', 'users', 'individual', page, size, auth, searchKey, direction, keyword],
    `/api/v1/user/search?${searchParams.toString()}`,
    'admin',
    {
      enabled: true,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData, // 이전 데이터 유지
    },
    true // 인증 필요
  );
}

// 개인 회원 상세 조회 API
export function useIndividualUserDetail(params: { userId: string }) {
  const { userId } = params;
  return useGetQuery<import('@/types/user').UserApiData>(
    ['admin', 'users', 'individual', 'detail', userId],
    `/api/v1/user/${userId}`,
    'admin',
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
    },
    true
  );
}

// 유저별 등록 대회 목록 조회 API
export function useUserRegistrationsList(params: {
  userId: string;
  page?: number;
  size?: number;
}) {
  const { userId, page = 1, size = 20 } = params;
  
  return useGetQuery<UserRegistrationListResponse>(
    ['admin', 'users', 'registrations', userId, page, size],
    `/api/v1/registration/${userId}?page=${page}&size=${size}`,
    'admin',
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5분
    },
    true // 인증 필요
  );
}

// 단체 회원 목록 조회 API (검색 API 사용)
export function useOrganizationUsersList(params: {
  page?: number;
  size?: number;
  organizationSearchKey?: 'NAME' | 'ID' | 'LEADER' | 'ALL';
  keyword?: string;
}) {
  const { page = 1, size = 20, organizationSearchKey, keyword } = params;
  
  // URL 파라미터 구성
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('size', String(size));
  if (organizationSearchKey && organizationSearchKey !== 'ALL') {
    searchParams.set('organizationSearchKey', organizationSearchKey);
  }
  if (keyword && keyword.trim()) {
    searchParams.set('keyword', keyword.trim());
  }
  
  return useGetQuery<OrganizationListResponse>(
    ['admin', 'users', 'organization', page, size, organizationSearchKey, keyword],
    `/api/v1/organization/search?${searchParams.toString()}`,
    'admin',
    {
      enabled: true,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData, // 이전 데이터 유지
    },
    true
  );
}

// 단체 상세 정보 조회 API
export function useOrganizationDetail(params: { organizationId: string }) {
  const { organizationId } = params;
  const isValidOrgId = !!organizationId && String(organizationId).trim() !== '';
  
  return useGetQuery<OrganizationDetailResponse>(
    ['admin', 'users', 'organization', 'detail', organizationId],
    `/api/v1/organization/${organizationId}`,
    'admin',
    {
      enabled: isValidOrgId,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    },
    true
  );
}

// 단체 구성원 목록 조회 API (기본)
export function useOrganizationMembersList(params: {
  orgId: number | string;
  page?: number;
  size?: number;
}) {
  const { orgId, page = 1, size = 20 } = params;
  const isValidOrgId = !!orgId && (typeof orgId === 'number' ? orgId > 0 : String(orgId).trim() !== '');
  
  return useGetQuery<OrganizationMemberListResponse>(
    ['admin', 'users', 'organization', 'members', orgId, page, size],
    `/api/v1/organization/${orgId}/user?page=${page}&size=${size}`,
    'admin',
    {
      enabled: isValidOrgId,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    true
  );
}

// 단체 구성원 검색 API
export function useOrganizationMembersSearch(params: {
  orgId: number | string;
  page?: number;
  size?: number;
  registrationSearchKey?: 'ALL' | 'NAME' | 'PAYMENTER_NAME' | 'ORGANIZATION' | 'MEMO' | 'DETAIL_MEMO' | 'NOTE' | 'MATCHING_LOG' | 'BIRTH' | 'PH_NUM';
  paymentStatus?: 'UNPAID' | 'COMPLETED' | 'MUST_CHECK' | 'NEED_PARTITIAL_REFUND' | 'NEED_REFUND' | 'REFUNDED';
  keyword?: string;
}) {
  const { orgId, page = 1, size = 20, registrationSearchKey, paymentStatus, keyword } = params;
  const isValidOrgId = !!orgId && (typeof orgId === 'number' ? orgId > 0 : String(orgId).trim() !== '');
  
  // URL 파라미터 구성
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('size', String(size));
  if (registrationSearchKey) {
    searchParams.set('registrationSearchKey', registrationSearchKey);
  }
  if (paymentStatus) {
    searchParams.set('paymentStatus', paymentStatus);
  }
  if (keyword && keyword.trim()) {
    searchParams.set('keyword', keyword.trim());
  }
  
  return useGetQuery<OrganizationMemberListResponse>(
    ['admin', 'users', 'organization', 'members', 'search', orgId, page, size, registrationSearchKey, paymentStatus, keyword],
    `/api/v1/organization/${orgId}/user?${searchParams.toString()}`,
    'admin',
    {
      enabled: isValidOrgId,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData,
    },
    true
  );
}

// 단체 기본 정보 수정 API
// PATCH /api/v1/organization/{organizationId}
export function useUpdateOrganizationInfo(organizationId: string) {
  return useApiMutation<string, UpdateOrganizationRequest>(
    `/api/v1/organization/${organizationId}`,
    'admin',
    'PATCH',
    true, // 인증 필요
    {
      onSuccess: () => {
        // 성공 시 쿼리 캐시 무효화하여 자동 리프레시
        // queryClient.invalidateQueries는 컴포넌트에서 처리
      },
    }
  );
}
