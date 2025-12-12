'use client';

import React, { useState } from 'react';
import { Plus, Users, Shield, UserPlus, HelpCircle, Info } from 'lucide-react';
import { useAdminEventList } from '@/services/admin';
import AdminTableShell from '@/components/admin/Table/AdminTableShell';
import Pagination from '@/components/common/Pagination/Pagination';
import { useAdminList } from './hooks/useAdminList';
import { useCreateAdmin } from './hooks/useCreateAdmin';
import { useAdminRoles } from './hooks/useAdminRoles';
import { useAdminDepartments } from './hooks/useAdminDepartments';
import { validateAdminForm } from './utils/validation';
import { resetFormData } from './utils/formHelpers';
import { ADMIN_TABLE_COLUMNS, DEFAULT_PAGE_SIZE } from './utils/constants';
import type { AdminFormData, RoleType, DepartmentItem } from './types';

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

  // 부서 목록 조회
  const { data: departmentsData } = useAdminDepartments(true);

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

      {/* 콘텐츠 */}
      <div>
        {activeTab === 'list' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">관리자 목록</h2>
              <div className="flex items-center justify-end mb-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <span className="text-gray-500">○</span>
                  <span className="font-medium">총 {adminListData?.totalElements || 0}명</span>
                </div>
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
              <>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#3B3F45] text-white">
                          {ADMIN_TABLE_COLUMNS.map((col, i) => (
                            <th
                              key={String(col.key) + i}
                              className="h-12 px-4 font-medium text-center border-b border-gray-300"
                            >
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {adminListData?.content?.map((row, idx) => (
                          <tr
                            key={row.id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            {ADMIN_TABLE_COLUMNS.map((col, ci) => (
                              <td
                                key={String(col.key) + ci}
                                className="px-4 py-4 text-sm text-gray-900 text-center"
                              >
                                {col.render ? col.render(row, idx) : String(row[col.key as keyof typeof row] || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">
                      총 {adminListData?.totalElements || 0}개의 게시물
                    </div>
                    <div className="text-sm text-gray-600">
                      페이지 {page}/{Math.max(1, Math.ceil((adminListData?.totalElements || 0) / DEFAULT_PAGE_SIZE))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Pagination
                      page={page}
                      pageSize={DEFAULT_PAGE_SIZE}
                      total={adminListData?.totalElements || 0}
                      onChange={(newPage) => setPage(newPage)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">새 관리자 생성</h2>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="권한을 선택하면 자동으로 입력됩니다"
                    disabled={!selectedRole}
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    권한을 선택하면 자동으로 설정됩니다.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부서
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="">부서를 선택하세요 (선택사항)</option>
                    {departmentsData?.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  권한 설정 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-white">
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all group ${
                    selectedRole === 'super_admin' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="super_admin"
                      checked={selectedRole === 'super_admin'}
                      onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">총 관리자</span>
                        <div className="relative group/help">
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                          <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20 opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all pointer-events-none">
                            <div className="font-semibold mb-1">시스템의 모든 기능에 접근 가능</div>
                            <div className="text-gray-300">• 모든 관리 기능 사용 가능</div>
                            <div className="text-gray-300">• 입금 처리, 대회 관리, 회원 관리 등 전체 권한</div>
                            <div className="text-gray-300">• 최고 수준의 관리 권한</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all group ${
                    selectedRole === 'no_deposit' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="no_deposit"
                      checked={selectedRole === 'no_deposit'}
                      onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">일반 관리자</span>
                        <div className="relative group/help">
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                          <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20 opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all pointer-events-none">
                            <div className="font-semibold mb-1">입금 처리 제외한 모든 기능 사용 가능</div>
                            <div className="text-gray-300">• 대회 관리, 회원 관리, 게시판 관리 가능</div>
                            <div className="text-gray-300">• 배너 관리, 갤러리 관리 가능</div>
                            <div className="text-gray-300">• 입금 처리 기능만 제한</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all group ${
                    selectedRole === 'no_deposit_event' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="no_deposit_event"
                      checked={selectedRole === 'no_deposit_event'}
                      onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">제한 관리자</span>
                        <div className="relative group/help">
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                          <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20 opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all pointer-events-none">
                            <div className="font-semibold mb-1">입금 처리 및 대회 관리 제외</div>
                            <div className="text-gray-300">• 회원 관리, 게시판 관리 가능</div>
                            <div className="text-gray-300">• 배너 관리, 갤러리 관리 가능</div>
                            <div className="text-gray-300">• 입금 처리 및 대회 관리 기능 제한</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all group ${
                    selectedRole === 'event_specific' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="event_specific"
                      checked={selectedRole === 'event_specific'}
                      onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                      className="w-4 h-4 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">대회별 관리자</span>
                        <div className="relative group/help">
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                          <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20 opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all pointer-events-none">
                            <div className="font-semibold mb-1">특정 대회의 참가자 데이터만 조회 가능</div>
                            <div className="text-gray-300">• 선택한 대회의 참가자 정보만 확인</div>
                            <div className="text-gray-300">• 시군 관계자와 공유 용도로 적합</div>
                            <div className="text-gray-300">• 다른 관리 기능은 사용 불가</div>
                          </div>
                        </div>
                      </div>
                      {selectedRole === 'event_specific' && (
                        <p className="text-xs text-blue-600 mt-2 ml-6 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          아래에서 대회를 선택해주세요.
                        </p>
                      )}
                    </div>
                  </label>
                </div>
                {selectedRole === 'event_specific' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대회 선택 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
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

              <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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

