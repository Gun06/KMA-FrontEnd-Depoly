"use client";

import NotificationRegisterForm from "../../components/NotificationRegisterForm";

export default function Client() {
  return (
    <>
      <NotificationRegisterForm
        initialTargetType="all"
        hideTargetSelection={false}
      />
    </>
  );
}
