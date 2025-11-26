import Badge from "./Badge";

export type InquiryStatus = "대기" | "완료";

type Props = {
  answered: boolean;
  size?: "xs" | "sm" | "smd" | "md" | "pill";
};

export default function InquiryStatusBadge({ answered, size = "pill" }: Props) {
  const status: InquiryStatus = answered ? "완료" : "대기";
  const tone = answered ? "success" : "danger";

  return (
    <Badge variant="soft" tone={tone} size={size} className="justify-center">
      {status}
    </Badge>
  );
}
