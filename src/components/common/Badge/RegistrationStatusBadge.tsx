// src/components/ui/Badge/RegistrationStatusBadge.tsx
import Badge from "./Badge";

export type RegStatus = "접수중" | "비접수" | "접수마감";
export type BadgeSize =  "sm" | "xs" | "smd" | "md";

const TONE: Record<RegStatus, "primary" | "danger" | "success" | "warning"> = {
  접수중: "primary",
  비접수: "danger",
  접수마감: "success",
};

export default function RegistrationStatusBadge({
  status,
  size = "sm",
}: { status: RegStatus; size?: BadgeSize }) {
  return (
    <Badge kind="registration" tone={TONE[status]} size={size}>
      {status}
    </Badge>
  );
}
