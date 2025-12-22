// src/components/providers/AdminEventsContext.tsx
'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import type { EventRow } from '@/components/admin/events/EventTable';

type EventsState = {
  rows: EventRow[];
  /** ✅ 폼 전체 스냅샷 저장소: id -> buildApiBody() 결과 그대로 */
  forms: Record<string, unknown>; // number에서 string으로 변경 (UUID 지원)
};

type EventsActions = {
  setInitial: (rows: EventRow[]) => void;
  /** 있으면 업데이트, 없으면 추가 */
  upsertOne: (row: EventRow) => void;
  /** (하위호환) 부분 업데이트 — 없으면 최소 정보로 추가 */
  updateOne: (id: string, patch: Partial<EventRow>) => void; // number에서 string으로 변경
  removeOne: (id: string) => void; // number에서 string으로 변경
  addOne: (row: EventRow) => void;
  /** ✅ 폼 스냅샷 저장/읽기 */
  saveForm: (id: string, form: unknown) => void; // number에서 string으로 변경
  clearForm: (id: string) => void; // number에서 string으로 변경
};

const CtxState = React.createContext<EventsState | null>(null);
const CtxActions = React.createContext<EventsActions | null>(null);

const LS_KEY = 'events_ctx_v1';

interface AdminEventsProviderProps {
  children: ReactNode;
}

export function AdminEventsProvider({ children }: AdminEventsProviderProps) {
  const [rows, setRows] = React.useState<EventRow[]>([]);
  const [forms, setForms] = React.useState<Record<string, unknown>>({});

  // load
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.rows) setRows(parsed.rows);
        if (parsed?.forms) setForms(parsed.forms);
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

  const actions: EventsActions = {
    setInitial: init => setRows(prev => (prev.length ? prev : init)),
    /** ✅ 업서트: 같은 id 있으면 병합/교체, 없으면 추가 */
    upsertOne: row =>
      setRows(prev => {
        const idx = prev.findIndex(r => String(r.id) === String(row.id));
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
        const idx = prev.findIndex(r => String(r.id) === String(id));
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
        {children}
      </CtxActions.Provider>
    </CtxState.Provider>
  );
}

// Admin 페이지용 hooks
export function useAdminEventsState() {
  const ctx = useContext(CtxState);
  if (!ctx)
    throw new Error('useAdminEventsState must be used within AdminEventsProvider');
  return ctx;
}

export function useAdminEventsActions() {
  const ctx = useContext(CtxActions);
  if (!ctx)
    throw new Error('useAdminEventsActions must be used within AdminEventsProvider');
  return ctx;
}

