import { SubmenuLayout } from '@/layouts/main/SubmenuLayout';
import { OrganizationalChart } from '@/components/main/association/organizational-chart/OrganizationalChart';

export default function OrganizationalChartPage() {
  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: '전마협',
        subMenu: '조직도',
      }}
    >
      <OrganizationalChart />
    </SubmenuLayout>
  );
}
