import { redirect } from 'next/navigation'

export default function EventRootPage() {
  // /event 경로로 직접 접근 시 기본 이벤트로 리디렉션
  redirect('/event/marathon2025')
}

