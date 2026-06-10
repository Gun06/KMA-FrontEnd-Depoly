import { userApi } from '@/hooks/api.presets';

/** 본인 회원탈퇴 - DELETE /api/v1/user */
export async function withdrawCurrentUser(): Promise<void> {
  await userApi.authDelete('/api/v1/user');
}
