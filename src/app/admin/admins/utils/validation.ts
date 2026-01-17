import type { AdminFormData, RoleType } from '../types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAdminForm(
  formData: AdminFormData,
  selectedRole: RoleType,
  selectedEventId?: string
): ValidationResult {
  if (!formData.account || !formData.account.trim()) {
    return { isValid: false, error: '아이디를 입력해주세요.' };
  }

  if (!formData.name || !formData.name.trim()) {
    return { isValid: false, error: '이름을 입력해주세요.' };
  }

  if (!selectedRole) {
    return { isValid: false, error: '권한을 선택해주세요.' };
  }

  if (!formData.roleId || !formData.roleId.trim()) {
    return { isValid: false, error: '권한 번호를 입력해주세요.' };
  }

  return { isValid: true };
}

