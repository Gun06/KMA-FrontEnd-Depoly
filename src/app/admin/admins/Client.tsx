'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Shield, UserPlus, HelpCircle, Info, AlertCircle } from 'lucide-react';
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
import { useAdminAuthStore } from '@/stores';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/common/Toast/ToastContainer';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import type { AdminFormData, RoleType, DepartmentItem, RoleItem } from './types';

export default function Client() {
  const router = useRouter();
  const { user, hasHydrated } = useAdminAuthStore();
  const { toasts, error: showErrorToast, success: showSuccessToast, removeToast } = useToast();
  const hasShownAlertRef = useRef(false);
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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [permissionTab, setPermissionTab] = useState<'super_admin' | 'no_deposit' | 'no_deposit_event' | 'event_specific'>('super_admin');
  const [selectedPermissions, setSelectedPermissions] = useState<{
    deposit: boolean;
    event: boolean;
    user: boolean;
    board: boolean;
    banner: boolean;
    gallery: boolean;
  }>({
    deposit: true,
    event: true,
    user: true,
    board: true,
    banner: true,
    gallery: true,
  });

  // 권한 확인: 총관리자(SUPER_ADMIN)만 접근 가능
  const roles = user?.roles || [];
  const primaryRole = user?.role || '';
  const allRoles = Array.from(
    new Set([primaryRole, ...roles].filter(Boolean))
  ).map(r => r.toUpperCase().replace(/^ROLE_/i, ''));
  const isSuperAdmin = allRoles.includes('SUPER_ADMIN');

  // 관리자 목록 조회 (Hooks는 항상 같은 순서로 호출되어야 하므로 early return 전에 호출)
  const {
    data: adminListData,
    isLoading: isLoadingAdminList,
    refetch: refetchAdminList,
  } = useAdminList({ page, size: DEFAULT_PAGE_SIZE });

  // 권한 목록 조회
  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useAdminRoles(true);

  // 부서 목록 조회
  const {
    data: departmentsData,
    isLoading: isLoadingDepartments,
    error: departmentsError,
  } = useAdminDepartments(true);

  // 대회 목록 조회 (특정 대회 선택용)
  const { data: eventsData } = useAdminEventList({ page: 1, size: 100 });

  // 관리자 생성 API
  const createAdminMutation = useCreateAdmin({
    onSuccess: () => {
      const adminName = formData.name || formData.account || '관리자';
      setSuccessMessage(`${adminName} 관리자가 성공적으로 생성되었습니다.`);
      setIsSuccessModalOpen(true);
      setActiveTab('list');
      resetFormData(setFormData, setSelectedRole, setSelectedEventId, setPermissionTab, setSelectedPermissions);
      refetchAdminList();
    },
    onError: (error) => {
      showErrorToast(`관리자 생성에 실패했습니다: ${error.message}`);
    },
  });

  // 권한 확인 후 Toast 표시 (한 번만 실행)
  useEffect(() => {
    if (!hasHydrated) return; // 아직 초기화되지 않았으면 대기
    if (hasShownAlertRef.current) return; // 이미 알림을 표시했으면 중복 방지
    
    if (!isSuperAdmin) {
      // 총관리자가 아니면 접근 차단 Toast 표시 (자동 리다이렉트 없음)
      hasShownAlertRef.current = true; // 알림 표시 플래그 설정
      showErrorToast('관리자 관리 페이지는 총관리자만 접근할 수 있습니다.', 0); // duration 0으로 설정하여 자동 닫힘 방지
    }
  }, [hasHydrated, isSuperAdmin, showErrorToast]);

  // 총관리자가 아니면 접근 차단 메시지 표시
  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-4">관리자 관리 페이지는 총관리자만 접근할 수 있습니다.</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            관리자 홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 권한 탭 변경 시 권한 자동 설정
  const handlePermissionTabChange = (tab: typeof permissionTab) => {
    setPermissionTab(tab);
    setSelectedRole(tab);
    
    // 탭에 따라 권한 자동 설정
    switch (tab) {
      case 'super_admin':
        // 총 관리자: 모든 권한
        setSelectedPermissions({
          deposit: true,
          event: true,
          user: true,
          board: true,
          banner: true,
          gallery: true,
        });
        break;
      case 'no_deposit':
        // 일반 관리자: 입금 처리 제외
        setSelectedPermissions({
          deposit: false,
          event: true,
          user: true,
          board: true,
          banner: true,
          gallery: true,
        });
        break;
      case 'no_deposit_event':
        // 제한 관리자: 입금 처리 + 대회 관리 제외
        setSelectedPermissions({
          deposit: false,
          event: false,
          user: true,
          board: true,
          banner: true,
          gallery: true,
        });
        break;
      case 'event_specific':
        // 대회별 관리자: 특정 대회만
        setSelectedPermissions({
          deposit: false,
          event: false,
          user: false,
          board: false,
          banner: false,
          gallery: false,
        });
        break;
    }
    
    // 권한 설정에서 선택한 권한에 따라 권한조회 드롭다운 자동 선택
    if (rolesData && rolesData.length > 0) {
      let matchedRole: RoleItem | undefined;
      
      // 권한 타입에 따라 매칭되는 권한 찾기
      switch (tab) {
        case 'super_admin':
          matchedRole = rolesData.find((r) => 
            r.name.includes('총관리자') || 
            r.name.includes('총 관리자') ||
            r.name.toLowerCase().includes('super')
          );
          break;
        case 'no_deposit':
          matchedRole = rolesData.find((r) => 
            r.name.includes('입금관리자') || 
            r.name.includes('입금 관리자') ||
            r.name.toLowerCase().includes('deposit')
          );
          break;
        case 'no_deposit_event':
          matchedRole = rolesData.find((r) => 
            r.name.includes('게시판관리자') || 
            r.name.includes('게시판 관리자') ||
            r.name.toLowerCase().includes('board')
          );
          break;
        case 'event_specific':
          matchedRole = rolesData.find((r) => 
            r.name.includes('대회관리자') || 
            r.name.includes('대회 관리자') ||
            r.name.toLowerCase().includes('event')
          );
          break;
      }
      
      if (matchedRole) {
        setFormData({ ...formData, roleId: matchedRole.id });
      }
    }
  };

  // 권한 체크박스 변경 핸들러
  const handlePermissionChange = (key: keyof typeof selectedPermissions) => {
    // 대회별 관리자는 권한 변경 불가
    if (permissionTab === 'event_specific') return;
    
    setSelectedPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 권한조회 드롭다운에서 직접 선택할 때
  const handleRoleIdChange = (roleId: string) => {
    setFormData({ ...formData, roleId });
    
    // 권한조회 드롭다운에서 선택한 권한에 따라 권한 설정도 자동 선택
    if (rolesData && rolesData.length > 0) {
      const selectedRoleData = rolesData.find((r) => r.id === roleId);
      if (selectedRoleData) {
        // 권한 이름으로 권한 타입 매칭
        const roleName = selectedRoleData.name.toLowerCase();
        // 슈퍼: 총관리자
        if (roleName.includes('총관리자') || roleName.includes('총 관리자') || roleName.includes('super')) {
          setSelectedRole('super_admin');
        } 
        // Deposit: 입금관리자
        else if (roleName.includes('입금관리자') || roleName.includes('입금 관리자') || roleName.includes('deposit')) {
          setSelectedRole('no_deposit');
        } 
        // Board: 게시판관리자
        else if (roleName.includes('게시판관리자') || roleName.includes('게시판 관리자') || roleName.includes('board')) {
          setSelectedRole('no_deposit_event');
        } 
        // Event: 대회관리자
        else if (roleName.includes('대회관리자') || roleName.includes('대회 관리자') || roleName.includes('event')) {
          setSelectedRole('event_specific');
        } 
        else {
          setSelectedRole('');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAdminForm(formData, selectedRole, selectedEventId);
    if (!validation.isValid) {
      showErrorToast(validation.error || '입력 정보를 확인해주세요.');
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
                    권한조회 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={(e) => handleRoleIdChange(e.target.value)}
                    disabled={isLoadingRoles}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">
                      {isLoadingRoles
                        ? '권한 목록 로딩 중...'
                        : rolesError
                          ? '권한 목록을 불러올 수 없습니다'
                          : '권한을 선택하세요'}
                    </option>
                    {rolesData?.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {rolesError && (
                    <p className="mt-1 text-xs text-red-500">
                      권한 목록을 불러오는 중 오류가 발생했습니다.
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    권한 설정에서 선택하면 자동으로 설정됩니다.
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
                    disabled={isLoadingDepartments}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingDepartments
                        ? '부서 목록 로딩 중...'
                        : departmentsError
                          ? '부서 목록을 불러올 수 없습니다'
                          : '부서를 선택하세요 (선택사항)'}
                    </option>
                    {departmentsData?.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {departmentsError && (
                    <p className="mt-1 text-xs text-red-500">
                      부서 목록을 불러오는 중 오류가 발생했습니다.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  권한 설정 <span className="text-red-500">*</span>
                </label>
                
                {/* 권한 탭 */}
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex space-x-1" aria-label="권한 탭">
                    {[
                      { id: 'super_admin', label: '총 관리자', description: '모든 관리 기능 사용 가능' },
                      { id: 'no_deposit', label: '일반 관리자', description: '입금처리 기능만 제외' },
                      { id: 'no_deposit_event', label: '제한 관리자', description: '입금처리와 대회관리 기능 제외' },
                      { id: 'event_specific', label: '대회별 관리자', description: '특정 대회의 참가자 데이터만 조회' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handlePermissionTabChange(tab.id as typeof permissionTab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          permissionTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-semibold">{tab.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{tab.description}</div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* 권한 설명 및 체크박스 */}
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  {/* 권한 설명 */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    {permissionTab === 'super_admin' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">총 관리자</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          모든 관리 기능 사용 가능합니다. 입금 처리, 대회 관리, 회원 관리 등 전체 권한을 가지며, 관리자 계정 생성 및 관리도 가능합니다.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• 입금 처리, 대회 관리, 회원 관리 등 전체 권한</li>
                          <li>• 관리자 계정 생성 및 관리 접근 가능</li>
                          <li>• 최고 수준의 관리 권한</li>
                        </ul>
                      </div>
                    )}
                    {permissionTab === 'no_deposit' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">일반 관리자</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          입금 처리 기능을 제외한 모든 기능 사용 가능합니다. 대회 관리, 회원 관리, 게시판 관리, 배너 관리, 갤러리 관리가 가능합니다.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• 대회 관리, 회원 관리, 게시판 관리 가능</li>
                          <li>• 배너 관리, 갤러리 관리 가능</li>
                          <li>• 입금 내역 확인 및 수정은 불가능</li>
                        </ul>
                      </div>
                    )}
                    {permissionTab === 'no_deposit_event' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">제한 관리자</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          입금 처리 및 대회 관리 기능을 제외한 기능 사용 가능합니다. 회원 관리, 게시판 관리, 배너 관리, 갤러리 관리가 가능합니다.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• 회원 관리, 게시판 관리 가능</li>
                          <li>• 배너 관리, 갤러리 관리 가능</li>
                          <li>• 입금 처리 및 대회 등록/수정은 불가능</li>
                        </ul>
                      </div>
                    )}
                    {permissionTab === 'event_specific' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">대회별 관리자</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          선택한 특정 대회의 참가자 정보만 확인 가능합니다. 시군 관계자와 공유 용도로 적합하며, 다른 관리 기능은 사용할 수 없습니다.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• 선택한 대회의 참가자 정보만 확인</li>
                          <li>• 시군 관계자와 공유 용도로 적합</li>
                          <li>• 다른 관리 기능은 사용 불가</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 권한 체크박스 */}
                  {permissionTab !== 'event_specific' ? (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">사용 가능한 권한</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'deposit', label: '입금 처리', description: '입금 내역 확인 및 수정' },
                          { key: 'event', label: '대회 관리', description: '대회 등록, 수정, 통계 확인' },
                          { key: 'user', label: '회원 관리', description: '개인/단체 회원 관리' },
                          { key: 'board', label: '게시판 관리', description: '공지사항, 문의사항, FAQ' },
                          { key: 'banner', label: '배너 관리', description: '메인/스폰서 배너, 팝업 관리' },
                          { key: 'gallery', label: '갤러리 관리', description: '갤러리 등록 및 관리' },
                        ].map((permission) => (
                          <label
                            key={permission.key}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPermissions[permission.key as keyof typeof selectedPermissions]
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions[permission.key as keyof typeof selectedPermissions]}
                              onChange={() => handlePermissionChange(permission.key as keyof typeof selectedPermissions)}
                              className="w-4 h-4 text-blue-600 mt-0.5 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{permission.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        선택한 대회의 참가자 정보만 조회할 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
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
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="관리자 생성 완료"
        message={successMessage}
      />
    </div>
  );
}

