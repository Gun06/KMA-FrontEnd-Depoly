import { useState, useCallback } from 'react';
import { SouvenirModalState, CategoryModalState, ConfirmModalState } from '../types';

export const useModalState = () => {
  const [souvenirModalState, setSouvenirModalState] = useState<SouvenirModalState>({
    isOpen: false,
    participantIndex: -1,
    categoryName: '',
    distance: undefined
  });

  const [categoryModalState, setCategoryModalState] = useState<CategoryModalState>({
    isOpen: false,
    participantIndex: -1
  });

  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
    open: false,
    message: ''
  });

  const handleOpenCategoryModal = useCallback((index: number) => {
    setCategoryModalState({
      isOpen: true,
      participantIndex: index
    });
  }, []);

  const handleCloseCategoryModal = useCallback(() => {
    setCategoryModalState({
      isOpen: false,
      participantIndex: -1
    });
  }, []);

  const handleOpenSouvenirModal = useCallback((index: number, categoryName: string, distance?: string) => {
    setSouvenirModalState({
      isOpen: true,
      participantIndex: index,
      categoryName,
      distance: distance || undefined
    });
  }, []);

  const handleCloseSouvenirModal = useCallback(() => {
    setSouvenirModalState({
      isOpen: false,
      participantIndex: -1,
      categoryName: '',
      distance: undefined
    });
  }, []);

  return {
    souvenirModalState,
    categoryModalState,
    confirmModalState,
    setConfirmModalState,
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleOpenSouvenirModal,
    handleCloseSouvenirModal
  };
};

