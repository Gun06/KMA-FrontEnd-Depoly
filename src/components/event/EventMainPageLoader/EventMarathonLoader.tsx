'use client';

import React from 'react';
import styles from './EventMarathonLoader.module.css';

/** KMA-Mobile `AppRefreshLoading` / 당겨서 새로고침 마스코트와 동일 톤 */
interface EventMarathonLoaderProps {
  visible: boolean;
  accentColor?: string;
  eventName?: string;
}

function RunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
    </svg>
  );
}

export default function EventMarathonLoader({
  visible,
  accentColor = '#16A34A',
  eventName,
}: EventMarathonLoaderProps) {
  if (!visible) return null;

  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{ '--loader-accent': accentColor } as React.CSSProperties}
    >
      <span className="sr-only">
        {eventName ? `${eventName} 로딩 중` : '대회 페이지 로딩 중'}
      </span>
      <div className={styles.content}>
        <div className={styles.mascotStage}>
          <div className={styles.speedLines} aria-hidden>
            <span className={styles.speedLine} />
            <span className={styles.speedLine} />
            <span className={styles.speedLine} />
          </div>
          <div className={styles.mascotWrap}>
            <RunIcon className={styles.mascotIcon} />
          </div>
          <span className={styles.groundShadow} aria-hidden />
        </div>
        <p className={styles.caption}>전국마라톤협회에서 열심히 달리는 중...</p>
      </div>
    </div>
  );
}
