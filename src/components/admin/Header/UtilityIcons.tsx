'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import userIcon from '@/assets/icons/main/user.svg';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { authService } from '@/services/auth';
import { navigationGuard } from '@/utils/navigationGuard';

export default function UtilityIcons() {
  const { isLoggedIn, user } = useAdminAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // 네비게이션 가드로 중복 요청 방지
    const canNavigate = navigationGuard.startNavigation();
    if (!canNavigate) {
      return;
    }

    try {
      await authService.adminLogout();

      // 드롭다운 닫기
      setIsDropdownOpen(false);

      // 약간의 지연 후 안전하게 리다이렉트 (브라우저 스로틀링 방지)
      await navigationGuard.safeNavigate(() => {
        router.replace('/admin/login');
      }, 100); // 100ms 지연
      
    } catch (error) {
      navigationGuard.endNavigation();
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <div className="flex items-center space-x-8 text-white">
        {isLoggedIn ? (
          // 로그인된 상태 - 드롭다운 메뉴
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Image
                src={userIcon}
                alt="사용자"
                width={20}
                height={20}
                className="w-5 h-5 invert"
              />
              <span className="font-pretendard text-sm whitespace-nowrap">
                {user?.role || '관리자'}님
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 드롭다운 메뉴 - 말풍선 형태 */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                {/* 말풍선 꼬리 */}
                <div className="absolute -top-2 right-6 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-transparent border-b-white"></div>
                <div className="absolute -top-[9px] right-[23px] w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-transparent border-b-gray-200"></div>

                {/* 사용자 정보 */}
                <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                    {user?.role || '관리자'}님
                      </p>
                </div>

                {/* 메뉴 아이템들 */}
                <div className="py-2">
                  <Link
                    href="/admin/admins"
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    관리자 관리
                  </Link>

                  <div className="border-t border-gray-100 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 로그인되지 않은 상태
          <button className="flex items-center space-x-1 text-white hover:text-gray-200 transition-colors">
            <Image
              src={userIcon}
              alt="사용자"
              width={20}
              height={20}
              className="w-5 h-5 invert"
            />
            <span className="font-pretendard text-sm">로그인</span>
          </button>
        )}
      </div>
    </>
  );
}
