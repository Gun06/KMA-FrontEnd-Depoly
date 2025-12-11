'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { getRegistrationDetail, updateRegistrationDetail } from '@/services/registration';
import type { RegistrationItem } from '@/types/registration';
import { formatBirthInput, formatPhoneInput, normalizeBirthDate, normalizePhoneNumber } from '@/utils/formatRegistration';
import { toast } from 'react-toastify';
import { useEventDetail } from '@/hooks/useEventDetail';

type Props = {
  isOpen: boolean;
  registrationId: string | null;
  eventId?: string;
  onClose: () => void;
  onSave?: () => Promise<void> | void;
};

// 주소에서 우편번호를 추출하고 분리하는 유틸리티 함수
const extractZipCode = (address: string | undefined): { zipCode: string; cleanAddress: string } => {
  if (!address) return { zipCode: '', cleanAddress: '' };
  
  const zipCodePatterns = [
    /_(\d{5})\b/,
    /\((\d{5})\)/,
    /\b(\d{5})\b(?=[^\d]|$)/,
  ];
  
  let zipCode = '';
  let cleanAddress = address;
  
  for (const pattern of zipCodePatterns) {
    const match = address.match(pattern);
    if (match && match[1]) {
      zipCode = match[1];
      cleanAddress = address.replace(pattern, '').trim();
      cleanAddress = cleanAddress.replace(/\s+/g, ' ').trim();
      cleanAddress = cleanAddress.replace(/[_\s]+$/, '').trim();
      break;
    }
  }
  
  return { zipCode, cleanAddress };
};

