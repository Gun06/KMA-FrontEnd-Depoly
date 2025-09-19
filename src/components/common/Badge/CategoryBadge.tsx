import Badge from "./Badge";
import type { Category } from "@/components/common/Table/types";

const TONE: Record<Category, "primary" | "neutral" | "danger" | "success"> = {
  이벤트: "primary",
  공지: "neutral",
  대회: "danger",
  문의: "primary",
  답변: "success", // 답변은 success 톤 사용 (녹색)
};

export default function CategoryBadge({
  category,
  size = "sm", // 기본은 기존 sm
}: { category: Category; size?: "sm" | "xs" | "smd" | "md" }) {
  return (
    <Badge kind="category" tone={TONE[category]} size={size}>
      {category}
    </Badge>
  );
}