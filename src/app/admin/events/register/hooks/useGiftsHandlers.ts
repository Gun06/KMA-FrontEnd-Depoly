// src/app/admin/events/register/hooks/useGiftsHandlers.ts
'use client';

import { useState } from 'react';
import type { GiftItem } from '../components/sections/GiftsSection';

/**
 * 기념품 상태 및 핸들러를 관리하는 커스텀 훅
 */
export function useGiftsHandlers(initialGifts: GiftItem[] = []) {
  const [gifts, setGifts] = useState<GiftItem[]>(initialGifts);

  const handleAddGift = () => {
    setGifts([...gifts, { name: '', size: '' }]);
  };

  const handleRemoveGift = (index: number) => {
    setGifts(gifts.filter((_, i) => i !== index));
  };

  const handleChangeGiftName = (index: number, value: string) => {
    setGifts(gifts.map((g, i) => (i === index ? { ...g, name: value } : g)));
  };

  const handleChangeGiftSize = (index: number, value: string) => {
    setGifts(gifts.map((g, i) => (i === index ? { ...g, size: value } : g)));
  };

  const handleToggleGiftEnabled = (index: number, enabled: boolean) => {
    setGifts(gifts.map((g, i) => (i === index ? { ...g, isActive: enabled } : g)));
  };

  return {
    gifts,
    setGifts,
    handleAddGift,
    handleRemoveGift,
    handleChangeGiftName,
    handleChangeGiftSize,
    handleToggleGiftEnabled,
  };
}
