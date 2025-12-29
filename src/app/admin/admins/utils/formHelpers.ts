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
  setSelectedEventId: (id: string) => void,
  setPermissionTab?: (tab: 'super_admin' | 'no_deposit' | 'no_deposit_event' | 'event_specific') => void,
  setSelectedPermissions?: (permissions: {
    deposit: boolean;
    event: boolean;
    user: boolean;
    board: boolean;
    banner: boolean;
    gallery: boolean;
  }) => void
) {
  setFormData(createEmptyFormData());
  setSelectedRole('');
  setSelectedEventId('');
  if (setPermissionTab) {
    setPermissionTab('super_admin');
  }
  if (setSelectedPermissions) {
    setSelectedPermissions({
      deposit: true,
      event: true,
      user: true,
      board: true,
      banner: true,
      gallery: true,
    });
  }
}

