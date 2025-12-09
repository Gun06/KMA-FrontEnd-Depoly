import type { AdminFormData, RoleType } from '../types';

export function createEmptyFormData(): AdminFormData {
  return {
    account: '',
    name: '',
    roleId: '',
    departmentId: '',
  };
}

export function resetFormData(
  setFormData: (data: AdminFormData) => void,
  setSelectedRole: (role: RoleType) => void,
  setSelectedEventId: (id: string) => void
) {
  setFormData(createEmptyFormData());
  setSelectedRole('');
  setSelectedEventId('');
}

