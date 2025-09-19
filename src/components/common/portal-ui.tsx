// src/components/common/Portal.tsx
import { createPortal } from "react-dom";
import { ReactNode, useEffect, useState } from "react";

export default function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(children, document.body);
}
