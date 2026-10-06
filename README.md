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

## 기여

1. GitHub 이슈 확인 또는 생성 (템플릿: `.github/ISSUE_TEMPLATE/`)
2. 브랜치 생성 (예: `design/#822-responsive-optimize`)
3. 작업 후 커밋 — 팀 규칙: `feat: #57 …`, `design: #822 …` 등 (`.cursor/rules/issues-commits.mdc` 참고)
4. PR 생성 (`.github/pull_request_template.md`)

## 라이선스

전국마라톤협회 소유입니다.
