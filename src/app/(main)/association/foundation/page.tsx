import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import Image from 'next/image'
import foundationImage from '@/assets/images/main/foundation.png'

export default function FoundationPage() {
  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "전마협",
        subMenu: "설립취지"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8">
          <div className="flex justify-center">
            <Image
              src={foundationImage}
              alt="설립취지"
              width={800}
              height={600}
              className="w-full h-auto max-w-4xl"
              priority
            />
          </div>
        </div>
      </div>
    </SubmenuLayout>
  )
}
