// src/components/admin/applications/RegistrationDetailDrawer.tsx
'use client';

import React from 'react';
import clsx from 'clsx';
import type { RegistrationItem } from '@/types/registration';
import { updateRegistrationDetail, resetRegistrationPassword, resetOrganizationPassword, deleteRegistration } from '@/services/registration';
import { formatBirthInput, formatPhoneInput, normalizeBirthDate, normalizePhoneNumber } from '@/utils/formatRegistration';
import { toast } from 'react-toastify';
import { useEventDetail } from '@/hooks/useEventDetail';

type WindowWithDaum = Window & { daum?: any };

// 주소에서 우편번호를 추출하고 분리하는 유틸리티 함수 (컴포넌트 외부로 이동)
const extractZipCode = (address: string | undefined): { zipCode: string; cleanAddress: string } => {
  if (!address) return { zipCode: '', cleanAddress: '' };
  
  // 우편번호 패턴: 언더스코어 또는 괄호로 시작하는 5자리 숫자
  // 예: "_02181", "(02181)", "02181"
  const zipCodePatterns = [
    /_(\d{5})\b/,           // 언더스코어와 함께: _02181
    /\((\d{5})\)/,          // 괄호와 함께: (02181)
    /\b(\d{5})\b(?=[^\d]|$)/, // 독립적인 5자리 숫자 (끝이나 비숫자 앞)
  ];
  
  let zipCode = '';
  let cleanAddress = address;
  
  // 각 패턴으로 우편번호 추출 시도
  for (const pattern of zipCodePatterns) {
    const match = address.match(pattern);
    if (match && match[1]) {
      zipCode = match[1];
      // 해당 패턴을 주소에서 제거
      cleanAddress = address.replace(pattern, '').trim();
      // 연속된 공백 정리
      cleanAddress = cleanAddress.replace(/\s+/g, ' ').trim();
      // 마지막 언더스코어나 공백 제거
      cleanAddress = cleanAddress.replace(/[_\s]+$/, '').trim();
      break;
    }
  }
  
  return { zipCode, cleanAddress };
};

type Props = {
  open: boolean;
  item: RegistrationItem | null;
  isLoading?: boolean;
  eventId?: string; // 대회 ID (코스, 기념품 수정용)
  onClose: () => void;
  onEdit?: () => void;
  onSave?: () => Promise<void> | void; // 저장 후 데이터 새로고침용
};

