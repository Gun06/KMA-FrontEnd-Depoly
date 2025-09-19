// app/admin/users/organization/[id]/SettingsTab.tsx
'use client';

import React from 'react';

export default function SettingsTab({ orgId, orgName }: { orgId: number; orgName: string }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">설정</h2>
      <div className="rounded-md border p-4">
        <div className="text-[15px]">
          <div>
            <span className="text-[#6B7280]">단체명 :</span>{' '}
            <span className="font-semibold">{orgName}</span>
          </div>
          <div>
            <span className="text-[#6B7280]">단체 ID :</span> {orgId}
          </div>
        </div>
        <p className="mt-2 text-sm text-[#6B7280]">※ 여기서 대표/연락처/메모 등 편집 UI를 붙이면 됩니다.</p>
      </div>
    </section>
  );
}
