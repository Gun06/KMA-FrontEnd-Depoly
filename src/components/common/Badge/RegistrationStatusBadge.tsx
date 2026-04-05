// src/components/ui/Badge/RegistrationStatusBadge.tsx
import Badge from "./Badge";
import { cn } from "@/utils/cn";

export type RegStatus = "접수중" | "비접수" | "접수마감" | "최종마감" | "업로드신청";
export type BadgeSize = "sm" | "xs" | "smd" | "md";

const TONE: Record<RegStatus, "primary" | "danger" | "success" | "warning"> = {
  접수중: "primary",
  비접수: "danger",
  접수마감: "success",
  최종마감: "warning",
  업로드신청: "warning",
};

export default function RegistrationStatusBadge({
  status,
  size = "sm",
  className,
}: { status: RegStatus; size?: BadgeSize; className?: string }) {
  // '최종마감'에만 커스텀 주황색 적용
  if (status === '최종마감') {
    return (
      <Badge
        kind="registration"
        tone={TONE[status]}
        size={size}
        className={cn("bg-[#FF4500] text-white border-[#FF4500]", className)}
      >
        {status}
      </Badge>
    );
  }

  // '업로드신청'은 최종마감처럼 솔리드 노란색
  if (status === '업로드신청') {
    return (
      <Badge
        kind="registration"
        tone={TONE[status]}
        size={size}
        className={cn("bg-[#F59E0B] text-white border-[#F59E0B]", className)}
      >
        {status}
      </Badge>
    );
  }

  return (
    <Badge kind="registration" tone={TONE[status]} size={size} className={className}>
      {status}
    </Badge>
  );
}
