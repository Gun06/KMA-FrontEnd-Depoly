// src/components/admin/forms/sections/PartiesSection.tsx
"use client";
import React from "react";
import PartyRows from "@/components/admin/Form/PartyRows";

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
    <>
      <PartyRows
        kind="주최"
        items={f.hostItems}
        onAdd={readOnly ? undefined : add(f.setHostItems)}           
        onRemove={readOnly ? undefined : remove(f.setHostItems)}      
        onChangeName={readOnly ? noop : changeName(f.setHostItems)}
        onChangeLink={readOnly ? noop : changeLink(f.setHostItems)}
        onChangeFile={readOnly ? noop : changeFile(f.setHostItems)}
        onToggleEnabled={readOnly ? undefined : toggle(f.setHostItems)}
        readOnly={readOnly}                                          
      />
      <PartyRows
        kind="주관"
        items={f.organizerItems}
        onAdd={readOnly ? undefined : add(f.setOrganizerItems)}
        onRemove={readOnly ? undefined : remove(f.setOrganizerItems)}
        onChangeName={readOnly ? noop : changeName(f.setOrganizerItems)}
        onChangeLink={readOnly ? noop : changeLink(f.setOrganizerItems)}
        onChangeFile={readOnly ? noop : changeFile(f.setOrganizerItems)}
        onToggleEnabled={readOnly ? undefined : toggle(f.setOrganizerItems)}
        readOnly={readOnly}
      />
      <PartyRows
        kind="후원"
        items={f.sponsorItems}
        onAdd={readOnly ? undefined : add(f.setSponsorItems)}
        onRemove={readOnly ? undefined : remove(f.setSponsorItems)}
        onChangeName={readOnly ? noop : changeName(f.setSponsorItems)}
        onChangeLink={readOnly ? noop : changeLink(f.setSponsorItems)}
        onChangeFile={readOnly ? noop : changeFile(f.setSponsorItems)}
        onToggleEnabled={readOnly ? undefined : toggle(f.setSponsorItems)}
        readOnly={readOnly}
      />
    </>
  );
}
