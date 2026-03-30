// src/app/admin/events/register/components/sections/UploadsSection.tsx
import React from "react";
import { cn } from "@/utils/cn";
import FormTable from "@/components/admin/Form/FormTable";
import NoticeMessage from "@/components/admin/Form/NoticeMessage";
import FileSection from "@/components/admin/Form/FileSection";
import SortableFileSection from "@/components/admin/Form/SortableFileSection";
import { Minus, Plus } from "lucide-react";
import type { ReadonlyFile } from "@/components/common/Upload/ReadonlyFileList";
import type { UploadItem } from "@/components/common/Upload/types";
import type { TermsInfoItem } from "../../hooks/useCompetitionForm";

/** 업로드 필드 & 세터 타입 */
export type CompetitionForm = {
  // 배너(요강/메인) - 데스크탑/모바일
  bannerGuideDesktop: UploadItem[] | undefined;
  setBannerGuideDesktop: (items: UploadItem[]) => void;

  bannerGuideMobile: UploadItem[] | undefined;
  setBannerGuideMobile: (items: UploadItem[]) => void;

  bannerMainDesktop: UploadItem[] | undefined;
  setBannerMainDesktop: (items: UploadItem[]) => void;

  bannerMainMobile: UploadItem[] | undefined;
  setBannerMainMobile: (items: UploadItem[]) => void;

  // 홍보용(인스타)
  bannerInstagram: UploadItem[] | undefined;
  setBannerInstagram: (items: UploadItem[]) => void;

  // 사이드메뉴배너(herosection 이미지)
  bannerSideMenu: UploadItem[] | undefined;
  setBannerSideMenu: (items: UploadItem[]) => void;

  // 페이지별 이미지
  imgNotice: UploadItem[] | undefined;
  setImgNotice: (items: UploadItem[]) => void;

  imgPost: UploadItem[] | undefined;
  setImgPost: (items: UploadItem[]) => void;

  imgCourse: UploadItem[] | undefined;
  setImgCourse: (items: UploadItem[]) => void;

  imgGift: UploadItem[] | undefined;
  setImgGift: (items: UploadItem[]) => void;

  imgConfirm: UploadItem[] | undefined;
  setImgConfirm: (items: UploadItem[]) => void;

  imgResult: UploadItem[] | undefined;
  setImgResult: (items: UploadItem[]) => void;

  termsInfo: TermsInfoItem[] | undefined;
  addTermsInfo: () => void;
  removeTermsInfo: (index: number) => void;
  updateTermsInfo: (index: number, field: "title" | "content", value: string) => void;
};

type UploadsSectionProps = {
  f: CompetitionForm;
  readOnly: boolean;
};

// UploadItem[] -> ReadonlyFile[] 매핑
const toRO = (arr: UploadItem[] | undefined): ReadonlyFile[] =>
  (arr ?? []).map((it: UploadItem, i: number) => ({
    id: it?.id ?? i,
    name: it?.name ?? `파일 ${i + 1}`,
    sizeMB: it?.sizeMB,
    url: undefined, // UploadItem에 url이 없다고 했으니 유지
  }));

// 내용 높이만 살짝 여유 — 라벨엔 영향 없도록 content에만 패딩
const contentPad = (count: number) => (count > 0 ? "items-start py-2" : "items-center py-0");

