# NoticeBoard 컴포넌트 사용 가이드

## 개요

`NoticeBoard`는 공지사항을 표시하는 재사용 가능한 컴포넌트입니다. 정적 데이터와 API 연결 두 가지 방식을 지원합니다.

## 사용 방법

### 1. 정적 데이터 사용 (기존 방식)

```tsx
import { NoticeBoard } from '@/components/common/Notice';
import { noticeData } from '@/data/notices';

function NoticePage() {
  const handleRowClick = (id: number) => {
    console.log('공지사항 클릭:', id);
  };

  return (
    <NoticeBoard
      data={noticeData}
      onRowClick={handleRowClick}
      pageSize={10}
      pinLimit={3}
    />
  );
}
```

### 2. API 연결 사용 (권장)

#### 메인 공지사항

```tsx
import { NoticeBoard } from '@/components/common/Notice';

function NoticePage() {
  const handleRowClick = (id: number) => {
    // 상세 페이지로 이동
    router.push(`/notice/${id}`);
  };

  return (
    <NoticeBoard
      useApi={true}
      onRowClick={handleRowClick}
      pageSize={10}
      pinLimit={3}
    />
  );
}
```

#### 대회별 공지사항

```tsx
import { NoticeBoard } from '@/components/common/Notice';

function EventNoticePage({ eventId }: { eventId: string }) {
  const handleRowClick = (id: number) => {
    router.push(`/event/${eventId}/notices/${id}`);
  };

  return (
    <NoticeBoard
      useApi={true}
      eventId={eventId}
      onRowClick={handleRowClick}
      pageSize={10}
      pinLimit={3}
    />
  );
}
```

## Props

| Prop                  | Type                   | Default | Description                          |
| --------------------- | ---------------------- | ------- | ------------------------------------ |
| `data`                | `NoticeItem[]`         | -       | 정적 데이터 (useApi=false일 때 필수) |
| `useApi`              | `boolean`              | `false` | API 연결 사용 여부                   |
| `eventId`             | `string`               | -       | 대회별 공지사항용 이벤트 ID          |
| `onRowClick`          | `(id: number) => void` | -       | 행 클릭 시 콜백                      |
| `pageSize`            | `number`               | `10`    | 페이지당 항목 수                     |
| `pinLimit`            | `number`               | `3`     | 상단 고정 공지 개수                  |
| `numberDesc`          | `boolean`              | `true`  | 번호 내림차순 정렬                   |
| `showPinnedBadgeInNo` | `boolean`              | `true`  | 고정 공지 뱃지 표시                  |
| `pinnedClickable`     | `boolean`              | `true`  | 고정 공지 클릭 가능 여부             |
| `className`           | `string`               | -       | 추가 CSS 클래스                      |

## 기능

### 자동 기능

- **검색**: 제목, 작성자 기반 실시간 검색
- **필터링**: 카테고리별 필터 (전체, 공지, 이벤트, 대회)
- **페이지네이션**: 자동 페이지 분할 및 네비게이션
- **반응형**: 모바일/데스크톱 최적화
- **로딩/에러 상태**: API 사용 시 자동 처리

### API 연결 시 추가 기능

- **자동 캐싱**: React Query를 통한 스마트 캐싱
- **실시간 업데이트**: 데이터 변경 시 자동 갱신
- **에러 핸들링**: 네트워크 오류 시 재시도 옵션
- **성능 최적화**: 불필요한 API 호출 방지

## API 엔드포인트

### 메인 공지사항

- `GET /notices?page=1&pageSize=10&category=공지&search=검색어`

### 대회별 공지사항

- `GET /events/{eventId}/notices?page=1&pageSize=10&category=공지&search=검색어`

## 상태 관리

API 연결 시 React Query를 사용하여 다음과 같이 관리됩니다:

```tsx
// 캐시 키 예시
[
  'notices',
  'list',
  { page: 1, pageSize: 10, category: '공지', search: '검색어' },
][
  ('event-notices',
  'eventId',
  'list',
  { page: 1, pageSize: 10, category: '공지' })
];
```

## 마이그레이션 가이드

기존 정적 데이터에서 API 연결로 전환:

```tsx
// 기존
<NoticeBoard data={staticData} onRowClick={handleClick} />

// 변경 후
<NoticeBoard useApi={true} onRowClick={handleClick} />
```

## 성능 고려사항

1. **캐싱**: API 응답은 5분간 캐시됩니다
2. **프리페칭**: 필요 시 `usePrefetchNotices()` 훅 사용
3. **조건부 렌더링**: `enabled` 옵션으로 불필요한 API 호출 방지
4. **메모이제이션**: 필터 변경 시에만 API 재호출
