/** 로그인 후 되돌아가면 안 되는 경로 (회원가입·로그인 플로우 등) */
const NON_RETURNABLE_PATH_PREFIXES = ['/signup', '/login'];

export function getLoginReturnUrl(pathname: string): string | null {
  if (NON_RETURNABLE_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return null;
  }
  return pathname;
}

export function buildLoginHref(pathname: string): string {
  const returnUrl = getLoginReturnUrl(pathname);
  return returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/login';
}

export function resolvePostLoginRedirectUrl(returnUrl: string | null): string {
  if (!returnUrl || returnUrl === '/login') {
    return '/';
  }
  if (NON_RETURNABLE_PATH_PREFIXES.some(prefix => returnUrl.startsWith(prefix))) {
    return '/';
  }
  return returnUrl;
}
