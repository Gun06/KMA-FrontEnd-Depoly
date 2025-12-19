"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { getGallery } from "./data/db";
import GalleryModal from "./components/GalleryModal";
import { upsertGallery, deleteGallery, getNextEventId } from "./data/db";
import type { Gallery } from "./data/types";
import { buildGalleryDateString, applySingleEventDate } from "./utils/galleryTransform";
import { updateGalleryByAdmin, deleteGalleryByAdmin } from "./api/galleryApi";
import GalleryGrid from "./components/GalleryGrid";
import type { GalleryGridItem } from "./components/GalleryGrid";
import { getAdminGalleries } from "./api/galleryListApi";
import FilterBar from "@/components/common/filters/FilterBar";
import { PRESETS } from "@/components/common/filters/presets";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";

export default function Client() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"no" | "date" | "title">("no");

  // ★ 여기서는 on/off 로 유지
  const [visible, setVisible] = React.useState<"on" | "off" | undefined>(undefined);

  // 팝업 관련 state
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"create" | "edit" | "view">("view");
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [gridItems, setGridItems] = React.useState<GalleryGridItem[]>([]);
  const [allItems, setAllItems] = React.useState<GalleryGridItem[]>([]);
  const [isLoadingList, setIsLoadingList] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // 필터링 함수
  const applyFilters = React.useCallback((items: GalleryGridItem[], searchQuery: string, sortType: "no" | "date" | "title", visibility?: "on" | "off") => {
    let filtered = [...items];

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.eventName.toLowerCase().includes(query) ||
          item.tagName.toLowerCase().includes(query)
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortType) {
        case "date":
          return new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime();
        case "title":
          return a.eventName.localeCompare(b.eventName, "ko");
        case "no":
        default:
          // ID 기반 역순 (최신순)
          return b.id.localeCompare(a.id);
      }
    });

    setGridItems(filtered);
  }, []);

  // 서버 갤러리 목록을 불러와 로컬 DB와 카드 미리보기를 동기화
  React.useEffect(() => {
    let cancelled = false;
    const fetchList = async () => {
      try {
        setIsLoadingList(true);
        // 페이지네이션 없이 전체 데이터를 한 번에 가져오기 (page=1, size를 크게 설정)
        const res = await getAdminGalleries(1, 10000);
        if (cancelled) return;

        const items: GalleryGridItem[] = res.content.map((item) => ({
          id: item.id,
          eventName: item.eventName,
          eventStartDate: item.eventStartDate,
          thumbnailUrl: item.thumbnailUrl,
          googlePhotoUrl: item.googlePhotoUrl,
          tagName: item.tagName,
        }));
        setAllItems(items);
        // 초기 필터링 적용
        applyFilters(items, q, sort, visible);

        // 로컬 메모리 DB도 동기화해서 모달에서 동일 데이터 사용
        items.forEach((it, index) => {
          const eventDate = it.eventStartDate.replace(/\./g, "-");
          const updated = applySingleEventDate(
            {
              eventId: it.id,
              tagName: it.tagName,
              title: it.eventName,
              googlePhotosUrl: it.googlePhotoUrl,
              thumbnailImageUrl: it.thumbnailUrl,
              visible: true,
              date: buildGalleryDateString(),
              views: 0,
              periodFrom: eventDate,
              periodTo: eventDate,
            } as Gallery,
            eventDate
          );
          upsertGallery(it.id, updated);
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setIsLoadingList(false);
      }
    };
    fetchList();
    return () => {
      cancelled = true;
    };
  }, [applyFilters, q, sort, visible]); // 페이지 변경 없이 최초 1회만 로드

  // 필터 변경 시 적용
  React.useEffect(() => {
    if (allItems.length > 0) {
      applyFilters(allItems, q, sort, visible);
    }
  }, [q, sort, visible, allItems, applyFilters]);

  // 선택된 갤러리 데이터
  const selectedGallery = React.useMemo<Gallery | null>(() => {
    if (!selectedEventId) return null;
    if (mode === "create") {
      return {
        eventId: getNextEventId(),
        tagName: "",
        title: "",
        visible: true,
        periodFrom: "",
        periodTo: "",
        googlePhotosUrl: "",
        thumbnailImageUrl: "",
        date: "",
        views: 0,
      };
    }
    return getGallery(selectedEventId) ?? null;
  }, [selectedEventId, mode]);

  const [value, setValue] = React.useState<Gallery | null>(selectedGallery);

  React.useEffect(() => {
    setValue(selectedGallery);
    setThumbnailFile(null);
  }, [selectedGallery]);

  const handleOpenCreate = () => {
    // 새로 만들기 전용 페이지로 이동 (모달 전용)
    router.push("/admin/galleries/write");
  };

  const handleOpenEdit = (eventId: string) => {
    setSelectedEventId(eventId);
    setMode("edit");
  };

  const handleOpenView = (eventId: string) => {
    setSelectedEventId(eventId);
    setMode("view");
  };

  const handleClose = () => {
    setSelectedEventId(null);
    setThumbnailFile(null);
    // 데이터 새로고침을 위해 페이지 상태 유지
  };

  const save = async () => {
    if (!value) return;
    if (!value.tagName.trim()) return alert("대회 태그명을 입력하세요.");
    if (!value.title.trim()) return alert("대회명을 입력하세요.");
    if (!value.periodFrom) return alert("대회 개최일을 입력하세요.");

    try {
      setIsUploading(true);

      // 1) 서버측 갤러리 수정 (썸네일은 있으면 교체)
      await updateGalleryByAdmin(
        value.eventId,
        {
          title: value.title.trim(),
          tagName: value.tagName.trim(),
          eventStartDate: value.periodFrom,
          googlePhotoUrl: (value.googlePhotosUrl ?? "").trim(),
        },
        thumbnailFile ?? undefined
      );

      // 2) 로컬 메모리 DB 동기화 (뷰 갱신용)
      const updated = applySingleEventDate(
        {
          ...value,
          tagName: value.tagName.trim(),
          title: value.title.trim(),
          googlePhotosUrl: (value.googlePhotosUrl ?? "").trim(),
          date: value.date || buildGalleryDateString(),
        },
        value.periodFrom
      );

      await upsertGallery(value.eventId, updated);

      setThumbnailFile(null);
      handleClose();
      // 페이지 새로고침 대신 상태 업데이트
      window.location.reload();
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      alert(`갤러리 수정 API 호출에 실패했습니다.\n\n${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedEventId) return;
    setShowDeleteConfirm(true);
  };

  const onDelete = async () => {
    if (!selectedEventId) return;
    try {
      setIsUploading(true);
      await deleteGalleryByAdmin(selectedEventId);
      // 로컬 DB에서도 제거
      deleteGallery(selectedEventId);
      setShowDeleteConfirm(false);
      handleClose();
      window.location.reload();
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      alert(`갤러리 삭제에 실패했습니다.\n\n${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const preset = PRESETS["관리자 / 갤러리 리스트"]?.props;

  return (
    <>
      <div className="px-4">
        {/* 상단: 검색 및 필터 바 */}
        <div className="max-w-[1300px] mx-auto w-full mb-6">
          <div className="flex items-center">
            <FilterBar
              {...preset}
              onFieldChange={(label, value) => {
                const L = String(label).replace(/\s/g, "");
                if (L === "정렬") {
                  setSort(value as "no" | "date" | "title");
                } else if (L === "공개여부") {
                  if (value === "open") setVisible("on");
                  else if (value === "closed") setVisible("off");
                  else setVisible(undefined);
                }
              }}
              onActionClick={(label) => {
                if (label === "등록하기") handleOpenCreate();
              }}
              onSearch={(query) => setQ(query)}
              onReset={() => {
                setSort("no");
                setVisible(undefined);
                setQ("");
              }}
            />
          </div>
        </div>

        {/* 카드 그리드 */}
        {isLoadingList ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : gridItems.length === 0 ? (
          <div className="max-w-[1300px] mx-auto w-full">
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-500 text-lg mb-2">등록된 갤러리가 없습니다</div>
              <div className="text-sm text-gray-400 mb-6">첫 번째 갤러리를 등록해보세요</div>
              <button
                onClick={handleOpenCreate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                갤러리 등록하기
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-[1300px] mx-auto w-full">
            <GalleryGrid
              items={gridItems}
              onItemClick={(id) => handleOpenView(id)}
            />
          </div>
        )}
      </div>

      {value && (mode === "create" || selectedEventId) && (
        <GalleryModal
          isOpen={true}
          onClose={handleClose}
          value={value}
          onChange={setValue}
          thumbnailFile={thumbnailFile}
          onThumbnailChange={setThumbnailFile}
          onSave={save}
          onDelete={mode === "view" && selectedEventId ? handleDeleteClick : undefined}
          onEdit={mode === "view" && selectedEventId ? () => handleOpenEdit(selectedEventId) : undefined}
          mode={mode}
          isUploading={isUploading}
        />
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title="갤러리 삭제"
        message="삭제하시겠습니까? 다시 제공하고자 하시면 재등록해주세요."
        confirmText="삭제하기"
        cancelText="취소"
        isLoading={isUploading}
        variant="danger"
      />
    </>
  );
}
