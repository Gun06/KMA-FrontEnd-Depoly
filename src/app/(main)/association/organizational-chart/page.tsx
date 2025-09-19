import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import Image from "next/image";
import organizationImage from "@/assets/images/main/organization.png";

export default function OrganizationalChartPage() {
  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "전마협",
        subMenu: "조직도"
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="p-6">
          <Image
            src={organizationImage}
            alt="조직도"
            width={800}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </SubmenuLayout>
  );
}
