// src/components/ui/Badge/RegistrationStatusBadge.tsx
import Badge from "./Badge";

export type RegStatus = "접수중" | "비접수" | "접수마감" | "내부마감";
export type BadgeSize = "sm" | "xs" | "smd" | "md";

const TONE: Record<RegStatus, "primary" | "danger" | "success" | "warning"> = {
  접수중: "primary",
  비접수: "danger",
  접수마감: "success",
  내부마감: "warning",
};

export default function RegistrationStatusBadge({
  status,
  size = "sm",
}: { status: RegStatus; size?: BadgeSize }) {
  // '내부마감'에만 커스텀 주황색 적용
  if (status === '내부마감') {
    return (
      <Badge
        kind="registration"
        tone={TONE[status]}
        size={size}
        className="bg-[#FF4500] text-white border-[#FF4500]"
      >
        {status}
      </Badge>
    );
  }

  return (
    <Badge kind="registration" tone={TONE[status]} size={size}>
      {status}
    </Badge>
  );
}
