'use client';

import React, { useState } from 'react';
import { Plus, Users, Shield, UserPlus } from 'lucide-react';
import { useAdminEventList } from '@/services/admin';
import AdminTableShell from '@/components/admin/Table/AdminTableShell';
import { useAdminList } from './hooks/useAdminList';
import { useCreateAdmin } from './hooks/useCreateAdmin';
import { useAdminRoles } from './hooks/useAdminRoles';
import { useAdminDepartments } from './hooks/useAdminDepartments';
import { validateAdminForm } from './utils/validation';
import { resetFormData } from './utils/formHelpers';
import { ADMIN_TABLE_COLUMNS, DEFAULT_PAGE_SIZE } from './utils/constants';
import type { AdminFormData, RoleType } from './types';

export default function Client() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<AdminFormData>({
    account: '',
    name: '',
    roleId: '',
    departmentId: '',
  });
  const [selectedRole, setSelectedRole] = useState<RoleType>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // 관리자 목록 조회
  const {
    data: adminListData,
    isLoading: isLoadingAdminList,
    refetch: refetchAdminList,
  } = useAdminList({ page, size: DEFAULT_PAGE_SIZE });

  // 권한 목록 조회 (필요시 활성화)
  useAdminRoles(false);

  // 부서 목록 조회 (필요시 활성화)
  useAdminDepartments(false);

  // 대회 목록 조회 (특정 대회 선택용)
  const { data: eventsData } = useAdminEventList({ page: 1, size: 100 });

  // 관리자 생성 API
  const createAdminMutation = useCreateAdmin({
    onSuccess: () => {
      alert('관리자가 성공적으로 생성되었습니다.');
      setActiveTab('list');
      resetFormData(setFormData, setSelectedRole, setSelectedEventId);
      refetchAdminList();
    },
    onError: (error) => {
      alert(`관리자 생성에 실패했습니다: ${error.message}`);
    },
  });

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    // TODO: 선택한 권한에 맞는 roleId를 API에서 가져와서 설정
    // 예: roleId를 API로부터 가져오는 로직 필요
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAdminForm(formData, selectedRole, selectedEventId);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // TODO: selectedRole에 따라 roleId를 설정하는 로직 필요
    // 현재는 임시로 roleId를 설정
    const submitData: AdminFormData = {
      ...formData,
      roleId: formData.roleId || selectedRole, // 실제로는 API에서 가져온 roleId 사용
    };

    createAdminMutation.mutate(submitData);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            관리자 계정을 생성하고 권한을 설정할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          관리자 생성
        </button>
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              관리자 목록
            </div>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              관리자 생성
            </div>
          </button>
        </nav>
      </div>

      {/* 콘텐츠 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'list' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">관리자 목록</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>총 {adminListData?.totalElements || 0}명</span>
              </div>
            </div>
            {isLoadingAdminList ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">로딩 중...</p>
              </div>
            ) : adminListData?.empty || !adminListData?.content?.length ? (
              <div className="border-t border-gray-200 pt-4">
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">등록된 관리자가 없습니다.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    관리자 생성하기
                  </button>
                </div>
              </div>
            ) : (
              <AdminTableShell
                columns={ADMIN_TABLE_COLUMNS}
                rows={adminListData?.content || []}
                rowKey={(row) => row.id}
                contentMinHeight={null}
                pagination={{
                  page,
                  pageSize: DEFAULT_PAGE_SIZE,
                  total: adminListData?.totalElements || 0,
                  onChange: (newPage) => setPage(newPage),
                  align: 'center',
                }}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">새 관리자 생성</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    아이디 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="account"
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="관리자 아이디를 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    권한 번호 (roleId) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="roleId"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="권한을 선택하면 자동으로 입력됩니다"
                    disabled={!selectedRole}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    권한 번호와 부서 번호는 API 호출을 통해 불러오셔서 사용하시면 될 것 같습니다.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부서 번호 (departmentId)
                  </label>
                  <input
                    type="text"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="부서 번호를 입력하세요 (선택사항)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  권한 설정 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="super_admin"
                      checked={selectedRole === 'super_admin'}
                      onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">총 관리자</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="no_deposit"
                      checked={selectedRole === 'no_deposit'}
                      onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        입금처리 기능만 빼고 다 가능한 관리자
                      </span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="no_deposit_event"
                      checked={selectedRole === 'no_deposit_event'}
                      onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        입금처리와 대회관리기능 빼고 다 가능한 관리자
                      </span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="event_specific"
                      checked={selectedRole === 'event_specific'}
                      onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        특정 대회의 참가자 데이터만 특정적으로 볼 수 있는 관리자
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        특정대회의 시군 관계자와 공유용
                      </p>
                    </div>
                  </label>
                </div>
                {selectedRole === 'event_specific' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대회 선택 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">대회를 선택하세요</option>
                      {eventsData?.content?.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.nameKr}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAdminMutation.isPending ? '생성 중...' : '생성하기'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

