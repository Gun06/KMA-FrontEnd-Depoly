import { useState } from 'react';

export const useFaqAccordion = () => {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(index);
      // 한 번에 하나만 열리도록 설정
      next.clear();
      if (!isOpen) next.add(index);
      return next;
    });
  };

  const isOpen = (index: number) => openSet.has(index);

  return {
    openSet,
    toggle,
    isOpen
  };
};
