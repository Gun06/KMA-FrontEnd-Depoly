export interface AdminFormData {
  account: string;
  name: string;
  roleId: string;
  departmentId: string;
}

export type RoleType = 'super_admin' | 'no_deposit' | 'no_deposit_event' | 'event_specific' | '';

export interface AdminItem {
  no: number;
  id: string;
  account: string;
  name: string;
  roleName: string;
  deptName: string;
}

export interface AdminListResponse {
  totalPages: number;
  totalElements: number;
  content: AdminItem[];
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminListParams {
  page?: number;
  size?: number;
}

export interface DepartmentItem {
  id: string;
  name: string;
}

export interface RoleItem {
  id: string;
  name: string;
}