export default function RegistrationDetailBottomSheet({
  isOpen,
  registrationId,
  eventId,
  onClose,
  onSave,
}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [detail, setDetail] = React.useState<RegistrationItem | null>(null);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [memo, setMemo] = React.useState('');
  const [detailMemo, setDetailMemo] = React.useState('');
  
  const { data: eventData } = useEventDetail(eventId || '');

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

  // 신청자 상세정보 가져오기
  useEffect(() => {
    if (!isOpen || !registrationId) {
      setDetail(null);
      setIsEditing(false);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const data = await getRegistrationDetail(registrationId);
        setDetail(data);
        
        // 폼 데이터 초기화
        const toGenderEnum = (g?: string): 'M' | 'F' | '' => {
          const s = String(g || '').trim();
          const u = s.toUpperCase();
          if (u === 'M' || s.includes('남')) return 'M';
          if (u === 'F' || s.includes('여')) return 'F';
          return '';
        };

        const currentEventCategoryId = data.souvenirListDetail?.[0]?.eventCategoryId || '';
        
        const currentSouvenirList: Array<{ souvenirId: string; selectedSize: string }> = [];
        if (data.souvenirListDetail && data.souvenirListDetail.length > 0) {
          data.souvenirListDetail.forEach((s) => {
            if (s.id && s.size) {
              currentSouvenirList.push({ souvenirId: s.id, selectedSize: s.size });
            }
          });
        } else if (data.souvenirList && data.souvenirList.length > 0) {
          currentSouvenirList.push(...data.souvenirList);
        }

        const { zipCode: extractedZipCode, cleanAddress: extractedCleanAddress } = extractZipCode(data.address);

        setForm({
          name: String(data.name || data.userName || ''),
          paymenterName: String(data.paymenterName || ''),
          birth: normalizeBirthDate(data.birth) || '',
          gender: toGenderEnum(data.gender),
          phNum: normalizePhoneNumber(data.phNum) || '',
          address: extractedCleanAddress || String(data.address || ''),
          addressDetail: String(data.addressDetail || ''),
          zipCode: extractedZipCode,
          paymentStatus: data.paymentStatus || '',
          eventCategoryId: currentEventCategoryId,
          souvenirJsonList: currentSouvenirList,
        });
        
        setMemo(data.memo ?? '');
        setDetailMemo(data.detailMemo ?? '');
      } catch (error) {
        setDetail(null);
        toast.error('신청자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, registrationId]);

  // 선택된 카테고리 정보
  const selectedCategory = React.useMemo(() => {
    if (!eventData?.eventCategories?.length) return undefined;
    if (form.eventCategoryId) {
      const matchById = eventData.eventCategories.find((c) => c.id === form.eventCategoryId);
      if (matchById) return matchById;
    }
    const courseLabel = (detail?.eventCategory || detail?.categoryName || '').trim();
    if (courseLabel) {
      const matchByName = eventData.eventCategories.find((c) => c.name === courseLabel);
      if (matchByName) return matchByName;
    }
    return undefined;
  }, [eventData?.eventCategories, form.eventCategoryId, detail?.eventCategory, detail?.categoryName]);

  // 닫기 애니메이션
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsEditing(false);
      onClose();
      setDetail(null);
    }, 300);
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!detail || !registrationId) {
      toast.error('신청 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setSaving(true);
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
        paymentStatus: form.paymentStatus || detail.paymentStatus,
        eventCategoryId: form.eventCategoryId || undefined,
        souvenirJsonList: form.souvenirJsonList.length > 0 ? form.souvenirJsonList : undefined,
        amount: selectedCategory?.amount,
        memo: memo ?? '',
        detailMemo: detailMemo ?? '',
      };
      
      await updateRegistrationDetail(registrationId, payload);
      toast.success('수정되었습니다.');
      setIsEditing(false);
      
      // 데이터 새로고침
      if (onSave) {
        await onSave();
      }
      
      // 상세정보 다시 불러오기
      const refreshed = await getRegistrationDetail(registrationId);
      setDetail(refreshed);
    } catch (error) {
      toast.error('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (!detail) return;
    
    setIsEditing(false);
    const currentEventCategoryId = detail.souvenirListDetail?.[0]?.eventCategoryId || '';
    const currentSouvenirList: Array<{ souvenirId: string; selectedSize: string }> = [];
    if (detail.souvenirListDetail && detail.souvenirListDetail.length > 0) {
      detail.souvenirListDetail.forEach((s) => {
        if (s.id && s.size) {
          currentSouvenirList.push({ souvenirId: s.id, selectedSize: s.size });
        }
      });
    } else if (detail.souvenirList && detail.souvenirList.length > 0) {
      currentSouvenirList.push(...detail.souvenirList);
    }
    
    const { zipCode: cancelZipCode, cleanAddress: cancelCleanAddress } = extractZipCode(detail.address);
    
    setForm({
      name: String(detail.name || detail.userName || ''),
      paymenterName: String(detail.paymenterName || ''),
      birth: normalizeBirthDate(detail.birth) || '',
      gender: (String(detail.gender || '').toUpperCase().startsWith('M') ? 'M' : String(detail.gender || '').toUpperCase().startsWith('F') ? 'F' : '') as 'M' | 'F' | '',
      phNum: normalizePhoneNumber(detail.phNum) || '',
      address: cancelCleanAddress || String(detail.address || ''),
      addressDetail: String(detail.addressDetail || ''),
      zipCode: cancelZipCode,
      paymentStatus: detail.paymentStatus || '',
      eventCategoryId: currentEventCategoryId,
      souvenirJsonList: currentSouvenirList,
    });
    setMemo(detail.memo ?? '');
    setDetailMemo(detail.detailMemo ?? '');
  };

  if (!isOpen) return null;

  const genderLabel = detail?.gender === 'M' || detail?.gender?.includes('남') ? '남' : 
                     detail?.gender === 'F' || detail?.gender?.includes('여') ? '여' : 
                     detail?.gender || '-';

  const paymentStatusLabel = (() => {
    const m: Record<string, string> = {
      UNPAID: '미결제',
      COMPLETED: '결제완료',
      MUST_CHECK: '확인필요',
      NEED_PARTITIAL_REFUND: '차액환불요청',
      NEED_REFUND: '전액환불요청',
      REFUNDED: '전액환불완료',
    };
    return m[detail?.paymentStatus || ''] || '미결제';
  })();

  const paymentStatusOptions: Array<{ value: string; label: string }> = [
    { value: 'UNPAID', label: '미결제' },
    { value: 'COMPLETED', label: '결제완료' },
    { value: 'MUST_CHECK', label: '확인필요' },
    { value: 'NEED_PARTITIAL_REFUND', label: '차액환불요청' },
    { value: 'NEED_REFUND', label: '전액환불요청' },
    { value: 'REFUNDED', label: '전액환불완료' },
  ];

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
    });
  };

  const souvenirDisplay = (() => {
    if (!detail) return { names: '-', sizes: '-' };
    
    if (detail.souvenirListDetail && Array.isArray(detail.souvenirListDetail) && detail.souvenirListDetail.length > 0) {
      const names = detail.souvenirListDetail.map(s => s?.name).filter(Boolean).join(', ');
      const sizes = detail.souvenirListDetail.map(s => s?.size).filter(Boolean).join(', ');
      return { names: names || '-', sizes: sizes || '-' };
    }
    
    const list = Array.isArray(detail.souvenirList) ? detail.souvenirList : [];
    if (list.length === 0) return { names: '-', sizes: '-' };
    
    const names = list.map(s => s?.souvenirId).filter(Boolean).join(', ');
    const sizes = list.map(s => s?.selectedSize).filter(Boolean).join(', ');
    return { names: names || '-', sizes: sizes || '-' };
  })();

  const courseName = selectedCategory?.name || detail?.eventCategory || detail?.categoryName || '-';

  // 배경 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isEditing) {
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* 바텀 시트 */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">신청자 상세정보</h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 rounded border border-blue-600 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                수정하기
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading || saving || !detail}
                  className="px-4 py-1.5 rounded border border-blue-600 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">성명</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900">{detail.name || detail.userName || '-'}</p>
                    ) : (
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(v => ({ ...v, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">단체명</label>
                    <p className="text-base text-gray-900">{detail.organizationName === '개인' ? '-' : detail.organizationName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">코스</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900">{courseName}</p>
                    ) : (
                      <select
                        value={form.eventCategoryId}
                        onChange={(e) => setForm(v => ({ ...v, eventCategoryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {eventData?.eventCategories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">기념품</label>
                    <p className="text-base text-gray-900">{souvenirDisplay.names}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">사이즈</label>
                    <p className="text-base text-gray-900">{souvenirDisplay.sizes}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">성별</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900">{genderLabel}</p>
                    ) : (
                      <select
                        value={form.gender}
                        onChange={(e) => setForm(v => ({ ...v, gender: e.target.value as 'M' | 'F' | '' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">선택하세요</option>
                        <option value="M">남</option>
                        <option value="F">여</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">생년월일</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900">{detail.birth || '-'}</p>
                    ) : (
                      <input
                        type="text"
                        value={form.birth}
                        onChange={(e) => setForm(v => ({ ...v, birth: formatBirthInput(e.target.value) }))}
                        placeholder="YYYY-MM-DD"
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">연락처</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900">{detail.phNum || '-'}</p>
                    ) : (
                      <input
                        type="text"
                        value={form.phNum}
                        onChange={(e) => setForm(v => ({ ...v, phNum: formatPhoneInput(e.target.value) }))}
                        placeholder="010-1234-5678"
                        maxLength={13}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">신청일시</label>
                    <p className="text-base text-gray-900">{formatDateTime(detail.registrationDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">금액</label>
                    <p className="text-base font-semibold text-blue-600">{detail.amount?.toLocaleString()}원</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">입금여부</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900">{paymentStatusLabel}</p>
                    ) : (
                      <select
                        value={form.paymentStatus}
                        onChange={(e) => setForm(v => ({ ...v, paymentStatus: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {paymentStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">입금자명</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900">{detail.paymenterName || '-'}</p>
                    ) : (
                      <input
                        type="text"
                        value={form.paymenterName}
                        onChange={(e) => setForm(v => ({ ...v, paymenterName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* 주소 정보 */}
              {(detail.address || detail.addressDetail || isEditing) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">주소 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">주소</label>
                      {!isEditing ? (
                        <p className="text-base text-gray-900">{detail.address || '-'}</p>
                      ) : (
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm(v => ({ ...v, address: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">상세주소</label>
                      {!isEditing ? (
                        <p className="text-base text-gray-900">{detail.addressDetail || '-'}</p>
                      ) : (
                        <input
                          type="text"
                          value={form.addressDetail}
                          onChange={(e) => setForm(v => ({ ...v, addressDetail: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 메모 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">메모</h3>
                <div className="space-y-3">
                  {detail.note && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">비고(사용자)</label>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{detail.note}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">메모(관리자)</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{detail.memo || '-'}</p>
                    ) : (
                      <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="메모를 입력하세요"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">상세 메모</label>
                    {!isEditing ? (
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{detail.detailMemo || '-'}</p>
                    ) : (
                      <textarea
                        value={detailMemo}
                        onChange={(e) => setDetailMemo(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="상세 메모를 입력하세요"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">신청자 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
