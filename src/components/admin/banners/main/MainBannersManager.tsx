'use client';

import React from 'react';
import Button from '@/components/common/Button/Button';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import type { UploadItem } from '@/components/common/Upload/types';
import MainBannersPreview, { MainBannerRow } from './components/MainBannersPreview';
import MainBannerGrid from './components/MainBannerGrid';
import MainBannerModal from './components/MainBannerModal';
import type { MainBannerFormData } from './types';
import { useMainBannersForAdmin, useCreateOrUpdateMainBanners, useUpdateMainBanner } from '@/hooks/useMainBanners';
import type { MainBannerResponse, MainBannerBatchRequest } from '@/types/mainBanner';
import type { MainBannerRowType } from './types';
import { convertApiToLocal, convertLocalToApi } from './utils/converters';
import { useMounted } from './hooks/useMounted';
import ConfirmModal from '@/components/common/Modal/ConfirmModal';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import ErrorModal from '@/components/common/Modal/ErrorModal';

// Types, utils, hooks는 별도 파일로 분리됨

/* ---------- Page ---------- */
export default function MainBannersManager() {
  const mounted = useMounted();
  const [mode, setMode] = React.useState<'manage' | 'preview'>('manage');
  const [rows, setRows] = React.useState<MainBannerRowType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // 모달 관련 state
  const [selectedBannerId, setSelectedBannerId] = React.useState<string | number | null>(null);
  const [modalMode, setModalMode] = React.useState<'create' | 'edit' | 'view'>('view');
  const [modalFormData, setModalFormData] = React.useState<MainBannerFormData>({ 
    title: '', 
    subtitle: '', 
    date: '', 
    eventId: undefined, 
    visible: true 
  });
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
  const { data: apiMainBanners, isLoading: isApiLoading } = useMainBannersForAdmin();
  const createOrUpdateMutation = useCreateOrUpdateMainBanners();
  const updateBannerMutation = useUpdateMainBanner();

  // API 데이터를 로컬 상태로 변환
  React.useEffect(() => {
    if (!mounted) return;
    
    if (apiMainBanners && apiMainBanners.length > 0) {
      const sortedBanners = [...apiMainBanners].sort((a, b) => Number(a.orderNo) - Number(b.orderNo));
      const convertedRows = convertApiToLocal(sortedBanners);
      setRows(convertedRows);
    } else if (!apiMainBanners) {
      setRows([]);
    }
  }, [mounted, apiMainBanners]);

  const updateRow = (id: string | number, patch: Partial<MainBannerRowType>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleAdd = () => {
    const newId = `temp_${Date.now()}`;
    setModalFormData({ title: '', subtitle: '', date: '', eventId: undefined, visible: true });
    setModalImageFile(null);
    setModalImageItem(null);
    setSelectedBannerId(newId);
    setModalMode('create');
  };

  const handleOpenView = (id: string | number) => {
    const banner = rows.find(r => r.id === id);
    if (!banner) return;
    
    setModalFormData({ 
      title: banner.title, 
      subtitle: banner.subtitle, 
      date: banner.date, 
      eventId: banner.eventId, 
      visible: banner.visible 
    });
    setModalImageFile(null);
    setModalImageItem(banner.image);
    setSelectedBannerId(id);
    setModalMode('view');
  };

  const handleOpenEdit = (id: string | number) => {
    const banner = rows.find(r => r.id === id);
    if (!banner) return;
    
    setModalFormData({ 
      title: banner.title, 
      subtitle: banner.subtitle, 
      date: banner.date, 
      eventId: banner.eventId, 
      visible: banner.visible 
    });
    setModalImageFile(null);
    setModalImageItem(banner.image);
    setSelectedBannerId(id);
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    if (modalImageFile && modalImageItem?.url && modalImageItem.url.startsWith('blob:')) {
      URL.revokeObjectURL(modalImageItem.url);
    }
    if (modalImageFile && modalImageItem?.previewUrl && modalImageItem.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(modalImageItem.previewUrl);
    }
    setSelectedBannerId(null);
    setModalImageFile(null);
    setModalImageItem(null);
  };

  const handleModalDelete = async () => {
    if (!selectedBannerId) return;
    
    const banner = rows.find(r => r.id === selectedBannerId);
    if (!banner) return;

    setConfirmModal({
      isOpen: true,
      message: '정말 삭제하시겠습니까?',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        try {
          if (banner.draft) {
            setRows(prev => prev.filter(r => r.id !== selectedBannerId));
            handleCloseModal();
            setSuccessModal({
              isOpen: true,
              title: '삭제되었습니다',
              message: '배너가 삭제되었습니다.',
            });
          } else {
            setRows(prev => prev.filter(r => r.id !== selectedBannerId));
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
      
      const { mainBannerInfos, images } = convertLocalToApi(rows);
      
      const deletedIds = apiMainBanners
        ?.filter(apiBanner => !rows.some(r => r.id === apiBanner.id))
        .map(banner => banner.id) || [];
      
      const requestData: MainBannerBatchRequest = {
        mainBannerInfos,
        deleteMainBannerIds: deletedIds,
      };
      
      await createOrUpdateMutation.mutateAsync({
        mainBannerBatchRequest: requestData,
        images
      });
      
      const updatedRows = rows.map(row => ({
        ...row,
        draft: false
      }));
      setRows(updatedRows);
      
      setSuccessModal({
        isOpen: true,
        title: '저장되었습니다',
        message: '메인 배너 정보가 성공적으로 저장되었습니다.',
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
    if (!selectedBannerId) return;

    try {
      setIsUploading(true);

      if (modalMode === 'create') {
        const newRow: MainBannerRowType = {
          id: selectedBannerId,
          title: modalFormData.title,
          subtitle: modalFormData.subtitle,
          date: modalFormData.date,
          eventId: modalFormData.eventId,
          image: modalImageFile ? {
            id: String(selectedBannerId),
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
        const banner = rows.find(r => r.id === selectedBannerId);
        if (!banner) return;

        if (banner.draft) {
          updateRow(selectedBannerId, {
            title: modalFormData.title,
            subtitle: modalFormData.subtitle,
            date: modalFormData.date,
            eventId: modalFormData.eventId,
            visible: modalFormData.visible,
            image: modalImageFile ? {
              id: String(selectedBannerId),
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
          await updateBannerMutation.mutateAsync({
            mainBannerId: String(selectedBannerId),
            mainBannerUpdateInfo: {
              title: modalFormData.title,
              subtitle: modalFormData.subtitle,
              date: modalFormData.date,
              eventId: modalFormData.eventId || '',
              deleteMainBannerIds: [],
            },
            image: modalImageFile ?? undefined
          });

          updateRow(selectedBannerId, {
            title: modalFormData.title,
            subtitle: modalFormData.subtitle,
            date: modalFormData.date,
            eventId: modalFormData.eventId,
            visible: modalFormData.visible,
            image: modalImageFile ? {
              id: String(selectedBannerId),
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
            message: '배너 정보가 성공적으로 저장되었습니다.',
          });
          handleCloseModal();
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
      title: r.title,
      subtitle: r.subtitle,
      date: r.date,
      eventId: r.eventId,
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
        <div className="text-gray-500">메인 배너 데이터를 불러오는 중...</div>
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
              새 배너 추가
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
                    목록에 추가하거나 수정한 배너 정보를 서버에 저장합니다. 저장하기 전에 모든 정보를 확인해주세요.
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
                <div className="text-gray-500 text-lg mb-2">등록된 배너가 없습니다</div>
                <div className="text-sm text-gray-400 mb-6">첫 번째 배너를 등록해보세요</div>
                <button
                  onClick={handleAdd}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  배너 등록하기
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-[1300px] mx-auto w-full">
              <MainBannerGrid
                items={gridItems}
                onItemClick={(id) => {
                  const banner = rows.find(r => r.id === id);
                  if (banner?.draft) {
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
                { text: '※ 새 배너를 추가하려면 "새 배너 추가" 버튼을 클릭하여 등록한 후, 반드시 "저장하기" 버튼을 눌러주세요.' },
                { text: '※ 이미지를 클릭하면 수정할 수 있습니다.' },
                { text: '※ 이미지는 JPG/PNG 권장, 가로 1600px 이상, 20MB 이하.' },
                { text: '※ 저장 전 항목은 목록에서 바로 수정 가능하며, 저장 후에는 이미지를 클릭하여 수정하세요.' },
              ]}
            />
          </div>
        </>
      ) : (
        <MainBannersPreview
          rows={rows.map((r) => ({
            id: r.id,
            visible: r.visible,
            image: r.image,
            badge: '대회 안내',
            title: r.title,
            subtitle: r.subtitle,
            date: r.date,
            eventId: r.eventId,
          }))}
        />
      )}

      {/* 모달 */}
      {selectedBannerId !== null && (
        <MainBannerModal
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
              const newItem: UploadItem = {
                id: String(selectedBannerId),
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
          onEdit={modalMode === 'view' ? () => handleOpenEdit(selectedBannerId) : undefined}
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

