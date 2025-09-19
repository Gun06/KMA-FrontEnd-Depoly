#!/usr/bin/env sh
set -e

# 리포지토리 루트에서 실행된다고 가정
# 항상 깔끔한 output 생성
rm -rf output
mkdir -p output

# 소스 전체를 output으로 동기화(.git 등 제외)
# 필요 시 제외 목록을 추가 --exclude 로 관리
rsync -av \
  --exclude '.git' \
  --exclude '.github' \
  --exclude 'node_modules' \
  ./ ./output/

# (선택) Next.js 정적 산출물만 내보내려면 위 rsync 대신 필요한 디렉토리만 복사
# pnpm i && pnpm build && rsync -av .next/ ./output/.next/ && rsync -av public/ ./output/public/
