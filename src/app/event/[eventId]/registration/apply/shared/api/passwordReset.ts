// 비밀번호 초기화 관련 API 함수들

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

// 개인 신청 비밀번호 초기화 요청 (OTP 발급)
export interface IndividualPasswordResetRequest {
  name: string;
  phNum: string; // 전화번호 (예: "010-1234-5678")
  birth: string; // 생년월일 (예: "1990-01-01")
}

export interface PasswordResetResponse {
  token?: string; // OTP 발급 시 받는 토큰
  message?: string;
}

export const requestIndividualPasswordReset = async (
  eventId: string,
  data: IndividualPasswordResetRequest
): Promise<PasswordResetResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/change-password`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`비밀번호 초기화 요청 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch {
        throw new Error(`비밀번호 초기화 요청 실패: ${response.status} - ${errorText}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 단체 신청 비밀번호 초기화 요청 (OTP 발급)
export interface GroupPasswordResetRequest {
  organizationAccount: string; // 단체 아이디
}

export const requestGroupPasswordReset = async (
  eventId: string,
  data: GroupPasswordResetRequest
): Promise<PasswordResetResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v0/public/event/${eventId}/organization/change-password`;
    
    // Swagger 스펙: organizationIdentify만 필요
    const requestBody = {
      organizationIdentify: data.organizationAccount
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`비밀번호 초기화 요청 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch {
        throw new Error(`비밀번호 초기화 요청 실패: ${response.status} - ${errorText}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 개인 신청 OTP 재발급
export interface OtpReissueRequest {
  token: string; // 기존 토큰
  uniqueInfo?: {
    name?: string;
    phNum?: string;
    birth?: string;
    organizationAccount?: string; // 단체 신청용
  };
}

export const reissueIndividualOtp = async (
  eventId: string,
  data: OtpReissueRequest
): Promise<PasswordResetResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/otp-reissue`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        // MAX_REQUESTED 에러 체크
        if (errorJson.code === 'MAX_REQUESTED') {
          throw { code: 'MAX_REQUESTED', message: errorJson.message || 'OTP 재발급 횟수를 초과했습니다.' };
        }
        throw new Error(`OTP 재발급 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'MAX_REQUESTED') {
          throw error;
        }
        throw new Error(`OTP 재발급 실패: ${response.status} - ${errorText}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 단체 신청 OTP 재발급
export const reissueGroupOtp = async (
  eventId: string,
  data: OtpReissueRequest
): Promise<PasswordResetResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v0/public/event/${eventId}/organization/otp-reissue`;
    
    // 단체 신청의 경우 uniqueInfo의 organizationAccount를 organizationIdentify로 변환
    interface GroupOtpReissueRequestBody {
      token: string;
      uniqueInfo?: {
        organizationIdentify?: string;
        name?: string;
        phNum?: string;
        birth?: string;
      };
    }
    
    const requestBody: GroupOtpReissueRequestBody = {
      token: data.token
    };
    
    if (data.uniqueInfo) {
      if (data.uniqueInfo.organizationAccount) {
        // 단체 신청: organizationAccount를 organizationIdentify로 변환
        requestBody.uniqueInfo = {
          organizationIdentify: data.uniqueInfo.organizationAccount
        };
      } else {
        // 개인 신청: 그대로 전송
        requestBody.uniqueInfo = {
          name: data.uniqueInfo.name,
          phNum: data.uniqueInfo.phNum,
          birth: data.uniqueInfo.birth
        };
      }
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        // MAX_REQUESTED 에러 체크
        if (errorJson.code === 'MAX_REQUESTED') {
          throw { code: 'MAX_REQUESTED', message: errorJson.message || 'OTP 재발급 횟수를 초과했습니다.' };
        }
        throw new Error(`OTP 재발급 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'MAX_REQUESTED') {
          throw error;
        }
        throw new Error(`OTP 재발급 실패: ${response.status} - ${errorText}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 개인 신청 비밀번호 변경 (OTP 검증 후)
export interface IndividualPasswordChangeRequest {
  token: string;
  otp: string;
  newPassword: string;
}

export const changeIndividualPassword = async (
  eventId: string,
  data: IndividualPasswordChangeRequest
): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/change-password`;
    
    // API 스펙에 맞게 otp를 otpNumber로 변환
    const requestBody = {
      token: data.token,
      otpNumber: data.otp,
      newPassword: data.newPassword
    };
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`비밀번호 변경 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch {
        throw new Error(`비밀번호 변경 실패: ${response.status} - ${errorText}`);
      }
    }
  } catch (error) {
    throw error;
  }
};

// 단체 신청 비밀번호 변경 (OTP 검증 후)
export interface GroupPasswordChangeRequest {
  token: string;
  otp: string;
  newPassword: string;
}

export const changeGroupPassword = async (
  eventId: string,
  data: GroupPasswordChangeRequest
): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/api/v0/public/event/${eventId}/organization/change-password`;
    
    // API 스펙에 맞게 otp를 otpNumber로 변환
    const requestBody = {
      token: data.token,
      otpNumber: data.otp,
      newPassword: data.newPassword
    };
    
    console.log('=== 단체 비밀번호 변경 요청 ===');
    console.log('전송 데이터:', {
      token: requestBody.token,
      otpNumber: requestBody.otpNumber,
      newPasswordLength: requestBody.newPassword.length
    });
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('에러 응답:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`비밀번호 변경 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch {
        throw new Error(`비밀번호 변경 실패: ${response.status} - ${errorText}`);
      }
    }
    
    console.log('비밀번호 변경 성공!');
  } catch (error) {
    throw error;
  }
};