export default function UploadsSection({ f, readOnly }: UploadsSectionProps) {
  const termsRows = f.termsInfo ?? [];
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);
  const previewTerm =
    previewIndex !== null && termsRows[previewIndex]
      ? termsRows[previewIndex]
      : null;

  return (
    <>
      {/* 배너 등록 */}
      <FormTable title="배너 등록" labelWidth={200} tightRows center>
        <FileSection
          label="대회메인 배너-데스크탑"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음 / 30MB 이내"}
          valueEditable={f.bannerMainDesktop}
          onChangeEditable={f.setBannerMainDesktop}
          valueReadonly={toRO(f.bannerMainDesktop)}
          contentClassName={cn("px-4", contentPad((f.bannerMainDesktop ?? []).length))}
          single={true}
        />
        <FileSection
          label="대회메인 배너-모바일"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음 / 30MB 이내"}
          valueEditable={f.bannerMainMobile}
          onChangeEditable={f.setBannerMainMobile}
          valueReadonly={toRO(f.bannerMainMobile)}
          contentClassName={cn("px-4", contentPad((f.bannerMainMobile ?? []).length))}
          single={true}
        />
        <FileSection
          label="대회메인 중간배너-데스크탑"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음 / 30MB 이내"}
          valueEditable={f.bannerGuideDesktop}
          onChangeEditable={f.setBannerGuideDesktop}
          valueReadonly={toRO(f.bannerGuideDesktop)}
          contentClassName={cn("px-4", contentPad((f.bannerGuideDesktop ?? []).length))}
          single={true}
        />
        <FileSection
          label="대회메인 중간배너-모바일"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음 / 30MB 이내"}
          valueEditable={f.bannerGuideMobile}
          onChangeEditable={f.setBannerGuideMobile}
          valueReadonly={toRO(f.bannerGuideMobile)}
          contentClassName={cn("px-4", contentPad((f.bannerGuideMobile ?? []).length))}
          single={true}
        />
        <FileSection
          label="홍보용(인스타배너)"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음 / 30MB 이내"}
          valueEditable={f.bannerInstagram}
          onChangeEditable={f.setBannerInstagram}
          valueReadonly={toRO(f.bannerInstagram)}
          contentClassName={cn("px-4", contentPad((f.bannerInstagram ?? []).length))}
          single={true}
        />
        <FileSection
          label="사이드메뉴배너"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음 / 30MB 이내"}
          valueEditable={f.bannerSideMenu}
          onChangeEditable={f.setBannerSideMenu}
          valueReadonly={toRO(f.bannerSideMenu)}
          contentClassName={cn("px-4", contentPad((f.bannerSideMenu ?? []).length))}
          single={true}
        />
      </FormTable>

      {/* 배너 등록 안내 메시지 */}
      <div className="flex mx-auto px-4">
        <NoticeMessage
          items={[
            { text: "※ 이미지는 jpg, jpeg, png, gif, webp, heic, heif, avif 만 지원합니다." },
            { text: "※ 실제 사이즈는 1440px × 200px을 지원합니다." },
            {
              text: "다만 해상도 문제로 업로드 시 2배(2880px × 400px)로 제작하여 부탁드립니다",
              highlight: true,
            },
          ]}
        />
      </div>

      {/* 3. 각 페이지별 이미지 등록 (드래그 앤 드롭 + 순서 변경 버튼) */}
      <FormTable title="각 페이지별 이미지 등록" labelWidth={200} tightRows center>
        <SortableFileSection
          label="유의사항 페이지"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음. 최대 10개 / 30MB 이내"}
          valueEditable={f.imgNotice}
          onChangeEditable={f.setImgNotice}
          valueReadonly={toRO(f.imgNotice)}
          contentClassName={cn("px-4", contentPad((f.imgNotice ?? []).length))}
        />
        <SortableFileSection
          label="대회요강 페이지"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음. 최대 10개 / 30MB 이내"}
          valueEditable={f.imgPost}
          onChangeEditable={f.setImgPost}
          valueReadonly={toRO(f.imgPost)}
          contentClassName={cn("px-4", contentPad((f.imgPost ?? []).length))}
        />
        <SortableFileSection
          label="대회코스 페이지"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음. 최대 10개 / 30MB 이내"}
          valueEditable={f.imgCourse}
          onChangeEditable={f.setImgCourse}
          valueReadonly={toRO(f.imgCourse)}
          contentClassName={cn("px-4", contentPad((f.imgCourse ?? []).length))}
        />
        <SortableFileSection
          label="기념품 상세 페이지"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음. 최대 10개 / 30MB 이내"}
          valueEditable={f.imgGift}
          onChangeEditable={f.setImgGift}
          valueReadonly={toRO(f.imgGift)}
          contentClassName={cn("px-4", contentPad((f.imgGift ?? []).length))}
        />
        <SortableFileSection
          label="집결/출발 이미지"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음. 최대 10개 / 30MB 이내"}
          valueEditable={f.imgConfirm}
          onChangeEditable={f.setImgConfirm}
          valueReadonly={toRO(f.imgConfirm)}
          contentClassName={cn("px-4", contentPad((f.imgConfirm ?? []).length))}
        />
      </FormTable>

      {/* 인증서 배경 이미지 (단일 파일) */}
      <FormTable title="인증서 배경 이미지" labelWidth={200} tightRows center>
        <FileSection
          label="인증서 배경 이미지"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음 / 30MB 이내"}
          valueEditable={f.imgResult}
          onChangeEditable={f.setImgResult}
          valueReadonly={toRO(f.imgResult)}
          contentClassName={cn("px-4", contentPad((f.imgResult ?? []).length))}
          single={true}
        />
      </FormTable>

      {/* 인증서 배경 이미지 안내 메시지 */}
      <div className="flex mx-auto px-4">
        <NoticeMessage
          items={[
            { text: "※ 이미지는 jpg, jpeg, png, gif만 지원합니다." },
            { text: "※ 실제 사이즈는 1200px × 200px을 지원합니다." },
            {
              text: "다만, 해상도 문제로 인하여 업로드는 각 2배인 2400px × 400px로 작업하여 업로드 부탁드립니다.",
              highlight: true,
            },
          ]}
        />
      </div>

      <FormTable
        title="약관 정보"
        labelWidth={200}
        tightRows
        center
        actions={
          !readOnly ? (
            <button
              type="button"
              onClick={f.addTermsInfo}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[13px] font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
              aria-label="약관 항목 추가"
            >
              <Plus size={16} strokeWidth={2.25} />
              추가
            </button>
          ) : undefined
        }
      >
        {termsRows.map((term, index) => (
          <div
            key={`${term.id ?? "new"}-${index}`}
            className="grid border-b border-neutral-200"
            style={{ gridTemplateColumns: "200px 1fr 56px" }}
          >
            <div className="bg-[#4D4D4D] text-white flex items-center justify-center text-[13px] border-r border-neutral-300 min-h-[52px]">
              약관 {index + 1}
            </div>
            <div className="bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={term.title}
                  onChange={(e) => f.updateTermsInfo(index, "title", e.target.value)}
                  placeholder="약관 제목을 입력하세요."
                  className="w-full h-9 px-1 text-[13px] border-0 border-b border-neutral-300 rounded-none bg-transparent focus:outline-none focus:ring-0 focus:border-blue-500"
                  readOnly={readOnly}
                />
                <button
                  type="button"
                  onClick={() => setPreviewIndex(index)}
                  className="h-9 px-3 shrink-0 text-[12px] font-medium border border-neutral-300 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                >
                  미리보기
                </button>
              </div>
              <div className="mt-0.5 pt-0">
              <textarea
                value={term.content}
                onChange={(e) => f.updateTermsInfo(index, "content", e.target.value)}
                placeholder="약관 내용을 입력하세요."
                rows={3}
                className="w-full min-h-[52px] px-1 py-1.5 text-[13px] border-0 rounded-none bg-transparent resize-y focus:outline-none focus:ring-0"
                readOnly={readOnly}
              />
              </div>
            </div>
            <div className="flex items-center justify-center bg-white border-l border-neutral-300">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => f.removeTermsInfo(index)}
                  aria-label={`약관 ${index + 1} 삭제`}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <Minus size={16} strokeWidth={2.25} />
                </button>
              )}
            </div>
          </div>
        ))}
      </FormTable>

      {/* 약관 정보 안내 (인증서 배경 이미지 안내와 동일 스타일/위치) */}
      <div className="flex mx-auto px-4 pt-2">
        <NoticeMessage
          items={[
            { text: "※ 우측 하단 모서리를 드래그하면 입력창을 더 크게 볼 수 있습니다." },
            { text: "※ 약관 정보는 필수 항목이 아닌 선택 사항입니다." },
          ]}
        />
      </div>

      {previewTerm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPreviewIndex(null)}
          />
          <div className="relative w-[calc(100%-2rem)] max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="text-[18px] font-bold text-gray-900">약관 미리보기</h3>
              <button
                type="button"
                onClick={() => setPreviewIndex(null)}
                className="h-8 px-3 text-[13px] rounded border border-neutral-300 hover:bg-neutral-50"
              >
                닫기
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto bg-white">
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="font-bold text-gray-800 mb-3 text-[15px]">
                  {previewTerm.title?.trim() || "제목 없음"}
                </p>
                <div className="space-y-2 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {previewTerm.content?.trim() || "내용이 없습니다."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
