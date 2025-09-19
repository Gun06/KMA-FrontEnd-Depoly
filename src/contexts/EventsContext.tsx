// src/contexts/EventsContext.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { EventRow } from '@/components/admin/events/EventTable';

// 기존 admin 페이지용 타입들
type EventsState = {
  rows: EventRow[];
  /** ✅ 폼 전체 스냅샷 저장소: id -> buildApiBody() 결과 그대로 */
  forms: Record<number, unknown>;
};

type EventsActions = {
  setInitial: (rows: EventRow[]) => void;
  /** 있으면 업데이트, 없으면 추가 */
  upsertOne: (row: EventRow) => void;
  /** (하위호환) 부분 업데이트 — 없으면 최소 정보로 추가 */
  updateOne: (id: number, patch: Partial<EventRow>) => void;
  removeOne: (id: number) => void;
  addOne: (row: EventRow) => void;
  /** ✅ 폼 스냅샷 저장/읽기 */
  saveForm: (id: number, form: unknown) => void;
  clearForm: (id: number) => void;
};

// mainBannerColor용 타입
interface MainBannerContextType {
  mainBannerColor: string | null;
  setMainBannerColor: (color: string | null) => void;
}

// 기존 admin 페이지용 Context들
const CtxState = React.createContext<EventsState | null>(null);
const CtxActions = React.createContext<EventsActions | null>(null);

// mainBannerColor용 Context
const MainBannerContext = createContext<MainBannerContextType | undefined>(
  undefined
);

const LS_KEY = 'events_ctx_v1';
const MAIN_BANNER_COLOR_KEY = 'main_banner_color';

export function EventsProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = React.useState<EventRow[]>([]);
  const [forms, setForms] = React.useState<Record<number, unknown>>({});
  const [mainBannerColor, setMainBannerColor] = useState<string | null>(null);

  // load
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.rows) setRows(parsed.rows);
        if (parsed?.forms) setForms(parsed.forms);
      }
      
      // mainBannerColor도 localStorage에서 로드
      const savedColor = localStorage.getItem(MAIN_BANNER_COLOR_KEY);
      if (savedColor) {
        setMainBannerColor(savedColor);
      }
    } catch {
      /* noop */
    }
  }, []);

  // save
  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ rows, forms }));
    } catch {
      /* noop */
    }
  }, [rows, forms]);

  // mainBannerColor 저장
  React.useEffect(() => {
    try {
      if (mainBannerColor) {
        localStorage.setItem(MAIN_BANNER_COLOR_KEY, mainBannerColor);
      } else {
        localStorage.removeItem(MAIN_BANNER_COLOR_KEY);
      }
    } catch {
      /* noop */
    }
  }, [mainBannerColor]);

  const actions: EventsActions = {
    setInitial: init => setRows(prev => (prev.length ? prev : init)),
    /** ✅ 업서트: 같은 id 있으면 병합/교체, 없으면 추가 */
    upsertOne: row =>
      setRows(prev => {
        const idx = prev.findIndex(r => r.id === row.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...row };
          return next;
        }
        return [row, ...prev];
      }),
    /** 하위호환: 부분 패치. 없으면 최소 정보로 추가(가능하면 upsertOne을 사용 권장) */
    updateOne: (id, patch) =>
      setRows(prev => {
        const idx = prev.findIndex(r => r.id === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...patch };
          return next;
        }
        // ⚠️ 컨텍스트에 해당 id가 없을 때 대비(필드 누락될 수 있으니 가급적 upsertOne 사용)
        const fallback = { id, ...patch } as EventRow;
        return [fallback, ...prev];
      }),
    removeOne: id => {
      setRows(prev => prev.filter(r => r.id !== id));
      setForms(prev => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    },
    addOne: row => setRows(prev => [row, ...prev]),
    saveForm: (id, form) =>
      setForms(prev => ({
        ...prev,
        [id]: form, // buildApiBody() 결과 그대로 저장
      })),
    clearForm: id =>
      setForms(prev => {
        const n = { ...prev };
        delete n[id];
        return n;
      }),
  };

  return (
    <CtxState.Provider value={{ rows, forms }}>
      <CtxActions.Provider value={actions}>
        <MainBannerContext.Provider
          value={{ mainBannerColor, setMainBannerColor }}
        >
          {children}
        </MainBannerContext.Provider>
      </CtxActions.Provider>
    </CtxState.Provider>
  );
}

// 기존 admin 페이지용 hooks
export function useEventsState() {
  const ctx = React.useContext(CtxState);
  if (!ctx)
    throw new Error('useEventsState must be used within EventsProvider');
  return ctx;
}

export function useEventsActions() {
  const ctx = React.useContext(CtxActions);
  if (!ctx)
    throw new Error('useEventsActions must be used within EventsProvider');
  return ctx;
}

// mainBannerColor용 hook
export function useEvents() {
  const context = useContext(MainBannerContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
