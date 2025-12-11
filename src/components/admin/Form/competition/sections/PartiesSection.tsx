// src/components/admin/forms/sections/PartiesSection.tsx
"use client";
import React from "react";
import PartyRows from "@/components/admin/Form/PartyRows";
import FormTable from "@/components/admin/Form/FormTable";
import NoticeMessage from "@/components/admin/Form/NoticeMessage";
import { Plus } from "lucide-react";

export default function PartiesSection({
  f,
  readOnly,
}: {
  f: any;
  readOnly: boolean;
}) {
  const noop = () => {};
  const add        = (setter: any) => () =>
    setter((p: any[]) => [...p, { name: "", link: "", file: [], enabled: false }]); // 기본값 OFF
  const remove     = (setter: any) => (i: number) =>
    setter((p: any[]) => p.filter((_, idx) => idx !== i));
  const changeName = (setter: any) => (i: number, v: string) =>
    setter((p: any[]) => p.map((it, j) => (j === i ? { ...it, name: v } : it)));
  const changeLink = (setter: any) => (i: number, v: string) =>
    setter((p: any[]) => p.map((it, j) => (j === i ? { ...it, link: v } : it)));
  const changeFile = (setter: any) => (i: number, files: any[]) =>
    setter((p: any[]) => p.map((it, j) => (j === i ? { ...it, file: files } : it)));
  const toggle     = (setter: any) => (i: number, v: boolean) =>
    setter((p: any[]) => p.map((it, j) => (j === i ? { ...it, enabled: v } : it)));

  return (
    <div className="space-y-6">
      {/* 주최 섹션 */}
      <FormTable 
        title="주최 배너" 
        labelWidth={200} 
        center
        actions={
          !readOnly && (
            <button
              type="button"
              onClick={add(f.setHostItems)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
              aria-label="주최 항목 추가"
            >
              <Plus size={16} strokeWidth={2.25} />
              추가
            </button>
          )
        }
      >
      <PartyRows
        kind="주최"
        items={f.hostItems}
          onAdd={undefined} // 헤더의 추가 버튼 사용
        onRemove={readOnly ? undefined : remove(f.setHostItems)}      
        onChangeName={readOnly ? noop : changeName(f.setHostItems)}
        onChangeLink={readOnly ? noop : changeLink(f.setHostItems)}
        onChangeFile={readOnly ? noop : changeFile(f.setHostItems)}
        onToggleEnabled={readOnly ? undefined : toggle(f.setHostItems)}
        readOnly={readOnly}                                          
      />
      </FormTable>

      {/* 주관 섹션 */}
      <FormTable 
        title="주관 배너" 
        labelWidth={200} 
        center
        actions={
          !readOnly && (
            <button
              type="button"
              onClick={add(f.setOrganizerItems)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
              aria-label="주관 항목 추가"
            >
              <Plus size={16} strokeWidth={2.25} />
              추가
            </button>
          )
        }
      >
      <PartyRows
        kind="주관"
        items={f.organizerItems}
          onAdd={undefined} // 헤더의 추가 버튼 사용
        onRemove={readOnly ? undefined : remove(f.setOrganizerItems)}
        onChangeName={readOnly ? noop : changeName(f.setOrganizerItems)}
        onChangeLink={readOnly ? noop : changeLink(f.setOrganizerItems)}
        onChangeFile={readOnly ? noop : changeFile(f.setOrganizerItems)}
        onToggleEnabled={readOnly ? undefined : toggle(f.setOrganizerItems)}
        readOnly={readOnly}
      />
      </FormTable>

      {/* 후원 섹션 */}
      <FormTable 
        title="후원 배너" 
        labelWidth={200} 
        center
        actions={
          !readOnly && (
            <button
              type="button"
              onClick={add(f.setSponsorItems)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#4D4D4D] rounded-md hover:bg-[#3D3D3D] transition-colors"
              aria-label="후원 항목 추가"
            >
              <Plus size={16} strokeWidth={2.25} />
              추가
            </button>
          )
        }
      >
      <PartyRows
        kind="후원"
        items={f.sponsorItems}
          onAdd={undefined} // 헤더의 추가 버튼 사용
        onRemove={readOnly ? undefined : remove(f.setSponsorItems)}
        onChangeName={readOnly ? noop : changeName(f.setSponsorItems)}
        onChangeLink={readOnly ? noop : changeLink(f.setSponsorItems)}
        onChangeFile={readOnly ? noop : changeFile(f.setSponsorItems)}
        onToggleEnabled={readOnly ? undefined : toggle(f.setSponsorItems)}
        readOnly={readOnly}
      />
      </FormTable>

      {/* 주최/주관/후원 안내 메시지 */}
      <div className="flex mx-auto px-4">
        <NoticeMessage
          items={[
            { text: '※ 이미지는 jpg, jpeg, png, gif, webp, heic, heif, avif 만 지원합니다.' },
            {
              text: '주최/주관/후원은 대회 페이지의 Footer 상단에 위치합니다.',
            },
            {
              text: "고정시키고 싶은 배너는 'OFF'를, 자동 스크롤을 원하는 배너는 'ON'을 선택하세요.",
            },
            { text: '※ 실제 사이즈는 220 × 80px을 지원합니다.' },
            {
              text: '다만 해상도 문제로 업로드 시 2배(440 × 160px)로 제작하여 부탁드립니다',
              highlight: true,
            },
          ]}
        />
      </div>
    </div>
  );
}
