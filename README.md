# KMA Frontend - 한국마라톤협회

한국마라톤협회 공식 웹사이트 프론트엔드 프로젝트입니다.

## 🚀 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: (선택사항 - 필요시 추가)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Package Manager**: PNPM

## 📦 설치 및 실행

### 1. 패키지 매니저 정책 (pnpm-only)

본 저장소는 pnpm만 사용합니다. npm, yarn, npx 사용을 금지합니다. CI에서 강제 검증되며 `preinstall` 훅으로도 차단됩니다.

### 2. PNPM 설치 (Corepack 미사용)

권장 로컬 버전: pnpm 8.15.0 (CI와 동일)

macOS (Homebrew):

```bash
brew install pnpm
```

크로스플랫폼 (설치 스크립트):

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 3. 의존성 설치

```bash
pnpm install
```

### 4. 환경 변수 설정

```bash
cp env.example .env.local
```

`.env.local` 파일을 열어 필요한 환경 변수들을 설정하세요.

### 5. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
│   ├── admin/          # 관리자 페이지
│   ├── event/          # 이벤트 관련 페이지
│   ├── mypage/         # 마이페이지
│   └── ...
├── components/         # 재사용 가능한 컴포넌트
├── hooks/             # 커스텀 훅
├── layouts/           # 레이아웃 컴포넌트
├── services/          # API 서비스
├── styles/            # 스타일 파일
├── types/             # TypeScript 타입 정의
└── utils/             # 유틸리티 함수
```

## 🛠️ 개발 도구

### 코드 포맷팅

```bash
pnpm format          # Prettier로 코드 포맷팅
pnpm format:check    # 포맷팅 검사
```

### 린팅

```bash
pnpm lint           # ESLint 검사
pnpm lint:fix       # 자동 수정 가능한 문제들 수정
```

### 타입 체크

```bash
pnpm type-check     # TypeScript 타입 검사
```

### 패키지 관리

```bash
pnpm clean          # PNPM 스토어 정리
pnpm update         # 패키지 업데이트
```

## 🚀 배포

### 빌드

```bash
pnpm build
```

### 프로덕션 서버 실행

```bash
pnpm start
```

## 📝 기여 가이드

1. 이슈를 생성하거나 기존 이슈를 확인하세요
2. 새로운 브랜치를 생성하세요 (`git checkout -b feature/your-feature`)
3. 변경사항을 커밋하세요 (`git commit -am 'Add some feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/your-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 전국마라톤협회의 소유입니다
