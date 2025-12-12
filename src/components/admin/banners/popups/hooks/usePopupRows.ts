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
export function usePopupRows({ apiPopups, eventId, mounted }: UsePopupRowsOptions) {
  const [rows, setRows] = React.useState<PopupRow[]>([]);

  // API 데이터를 PopupRow로 변환
  React.useEffect(() => {
    if (!mounted) return;
    
    if (apiPopups && Array.isArray(apiPopups) && apiPopups.length > 0) {
      const convertedRows: PopupRow[] = apiPopups.map((popup: PopupItem) => ({
        id: popup.id,
        url: popup.url || '',
        image: popup.imageUrl ? {
          id: `${popup.id}_image`,
          file: new File([], `placeholder_${popup.id}`),
          name: getFileNameFromUrl(popup.imageUrl),
          size: 0,
          sizeMB: 0,
          tooLarge: false,
          url: popup.imageUrl
        } as UploadItem : null,
        visible: true,
        device: popup.device,
        startAt: formatDateForInput(popup.startAt),
        endAt: formatDateForInput(popup.endAt),
        orderNo: popup.orderNo,
        eventId: popup.eventId,
        draft: false
      }));

      setRows(convertedRows);
    } else {
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
        draft: true
      };

      setRows([newPopupRow]);
    }
  }, [apiPopups, mounted, eventId]);

  const updateRow = React.useCallback((id: string, patch: Partial<PopupRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const move = React.useCallback((idx: number, dir: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      next.forEach((row, index) => {
        row.orderNo = index + 1;
      });
      return next;
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
      next.forEach((row, index) => {
        row.orderNo = index + 1;
      });
      return next;
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
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      next.forEach((row, index) => {
        row.orderNo = index + 1;
      });
      return next;
    });
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

