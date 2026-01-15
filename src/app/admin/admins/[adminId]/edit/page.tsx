'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useAdminRoles } from '../../hooks/useAdminRoles';
import { useAdminList } from '../../hooks/useAdminList';
import { request } from '@/hooks/useFetch';
import { ADMIN_API_ENDPOINTS } from '../../api';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/common/Toast/ToastContainer';
import { useAdminAuthStore } from '@/stores';
import type { AdminFormData, RoleItem, AdminItem } from '../../types';

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params?.adminId as string;
  const { user, hasHydrated } = useAdminAuthStore();
  const { toasts, error: showErrorToast, success: showSuccessToast, removeToast } = useToast();
  
  const [formData, setFormData] = useState<{ name: string; roleId: string }>({
    name: '',
    roleId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleBtnRef = useRef<HTMLButtonElement | null>(null);
  const rolePortalRef = useRef<HTMLDivElement | null>(null);
  const [roleMenuStyle, setRoleMenuStyle] = useState<React.CSSProperties | null>(null);
  const [permissionTab, setPermissionTab] = useState<'super_admin' | 'no_deposit' | 'no_deposit_event' | 'event_specific'>('super_admin');

  // 권한 확인: 총관리자(SUPER_ADMIN)만 접근 가능
  const roles = user?.roles || [];
  const primaryRole = user?.role || '';
  const allRoles = Array.from(
    new Set([primaryRole, ...roles].filter(Boolean))
  ).map(r => {
    const upper = r.toUpperCase().replace(/^ROLE_/i, '');
    if (upper.includes('총관리자') || upper.includes('총관리') || upper.includes('SUPER')) {
      return 'SUPER_ADMIN';
    }
    return upper;
  });
  const isSuperAdmin = allRoles.includes('SUPER_ADMIN');

  // 권한 목록 조회
  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useAdminRoles(true);

  // 관리자 목록 조회 (전체 목록에서 해당 관리자 찾기)
  const { data: adminListData, isLoading: isLoadingAdminList } = useAdminList({ page: 1, size: 1000 });

  // 관리자 정보 조회 (목록에서 찾기)
  useEffect(() => {
    if (!adminId || isLoadingAdminList || !adminListData) return;
    
    setIsLoading(true);
    try {
      // 목록에서 해당 adminId를 가진 관리자 찾기
      const admin = adminListData.content?.find((item: AdminItem) => item.id === adminId);
      
      if (!admin) {
        showErrorToast('관리자 정보를 찾을 수 없습니다.');
        router.push('/admin/admins');
        return;
      }

      // roleName으로 roleId 찾기
      let roleId = '';
      let initialTab: typeof permissionTab = 'super_admin';
      if (rolesData && admin.roleName) {
        const role = rolesData.find((r) => r.name === admin.roleName);
        if (role) {
          roleId = role.id;
          // 권한에 따라 초기 탭 설정
          const roleName = role.name.toLowerCase();
          if (roleName.includes('총관리자') || roleName.includes('총 관리자') || roleName.includes('super')) {
            initialTab = 'super_admin';
          } else if (roleName.includes('입금관리자') || roleName.includes('입금 관리자') || roleName.includes('deposit')) {
            initialTab = 'no_deposit';
          } else if (roleName.includes('대회관리자') || roleName.includes('대회 관리자') || roleName.includes('event')) {
            initialTab = 'event_specific';
          } else if (roleName.includes('게시판관리자') || roleName.includes('게시판 관리자') || roleName.includes('board')) {
            initialTab = 'no_deposit_event';
          }
        }
      }
      
      setFormData({
        name: admin.name || '',
        roleId: roleId,
      });
      setPermissionTab(initialTab);
    } catch (error) {
      const err = error as Error;
      showErrorToast(`관리자 정보를 불러오는데 실패했습니다: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
      router.push('/admin/admins');
    } finally {
      setIsLoading(false);
    }
  }, [adminId, adminListData, rolesData, isLoadingAdminList, router, showErrorToast]);

  // 권한 드롭다운 위치 계산
  useEffect(() => {
    const recalcRoleMenuPosition = () => {
      const el = roleBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = r.width;
      setRoleMenuStyle({
        position: 'fixed',
        top: r.bottom + 4,
        left: Math.min(r.left, window.innerWidth - width - 8),
        width,
        maxHeight: 280,
        overflowY: 'auto',
        zIndex: 9999,
      });
    };

    if (roleDropdownOpen) {
      recalcRoleMenuPosition();
      window.addEventListener('scroll', recalcRoleMenuPosition, true);
      window.addEventListener('resize', recalcRoleMenuPosition);
      return () => {
        window.removeEventListener('scroll', recalcRoleMenuPosition, true);
        window.removeEventListener('resize', recalcRoleMenuPosition);
      };
    }
  }, [roleDropdownOpen]);

  // 권한 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        roleBtnRef.current &&
        !roleBtnRef.current.contains(e.target as Node) &&
        rolePortalRef.current &&
        !rolePortalRef.current.contains(e.target as Node)
      ) {
        setRoleDropdownOpen(false);
      }
    };
    if (roleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [roleDropdownOpen]);

  const selectedRoleData = rolesData?.find((r) => r.id === formData.roleId);
  const roleLabel = selectedRoleData ? selectedRoleData.name : (isLoadingRoles ? '권한 목록 로딩 중...' : rolesError ? '권한 목록을 불러올 수 없습니다' : '권한을 선택하세요');

  const handleRoleIdChange = (roleId: string) => {
    setFormData({ ...formData, roleId });
    setRoleDropdownOpen(false);
    
    // 권한 선택에 따라 탭 자동 변경
    if (rolesData) {
      const selectedRole = rolesData.find((r) => r.id === roleId);
      if (selectedRole) {
        const roleName = selectedRole.name.toLowerCase();
        if (roleName.includes('총관리자') || roleName.includes('총 관리자') || roleName.includes('super')) {
          setPermissionTab('super_admin');
        } else if (roleName.includes('입금관리자') || roleName.includes('입금 관리자') || roleName.includes('deposit')) {
          setPermissionTab('no_deposit');
        } else if (roleName.includes('대회관리자') || roleName.includes('대회 관리자') || roleName.includes('event')) {
          setPermissionTab('event_specific');
        } else if (roleName.includes('게시판관리자') || roleName.includes('게시판 관리자') || roleName.includes('board')) {
          setPermissionTab('no_deposit_event');
        }
      }
    }
  };

  const handlePermissionTabChange = (tab: typeof permissionTab) => {
    setPermissionTab(tab);
    
    // 탭에 따라 권한 자동 설정
    if (rolesData) {
      let matchedRole: RoleItem | undefined;
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
        case 'event_specific':
          matchedRole = rolesData.find((r) => 
            r.name.includes('대회관리자') || 
            r.name.includes('대회 관리자') ||
            r.name.toLowerCase().includes('event')
          );
          break;
        case 'no_deposit_event':
          matchedRole = rolesData.find((r) => 
            r.name.includes('게시판관리자') || 
            r.name.includes('게시판 관리자') ||
            r.name.toLowerCase().includes('board')
          );
          break;
      }
      if (matchedRole) {
        setFormData({ ...formData, roleId: matchedRole.id });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorToast('이름을 입력해주세요.');
      return;
    }

    if (!formData.roleId) {
      showErrorToast('권한을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await request<string>(
        'admin',
        ADMIN_API_ENDPOINTS.UPDATE_INFO(adminId),
        'PATCH',
        {
          name: formData.name.trim(),
          roleId: formData.roleId,
        },
        true
      );

      showSuccessToast('관리자 정보가 성공적으로 수정되었습니다.');
      setTimeout(() => {
        router.push('/admin/admins');
      }, 1500);
    } catch (error) {
      const err = error as Error;
      showErrorToast(`관리자 정보 수정에 실패했습니다: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 권한 확인
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-4">관리자 수정 페이지는 총관리자만 접근할 수 있습니다.</p>
          <button
            onClick={() => router.push('/admin/admins')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            관리자 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6">
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
          onClick={() => router.push('/admin/admins')}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          목록으로
        </button>
      </div>

      {/* 콘텐츠 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">관리자 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="이름을 입력하세요 (부서명도 여기에 입력 가능)"
              required
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              부서명이 필요한 경우 이름 필드에 함께 입력하세요.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              권한 선택 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                ref={roleBtnRef}
                type="button"
                onClick={() => !isLoadingRoles && !rolesError && !isSubmitting && setRoleDropdownOpen((v) => !v)}
                disabled={isLoadingRoles || !!rolesError || isSubmitting}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 h-10 w-full text-sm rounded-md transition-colors border',
                  isLoadingRoles || rolesError || isSubmitting
                    ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
                )}
                aria-haspopup="listbox"
                aria-expanded={roleDropdownOpen}
                title={roleLabel}
              >
                <span className="flex-1 text-left max-w-[520px] truncate">{roleLabel}</span>
                <ChevronDown className={clsx('w-4 h-4 ml-auto transition-transform flex-shrink-0', roleDropdownOpen && 'rotate-180', (isLoadingRoles || rolesError || isSubmitting) && 'opacity-40')} />
              </button>

              {roleDropdownOpen && rolesData && createPortal(
                <div
                  ref={rolePortalRef}
                  style={roleMenuStyle ?? undefined}
                  className="bg-white rounded-md shadow-lg border border-gray-200"
                >
                  <div role="listbox" className="py-1">
                    {rolesData.map((role) => {
                      const active = role.id === formData.roleId;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleRoleIdChange(role.id)}
                          className={clsx(
                            'w-full text-left px-4 py-2 text-sm transition-colors truncate',
                            active
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          )}
                          title={role.name}
                        >
                          {role.name}
                        </button>
                      );
                    })}
                  </div>
                </div>,
                document.body
              )}
            </div>
            {rolesError && (
              <p className="mt-1 text-xs text-red-500">
                권한 목록을 불러오는 중 오류가 발생했습니다.
              </p>
            )}
          </div>
        </div>

        {/* 권한 탭 */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-1" aria-label="권한 탭">
            {[
              { id: 'super_admin', label: '총 관리자', description: '모든 관리 기능 사용 가능' },
              { id: 'no_deposit', label: '입금 관리자', description: '신청, 입금 관련 기능 사용 가능' },
              { id: 'event_specific', label: '대회 관리자', description: '대회 관련 기능 사용 가능' },
              { id: 'no_deposit_event', label: '게시판 관리자', description: '공지사항, 문의사항, FAQ 관리 가능' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePermissionTabChange(tab.id as typeof permissionTab)}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  permissionTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* 권한 설명 */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="p-4 bg-gray-50 rounded-lg">
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
                <h4 className="font-semibold text-gray-900 mb-2">입금 관리자</h4>
                <p className="text-sm text-gray-600 mb-2">
                  신청, 입금 관련 기능을 중심으로 사용 가능합니다.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 신청 및 입금 관련 기능 사용 가능</li>
                  <li>• 입금 내역 확인 및 수정 가능</li>
                </ul>
              </div>
            )}
            {permissionTab === 'no_deposit_event' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">게시판 관리자</h4>
                <p className="text-sm text-gray-600 mb-2">
                  게시판 관련 기능(공지사항, 문의사항, FAQ 등)을 관리할 수 있는 권한입니다.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 공지사항, 문의사항, FAQ 게시판 관리</li>
                  <li>• 게시글 작성, 수정, 삭제 권한</li>
                  <li>• 다른 관리 기능에는 접근 불가</li>
                </ul>
              </div>
            )}
            {permissionTab === 'event_specific' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">대회 관리자</h4>
                <p className="text-sm text-gray-600 mb-2">
                  대회 관련 기능만 사용할 수 있습니다. 시군 관계자 등 외부 대회 담당자에게 부여하는 권한입니다.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 대회 관련 기능 사용 가능</li>
                  <li>• 시군 관계자와 공유 용도로 적합</li>
                  <li>• 다른 관리 기능에는 접근 불가</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-6 pb-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/admin/admins')}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? '수정 중...' : '수정하기'}
          </button>
        </div>
      </form>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  );
}

