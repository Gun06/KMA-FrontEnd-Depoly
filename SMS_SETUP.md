# SMS 서비스 설정 가이드

## 네이버 클라우드 플랫폼 SMS 서비스 설정

### 1. 네이버 클라우드 플랫폼 가입 및 설정

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 가입
2. SMS 서비스 활성화
3. 프로젝트 생성 및 SMS 서비스 추가

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 네이버 클라우드 플랫폼 SMS 서비스 설정
NCP_SERVICE_ID=your_service_id_here
NCP_ACCESS_KEY=your_access_key_here
NCP_SECRET_KEY=your_secret_key_here
NCP_FROM_NUMBER=01012345678
```

### 3. 필요한 값들

- **NCP_SERVICE_ID**: SMS 서비스 ID (네이버 클라우드 콘솔에서 확인)
- **NCP_ACCESS_KEY**: Access Key (네이버 클라우드 콘솔에서 확인)
- **NCP_SECRET_KEY**: Secret Key (네이버 클라우드 콘솔에서 확인)
- **NCP_FROM_NUMBER**: 등록된 발신번호

### 4. 발신번호 등록

1. 네이버 클라우드 콘솔 → SMS → 발신번호 관리
2. 발신번호 등록 신청
3. 승인 후 사용 가능

### 5. 현재 상태

- **환경변수 미설정**: 콘솔에만 로그 출력 (개발용)
- **환경변수 설정 완료**: 실제 SMS 전송

### 6. 테스트 방법

1. 환경변수 설정 전: 터미널에서 인증번호 확인
2. 환경변수 설정 후: 실제 SMS 수신 확인

### 주의사항

- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- 실제 서비스 배포 시에는 서버 환경변수로 설정해야 합니다
- SMS 발송 비용이 발생할 수 있습니다
