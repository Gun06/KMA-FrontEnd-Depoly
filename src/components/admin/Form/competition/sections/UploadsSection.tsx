// src/components/admin/forms/sections/UploadsSection.tsx (상단에)
import React from "react";
import { cn } from "@/utils/cn";
import FormTable from "@/components/admin/Form/FormTable";
import NoticeMessage from "@/components/admin/Form/NoticeMessage";
import FileSection from "@/components/admin/Form/FileSection";
import type { ReadonlyFile } from "@/components/common/Upload/ReadonlyFileList";
import type { UploadItem } from "@/components/common/Upload/types";

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
const contentPad = (count: number) => (count > 0 ? "items-start py-3" : "items-center py-0");

export default function UploadsSection({ f, readOnly }: UploadsSectionProps) {
  return (
    <>
      {/* 배너 등록 */}
      <FormTable title="배너 등록" labelWidth={200} center>
      <FileSection
          label="대회메인 배너-데스크탑"
          editable={!readOnly}
          single
          accept="image/*"
          maxSizeMB={30}
          valueEditable={f.bannerMainDesktop}
          onChangeEditable={f.setBannerMainDesktop}
          valueReadonly={toRO(f.bannerMainDesktop)}
          contentClassName={cn("px-4", contentPad((f.bannerMainDesktop ?? []).length))}
        />
        <FileSection
          label="대회메인 배너-모바일"
          editable={!readOnly}
          single
          accept="image/*"
          maxSizeMB={30}
          valueEditable={f.bannerMainMobile}
          onChangeEditable={f.setBannerMainMobile}
          valueReadonly={toRO(f.bannerMainMobile)}
          contentClassName={cn("px-4", contentPad((f.bannerMainMobile ?? []).length))}
        />
        <FileSection
          label="대회메인 중간배너-데스크탑"
          editable={!readOnly}
          single
          accept="image/*"
          maxSizeMB={30}
          valueEditable={f.bannerGuideDesktop}
          onChangeEditable={f.setBannerGuideDesktop}
          valueReadonly={toRO(f.bannerGuideDesktop)}
          contentClassName={cn("px-4", contentPad((f.bannerGuideDesktop ?? []).length))}
        />
        <FileSection
          label="대회메인 중간배너-모바일"
          editable={!readOnly}
          single
          accept="image/*"
          maxSizeMB={30}
          valueEditable={f.bannerGuideMobile}
          onChangeEditable={f.setBannerGuideMobile}
          valueReadonly={toRO(f.bannerGuideMobile)}
          contentClassName={cn("px-4", contentPad((f.bannerGuideMobile ?? []).length))}
        />
        <FileSection
          label="홍보용(인스타배너)"
          editable={!readOnly}
          single
          accept="image/*"
          maxSizeMB={30}
          valueEditable={f.bannerInstagram}
          onChangeEditable={f.setBannerInstagram}
          valueReadonly={toRO(f.bannerInstagram)}
          contentClassName={cn("px-4", contentPad((f.bannerInstagram ?? []).length))}
        />
        <FileSection
          label="사이드메뉴배너"
          editable={!readOnly}
          single
          accept="image/*"
          maxSizeMB={30}
          valueEditable={f.bannerSideMenu}
          onChangeEditable={f.setBannerSideMenu}
          valueReadonly={toRO(f.bannerSideMenu)}
          contentClassName={cn("px-4", contentPad((f.bannerSideMenu ?? []).length))}
        />
      </FormTable>

      <div className="flex mx-auto px-4">
        <NoticeMessage
          items={[
            { text: "※ 이미지는 jpg, jpeg, png, gif, webp, heic, heif, avif 만 지원합니다." },
            { text: "※ 실제 사이즈는 1440px × 200px을 지원합니다." },
            { text: "다만 해상도 문제로 업로드 시 2배(2880px × 400px)로 제작하여 부탁드립니다", highlight: true },
          ]}
        />
      </div>

      {/* 페이지별 이미지 등록 */}
      <FormTable title="페이지별 이미지 등록" labelWidth={200} center>
        <FileSection
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
        <FileSection
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
        <FileSection
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
        <FileSection
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
        <FileSection
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
        <FileSection
          label="인증서 배경 이미지"
          editable={!readOnly}
          accept="image/*"
          maxSizeMB={30}
          helper={"선택된 파일 없음. 최대 10개 / 30MB 이내"}
          valueEditable={f.imgResult}
          onChangeEditable={f.setImgResult}
          valueReadonly={toRO(f.imgResult)}
          contentClassName={cn("px-4", contentPad((f.imgResult ?? []).length))}
        />
      </FormTable>

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
    </>
  );
}
