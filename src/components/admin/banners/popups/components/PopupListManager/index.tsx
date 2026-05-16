'use client';

import React from 'react';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import type { PopupItem, PopupBatchRequest } from '@/types/popup';
import type { PopupListManagerRef } from '../../types';
import { useMounted, popupDatetimeForApi } from '../../utils/helpers';
import { usePopupList, usePopupSave, usePopupRows } from '../../hooks';
import PopupPreview from '../PopupPreview';
import PopupListManagerHeader from './PopupListManagerHeader';
import PopupCard from './PopupCard';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import ErrorModal from '@/components/common/Modal/ErrorModal';

const PopupListManager = React.forwardRef<PopupListManagerRef, { eventId?: string }>(
  ({ eventId }, ref) => {
  const mounted = useMounted();
  const [mode, setMode] = React.useState<'manage' | 'preview'>('manage');
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [editingIds, setEditingIds] = React.useState<Set<string>>(new Set());
  const [successModal, setSuccessModal] = React.useState<{
    isOpen: boolean;
    title?: string;
    message: string;
  }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = React.useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: '' });

  // API 데이터 조회
  const { data: apiPopups } = usePopupList(eventId);

  // Rows 상태 관리
  const {
    rows,
    setRows,
    updateRow,
    move,
    addAfter,
    addNewPopup,
    removeAt,
  } = usePopupRows({
    apiPopups: apiPopups as PopupItem[] | undefined,
    eventId,
    mounted,
  });

  // 저장 mutation
  const saveMutation = usePopupSave({
    eventId,
    onSuccess: () => {
      setSuccessModal({
        isOpen: true,
        title: '저장되었습니다',
        message: '팝업 정보가 성공적으로 저장되었습니다.',
      });
      setMode('preview');
    },
    onError: (error: Error) => {
      setErrorModal({
        isOpen: true,
        message: error.message || '저장에 실패했습니다. 다시 시도해주세요.',
      });
    }
  });

  React.useImperativeHandle(ref, () => ({
    addNewPopup,
    handleSave,
  }));

  const handleSave = () => {
    const now = new Date();
    const defaultEndTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const popupInfos = rows.map((row, index) => ({
      id: row.draft ? undefined : row.id,
      url: row.url || '',
      startAt: popupDatetimeForApi(row.startAt, now),
      endAt: popupDatetimeForApi(row.endAt, defaultEndTime),
      device: row.device,
      orderNo: index + 1,
      eventId: row.eventId
    }));

    const deletedPopupIds = (apiPopups && Array.isArray(apiPopups))
      ? apiPopups
          .filter((apiPopup: PopupItem) => !rows.some(r => r.id === apiPopup.id))
          .map((popup: PopupItem) => popup.id)
      : [];

    const popupBatchRequest: PopupBatchRequest = {
      popupInfos,
      deletedPopupIds
    };

    const formData = new FormData();
    formData.append('popupBatchRequest', JSON.stringify(popupBatchRequest));
    
    const imagesToSend = rows.filter(row => row.draft && row.image?.file instanceof File);
    
    imagesToSend.forEach((row) => {
      if (row.image?.file instanceof File) {
        formData.append('images', row.image.file);
      }
    });

    saveMutation.mutate(formData);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleEdit = (id: string) => {
    setEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };


  if (!mounted) return null;

  return (
    <div>
      <PopupListManagerHeader
        mode={mode}
        eventId={eventId}
        onModeChange={setMode}
        onAddNew={addNewPopup}
        onSave={handleSave}
      />

      {mode === 'manage' ? (
        <>
          {/* 그리드 형태의 팝업 목록 (한 열에 3개) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
                <p className="text-slate-500 text-lg mb-2">등록된 팝업이 없습니다</p>
                <p className="text-slate-400 text-sm mb-4">위의 &quot;추가하기&quot; 버튼을 클릭하여 팝업을 추가하세요.</p>
              </div>
            ) : (
              rows.map((row, idx) => (
                <PopupCard
                  key={row.id}
                  row={row}
                  index={idx}
                  isExpanded={expandedIds.has(row.id)}
                  isEditing={editingIds.has(row.id)}
                  onToggleExpand={() => toggleExpand(row.id)}
                  onUpdate={(patch) => updateRow(row.id, patch)}
                  onMove={(dir) => move(idx, dir)}
                  onAddAfter={() => addAfter(idx)}
                  onRemove={() => removeAt(idx)}
                  onToggleEdit={() => toggleEdit(row.id)}
                  onVisibilityChange={(value) => updateRow(row.id, { visible: value })}
                  eventId={eventId}
                  onBatchSave={handleSave}
                />
              ))
            )}
          </div>

          <div className="mt-8 pt-4 pb-16">
            <NoticeMessage
              items={[
                { text: '※ 카드를 클릭하여 뒤집으면 상세 정보를 확인할 수 있습니다.' },
                { text: '※ 수정 버튼을 누르면 바로 수정할 수 있습니다. 수정 모드가 아닐 때는 읽기 전용입니다.' },
                { text: '※ 카드를 뒤집은 뒤 ▲ / ▼ 버튼으로 순서를 바꿀 수 있으며, 변경 후 상단 저장하기를 눌러야 반영됩니다.' },
                { text: '※ 기간을 비우면 항상 노출로 간주됩니다. (실서비스에서는 서버 검증 권장)' },
                { text: '※ 이미지는 JPG/PNG 권장, 가로 1200px 이상, 20MB 이하.' },
              ]}
            />
          </div>
        </>
      ) : (
        <div className="pb-56">
          <PopupPreview rows={rows} showControls ignorePeriod/>
        </div>
      )}

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="오류"
        message={errorModal.message}
      />
    </div>
  );
});

PopupListManager.displayName = 'PopupListManager';

export default PopupListManager;
