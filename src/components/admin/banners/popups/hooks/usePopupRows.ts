import React from 'react';
import type { PopupItem } from '@/types/popup';
import type { PopupRow } from '../types';
import type { UploadItem } from '@/components/common/Upload/types';
import { formatDateForInput, getFileNameFromUrl } from '../utils/helpers';

interface UsePopupRowsOptions {
  apiPopups: PopupItem[] | undefined;
  eventId?: string;
  mounted: boolean;
}

/**
 * 팝업 rows 상태 관리 및 CRUD 로직을 담당하는 커스텀 훅
 */
function buildApiPopupsSignature(popups: PopupItem[] | undefined): string {
  if (!popups?.length) return '';
  return [...popups]
    .sort((a, b) => Number(a.orderNo) - Number(b.orderNo))
    .map((p) => `${p.id}:${p.orderNo}:${p.url}:${p.startAt}:${p.endAt}:${p.device}`)
    .join('|');
}

function convertApiPopupsToRows(popups: PopupItem[], eventId?: string): PopupRow[] {
  const sorted = [...popups].sort((a, b) => Number(a.orderNo) - Number(b.orderNo));

  return sorted.map((popup: PopupItem, index) => ({
    id: popup.id,
    url: popup.url || '',
    image: popup.imageUrl
      ? {
          id: `${popup.id}_image`,
          file: new File([], `placeholder_${popup.id}`),
          name: getFileNameFromUrl(popup.imageUrl),
          size: 0,
          sizeMB: 0,
          tooLarge: false,
          url: popup.imageUrl,
        }
      : null,
    visible: true,
    device: popup.device,
    startAt: formatDateForInput(popup.startAt),
    endAt: formatDateForInput(popup.endAt),
    orderNo: index + 1,
    eventId: popup.eventId ?? eventId,
    draft: false,
  }));
}

export function usePopupRows({ apiPopups, eventId, mounted }: UsePopupRowsOptions) {
  const [rows, setRows] = React.useState<PopupRow[]>([]);
  const lastSyncedContextRef = React.useRef<string | null>(null);
  const apiSignature = React.useMemo(
    () => buildApiPopupsSignature(apiPopups),
    [apiPopups]
  );

  // API 데이터가 실제로 바뀔 때만 로컬 rows 동기화 (재조회만으로 순서 변경이 초기화되지 않도록)
  React.useEffect(() => {
    if (!mounted) return;

    const syncContext = `${eventId ?? 'main'}::${apiSignature}`;
    if (syncContext === lastSyncedContextRef.current) return;
    lastSyncedContextRef.current = syncContext;

    if (apiPopups && Array.isArray(apiPopups) && apiPopups.length > 0) {
      setRows(convertApiPopupsToRows(apiPopups, eventId));
    } else if (!apiSignature) {
      const newPopupRow: PopupRow = {
        id: `temp_${Date.now()}`,
        url: '',
        image: null,
        visible: true,
        device: 'BOTH',
        startAt: '',
        endAt: '',
        orderNo: 1,
        eventId: eventId,
        draft: true,
      };

      setRows([newPopupRow]);
    }
  }, [apiSignature, mounted, eventId, apiPopups]);

  const updateRow = React.useCallback((id: string, patch: Partial<PopupRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const move = React.useCallback((idx: number, dir: -1 | 1) => {
    setRows((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;

      const next = [...prev];
      [next[idx], next[j]] = [next[j], next[idx]];

      return next.map((row, index) => ({ ...row, orderNo: index + 1 }));
    });
  }, []);

  const addAfter = React.useCallback((idx: number) => {
    setRows((prev) => {
      const nextId = `temp_${Date.now()}`;
      const next = [...prev];
      next.splice(idx + 1, 0, {
        id: nextId, 
        url: '', 
        image: null, 
        visible: true, 
        device: 'BOTH', 
        startAt: '', 
        endAt: '', 
        orderNo: idx + 2,
        eventId: eventId,
        draft: true,
      });
      return next.map((row, index) => ({ ...row, orderNo: index + 1 }));
    });
  }, [eventId]);

  const addNewPopup = React.useCallback(() => {
    setRows((prev) => {
      const nextId = `temp_${Date.now()}`;
      const newPopup: PopupRow = {
        id: nextId,
        url: '',
        image: null,
        visible: true,
        device: 'BOTH',
        startAt: '',
        endAt: '',
        orderNo: prev.length + 1,
        eventId: eventId,
        draft: true,
      };
      return [...prev, newPopup];
    });
  }, [eventId]);

  const removeAt = React.useCallback((idx: number) => {
    setRows((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((row, index) => ({ ...row, orderNo: index + 1 }))
    );
  }, []);

  return {
    rows,
    setRows,
    updateRow,
    move,
    addAfter,
    addNewPopup,
    removeAt,
  };
}

