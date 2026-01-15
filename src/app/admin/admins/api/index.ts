export const ADMIN_API_ENDPOINTS = {
  LIST: '/api/v1/admin',
  CREATE: '/api/v1/admin',
  ROLES: '/api/v1/role',
  DEPARTMENTS: '/api/v1/department',
  RESET_PASSWORD_SELF: '/api/v1/admin/password',
  RESET_PASSWORD_OTHER: (adminId: string) => `/api/v1/admin/${adminId}/password`,
  UPDATE_INFO: (adminId: string) => `/api/v1/admin/${adminId}/info`,
} as const;

// 관리자 정보 수정 API는 필요시 사용

