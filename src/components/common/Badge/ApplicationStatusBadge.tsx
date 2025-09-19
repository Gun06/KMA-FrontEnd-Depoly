// src/components/ui/Badge/ApplicationStatusBadge.tsx
import Badge from "./Badge";

export type AppStatus = "참가완료" | "접수중" | "접수취소";
export type BadgeSize = "xs" | "sm" | "md" |"smd";

const TONE: Record<AppStatus, "primary" | "success" | "danger"> = {
  참가완료: "primary",
  접수중: "success",
  접수취소: "danger",
};

export default function ApplicationStatusBadge({
  status,
  size = "sm",
}: { status: AppStatus; size?: BadgeSize }) {
  return (
    <Badge kind="application" tone={TONE[status]} size={size}>
      {status}
    </Badge>
  );
}
