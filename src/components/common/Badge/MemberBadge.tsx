import React from "react";
import Badge from "./Badge";

type Props = {
  isMember: boolean;
  size?: "pill" | "xs" | "smd" | "sm" | "md";
  className?: string;
};

export default function MemberBadge({ isMember, size = "pill", className }: Props) {
  return (
    <Badge
      variant="soft"
      tone={isMember ? "primary" : "danger"}
      size={size}
      className="justify-center"
    >
      {isMember ? "회원" : "비회원"}
    </Badge>
  );
}
