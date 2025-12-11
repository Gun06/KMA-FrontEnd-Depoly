'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export type CoachmarkStep = {
  id: string;
  target?: string; // CSS selector 또는 ref ID (선택사항)
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  skipTarget?: boolean; // 타겟을 찾지 않고 중앙에 표시할지 여부
};

type CoachmarkProps = {
  steps: CoachmarkStep[];
  storageKey: string; // 로컬 스토리지 키
  onComplete?: () => void;
  onSkip?: () => void;
  forceShow?: boolean; // 강제로 표시할지 여부
};

export default function Coachmark({
  steps,
  storageKey,
  onComplete,
  onSkip,
  forceShow = false,
}: CoachmarkProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지에서 완료 여부 확인 또는 강제 표시
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      const completed = localStorage.getItem(storageKey);
      if (!completed) {
        setIsVisible(true);
      }
    }
  }, [storageKey, forceShow]);

  // 현재 단계의 타겟 요소 찾기
  useEffect(() => {
    if (!isVisible || currentStep >= steps.length) return;

    const step = steps[currentStep];
    
    // skipTarget이 true이거나 target이 없으면 타겟을 찾지 않음
    if (step.skipTarget || !step.target) {
      setTargetElement(null);
      return;
    }

    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      // skipTarget이 아닌 경우에만 스크롤 이동
      if (!step.skipTarget) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetElement(null);
    }
  }, [currentStep, isVisible, steps]);

  // 툴팁 위치 계산 및 오버레이 업데이트
  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const step = steps[currentStep];
    const position = step.position || 'bottom';

    // 타겟이 없거나 skipTarget이 true인 경우 중앙에 표시
    if (!targetElement || step.skipTarget) {
      const tooltipX = window.innerWidth / 2;
      const tooltipY = window.innerHeight / 2;
      tooltip.style.transform = 'translate(-50%, -50%)';
      tooltip.style.top = `${tooltipY}px`;
      tooltip.style.left = `${tooltipX}px`;
      return;
    }

    // 타겟 요소가 있는 경우
    const rect = targetElement.getBoundingClientRect();

    // 타겟 요소에 하이라이트 효과 추가
    targetElement.style.outline = '3px solid #3b82f6';
    targetElement.style.outlineOffset = '4px';
    targetElement.style.zIndex = '1000';
    targetElement.style.position = 'relative';

    // 툴팁 위치 설정
    let tooltipX = 0;
    let tooltipY = 0;
    const padding = 16;

    switch (position) {
      case 'top':
        tooltipX = rect.left + rect.width / 2;
        tooltipY = rect.top - padding;
        tooltip.style.transform = 'translate(-50%, -100%)';
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.left = `${tooltipX}px`;
        break;
      case 'bottom':
        tooltipX = rect.left + rect.width / 2;
        tooltipY = rect.bottom + padding;
        tooltip.style.transform = 'translate(-50%, 0)';
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.left = `${tooltipX}px`;
        break;
      case 'left':
        tooltipX = rect.left - padding;
        tooltipY = rect.top + rect.height / 2;
        tooltip.style.transform = 'translate(-100%, -50%)';
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.left = `${tooltipX}px`;
        break;
      case 'right':
        tooltipX = rect.right + padding;
        tooltipY = rect.top + rect.height / 2;
        tooltip.style.transform = 'translate(0, -50%)';
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.left = `${tooltipX}px`;
        break;
      case 'center':
        tooltipX = window.innerWidth / 2;
        tooltipY = window.innerHeight / 2;
        tooltip.style.transform = 'translate(-50%, -50%)';
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.left = `${tooltipX}px`;
        break;
    }

    // 정리 함수
    return () => {
      if (targetElement) {
        targetElement.style.outline = '';
        targetElement.style.outlineOffset = '';
        targetElement.style.zIndex = '';
        targetElement.style.position = '';
      }
    };
  }, [targetElement, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onSkip?.();
  };

  if (!isVisible || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <>
      {/* 오버레이 */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] pointer-events-auto bg-black bg-opacity-50"
      />

      {/* 툴팁 */}
      <div
        ref={tooltipRef}
        className="fixed z-[70] bg-white rounded-lg shadow-2xl p-6 max-w-sm pointer-events-auto"
        style={{ minWidth: '320px' }}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 진행 표시 */}
        <div className="flex items-center gap-1 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>
          <div className="text-xs text-gray-500">
            {currentStep + 1} / {steps.length}
          </div>
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            {isLast ? '완료' : '다음'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  );
}

