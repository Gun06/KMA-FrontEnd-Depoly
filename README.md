# KMA Frontend — 전국마라톤협회

전국마라톤협회 공식 웹 프론트엔드(Next.js)입니다. **메인(협회)** · **대회별 미니사이트** · **관리자**를 한 저장소에서 운영합니다.

## 기술 스택

| 구분 | 사용 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React 18, Tailwind CSS |
| Data | TanStack React Query |
| 기타 | TipTap, Zustand, Framer Motion, Swiper |
| 품질 | ESLint, Prettier |
| 패키지 | **pnpm 8.15.0** (필수) |

## 요구 사항

- **Node.js 22** (CI와 동일, `.github/workflows/ci.yml`)
- **pnpm 8.15.0** (`package.json`의 `packageManager`)

## 설치 및 실행

### pnpm-only

npm / yarn / npx는 사용하지 않습니다. `preinstall` 훅과 CI에서 pnpm만 허용합니다.

**pnpm 설치 (Corepack 미사용)**

```bash
# macOS
brew install pnpm

# 또는
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**의존성**

```bash
pnpm install
```

**환경 변수**

```bash
cp env.example .env.local
```

`.env.local`에서 API URL 등을 환경에 맞게 수정합니다. 로컬 백엔드가 `8080`이면 예시 값 그대로도 동작합니다(`next.config.js` 기본값과 동일).

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_API_BASE_URL_USER` | 메인·대회 공개 API |
| `NEXT_PUBLIC_API_BASE_URL_ADMIN` | 관리자 API |
| `NEXT_PUBLIC_AUTH_MODE` | (선택) `cookie` / `bearer` / `none` |
| `NCP_*` | (선택) 회원가입 SMS — 서버 전용 |

**개발 서버**

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) — 메인 홈은 `src/app/(main)/page.tsx`  
[http://localhost:3000/admin](http://localhost:3000/admin) — 관리자  
[http://localhost:3000/event/{eventId}](http://localhost:3000/event) — 대회 사이트

## 프로젝트 구조

경로만 봐도 **어느 사이트 코드인지** 구분합니다. 메인 UI를 관리자에 복사하지 않습니다(반대도 동일).

```
src/
├── app/
│   ├── (main)/              # 공개 메인 → /, /notice, /schedule, /mypage …
│   ├── admin/               # 관리자 → /admin/*
│   ├── event/               # 대회 미니사이트 → /event/[eventId]/*
│   └── api/                 # Next Route Handlers (프록시 등)
├── components/
│   ├── main/                # 메인 전용 UI
│   ├── admin/               # 관리자 전용 UI
│   ├── event/               # 대회 전용 UI
│   └── common/              # 공통 (Notice, FAQ, TextEditor …)
├── layouts/
│   ├── main/
│   ├── admin/
│   └── event/
├── services/                # API·도메인 서비스
├── hooks/
├── lib/                     # 공통 상수·타입 (event, legal, register …)
├── styles/                  # globals.css, main.css …
├── types/
└── utils/
```

**예시**

| 화면 | 페이지 | 컴포넌트 |
|------|--------|----------|
| 메인 FAQ | `app/(main)/notice/faq/page.tsx` | `components/main/FaqSection` 등 |
| 대회 FAQ | `app/event/[eventId]/notices/faq/page.tsx` | `app/event/.../faq/components/*` |
| 관리자 FAQ | `app/admin/boards/faq/...` | `components/admin/...` |

별칭: `@/*` → `src/*` (`tsconfig.json` `paths`)

## 개발 명령

```bash
pnpm dev              # 개발 서버
pnpm build            # 프로덕션 빌드 (output: standalone)
pnpm start            # 프로덕션 서버
pnpm type-check       # tsc --noEmit
pnpm lint             # next lint
pnpm lint:fix
pnpm format           # Prettier write
pnpm format:check
pnpm clean            # pnpm store prune
pnpm update           # pnpm update --latest
```

### CI

`main`, `develop` 브랜치 push/PR 시 GitHub Actions에서 **build → type-check → lint** 를 실행합니다 (`.github/workflows/ci.yml`).

## 반응형·프론트 최적화 (#822)

이슈 [#822](https://github.com/KMA-Renewal/KMA-Frontend/issues/822) 범위·브레이크포인트·리소스 패턴 요약입니다.

### 우선순위 (P0 → P1)

| 우선 | 영역 | 대표 URL |
|------|------|----------|
| P0 | 메인 홈·히어로·embedded 섹션 | `/` |
| P0 | 참가신청 가이드 | `/registration/guide` |
| P0 | 메인 FAQ | `/notice/faq` |
| P0 | 대회 홈·게시판·가이드 | `/event/{eventId}`, `…/notices/*`, `…/guide/*` |
| P1 | 관리자 게시판·목록 (별도 PR 가능) | `/admin/*` |
| — | 커밍순 | `src/app/page.tsx` 모드 분기 |

### 브레이크포인트

Tailwind `screens` (`tailwind.config.js`)와 `src/lib/layout/breakpoints.ts`를 맞춥니다.

| 토큰 | px | 용도 |
|------|-----|------|
| `xs` | 475 | 초소형 |
| `sm` | 640 | 본문 16px 전환 (`typography.ts`) |
| `md` | 768 | 태블릿 |
| `lg` | 1024 | 메인 히어로 고정 높이 (`globals.css`) |
| `xl` | 1280 | |
| `custom` | 1300 | 메인 데스크탑 헤더·우측 플로팅 (`mainLayoutTokens`) |
| `eventNav` | 1180 | 대회 헤더 가로 nav |
| `2xl` | 1536 | |

수동 QA 권장 뷰포트: **390 · 768 · 1280 · 1920** (`QA_VIEWPORTS` in `breakpoints.ts`).

### 공통 레이아웃·UI

- 메인 가로 리듬: `src/components/main/mainLayoutTokens.ts`
- 게시판·FAQ 목록 폭: `src/lib/layout/publicContentFrame.ts` (`EventBoardListFrame`, `FaqPageFrame`)
- 공개 본문 타이포: `src/lib/main/typography.ts`

### 정적 리소스

- 폰트: `src/styles/globals.css` `@font-face` — **woff2**, `font-display: swap`
- 이미지: `next/image` + `sizes`; 대회 메인은 `useEventMainPageAssets`에서 **프리로드 후 일괄 표시**
- 대회 가이드·기념품: `GuidePageImageStack` — 스켈레톤 → 로드 후 reveal

### 렌더·데이터

- 대회 메인: 단일 훅으로 API·스폰서 fetch + 이미지 preload (`useEventMainPageAssets`)
- FAQ 아코디언: `React.memo` on `FaqItem`, 홈 `FaqSection` toggle `useCallback`
- `useBreakpoints` / `useMediaQuery`: `breakpoints.ts`와 동일 px

## 기여

1. GitHub 이슈 확인 또는 생성 (템플릿: `.github/ISSUE_TEMPLATE/`)
2. 브랜치 생성 (예: `design/#822-responsive-optimize`)
3. 작업 후 커밋 — 팀 규칙: `feat: #57 …`, `design: #822 …` 등 (`.cursor/rules/issues-commits.mdc` 참고)
4. PR 생성 (`.github/pull_request_template.md`)

## 라이선스

이 프로젝트는 전국마라톤협회 및 TEAM.BR{Ai}N 소유입니다
