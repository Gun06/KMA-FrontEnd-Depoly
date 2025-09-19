import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import homeIcon from "@/assets/icons/event/home.svg";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const params = useParams();
  const eventId = params.eventId as string;
  
  // 마지막 아이템이 서브메뉴 제목
  const subMenuTitle = items[items.length - 1]?.label || "";

  // 대메뉴와 서브메뉴에 따른 링크 생성
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/event" }
    ];

    // 대메뉴 추가 (링크 포함)
    if (items[1]?.label === "대회안내") {
      baseItems.push({ label: "대회안내", href: `/event/${eventId}/guide/overview` });
    } else if (items[1]?.label === "참가신청") {
      baseItems.push({ label: "참가신청", href: `/event/${eventId}/registration/agreement` });
    } else if (items[1]?.label === "기록조회") {
      baseItems.push({ label: "기록조회", href: `/event/${eventId}/records` });
    } else if (items[1]?.label === "게시판") {
      baseItems.push({ label: "게시판", href: `/event/${eventId}/notices` });
    } else if (items[1]?.label === "기념품") {
      baseItems.push({ label: "기념품", href: `/event/${eventId}/merchandise` });
    } else {
      // 기본값
      baseItems.push({ label: items[1]?.label || "대회안내" });
    }

    // 서브메뉴 추가 (링크 없음)
    baseItems.push({ label: items[2]?.label || "대회요강" });

    return baseItems;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <div className={className}>
      {/* 브레드크럼 네비게이션 */}
      <nav className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
        <div className="flex justify-center">
          <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-0">
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400" />
                )}
                {item.href ? (
                  <Link 
                    href={item.href}
                    className="hover:text-gray-900 transition-colors duration-200 flex items-center gap-1 px-1 sm:px-0"
                  >
                    {index === 0 && (
                      <Image 
                        src={homeIcon} 
                        alt="홈" 
                        width={16} 
                        height={16}
                        className="w-3 h-3 sm:w-4 sm:h-4"
                      />
                    )}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium whitespace-nowrap">{item.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
      
      {/* 페이지 제목 */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 text-center mb-4 sm:mb-6 font-pretendard-extrabold px-2 sm:px-0">
        {subMenuTitle}
      </h1>
    </div>
  );
}
