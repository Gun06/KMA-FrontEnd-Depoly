'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import FormRow from '@/components/admin/Form/FormRow';
import { FormLayoutProvider } from '@/components/admin/Form/FormLayoutContext';
import NoticeMessage from '@/components/admin/Form/NoticeMessage';
import { MiniToggle } from '@/components/admin/Form/PartyRows';
import type { EventSettingSpec } from '@/types/eventSetting';

type Props = {
  settings: EventSettingSpec;
  onChange: (next: EventSettingSpec) => void;
  readOnly?: boolean;
};

export default function EventSettingSection({
  settings,
  onChange,
  readOnly = false,
}: Props) {
  const textCls = readOnly ? 'text-[#646464]' : 'text-neutral-700';

  return (
    <div id="event-setting-section">
      <h1 className="text-[17px] font-semibold mb-3 text-left">신청 UI 설정</h1>
      <FormLayoutProvider labelWidth={200} tightRows>
        <div className="w-full border border-neutral-300 rounded-sm">
          <div className="w-full divide-y divide-neutral-300 bg-white">
            <FormRow
              label="단체신청"
              contentClassName="items-center px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <MiniToggle
                  value={settings.groupRegistrationEnabled}
                  onChange={
                    readOnly
                      ? undefined
                      : (value) =>
                          onChange({
                            ...settings,
                            groupRegistrationEnabled: value,
                          })
                  }
                  disabled={readOnly}
                  className="shrink-0"
                />
                <span className={cn('text-[13px]', textCls)}>
                  {settings.groupRegistrationEnabled
                    ? '단체신청 버튼 노출'
                    : '단체신청 버튼 숨김'}
                </span>
              </div>
            </FormRow>
            <FormRow
              label="개인 ID 불러오기"
              contentClassName="items-center px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <MiniToggle
                  value={settings.individualLoginIdEnabled}
                  onChange={
                    readOnly
                      ? undefined
                      : (value) =>
                          onChange({
                            ...settings,
                            individualLoginIdEnabled: value,
                          })
                  }
                  disabled={readOnly}
                  className="shrink-0"
                />
                <span className={cn('text-[13px]', textCls)}>
                  {settings.individualLoginIdEnabled
                    ? '전마협 아이디·정보 불러오기 노출'
                    : '전마협 아이디·정보 불러오기 숨김'}
                </span>
              </div>
            </FormRow>
          </div>
        </div>
      </FormLayoutProvider>
      <div className="flex mx-auto px-4 mt-2">
        <NoticeMessage
          items={[
            {
              text: '※ 대회 생성 시 기본값은 모두 사용(ON)입니다.',
            },
            {
              text: '※ 변경 사항은 아래 저장 버튼으로 반영됩니다.',
            },
          ]}
        />
      </div>
    </div>
  );
}
