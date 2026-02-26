'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logoImage from '@/assets/images/main/logo.jpg';

const STORAGE_KEY = 'kma-main-app-install-banner-hidden';

interface AppInstallBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

export default function AppInstallBanner({ onVisibilityChange }: AppInstallBannerProps) {
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isHidden = window.sessionStorage.getItem(STORAGE_KEY) === 'true';
    setHidden(isHidden);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    onVisibilityChange?.(!hidden);
  }, [ready, hidden, onVisibilityChange]);

  const handleClose = () => {
    setHidden(true);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  if (!ready || hidden) return null;

  return (
    <div className="w-full bg-black text-white">
      <div className="mx-auto flex h-14 w-full max-w-[1920px] items-center gap-3 px-3 md:h-16 md:px-4">
        <button
          type="button"
          onClick={handleClose}
          aria-label="앱 설치 배너 닫기"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <span className="text-xl leading-none">×</span>
        </button>

        <div className="relative h-9 w-9 overflow-hidden rounded-md border border-white/15 md:h-10 md:w-10">
          <Image
            src={logoImage}
            alt="전국마라톤협회 앱"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold md:text-base">Download the app</p>
          <p className="truncate text-xs text-white/70 md:text-sm">전국마라톤협회 앱으로 더 빠르게 신청하세요</p>
        </div>

        <Link
          href="#"
          className="rounded-full bg-lime-300 px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-lime-200 md:px-5 md:py-2"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
