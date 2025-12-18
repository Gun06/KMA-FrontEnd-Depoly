'use client';

import React from 'react';
import Link from 'next/link';
import AdminBannerTableShell from '@/components/admin/Table/AdminBannerTableShell';
import type { Column } from '@/components/admin/Table/BannerTable';
import Button from '@/components/common/Button/Button';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import SponsorUploader from '@/components/common/Upload/SponsorUploader';
import type { UploadItem } from '@/components/common/Upload/types';
import { ChevronUp, ChevronDown, Plus, Minus, Pencil } from 'lucide-react';
import SponsorsPreview from './SponsorsPreview';
import SponsorGrid from './SponsorGrid';
import SponsorModal from './SponsorModal';
import SponsorForm, { type SponsorFormData } from './SponsorForm';
import { useSponsors, useCreateOrUpdateSponsors, useUpdateSponsor } from '@/hooks/useSponsors';
import type { SponsorResponse } from '@/types/sponsor';
import ConfirmModal from '@/components/common/Modal/ConfirmModal';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import ErrorModal from '@/components/common/Modal/ErrorModal';

/* ---------- Types & Storage ---------- */
export type SponsorRow = {
  id: string | number; // API에서는 string, 로컬에서는 number
  url: string;
  image: UploadItem | null;
  visible: boolean;
  draft?: boolean; // 저장 전 편집 가능
  orderNo: number; // 순서 번호
};

type PersistRow = {
  id: number;
  url: string;
  visible: boolean;
  image: null | { name?: string; sizeMB?: number; url: string };
};

const LS_KEY = 'kma_admin_sponsors_v1';

// normalizeForStorage 함수는 API 연동으로 인해 더 이상 사용하지 않음

function loadFromStorage(): SponsorRow[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr: PersistRow[] = raw ? JSON.parse(raw) : [];
    return arr.map((r, i) => ({
      id: r.id ?? i + 1,
      url: r.url ?? '',
      visible: r.visible ?? true,
      image: r.image ? {
        id: String(r.id ?? i + 1),
        file: new File([], 'placeholder'),
        name: r.image.name || r.image.url.split('/').pop() || 'image',
        size: 0,
        sizeMB: r.image.sizeMB || 0,
        tooLarge: false,
        url: r.image.url,
        previewUrl: r.image.url
      } as UploadItem : null,
      draft: false,
      orderNo: i + 1
    }));
  } catch {
    return [];
  }
}

// saveToStorage 함수는 API 연동으로 인해 더 이상 사용하지 않음

/* ---------- Small UI ---------- */
function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

function CircleBtn({ kind, onClick }: { kind: 'up'|'down'|'plus'|'minus'; onClick: () => void }) {
  const base = 'inline-flex items-center justify-center h-9 w-9 rounded-full select-none';
  const isMove = kind === 'up' || kind === 'down';
  const cls = isMove ? `${base} border border-black text-black bg-white` : `${base} border border-black text-white bg-black`;
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={kind}>
      {kind === 'up'    && <ChevronUp   size={16} strokeWidth={2.2} />}
      {kind === 'down'  && <ChevronDown size={16} strokeWidth={2.2} />}
      {kind === 'plus'  && <Plus        size={16} strokeWidth={2.2} />}
      {kind === 'minus' && <Minus       size={16} strokeWidth={2.2} />}
    </button>
  );
}

function VisibilityChip({ value }: { value: boolean }) {
  const base = 'inline-flex items-center rounded-full px-2.5 h-7 text-[12px] font-medium border';
  return value
    ? <span className={`${base} bg-[#1E5EFF] border-[#1E5EFF] text-white`}>공개</span>
    : <span className={`${base} bg-[#EF4444] border-[#EF4444] text-white`}>비공개</span>;
}
function VisibilityChipsEditable({ value, onChange }: { value: boolean; onChange: (v:boolean)=>void }) {
  const base = 'rounded-full px-2.5 h-7 text-[12px] font-medium border';
  const onCls  = value ? `${base} bg-[#1E5EFF] border-[#1E5EFF] text-white` : `${base} bg-gray-100 border-gray-200 text-gray-600`;
  const offCls = !value ? `${base} bg-[#EF4444] border-[#EF4444] text-white` : `${base} bg-gray-100 border-gray-200 text-gray-600`;
  return (
    <div className="inline-flex items-center gap-1">
      <button type="button" onClick={() => onChange(true)}  className={onCls}>공개</button>
      <button type="button" onClick={() => onChange(false)} className={offCls}>비공개</button>
    </div>
  );
}

