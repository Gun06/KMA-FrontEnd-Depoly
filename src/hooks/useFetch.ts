// api.ts
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  getAccessToken,
  clearTokens,
  getAdminAccessToken,
  clearAdminTokens,
} from '@/utils/jwt';

/** ====== 설정 ====== */
const API_BASE_URL_ADMIN = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN ?? '';
const API_BASE_URL_USER = process.env.NEXT_PUBLIC_API_BASE_URL_USER ?? '';

export type ServerType = 'admin' | 'user';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/** 슬래시 중복/누락 안전 URL 조합 */
const joinUrl = (base: string, endpoint: string) =>
  `${base.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

const getBaseUrl = (server: ServerType) =>
  server === 'admin' ? API_BASE_URL_ADMIN : API_BASE_URL_USER;

/** ====== 유틸: unknown에서 메시지 추출 ====== */
const extractMessage = (data: unknown, fallback: string) => {
  if (typeof data === 'string' && data.trim().length > 0) return data;
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const m = (data as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim().length > 0) return m;
  }
  return fallback;
};

const extractCode = (data: unknown): string | undefined => {
  if (typeof data === 'object' && data !== null && 'code' in data) {
    const c = (data as { code?: unknown }).code;
    if (typeof c === 'string') return c;
  }
  return undefined;
};

/** 백엔드 에러 페이로드 타입 (공통 포맷) */
export type BackendErrorPayload = {
  httpStatus?: string;
  code?: string;
  message?: string;
  meta?: unknown | null;
};

const extractServerHttpStatus = (data: unknown): string | undefined => {
  if (typeof data === 'object' && data !== null && 'httpStatus' in data) {
    const s = (data as { httpStatus?: unknown }).httpStatus;
    if (typeof s === 'string' && s.trim().length > 0) return s;
  }
  return undefined;
};

const extractMeta = (data: unknown): unknown | null | undefined => {
  if (typeof data === 'object' && data !== null && 'meta' in data) {
    return (data as { meta?: unknown | null }).meta;
  }
  return undefined;
};

/** ====== 에러 타입 ====== */
export class HttpError<T = unknown> extends Error {
  status: number;
  data?: T;
  code?: string;
  serverHttpStatus?: string;
  meta?: unknown;
  /** Axios 스타일 호환을 위한 응답 alias (error.response.message 등) */
  response?: {
    status: number;
    data?: T;
    message: string;
    code?: string;
    httpStatus?: string;
    meta?: unknown;
  };
  constructor(
    message: string,
    status: number,
    data?: T,
    code?: string,
    serverHttpStatus?: string,
    meta?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.code = code;
    this.serverHttpStatus = serverHttpStatus;
    this.meta = meta;
    this.response = {
      status: this.status,
      data: this.data,
      message,
      code: this.code,
      httpStatus: this.serverHttpStatus,
      meta: this.meta,
    };
  }
}

/** ====== 헤더 빌더 ====== */
/** GET/DELETE에는 Content-Type 생략 -> 불필요한 preflight 방지 */
const buildHeaders = (
  server: ServerType,
  withAuth: boolean,
  contentType?: 'json' | 'form'
): HeadersInit => {
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (contentType === 'json') headers['Content-Type'] = 'application/json';
  // form은 브라우저가 boundary 포함한 Content-Type 자동 설정

  if (withAuth) {
    const token = server === 'admin' ? getAdminAccessToken() : getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/** ====== 응답 파싱 ====== */
const parseResponse = async <T>(res: Response): Promise<T | undefined> => {
  if (res.status === 204) return undefined;

  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const dispo = res.headers.get('content-disposition') || '';

  // JSON (application/json, application/problem+json 등)
  if (ct.includes('json')) {
    const resForJson = res.clone();
    try {
      return (await resForJson.json()) as T;
    } catch {
      // JSON 파싱 실패 → 텍스트로 폴백하여 성공 경로로 전달
      const text = await res.text();
      return text as unknown as T;
    }
  }

  // 파일/바이너리
  if (dispo.includes('attachment') || ct.includes('octet-stream')) {
    return (await res.blob()) as unknown as T;
  }

  // 그 외 텍스트
  const text = await res.text();
  return text ? (text as unknown as T) : undefined;
};

/** 에러 본문을 안전하게 읽기 (json -> text 폴백) */
const readErrorPayload = async (res: Response): Promise<unknown> => {
  try {
    return await res.clone().json();
  } catch {
    // ignore
  }
  try {
    return await res.text();
  } catch {
    // ignore
  }
  return undefined;
};

/** 에러 필드 추출(통합) */
const parseErrorFields = (data: unknown, fallbackMessage: string) => ({
  message: extractMessage(data, fallbackMessage),
  code: extractCode(data),
  serverHttpStatus: extractServerHttpStatus(data),
  meta: extractMeta(data),
});

/** 공통 에러 처리: 토큰 정리 + HttpError 생성/throw */
const handleErrorResponse = async (
  server: ServerType,
  res: Response
): Promise<never> => {
  const data = await readErrorPayload(res);

  if (res.status === 401) {
    if (server === 'admin') clearAdminTokens();
    else clearTokens();
  }

  // 백엔드의 message를 항상 우선 사용. 폴백은 일반 상태 문자열만 사용
  const fallback = `HTTP ${res.status}`;

  const { message, code, serverHttpStatus, meta } = parseErrorFields(
    data,
    fallback
  );

  throw new HttpError(
    message,
    res.status,
    data as BackendErrorPayload,
    code,
    serverHttpStatus,
    meta
  );
};

/** ====== 공통 요청기 ====== */
/**
 * - React Query의 abort signal을 init.signal로 그대로 받습니다.
 * - FormData면 Content-Type을 지정하지 않습니다.
 * - 헤더는 기본값 후 사용자 init.headers로 덮어씁니다.
 */
export const request = async <T>(
  server: ServerType,
  endpoint: string,
  method: HttpMethod,
  body?: unknown,
  withAuth = false,
  init?: RequestInit
): Promise<T | undefined> => {
  const baseUrl = getBaseUrl(server);
  const isAbsoluteEndpoint = /^https?:\/\//i.test(endpoint);
  if (!isAbsoluteEndpoint && !baseUrl) {
    console.warn('API base URL이 비어 있습니다. 환경변수를 확인하세요.', {
      server,
      endpoint,
    });
  }
  const url = isAbsoluteEndpoint ? endpoint : joinUrl(baseUrl, endpoint);

  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  const headers = buildHeaders(
    server,
    withAuth,
    isFormData
      ? undefined
      : method === 'POST' || method === 'PUT' || method === 'PATCH'
        ? 'json'
        : undefined
  );
  const mergedHeaders = { ...headers, ...(init?.headers ?? {}) };

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      method,
      headers: mergedHeaders,
      body: isFormData
        ? (body as FormData)
        : body != null
          ? JSON.stringify(body)
          : undefined,
      signal: init?.signal, // ← 핵심: 외부 signal 사용
    });
  } catch {
    throw new HttpError('네트워크 오류가 발생했습니다.', 0);
  }

  if (!res.ok) await handleErrorResponse(server, res);

  return parseResponse<T>(res);
};

/** ====== 훅: GET (인증/비인증 공용) ====== */
export function useGetQuery<TData = unknown>(
  key: readonly unknown[],
  endpoint: string,
  server: ServerType,
  opts?: Omit<
    UseQueryOptions<TData | undefined, HttpError, TData | undefined>,
    'queryKey' | 'queryFn'
  >,
  withAuth = false
): UseQueryResult<TData | undefined, HttpError> {
  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) =>
      request<TData>(server, endpoint, 'GET', undefined, withAuth, {
        signal,
      }),
    ...opts,
  });
}

/** ====== 훅: Mutation (POST/PUT/DELETE/PATCH 통합) ====== */
/**
 * initFactory를 사용하면 vars 기반으로 동적 헤더/옵션을 주입할 수 있습니다.
 * (예: 특정 요청만 커스텀 헤더 추가)
 */
export function useApiMutation<TData = unknown, TVars = unknown>(
  endpoint: string,
  server: ServerType,
  method: Exclude<HttpMethod, 'GET'>,
  withAuth = false,
  options?: UseMutationOptions<TData | undefined, HttpError, TVars>,
  initFactory?: (vars: TVars) => RequestInit | undefined
) {
  return useMutation<TData | undefined, HttpError, TVars>({
    mutationFn: (vars: TVars) =>
      request<TData>(
        server,
        endpoint,
        method,
        vars as unknown,
        withAuth,
        initFactory?.(vars)
      ),
    ...options,
  });
}

/** ====== 편의 함수 (훅 없이 직접 호출) ====== */
export const api = {
  get: <T>(server: ServerType, endpoint: string, init?: RequestInit) =>
    request<T>(server, endpoint, 'GET', undefined, false, init),
  authGet: <T>(server: ServerType, endpoint: string, init?: RequestInit) =>
    request<T>(server, endpoint, 'GET', undefined, true, init),

  post: <T>(
    server: ServerType,
    endpoint: string,
    body?: unknown,
    init?: RequestInit
  ) => request<T>(server, endpoint, 'POST', body, false, init),
  authPost: <T>(
    server: ServerType,
    endpoint: string,
    body?: unknown,
    init?: RequestInit
  ) => request<T>(server, endpoint, 'POST', body, true, init),

  put: <T>(
    server: ServerType,
    endpoint: string,
    body?: unknown,
    init?: RequestInit
  ) => request<T>(server, endpoint, 'PUT', body, false, init),
  authPut: <T>(
    server: ServerType,
    endpoint: string,
    body?: unknown,
    init?: RequestInit
  ) => request<T>(server, endpoint, 'PUT', body, true, init),

  patch: <T>(
    server: ServerType,
    endpoint: string,
    body?: unknown,
    init?: RequestInit
  ) => request<T>(server, endpoint, 'PATCH', body, false, init),
  authPatch: <T>(
    server: ServerType,
    endpoint: string,
    body?: unknown,
    init?: RequestInit
  ) => request<T>(server, endpoint, 'PATCH', body, true, init),

  delete: <T>(server: ServerType, endpoint: string, init?: RequestInit) =>
    request<T>(server, endpoint, 'DELETE', undefined, false, init),
  authDelete: <T>(server: ServerType, endpoint: string, init?: RequestInit) =>
    request<T>(server, endpoint, 'DELETE', undefined, true, init),
};

/** ====== 파일 업로드 전용 훅 ====== */
export function useAuthUpload<TData = unknown>(
  endpoint: string,
  server: ServerType = 'admin',
  options?: UseMutationOptions<TData | undefined, HttpError, FormData>
) {
  return useApiMutation<TData, FormData>(
    endpoint,
    server,
    'POST',
    true, // withAuth = true
    options
  );
}
