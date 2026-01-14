'use client';

import React, { useEffect, useMemo, useState } from 'react';
import OrgMembersTable from '@/components/admin/Users/organization/OrgMembersTable';
import { useOrganizationMembersList, useOrganizationDetail } from '@/services/admin/users';
import { transformOrgMemberApiToRow, type OrgMemberRow } from '@/data/users/orgMembers';
import { getRegistrationDetail, resetOrganizationPassword } from '@/services/registration';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import RegistrationDetailDrawer from '@/components/admin/applications/RegistrationDetailDrawer';
import type { RegistrationItem } from '@/types/registration';
import { getSimpleEventList } from '@/services/event';

type SortKey = 'id' | 'name' | 'birth';
type SortDir = 'asc' | 'desc';
type MemberFilter = '' | 'member' | 'nonMember';

// 문자열 orgId (백엔드 조직 ID)를 그대로 사용
export default function Client({ orgId }: { orgId: string }) {
  // 표시/더미 계산용으로만 쓰는 해시 숫자
  const hashStringToNumber = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return Math.abs(h) || 1;
  };
  const numericOrgId = hashStringToNumber(orgId);
  const isValidOrgId = typeof orgId === 'string' && orgId.trim().length > 0;
  const router = useRouter();
  
  // 조직 상세 정보 조회
  const { data: orgDetailData } = useOrganizationDetail({ organizationId: isValidOrgId ? orgId : '' });
  const org = useMemo(() => {
    if (!orgDetailData) return undefined;
    
    return {
      id: numericOrgId,
      org: orgDetailData.groupName,
      owner: orgDetailData.leaderName,
      ownerId: orgDetailData.account,
      ownerPhone: orgDetailData.leaderPhNum,
      eventTitle: orgDetailData.eventName,
      createdAt: orgDetailData.createdAt,
    };
  }, [orgDetailData, numericOrgId]);


  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [rows, setRows] = useState<OrgMemberRow[]>([]);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('');

  // 비밀번호 초기화 모달 상태
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<RegistrationItem | null>(null);
  const [simpleEvents, setSimpleEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [eventListFetched, setEventListFetched] = useState(false);
  const [orgEventId, setOrgEventId] = useState<string | undefined>(undefined);

  // 서버 데이터 조회 (members 탭에서만 요청, 유효한 orgId일 때만)
  const { data: apiData, isLoading, error } = useOrganizationMembersList({ 
    orgId: isValidOrgId ? orgId : '', 
    page, 
    size: pageSize 
  });

  // API → 화면 행 변환 (페이지 기반 시퀀스)
  useEffect(() => {
    if (!apiData) {
      setRows([]);
      setTotal(0);
      return;
    }
    const base = apiData.content.map((item, idx) =>
      transformOrgMemberApiToRow(numericOrgId, item, (page - 1) * pageSize + idx + 1)
    );
    setRows(base);
    setTotal(apiData.totalElements);
  }, [apiData, numericOrgId, page, pageSize]);

  // 단체가 속한 대회명을 기반으로 eventId를 매핑하기 위해 전체 대회 드롭다운 데이터 조회
  useEffect(() => {
    if (eventListFetched || !org?.eventTitle) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await getSimpleEventList();
        if (cancelled) return;
        setSimpleEvents(Array.isArray(list) ? list : []);
      } catch (_error) {
        if (cancelled) return;
        setSimpleEvents([]);
      } finally {
        if (!cancelled) setEventListFetched(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventListFetched, org?.eventTitle]);

  // Org API에서 내려준 대회명과 단순 대회 목록을 매칭하여 eventId 추출
  useEffect(() => {
    if (!org?.eventTitle) {
      setOrgEventId(undefined);
      return;
    }
    if (!simpleEvents.length) return;
    const normalize = (value: string) =>
      value.replace(/\s+/g, '').toLowerCase();
    const target = normalize(org.eventTitle);
    const matched = simpleEvents.find(({ title }) => {
      const normalizedTitle = normalize(title);
      return (
        normalizedTitle === target ||
        normalizedTitle.includes(target) ||
        target.includes(normalizedTitle)
      );
    });
    setOrgEventId(matched?.id);
  }, [org?.eventTitle, simpleEvents]);

  // 클라이언트 필터/정렬/검색 적용된 뷰
  const viewRows = useMemo(() => {
    let arr = rows.slice();
    const q = query.trim();
    if (q) {
      arr = arr.filter(r => r.name.includes(q) || r.userId.includes(q) || r.phone.includes(q));
    }
    if (memberFilter) {
      const flag = memberFilter === 'member';
      arr = arr.filter(r => r.isMember === flag);
    }
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const A = a[sortKey];
      const B = b[sortKey];
      if (typeof A === 'number' && typeof B === 'number') return (A - B) * dir;
      return String(A).localeCompare(String(B), 'ko') * dir;
    });
    return arr;
  }, [rows, query, memberFilter, sortKey, sortDir]);

  const latestRegDate = useMemo(() => {
    const rawDates = rows
      .map((r) => r.regDateRaw)
      .filter((raw): raw is string => !!raw);
    if (!rawDates.length) return '-';
    const parsed = rawDates
      .map((raw) => {
        const d = new Date(raw);
        if (!Number.isNaN(d.getTime())) return d;
        return null;
      })
      .filter((d): d is Date => !!d);
    if (!parsed.length) return '-';
    const latest = parsed.reduce((acc, cur) => (acc > cur ? acc : cur));
    return latest.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [rows]);

  const memberCountDisplay = total;
  const applicationDate = latestRegDate;
  const totalAmountFromRows = useMemo(() => {
    return rows.reduce((sum, row) => {
      if (typeof row.fee === 'number' && Number.isFinite(row.fee)) {
        return sum + row.fee;
      }
      return sum;
    }, 0);
  }, [rows]);
  const totalAmountDisplay = totalAmountFromRows > 0 ? `${totalAmountFromRows.toLocaleString()}원` : '-';
  const depositorName =
    rows.find((row) => typeof row.account === 'string' && row.account.trim())?.account?.trim() ||
    '-';
  const totalParticipants = rows.length;
  const payStatusDisplay = useMemo(() => {
    const statuses = rows
      .map((row) => row.payStatus)
      .filter((status): status is NonNullable<OrgMemberRow['payStatus']> => !!status);
    if (statuses.length === 0) return '-';
    const first = statuses[0];
    const allSame = statuses.every((status) => status === first);
    return allSame ? first : '혼합';
  }, [rows]);

  const handleDetailClose = () => {
    setDetailOpen(false);
    setDetailItem(null);
  };

  const handleRowClick = async (row: OrgMemberRow) => {
    if (!row.registrationId) {
      toast.warning('신청 상세 정보를 찾을 수 없습니다.');
      return;
    }
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const item = await getRegistrationDetail(row.registrationId);
      setDetailItem(item);
    } catch (error) {
      toast.error('상세 정보를 불러오지 못했습니다.');
      setDetailOpen(false);
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };
  const effectiveEventId = detailItem?.eventId || orgEventId;

  const infoSections = useMemo(() => ([
    {
      title: '기본 정보',
      items: [
        // { label: '단체 ID', value: orgId },
        { label: '단체명', value: org?.org ?? '-' },
        { label: '대표자명', value: org?.owner ?? '-' },
        { label: '대표 아이디', value: org?.ownerId ?? '-' },
        { label: '대표 연락처', value: org?.ownerPhone ?? '-' },
      ],
    },
    {
      title: '신청 정보',
      items: [
        { label: '신청일시', value: applicationDate },
        { label: '최근 신청 대회', value: org?.eventTitle ?? '-' },
        {
          label: '총 구성원',
          value: typeof memberCountDisplay === 'number' ? `${memberCountDisplay}명` : '-',
        },
      ],
    },
    {
      title: '결제 정보',
      items: [
        { label: '총 금액', value: totalAmountDisplay },
        { label: '입금자명', value: depositorName },
        { label: '입금 여부', value: payStatusDisplay },
      ],
    },
  ]), [
    org?.org,
    org?.owner,
    org?.ownerId,
    org?.ownerPhone,
    applicationDate,
    org?.eventTitle,
    memberCountDisplay,
    totalAmountDisplay,
    depositorName,
    payStatusDisplay,
  ]);

  // orgId 유효성 검증
  if (!isValidOrgId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">유효하지 않은 단체 ID입니다: {orgId}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">단체 구성원을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    // 404 에러일 때 더 명확한 메시지
    const isNotFound = error.message?.includes('404') || 
                       error.message?.includes('찾을 수 없') || 
                       error.message?.includes('존재하지 않');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          {isNotFound 
            ? `조직 정보를 찾을 수 없습니다. (ID: ${orgId}) 존재하지 않거나 삭제된 조직일 수 있습니다.`
            : `구성원 조회 중 오류가 발생했습니다: ${error.message}`}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md bg-white shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[20px] md:text-[24px] font-pretendard-extrabold text-gray-900">
              단체 상세
            </div>
            <div className="text-sm text-gray-500">
              {org?.org ?? `단체 #${numericOrgId}`}
            </div>
          </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                onClick={() => router.back()}
              >
                목록으로
              </button>
              <button
                onClick={() => {
                  setShowPwdModal(true);
                  setNewPwd('');
                }}
                className="px-4 py-2 text-sm rounded border border-red-600 bg-red-600 text-white hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                비밀번호 초기화
              </button>
            </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {infoSections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
              <dl className="mt-3 grid grid-cols-[90px_1fr] gap-y-2 text-sm text-gray-700">
                {section.items.map(({ label, value }) => (
                  <React.Fragment key={label}>
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-gray-900">{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>

      <OrgMembersTable
        rows={viewRows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}

        onSearch={(q) => { setQuery(q); setPage(1); }}
        onSortKeyChange={(k) => { setSortKey(k); }}
        onSortDirChange={(d) => { setSortDir(d); }}
        onMemberFilterChange={(f) => { setMemberFilter(f); setPage(1); }}

        onClickExcel={() => {}}
        onResetFilters={() => {
          setQuery('');
          setSortKey('id');
          setSortDir('asc');
          setMemberFilter('');
          setPage(1);
        }}
        onClickBack={() => router.push('/admin/users/organization')}
        title={<span className="text-gray-700">단체 구성원 목록</span>}
        onRowClick={handleRowClick}
      />

      {/* 비밀번호 초기화 모달 */}
      {showPwdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !pwdSaving && setShowPwdModal(false)} />
          <div className="relative bg-white rounded-md shadow-lg w-[360px] p-4">
            <h4 className="font-semibold mb-2">단체 비밀번호 초기화</h4>
            <p className="text-sm text-gray-600 mb-1">
              {org?.org ?? '단체'}
            </p>
            <p className="text-sm text-gray-600 mb-3">새 비밀번호를 입력하세요 (최소 6자리, 공백 없음)</p>
            <input
              type="password"
              className="w-full rounded border px-3 py-2 text-sm mb-2"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="새 비밀번호"
              disabled={pwdSaving}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-3 py-1.5 rounded border text-sm"
                onClick={() => {
                  if (!pwdSaving) {
                    setShowPwdModal(false);
                    setNewPwd('');
                  }
                }}
                disabled={pwdSaving}
              >
                취소
              </button>
              <button
                className="px-3 py-1.5 rounded border border-red-600 bg-red-600 text-white text-sm disabled:opacity-50"
                onClick={async () => {
                  if (!orgId || !isValidOrgId) {
                    toast.error('단체 ID를 찾을 수 없습니다.');
                    return;
                  }
                  const pwd = newPwd.trim();
                  if (pwd.length < 6 || /\s/.test(pwd)) {
                    toast.error('비밀번호는 최소 6자리, 공백 없이 입력해주세요.');
                    return;
                  }
                  try {
                    setPwdSaving(true);
                    await resetOrganizationPassword(orgId, pwd);
                    toast.success('단체 비밀번호가 초기화되었습니다.');
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

      <RegistrationDetailDrawer
        open={detailOpen}
        item={detailItem}
        isLoading={detailLoading}
        eventId={effectiveEventId}
        onClose={handleDetailClose}
        onSave={async () => {
          // 저장 후 상세 정보 다시 불러오기
          if (detailItem?.id) {
            try {
              const refreshed = await getRegistrationDetail(detailItem.id);
              setDetailItem(refreshed);
            } catch (error) {
              // 에러 무시 (이미 상세 정보가 있으므로)
            }
          }
        }}
      />
    </div>
  );
}