const inputCls =
  'w-full h-10 px-3 rounded-md bg-white border border-slate-200 hover:border-slate-300 ' +
  'focus:border-[#BFD7FF] outline-none ring-0 transition-colors shadow-none';

/* ---------- Page (list + preview) ---------- */
export default function SponsorsManager() {
  const mounted = useMounted();
  const [mode, setMode] = React.useState<'manage' | 'preview'>('manage');
  const [rows, setRows] = React.useState<SponsorRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // 모달 관련 state
  const [selectedSponsorId, setSelectedSponsorId] = React.useState<string | number | null>(null);
  const [modalMode, setModalMode] = React.useState<'create' | 'edit' | 'view'>('view');
  const [modalFormData, setModalFormData] = React.useState<SponsorFormData>({ url: '', visible: true });
  const [modalImageFile, setModalImageFile] = React.useState<File | null>(null);
  const [modalImageItem, setModalImageItem] = React.useState<UploadItem | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  // 알림 모달 state
  const [confirmModal, setConfirmModal] = React.useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  const [successModal, setSuccessModal] = React.useState<{ isOpen: boolean; title?: string; message: string }>({
    isOpen: false,
    message: '',
  });
  const [errorModal, setErrorModal] = React.useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  // API 훅들
  const { data: apiSponsors, isLoading: isApiLoading } = useSponsors();
  const createOrUpdateMutation = useCreateOrUpdateSponsors();
  const updateSponsorMutation = useUpdateSponsor();

  // API 데이터를 로컬 상태로 변환
  React.useEffect(() => {
    if (!mounted) return;
    
    if (apiSponsors && apiSponsors.length > 0) {
      // 디버깅용: API 응답 확인
      
      // API에서 받은 데이터를 orderNo로 정렬 (백엔드에서 정렬되지 않은 경우를 대비)
      const sortedSponsors = [...apiSponsors].sort((a, b) => Number(a.orderNo) - Number(b.orderNo));
      
      const convertedRows: SponsorRow[] = sortedSponsors
        .map((sponsor: SponsorResponse) => ({
          id: sponsor.id,
          url: sponsor.url,
          image: sponsor.imageUrl ? {
            url: sponsor.imageUrl,
            previewUrl: sponsor.imageUrl,
            name: `sponsor-${sponsor.id}`,
            sizeMB: 0
          } as unknown as UploadItem : null,
          visible: sponsor.visible,
          orderNo: sponsor.orderNo,
          draft: false
        }));

      setRows(convertedRows);
    } else {
      // API 데이터가 없거나 빈 배열일 때 로컬 스토리지에서 로드
      const initial = loadFromStorage();
      setRows(
        initial.length
          ? initial
          : [{ id: `temp_${Date.now()}`, url: '', image: null, visible: true, draft: true, orderNo: 1 }]
      );
    }
  }, [mounted, apiSponsors]);

  const updateRow = (id: string | number, patch: Partial<SponsorRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const move = (idx: number, dir: -1 | 1) =>
    setRows((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const addAfter = (idx: number) =>
    setRows((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, {
        id: `temp_${Date.now()}`, url: '', image: null, visible: true, draft: true, orderNo: idx + 2,
      });
      return next;
    });

  const removeAt = (idx: number) =>
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });

  const handleAdd = () => {
    const newId = `temp_${Date.now()}`;
    setModalFormData({ url: '', visible: true });
    setModalImageFile(null);
    setModalImageItem(null);
    setSelectedSponsorId(newId);
    setModalMode('create');
  };

  const handleOpenView = (id: string | number) => {
    const sponsor = rows.find(r => r.id === id);
    if (!sponsor) return;
    
    setModalFormData({ url: sponsor.url, visible: sponsor.visible });
    setModalImageFile(null);
    setModalImageItem(sponsor.image);
    setSelectedSponsorId(id);
    setModalMode('view');
  };

  const handleOpenEdit = (id: string | number) => {
    const sponsor = rows.find(r => r.id === id);
    if (!sponsor) return;
    
    setModalFormData({ url: sponsor.url, visible: sponsor.visible });
    setModalImageFile(null);
    setModalImageItem(sponsor.image);
    setSelectedSponsorId(id);
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    // 모달에서 생성한 이미지 URL 정리
    if (modalImageFile && modalImageItem?.url && modalImageItem.url.startsWith('blob:')) {
      URL.revokeObjectURL(modalImageItem.url);
    }
    if (modalImageFile && modalImageItem?.previewUrl && modalImageItem.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(modalImageItem.previewUrl);
    }
    setSelectedSponsorId(null);
    setModalImageFile(null);
    setModalImageItem(null);
  };

  const handleModalDelete = async () => {
    if (!selectedSponsorId) return;
    
    const sponsor = rows.find(r => r.id === selectedSponsorId);
    if (!sponsor) return;

    setConfirmModal({
      isOpen: true,
      message: '정말 삭제하시겠습니까?',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        try {
          // draft 항목이면 바로 삭제
          if (sponsor.draft) {
            setRows(prev => prev.filter(r => r.id !== selectedSponsorId));
            handleCloseModal();
            setSuccessModal({
              isOpen: true,
              title: '삭제되었습니다',
              message: '스폰서가 삭제되었습니다.',
            });
          } else {
            // 저장된 항목이면 rows에서 제거 (나중에 저장할 때 deletedSponsorIds에 포함됨)
            setRows(prev => prev.filter(r => r.id !== selectedSponsorId));
            handleCloseModal();
            setSuccessModal({
              isOpen: true,
              title: '삭제되었습니다',
              message: '변경사항을 저장하려면 "저장하기" 버튼을 눌러주세요.',
            });
          }
        } catch (error) {
          console.error(error);
          setErrorModal({
            isOpen: true,
            message: '삭제에 실패했습니다. 다시 시도해주세요.',
          });
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // 백엔드 요구사항에 맞춰 데이터 준비
      // 1. sponsorInfos: 저장 시점에 생성되어 있는 모든 스폰서 정보 (변경이 없더라도)
      const sponsorInfos = rows.map((r, index) => ({
        id: r.id && typeof r.id === 'string' && !r.id.startsWith('temp_') ? String(r.id) : null, // 임시 ID는 null로
        url: r.url.trim(),
        visible: r.visible,
        orderNo: index + 1 // 순서 번호 (저장 시점에 업데이트)
      }));

      // 2. deletedSponsorIds: 삭제되는 스폰서들의 id
      const deletedSponsorIds = apiSponsors
        ?.filter(apiSponsor => !rows.some(r => r.id === apiSponsor.id))
        .map(sponsor => sponsor.id) || [];

      // 3. images: 새로 생성된 스폰서(임시 ID)의 순서대로 이미지 파일 추출
      // sponsorInfos에서 id가 null인 항목들의 순서와 정확히 일치해야 함
      const images: File[] = [];
      for (const row of rows) {
        if (typeof row.id === 'string' && row.id.startsWith('temp_')) {
          // 새로 생성된 스폰서
          if (row.image && row.image.file instanceof File) {
            images.push(row.image.file);
          }
          // 이미지가 없어도 순서는 유지 (빈 값은 서버에서 처리)
        }
      }
      
      // 백엔드에서 images 필드를 필수로 요구하므로 항상 전송 (빈 배열이라도)

      // API 호출
      const _response = await createOrUpdateMutation.mutateAsync({
        sponsorBatchRequest: {
          sponsorInfos,
          deletedSponsorIds
        },
        images: images.filter((img): img is File => img !== null)
      });

      // 성공 시 로컬 상태 업데이트 (스폰서는 BATCH_SUCCESS 응답이므로 기존 데이터 유지)
      
      // 스폰서 API는 BATCH_SUCCESS 문자열을 반환하므로, 기존 rows를 그대로 유지하되 draft 상태만 변경
      const updatedRows = rows.map(row => ({
        ...row,
        draft: false
      }));
      setRows(updatedRows);
      setSuccessModal({
        isOpen: true,
        title: '저장되었습니다',
        message: '스폰서 정보가 성공적으로 저장되었습니다.',
      });
      setMode('preview');
      
    } catch (_error) {
      setErrorModal({
        isOpen: true,
        message: '저장에 실패했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSave = async () => {
    if (!selectedSponsorId) return;

    try {
      setIsUploading(true);

      if (modalMode === 'create') {
        // 새 스폰서 추가: rows에 추가
        const newRow: SponsorRow = {
          id: selectedSponsorId,
          url: modalFormData.url,
          image: modalImageFile ? {
            id: String(selectedSponsorId),
            file: modalImageFile,
            name: modalImageFile.name,
            size: modalImageFile.size,
            sizeMB: modalImageFile.size / (1024 * 1024),
            tooLarge: modalImageFile.size > 20 * 1024 * 1024,
            url: URL.createObjectURL(modalImageFile),
            previewUrl: URL.createObjectURL(modalImageFile)
          } as UploadItem : null,
          visible: modalFormData.visible,
          draft: true,
          orderNo: rows.length + 1
        };
        setRows(prev => [...prev, newRow]);
        handleCloseModal();
      } else if (modalMode === 'edit') {
        // 기존 스폰서 수정
        const sponsor = rows.find(r => r.id === selectedSponsorId);
        if (!sponsor) return;

        if (sponsor.draft) {
          // 아직 저장되지 않은 항목: 로컬 상태만 업데이트
          updateRow(selectedSponsorId, {
            url: modalFormData.url,
            visible: modalFormData.visible,
            image: modalImageFile ? {
              id: String(selectedSponsorId),
              file: modalImageFile,
              name: modalImageFile.name,
              size: modalImageFile.size,
              sizeMB: modalImageFile.size / (1024 * 1024),
              tooLarge: modalImageFile.size > 20 * 1024 * 1024,
              url: URL.createObjectURL(modalImageFile),
              previewUrl: URL.createObjectURL(modalImageFile)
            } as UploadItem : modalImageItem
          });
          handleCloseModal();
        } else {
          // 이미 저장된 항목: API 호출
          await updateSponsorMutation.mutateAsync({
            sponsorId: String(selectedSponsorId),
            sponsorUpdateInfo: {
              url: modalFormData.url,
              visible: modalFormData.visible
            },
            image: modalImageFile ?? undefined
          });

          // 로컬 상태 업데이트
          updateRow(selectedSponsorId, {
            url: modalFormData.url,
            visible: modalFormData.visible,
            image: modalImageFile ? {
              id: String(selectedSponsorId),
              file: modalImageFile,
              name: modalImageFile.name,
              size: modalImageFile.size,
              sizeMB: modalImageFile.size / (1024 * 1024),
              tooLarge: modalImageFile.size > 20 * 1024 * 1024,
              url: URL.createObjectURL(modalImageFile),
              previewUrl: URL.createObjectURL(modalImageFile)
            } as UploadItem : modalImageItem
          });

          setSuccessModal({
            isOpen: true,
            title: '저장되었습니다',
            message: '스폰서 정보가 성공적으로 저장되었습니다.',
          });
          handleCloseModal();
          // API 데이터 새로고침
          window.location.reload();
        }
      }
    } catch (error) {
      console.error(error);
      setErrorModal({
        isOpen: true,
        message: '저장에 실패했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 그리드 아이템으로 변환
  const gridItems = React.useMemo(() => {
    return rows.map((r) => ({
      id: r.id,
      url: r.url,
      imageUrl: r.image?.url || r.image?.previewUrl || null,
      visible: r.visible,
      orderNo: r.orderNo
    }));
  }, [rows]);

  if (!mounted) return null;

  // 로딩 상태
  if (isApiLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">스폰서 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4">
      {/* 헤더: 모드 토글 + 저장 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg border bg-white p-1 inline-flex gap-1">
          <button
            type="button"
            onClick={() => setMode('manage')}
            className={`px-3 h-9 rounded-md text-sm ${mode === 'manage' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
          >
            관리
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 h-9 rounded-md text-sm ${mode === 'preview' ? 'bg-[#1E5EFF] text-white' : 'text-gray-700'}`}
          >
            미리보기
          </button>
        </div>
        {mode === 'manage' ? (
          <div className="flex gap-2">
            <Button size="sm" tone="neutral" widthType="pager" onClick={handleAdd}>
              새 스폰서 추가
            </Button>
            <div className="relative group">
              <Button 
                size="sm" 
                tone="primary" 
                widthType="pager" 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '저장하기'}
              </Button>
              {/* 툴팁 */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-[100] pointer-events-none" style={{ width: 'max-content', maxWidth: '320px' }}>
                <div className="bg-gray-900 text-white rounded-lg py-3 px-4 shadow-xl" style={{ minWidth: '280px', width: 'max-content' }}>
                  <div className="font-semibold mb-2 text-sm">저장하기</div>
                  <div className="text-xs text-gray-300 leading-relaxed" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    목록에 추가하거나 수정한 스폰서 정보를 서버에 저장합니다. 저장하기 전에 모든 정보를 확인해주세요.
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        ) : <div />}
      </div>

      {mode === 'manage' ? (
        <>
          {gridItems.length === 0 ? (
            <div className="max-w-[1300px] mx-auto w-full">
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
                <div className="text-gray-500 text-lg mb-2">등록된 스폰서가 없습니다</div>
                <div className="text-sm text-gray-400 mb-6">첫 번째 스폰서를 등록해보세요</div>
                <button
                  onClick={handleAdd}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  스폰서 등록하기
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-[1300px] mx-auto w-full">
              <SponsorGrid
                items={gridItems}
                onItemClick={(id) => {
                  const sponsor = rows.find(r => r.id === id);
                  if (sponsor?.draft) {
                    handleOpenEdit(id);
                  } else {
                    handleOpenView(id);
                  }
                }}
              />
            </div>
          )}

          <div className="mt-8 pt-4 pb-16">
            <NoticeMessage
              items={[
                { text: '※ 새 스폰서를 추가하려면 "새 스폰서 추가" 버튼을 클릭하여 등록한 후, 반드시 "저장하기" 버튼을 눌러주세요.' },
                { text: '※ 이미지를 클릭하면 수정할 수 있습니다.' },
                { text: '※ 이미지는 JPG/PNG 권장, 가로 1600px 이상 (비율 2:1), 20MB 이하.' },
                { text: '※ 저장 전 항목은 목록에서 바로 수정 가능하며, 저장 후에는 이미지를 클릭하여 수정하세요.' },
              ]}
            />
          </div>
        </>
      ) : (
        <SponsorsPreview
          rows={rows.map((r) => ({ 
            visible: r.visible, 
            url: r.image?.url || '', 
            file: r.image 
          }))}
        />
      )}

      {/* 모달 */}
      {selectedSponsorId !== null && (
        <SponsorModal
          isOpen={true}
          onClose={handleCloseModal}
          value={modalFormData}
          onChange={setModalFormData}
          imageFile={modalImageFile}
          imageItem={modalImageItem}
          onImageChange={(file) => {
            setModalImageFile(file);
            if (!file) {
              setModalImageItem(null);
            } else {
              // 새 파일이 선택되면 UploadItem 생성
              const newItem: UploadItem = {
                id: String(selectedSponsorId),
                file: file,
                name: file.name,
                size: file.size,
                sizeMB: file.size / (1024 * 1024),
                tooLarge: file.size > 20 * 1024 * 1024,
                url: URL.createObjectURL(file),
                previewUrl: URL.createObjectURL(file)
              };
              setModalImageItem(newItem);
            }
          }}
          onSave={handleModalSave}
          mode={modalMode}
          isUploading={isUploading}
          onEdit={modalMode === 'view' ? () => handleOpenEdit(selectedSponsorId) : undefined}
          onDelete={modalMode !== 'create' ? handleModalDelete : undefined}
        />
      )}

      {/* 커스텀 알림 모달들 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        title="확인"
        message={confirmModal.message}
        confirmText="확인"
        cancelText="취소"
      />
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
}
