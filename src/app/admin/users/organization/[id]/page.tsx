// src/app/admin/users/organization/[id]/page.tsx
import MembersClient from './MembersClient';
import SettingsTab from './SettingsTab';
import { getOrganizationById } from '@/data/users/organization';

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const id = Number(params.id);
  const tab = (searchParams?.tab ?? 'members') as 'members' | 'apps' | 'settings';
  const org = getOrganizationById(id);
  const orgName = org?.org ?? '알 수 없음';

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      {tab === 'members'  && <MembersClient orgId={id} orgName={orgName} initial={{
        page: 1, q: '', sortKey: 'id', sortDir: 'asc', member: '',
      }} />}
      {tab === 'settings' && <SettingsTab  orgId={id} orgName={orgName} />}
    </main>
  );
}
