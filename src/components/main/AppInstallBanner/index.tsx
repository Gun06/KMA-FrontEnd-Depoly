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
    <div className="relative z-[120] w-full bg-black text-white">
      <div className="mx-auto flex min-h-11 w-full max-w-[1920px] items-center gap-2 px-2.5 py-1 sm:gap-2.5 sm:px-3 md:min-h-12 md:py-1.5 md:px-3.5">
        <button
          type="button"
          onClick={handleClose}
          aria-label="앱 설치 배너 닫기"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <span className="text-lg leading-none">×</span>
        </button>

        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-white/15 sm:h-8 sm:w-8 md:h-8 md:w-8">
          <Image
            src={logoImage}
            alt="전국마라톤협회 앱"
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-semibold sm:text-sm">Download the app</p>
          <p className="truncate text-[10px] text-white/70 sm:text-xs md:text-sm">
            전국마라톤협회 앱으로 더 빠르게 신청하세요
          </p>
        </div>

        <Link
          href="#"
          className="shrink-0 rounded-full bg-lime-300 px-3 py-1 text-xs font-semibold text-black transition hover:bg-lime-200 sm:px-3.5 sm:text-sm md:px-4 md:py-1.5"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