export default function RegistrationDetailDrawer({
  open,
  item,
  isLoading = false,
  eventId,
  onClose,
  onEdit,
  onSave,
}: Props) {
  // 대회 정보 가져오기 (코스, 기념품 목록용)
  const { data: eventData } = useEventDetail(eventId || '');
  const [memo, setMemo] = React.useState('');
  const [detailMemo, setDetailMemo] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  // 메모와 상세메모의 초기값을 추적 (저장 버튼 활성화 여부 판단용)
  const initialMemoRef = React.useRef<string>('');
  const initialDetailMemoRef = React.useRef<string>('');
  // 비번 초기화 모달 상태
  const [showPwdModal, setShowPwdModal] = React.useState(false);
  const [newPwd, setNewPwd] = React.useState('');
  const [pwdSaving, setPwdSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const postcodeContainerRef = React.useRef<HTMLDivElement | null>(null);
  
  // 편집 상태 및 폼 값 (모든 hooks는 return 전에 정의되어야 함)
  const [isEditing, setIsEditing] = React.useState(false);
  const handleAddressSelect = React.useCallback((postalCode: string, address: string) => {
    setForm((prev) => ({
      ...prev,
      zipCode: postalCode,
      address,
    }));
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !showAddressModal) return;
    let cancelled = false;

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        const win = window as WindowWithDaum;
        if (win.daum?.Postcode) {
          resolve();
          return;
        }
        const existing = document.getElementById('daum-postcode-script');
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          return;
        }
        const script = document.createElement('script');
        script.id = 'daum-postcode-script';
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        script.addEventListener('load', () => resolve(), { once: true });
        document.body.appendChild(script);
      });

    ensureScript().then(() => {
      const win = window as WindowWithDaum;
      if (cancelled || !postcodeContainerRef.current || !win.daum?.Postcode) return;
      const postcode = new win.daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete(data: any) {
          let fullAddress = data.address;
          if (data.userSelectedType === 'R') {
            fullAddress = data.roadAddress;
            let extra = '';
            if (data.bname && /[동|로|가]$/g.test(data.bname)) extra += data.bname;
            if (data.buildingName) extra += extra ? `, ${data.buildingName}` : data.buildingName;
            if (extra) fullAddress += ` (${extra})`;
          } else if (data.jibunAddress) {
            fullAddress = data.jibunAddress;
          }
          handleAddressSelect(data.zonecode, fullAddress);
          setShowAddressModal(false);
        },
      });
      postcode.embed(postcodeContainerRef.current!);
    });

    return () => {
      cancelled = true;
      if (postcodeContainerRef.current) {
        postcodeContainerRef.current.innerHTML = '';
      }
    };
  }, [handleAddressSelect, showAddressModal]);
  const [form, setForm] = React.useState({
    name: '',
    paymenterName: '',
    birth: '',
    gender: '' as 'M' | 'F' | '',
    phNum: '',
    address: '',
    addressDetail: '',
    zipCode: '',
    paymentStatus: '' as 'UNPAID' | 'MUST_CHECK' | 'NEED_REFUND' | 'NEED_PARTITIAL_REFUND' | 'COMPLETED' | 'REFUNDED' | '',
    eventCategoryId: '',
    souvenirJsonList: [] as Array<{ souvenirId: string; selectedSize: string }>,
  });

  // item.id를 추적하여 다른 항목을 선택했을 때만 메모 초기화
  const prevItemIdRef = React.useRef<string | null>(null);
  const isInitialLoadRef = React.useRef(true);
  
  React.useEffect(() => {
    if (open && item) {
      // 다른 항목을 선택했을 때만 메모와 상세메모 초기화
      if (prevItemIdRef.current !== null && prevItemIdRef.current !== item.id) {
        const newMemo = item?.memo ?? '';
        const newDetailMemo = item?.detailMemo ?? '';
        setMemo(newMemo);
        setDetailMemo(newDetailMemo);
        initialMemoRef.current = newMemo;
        initialDetailMemoRef.current = newDetailMemo;
        setSaving(false);
        setSaving(false);
        prevItemIdRef.current = item.id;
        isInitialLoadRef.current = false;
      }
      // 드로어가 처음 열릴 때만 초기화
      else if (isInitialLoadRef.current) {
        const newMemo = item?.memo ?? '';
        const newDetailMemo = item?.detailMemo ?? '';
        setMemo(newMemo);
        setDetailMemo(newDetailMemo);
        initialMemoRef.current = newMemo;
        initialDetailMemoRef.current = newDetailMemo;
        setSaving(false);
        setSaving(false);
        prevItemIdRef.current = item.id;
        isInitialLoadRef.current = false;
      }
      // 같은 항목이라도 상세 데이터가 갱신되었다면 값을 반영
      else if (prevItemIdRef.current === item.id) {
        const incomingMemo = item?.memo ?? '';
        const incomingDetailMemo = item?.detailMemo ?? '';
        if (incomingMemo !== initialMemoRef.current) {
          setMemo(incomingMemo);
          initialMemoRef.current = incomingMemo;
        }
        if (incomingDetailMemo !== initialDetailMemoRef.current) {
          setDetailMemo(incomingDetailMemo);
          initialDetailMemoRef.current = incomingDetailMemo;
        }
        prevItemIdRef.current = item.id;
      }
    } else if (!open) {
      // 드로어가 닫힐 때 상태 초기화
      prevItemIdRef.current = null;
      isInitialLoadRef.current = true;
      initialMemoRef.current = '';
      initialDetailMemoRef.current = '';
    }
  }, [open, item?.id, item?.memo, item?.detailMemo]);

  const handleDelete = React.useCallback(async () => {
    if (!item) return;
    try {
      setDeleting(true);
      await deleteRegistration(item.id);
      toast.success('신청 정보가 삭제되었습니다.');
      await onSave?.();
      onClose();
    } catch (error) {
      toast.error('신청 정보 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [item, onClose, onSave]);

  // 기념품과 사이즈를 매핑하여 표시 (Hooks는 항상 같은 순서로 호출되어야 함)
  const souvenirDisplay = React.useMemo(() => {
    if (!item) return { names: '-', sizes: '-' };
    
    // 상세 API 응답 (새 구조)
    if (item.souvenirListDetail && Array.isArray(item.souvenirListDetail) && item.souvenirListDetail.length > 0) {
      const names = item.souvenirListDetail
        .map(s => s?.name)
        .filter(Boolean)
        .join(', ');
      const sizes = item.souvenirListDetail
        .map(s => s?.size)
        .filter(Boolean)
        .join(', ');
      return {
        names: names || '-',
        sizes: sizes || '-',
      };
    }
    
    // 목록 API 응답 (기존 구조)
    const list = Array.isArray(item.souvenirList) ? item.souvenirList : [];
    if (list.length === 0) return { names: '-', sizes: '-' };
    
    const names = list
      .map(s => s?.souvenirId)
      .filter(Boolean)
      .join(', ');
    const sizes = list
      .map(s => s?.selectedSize)
      .filter(Boolean)
      .join(', ');
    
    return {
      names: names || '-',
      sizes: sizes || '-',
    };
  }, [item]);

  // 선택된 카테고리 정보
  const selectedCategory = React.useMemo(() => {
    if (!eventData?.eventCategories?.length) return undefined;
    if (form.eventCategoryId) {
      const matchById = eventData.eventCategories.find((c) => c.id === form.eventCategoryId);
      if (matchById) return matchById;
    }
    const courseLabel = (item?.eventCategory || item?.categoryName || '').trim();
    if (courseLabel) {
      const matchByName = eventData.eventCategories.find((c) => c.name === courseLabel);
      if (matchByName) return matchByName;
    }
    return undefined;
  }, [eventData?.eventCategories, form.eventCategoryId, item?.eventCategory, item?.categoryName]);

  // 현재 코스명 계산
  const courseName = React.useMemo(() => {
    if (selectedCategory?.name) return selectedCategory.name;
    const directName = item?.eventCategory || item?.categoryName;
    return directName || '-';
  }, [selectedCategory?.name, item?.eventCategory, item?.categoryName]);

  // 이벤트 데이터 로드 후 코스 ID 자동 매핑 (없을 때만)
  React.useEffect(() => {
    if (!item) return;
    if (form.eventCategoryId) return;
    if (!eventData?.eventCategories?.length) return;
    const courseByName = eventData.eventCategories.find(c => {
      const courseLabel = (item.eventCategory || item.categoryName || '').trim();
      return courseLabel && c.name === courseLabel;
    });
    if (courseByName?.id) {
      setForm((prev) => ({ ...prev, eventCategoryId: courseByName.id }));
    }
  }, [item, eventData?.eventCategories, form.eventCategoryId]);

  // 폼 데이터 초기화 (item이 변경될 때마다)
  React.useEffect(() => {
    if (!item) return;
    // 성별을 API enum으로 안정적으로 변환 (M/F 또는 남/여 모두 지원)
    const toGenderEnum = (g?: string): 'M' | 'F' | '' => {
      const s = String(g || '').trim();
      const u = s.toUpperCase();
      if (u === 'M' || s.includes('남')) return 'M';
      if (u === 'F' || s.includes('여')) return 'F';
      return '';
    };

    // eventCategoryId 추출: souvenirListDetail에서 첫 번째 항목의 eventCategoryId 사용
    const currentEventCategoryId = item.souvenirListDetail?.[0]?.eventCategoryId || '';
    
    // souvenirJsonList 구성: souvenirListDetail 또는 souvenirList에서 추출
    const currentSouvenirList: Array<{ souvenirId: string; selectedSize: string }> = [];
    if (item.souvenirListDetail && item.souvenirListDetail.length > 0) {
      item.souvenirListDetail.forEach((s) => {
        if (s.id && s.size) {
          currentSouvenirList.push({ souvenirId: s.id, selectedSize: s.size });
        }
      });
    } else if (item.souvenirList && item.souvenirList.length > 0) {
      currentSouvenirList.push(...item.souvenirList);
    }

    // 주소에서 우편번호 분리
    const { zipCode: extractedZipCode, cleanAddress: extractedCleanAddress } = extractZipCode(item.address);

    setForm({
      name: String(item.name || item.userName || ''),
      paymenterName: String(item.paymenterName || ''),
      birth: normalizeBirthDate(item.birth) || '',
      gender: toGenderEnum(item.gender),
      phNum: normalizePhoneNumber(item.phNum) || '',
      address: extractedCleanAddress || String(item.address || ''),
      addressDetail: String(item.addressDetail || ''),
      zipCode: extractedZipCode,
      paymentStatus: item.paymentStatus || '',
      eventCategoryId: currentEventCategoryId,
      souvenirJsonList: currentSouvenirList,
    });
    // 편집 모드가 열릴 때 편집 상태 리셋
    if (open) {
      setIsEditing(false);
    }
  }, [item, open]);

  // 주소와 우편번호 분리 (hooks는 조건부 return 전에 호출되어야 함)
  const { zipCode, cleanAddress } = React.useMemo(() => {
    return extractZipCode(item?.address);
  }, [item?.address]);

  if (!open || !item) return null;

  // 미결제가 아닌 경우: 기본 정보(성명, 코스, 기념품, 주소 등)는 수정 불가
  // - 미결제(UNPAID): 수정하기 클릭 시 모든 필드 수정 가능
  // - 그 외 상태   : 수정하기 클릭 시 '입금여부', 메모, 상세메모만 수정 가능
  const isUnpaid = item.paymentStatus === 'UNPAID';
  const canEditFields = isEditing && isUnpaid; // 기본 정보 필드
  const canEditMemo = isEditing; // 메모와 상세메모는 항상 수정 가능

  const genderLabel = (() => {
    const g = String(item.gender || '').toUpperCase();
    if (g === 'M' || g.includes('남')) return '남';
    if (g === 'F' || g.includes('여')) return '여';
    return item.gender || '';
  })();

  const paymentStatusLabel = (() => {
    const m: Record<string, string> = {
      UNPAID: '미결제',
      COMPLETED: '결제완료',
      MUST_CHECK: '확인필요',
      NEED_PARTITIAL_REFUND: '차액환불요청',
      NEED_REFUND: '전액환불요청',
      REFUNDED: '전액환불완료',
    };
    return m[item.paymentStatus] ?? (item.depositFlag ? '결제완료' : item.paymentStatus === 'COMPLETED' ? '결제완료' : '미결제');
  })();

  const organizationNameDisplay = (() => {
    const org = (item.organizationName ?? '').trim();
    if (!org || org === '개인') return '-';
    return org;
  })();

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  const formatAmount = (v?: number) =>
    typeof v === 'number' ? `${v.toLocaleString()}원` : '';

  const line = (label: string, value?: React.ReactNode) => (
    <div className="flex py-2 text-sm">
      <div className="w-28 shrink-0 text-gray-500">{label}</div>
      <div className="flex-1 text-gray-900">{value ?? '-'}</div>
    </div>
  );

  const editLine = (label: string, node: React.ReactNode) => (
    <div className="flex py-2 text-sm">
      <div className="w-28 shrink-0 text-gray-500">{label}</div>
      <div className="flex-1">{node}</div>
    </div>
  );


  return (
    <div
      className={clsx(
        'fixed inset-0 z-[60]',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* dim */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* panel */}
      <aside className="absolute right-0 top-0 h-full w-[420px] bg-white shadow-xl border-l flex flex-col">
        <header className="flex items-center justify-between px-5 h-14 border-b">
          <h3 className="font-semibold">신청 상세정보</h3>
          <button
            className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            닫기
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 px-5">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto mb-3"></div>
                <div className="text-gray-600 text-sm">로딩 중...</div>
              </div>
            </div>
          ) : (
            <>
              {/* 버튼들 - 스크롤 시 상단 고정 */}
              <div className="sticky top-0 z-10 bg-white left-0 right-0 px-5 pt-4 pb-3 mb-4 flex items-center justify-end gap-2 border-b shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded border border-red-600 text-red-600 text-sm hover:bg-red-50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading || !item || deleting}
                  >
                    {deleting ? '삭제 중...' : '삭제'}
                  </button>
                {/* 비밀번호 초기화: 단체는 숨김 */}
                {item && (item.organizationName === undefined || item.organizationName === '개인') && (
                  <button
                      className="px-3 py-1.5 rounded border border-red-600 text-red-600 text-sm hover:bg-red-50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowPwdModal(true)}
                    disabled={isLoading || !item}
                  >
                    비밀번호 초기화
                  </button>
                )}
                </div>
                {!isEditing ? (
                  <button 
                    className="px-4 py-1.5 rounded border border-blue-600 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors whitespace-nowrap" 
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                  >
                    수정하기
                  </button>
                ) : (
                  <>
                    <button
                      className="px-4 py-1.5 rounded border border-blue-600 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        if (!item) {
                          alert('신청 정보를 찾을 수 없습니다.');
                          return;
                        }
                        
                        const registrationId = item.id;
                        if (!registrationId || registrationId.trim() === '') {
                          alert('신청 ID를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
                          return;
                        }
                        
                        try {
                          setSaving(true);
                          // 주소와 우편번호를 결합하여 전송 (우편번호가 있으면 주소 끝에 추가)
                          const combinedAddress = form.zipCode 
                            ? `${form.address.trim()} _${form.zipCode}`.trim()
                            : form.address.trim();
                          
                          const payload = {
                            userName: form.name.trim() || undefined,
                            paymenterName: form.paymenterName.trim() || undefined,
                            birth: form.birth.trim() || undefined,
                            gender: form.gender || undefined,
                            phNum: form.phNum.trim() || undefined,
                            address: combinedAddress || undefined,
                            addressDetail: form.addressDetail.trim() || undefined,
                            paymentStatus: form.paymentStatus || item.paymentStatus,
                            eventCategoryId: form.eventCategoryId || undefined,
                            souvenirJsonList: form.souvenirJsonList.length > 0 ? form.souvenirJsonList : undefined,
                            amount: selectedCategory?.amount,
                            memo: memo ?? '',
                            detailMemo: detailMemo ?? '',
                          };
                          await updateRegistrationDetail(registrationId, payload);
                          initialMemoRef.current = memo ?? '';
                          initialDetailMemoRef.current = detailMemo ?? '';
                          setIsEditing(false);
                          // 저장 후 데이터 새로고침
                          if (onSave) {
                            await onSave();
                          }
                        } catch (error) {
                          alert('수정에 실패했습니다. 다시 시도해주세요.');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={isLoading || saving || !item || !item?.id}
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                    <button
                      className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
                      onClick={() => {
                        // 값 되돌리기
                        setIsEditing(false);
                        // 값 되돌리기: 현재 item의 값으로 초기화
                        const currentEventCategoryId = item.souvenirListDetail?.[0]?.eventCategoryId || '';
                        const currentSouvenirList: Array<{ souvenirId: string; selectedSize: string }> = [];
                        if (item.souvenirListDetail && item.souvenirListDetail.length > 0) {
                          item.souvenirListDetail.forEach((s) => {
                            if (s.id && s.size) {
                              currentSouvenirList.push({ souvenirId: s.id, selectedSize: s.size });
                            }
                          });
                        } else if (item.souvenirList && item.souvenirList.length > 0) {
                          currentSouvenirList.push(...item.souvenirList);
                        }
                        
                        // 주소에서 우편번호 분리
                        const { zipCode: cancelZipCode, cleanAddress: cancelCleanAddress } = extractZipCode(item.address);
                        
                        setForm({
                          name: String(item.name || item.userName || ''),
                          paymenterName: String(item.paymenterName || ''),
                          birth: String(item.birth || ''),
                          gender: (String(item.gender || '').toUpperCase().startsWith('M') ? 'M' : String(item.gender || '').toUpperCase().startsWith('F') ? 'F' : '') as 'M' | 'F' | '',
                          phNum: String(item.phNum || ''),
                          address: cancelCleanAddress || String(item.address || ''),
                          addressDetail: String(item.addressDetail || ''),
                          zipCode: cancelZipCode,
                          paymentStatus: item.paymentStatus || '',
                          eventCategoryId: currentEventCategoryId,
                          souvenirJsonList: currentSouvenirList,
                        });
                        setMemo(initialMemoRef.current);
                        setDetailMemo(initialDetailMemoRef.current);
                      }}
                    >
                      취소
                    </button>
                  </>
                )}
                <button
                  className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
                  onClick={onClose}
                >
                  닫기
                </button>
              </div>
              <div className="px-5 py-4">
              {!canEditFields ? line('성명', item.name || item.userName) : editLine('성명', (
                <input className="w-full rounded border px-2 py-1" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} />
              ))}
              {line('단체명', organizationNameDisplay)}
              {!canEditFields ? line('코스', courseName) : editLine('코스', (
                <>
                  {!eventId ? (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                      대회 정보를 불러올 수 없어 코스를 선택할 수 없습니다. (eventId 없음)
                    </div>
                  ) : !eventData?.eventCategories?.length ? (
                    <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      코스 정보를 불러오는 중...
                    </div>
                  ) : (
                <select
                  className="w-full rounded border px-2 py-1"
                  value={form.eventCategoryId}
                  onChange={e => {
                    const nextId = e.target.value;
                    setForm(v => ({
                      ...v,
                      eventCategoryId: nextId,
                      souvenirJsonList: [], // 코스 변경 시 기념품/사이즈 초기화
                    }));
                  }}
                >
                  <option value="">코스를 선택하세요</option>
                      {eventData.eventCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                  )}
                </>
              ))}
              {!canEditFields ? line('기념품', souvenirDisplay.names) : editLine('기념품', (
                <div className="space-y-2">
                  {form.eventCategoryId && eventData?.eventCategories?.find(c => c.id === form.eventCategoryId)?.souvenirs?.map((souvenir) => {
                    const isSelected = form.souvenirJsonList.some(s => s.souvenirId === souvenir.id);
                    return (
                      <div key={souvenir.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // 사이즈 선택이 필요한 경우 기본 사이즈 설정
                              const defaultSize = souvenir.sizes?.split(',')[0]?.trim() || '';
                              setForm(v => ({
                                ...v,
                                souvenirJsonList: [...v.souvenirJsonList, { souvenirId: souvenir.id, selectedSize: defaultSize }]
                              }));
                            } else {
                              setForm(v => ({
                                ...v,
                                souvenirJsonList: v.souvenirJsonList.filter(s => s.souvenirId !== souvenir.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label className="text-sm">{souvenir.name}</label>
                      </div>
                    );
                  }) || <div className="text-sm text-gray-500">코스를 먼저 선택해주세요.</div>}
                </div>
              ))}
              {!canEditFields ? line('사이즈', souvenirDisplay.sizes) : editLine('사이즈', (
                <div className="space-y-2">
                  {form.souvenirJsonList.length > 0 ? (
                    form.souvenirJsonList.map((selectedSouvenir, idx) => {
                      const souvenirInfo = eventData?.eventCategories
                        ?.flatMap(c => c.souvenirs)
                        ?.find(s => s.id === selectedSouvenir.souvenirId);
                      
                      // 사이즈 파싱: 파이프(|) 또는 쉼표(,)로 구분된 문자열 처리
                      const sizesString = souvenirInfo?.sizes || '';
                      const availableSizes = sizesString
                        .split(/[|,]/) // 파이프 또는 쉼표로 분리
                        .map(s => s.trim().replace(/^✓\s*/, '').trim()) // ✓ 제거
                        .filter(s => s.length > 0); // 빈 문자열 제거
                      
                      if (availableSizes.length === 0) return null;
                      
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 min-w-[100px]">
                            {souvenirInfo?.name || '기념품'}:
                          </span>
                          <select
                            className="flex-1 rounded border px-2 py-1 text-sm"
                            value={selectedSouvenir.selectedSize}
                            onChange={(e) => {
                              setForm(v => ({
                                ...v,
                                souvenirJsonList: v.souvenirJsonList.map((s, i) => 
                                  i === idx ? { ...s, selectedSize: e.target.value } : s
                                )
                              }));
                            }}
                          >
                            {availableSizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500">기념품을 선택해주세요.</div>
                  )}
                </div>
              ))}
              {!canEditFields ? line('성별', genderLabel) : editLine('성별', (
                <select className="w-full rounded border px-2 py-1" value={form.gender} onChange={e => setForm(v => ({ ...v, gender: e.target.value as 'M' | 'F' | '' }))}>
                  <option value="">선택</option>
                  <option value="M">남</option>
                  <option value="F">여</option>
                </select>
              ))}
              {!canEditFields ? line('생년월일', (String(item.birth || '').replace(/\D+/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))) : editLine('생년월일', (
                <input className="w-full rounded border px-2 py-1" value={form.birth} onChange={e => setForm(v => ({ ...v, birth: formatBirthInput(e.target.value) }))} placeholder="YYYY-MM-DD" />
              ))}
              {!canEditFields ? line('연락처', (String(item.phNum || '').replace(/\D+/g, '').replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3'))) : editLine('연락처', (
                <input className="w-full rounded border px-2 py-1" value={form.phNum} onChange={e => setForm(v => ({ ...v, phNum: formatPhoneInput(e.target.value) }))} />
              ))}
              {line('신청일시', formatDateTime(item.registrationDate))}
              {line('금액', formatAmount(item.amount))}
              {!isEditing ? line('입금여부', paymentStatusLabel) : editLine('입금여부', (
                <select 
                  className="w-full rounded border px-2 py-1" 
                  value={form.paymentStatus} 
                  onChange={e => setForm(v => ({ ...v, paymentStatus: e.target.value as typeof form.paymentStatus }))}
                >
                  <option value="UNPAID">미결제</option>
                  <option value="COMPLETED">결제완료</option>
                  <option value="MUST_CHECK">확인필요</option>
                  <option value="NEED_PARTITIAL_REFUND">차액환불요청</option>
                  <option value="NEED_REFUND">전액환불요청</option>
                  <option value="REFUNDED">전액환불완료</option>
                </select>
              ))}
              {!canEditFields ? line('입금자명', item.paymenterName || '-') : editLine('입금자명', (
                <input className="w-full rounded border px-2 py-1" value={form.paymenterName} onChange={e => setForm(v => ({ ...v, paymenterName: e.target.value }))} />
              ))}
              {!canEditFields ? line('우편번호', zipCode || '-') : editLine('우편번호', (
                <div className="flex items-center gap-2" data-allow-bubble="true">
                <input 
                    className="w-28 rounded border px-2 py-1 bg-gray-50 cursor-not-allowed" 
                  value={form.zipCode} 
                    readOnly
                    placeholder="우편번호"
                />
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    주소 검색
                  </button>
                </div>
              ))}
              {!canEditFields ? line('주소', cleanAddress || '-') : editLine('주소', (
                <input
                  className="w-full rounded border px-2 py-1 bg-gray-50 cursor-not-allowed"
                  value={form.address}
                  readOnly
                  placeholder="주소 검색 버튼으로 입력"
                />
              ))}
              {!canEditFields ? line('상세주소', item.addressDetail || '-') : editLine('상세주소', (
                <input className="w-full rounded border px-2 py-1" value={form.addressDetail} onChange={e => setForm(v => ({ ...v, addressDetail: e.target.value }))} />
              ))}

              {/* 사용자 비고 */}
              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-1">비고(사용자)</div>
                <div className="rounded border bg-gray-50 px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap min-h-[64px]">
                  {item.note ? item.note : ''}
                </div>
              </div>

              {/* 관리자 메모 */}
              <div className="mt-4">
                <div className="text-sm text-gray-700 mb-1">메모(관리자만 보입니다)</div>
                <textarea
                  className={clsx(
                    'w-full rounded border px-3 py-2 text-sm min-h-[64px] focus:outline-none focus:ring-2',
                    canEditMemo ? 'focus:ring-blue-500 bg-white text-gray-900' : 'bg-gray-100 text-gray-600 cursor-not-allowed focus:ring-gray-200'
                  )}
                  value={memo}
                  readOnly={!canEditMemo}
                  disabled={!canEditMemo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="메모를 입력하세요"
                />
                {!canEditMemo && (
                  <p className="mt-1 text-xs text-gray-400">메모는 상단의 &apos;수정하기&apos; 버튼을 눌러야 입력할 수 있습니다.</p>
                )}
              </div>

              {/* 상세 메모 */}
              <div className="mt-4">
                <div className="text-sm text-gray-700 mb-1">상세메모</div>
                <textarea
                  className={clsx(
                    'w-full rounded border px-3 py-2 text-sm min-h-[64px] focus:outline-none focus:ring-2',
                    canEditMemo ? 'focus:ring-blue-500 bg-white text-gray-900' : 'bg-gray-100 text-gray-600 cursor-not-allowed focus:ring-gray-200'
                  )}
                  value={detailMemo}
                  readOnly={!canEditMemo}
                  disabled={!canEditMemo}
                  onChange={e => setDetailMemo(e.target.value)}
                  placeholder="상세메모를 입력하세요"
                />
                {!canEditMemo && (
                  <p className="mt-1 text-xs text-gray-400">상세메모도 &apos;수정하기&apos; 버튼을 눌러야 입력 가능합니다.</p>
                )}
              </div>

              {/* 매칭 로그 */}
              <div className="mt-4">
                <div className="text-sm text-gray-700 mb-1">매칭 로그</div>
                <div className="rounded border bg-gray-50 px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap min-h-[64px]">
                  {item.matchingLog ? item.matchingLog : '-'}
                </div>
              </div>
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <footer className="px-5 py-3 border-t flex justify-end gap-2">
          <button className="h-9 px-3 rounded border text-sm hover:bg-gray-50 transition-colors" onClick={onClose}>
            닫기
          </button>
        </footer>
      </aside>
      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && item && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-md shadow-lg w-[360px] p-5">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">신청 삭제</h4>
            <p className="text-sm text-gray-600 mb-4">
              해당 신청을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                취소
              </button>
              <button
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 초기화 모달 */}
      {showPwdModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !pwdSaving && setShowPwdModal(false)} />
          <div className="relative bg-white rounded-md shadow-lg w-[360px] p-4">
            <h4 className="font-semibold mb-2">비밀번호 초기화</h4>
            <p className="text-sm text-gray-600 mb-3">새 비밀번호를 입력하세요 (최소 6자리, 공백 없음)</p>
            <input
              type="password"
              className="w-full rounded border px-3 py-2 text-sm mb-2"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="새 비밀번호"
              disabled={pwdSaving}
            />
            {/* 단체 비밀번호 초기화: 조직 ID는 상세 데이터에서 자동 사용 */}
            <div className="flex justify-end gap-2 mt-2">
              <button className="px-3 py-1.5 rounded border text-sm" onClick={() => setShowPwdModal(false)} disabled={pwdSaving}>취소</button>
              <button
                className="px-3 py-1.5 rounded border border-red-600 bg-red-600 text-white text-sm disabled:opacity-50"
                onClick={async () => {
                  if (!item || !item.id) return;
                  const pwd = newPwd.trim();
                  if (pwd.length < 6 || /\s/.test(pwd)) {
                    toast.error('비밀번호는 최소 6자리, 공백 없이 입력해주세요.');
                    return;
                  }
                  try {
                    setPwdSaving(true);
                    const isGroup = !!(item as any).organizationName && (item as any).organizationName !== '개인';
                    if (isGroup) {
                      // 여러 필드명으로 시도: organizationId, organizationAccount, account 등
                      const orgId = item.organizationId 
                        || item.organizationAccount 
                        || (item as any).organizationId
                        || (item as any).organizationAccount
                        || (item as any).account
                        || (item as any).organizationAccountId;
                      if (!orgId) {
                        toast.info('단체 ID 확인 중... 상세 정보를 다시 불러오는 중...');
                        // 상세 데이터를 다시 불러와서 시도
                        try {
                          const { getRegistrationDetail } = await import('@/services/registration');
                          const refreshed = await getRegistrationDetail(item.id);
                          // 더 많은 필드명 시도
                          const refreshedOrgId = refreshed.organizationId 
                            || refreshed.organizationAccount
                            || (refreshed as any).organizationId
                            || (refreshed as any).organizationAccount
                            || (refreshed as any).account
                            || (refreshed as any).organizationAccountId
                            || (refreshed as any).organization?.id
                            || (refreshed as any).organization?.account
                            || (refreshed as any).organization?.organizationAccount;
                          if (!refreshedOrgId) {
                            toast.error('단체 ID를 찾을 수 없습니다. 백엔드 API가 organizationId 또는 organizationAccount를 반환해야 합니다. 콘솔 로그를 확인해주세요.');
                            setPwdSaving(false);
                            return;
                          }
                          await resetOrganizationPassword(String(refreshedOrgId), pwd);
                        } catch (_refreshError) {
                          toast.error('단체 ID를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
                          setPwdSaving(false);
                          return;
                        }
                      } else {
                        await resetOrganizationPassword(String(orgId), pwd);
                      }
                    } else {
                      await resetRegistrationPassword(item.id, pwd);
                    }
                    toast.success('비밀번호가 초기화되었습니다.');
                    setShowPwdModal(false);
                    setNewPwd('');
                  } catch (_e) {
                    toast.error('비밀번호 초기화에 실패했습니다.');
                  } finally {
                    setPwdSaving(false);
                  }
                }}
                disabled={pwdSaving}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 주소 검색 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center" data-allow-bubble="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddressModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-[92vw] max-w-3xl h-[80vh] flex flex-col">
            <header className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">주소 검색</h3>
                <p className="text-xs text-gray-500 mt-0.5">Daum 우편번호 서비스에서 주소를 선택하세요.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                닫기
              </button>
            </header>
            <div className="flex-1 p-4">
              <div className="w-full h-full border rounded-lg overflow-hidden" ref={postcodeContainerRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}