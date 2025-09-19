'use client';

export interface AdminLoginCredentials {
  account: string;
  password: string;
}

export interface AdminLoginResult {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
}

export const adminAuthService = {
  async login(credentials: AdminLoginCredentials): Promise<AdminLoginResult> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN;
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL_ADMIN 환경 변수가 설정되지 않았습니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        account: credentials.account,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      // 서버 페이로드의 message/코드 등을 보존하여 HttpError 유사 형태로 throw
      let payload: unknown = undefined;
      let message = `HTTP ${response.status}`;
      let code: string | undefined;
      let httpStatus: string | undefined;
      let meta: unknown | undefined;

      try {
        const ct = (response.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('json')) {
          payload = await response.clone().json();
        } else {
          const text = await response.text();
          try {
            payload = JSON.parse(text);
          } catch {
            payload = text;
          }
        }

        if (payload && typeof payload === 'object') {
          const obj = payload as {
            message?: unknown;
            code?: unknown;
            httpStatus?: unknown;
            meta?: unknown;
          };
          if (typeof obj.message === 'string' && obj.message.trim())
            message = obj.message;
          if (typeof obj.code === 'string') code = obj.code;
          if (typeof obj.httpStatus === 'string') httpStatus = obj.httpStatus;
          if ('meta' in obj) meta = obj.meta;
        } else if (typeof payload === 'string' && payload.trim()) {
          message = payload;
        }
      } catch {
        // ignore
      }

      const error = new Error(message) as Error & {
        status: number;
        data?: unknown;
        code?: string;
        serverHttpStatus?: string;
        meta?: unknown;
        response?: {
          status: number;
          data?: unknown;
          message: string;
          code?: string;
          httpStatus?: string;
          meta?: unknown;
        };
      };
      error.status = response.status;
      error.data = payload;
      error.code = code;
      error.serverHttpStatus = httpStatus;
      error.meta = meta;
      error.response = {
        status: response.status,
        data: payload,
        message,
        code,
        httpStatus,
        meta,
      };
      throw error;
    }

    const accessToken =
      response.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      undefined;
    const refreshToken =
      response.headers.get('refreshtoken')?.replace(/^Bearer\s+/i, '') ||
      undefined;

    return {
      success: true,
      message: '로그인 성공',
      accessToken,
      refreshToken,
    };
  },
};
