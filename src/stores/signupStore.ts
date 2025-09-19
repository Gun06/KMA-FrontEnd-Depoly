import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import React from 'react';
import {
  SignupFormData,
  SignupValidation,
  SignupStepStatus,
  PhoneVerificationData,
  TermsAgreement,
  AccountInfo,
  PersonalInfo,
  AddressInfo,
  SIGNUP_ERROR_MESSAGES,
  VALIDATION_RULES,
  EMAIL_DOMAINS,
  PHONE_PREFIXES
} from '../types/signup';
import { authService } from '../services/auth';

// API 요청 형식에 맞는 타입 정의
interface SignupApiRequest {
  account: {
    accountId: string;
    accountPassword: string;
  };
  profile: {
    birth: string;
    name: string;
    phNum: string;
    email: string;
    gender: 'M' | 'F';
  };
  consents: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    marketingAndAdvertisingSMS: boolean;
    marketingAndAdvertisingEmail: boolean;
    personalInfoCollectionAndUse: boolean;
  };
  address: {
    siDo: string;
    siGunGu: string;
    roadAddress: string;
    zipCode: string;
    addressDetail: string;
  };
}

interface SignupState {
  // 현재 단계
  currentStep: number;
  
  // 회원가입 데이터
  formData: SignupFormData;
  
  // 유효성 검사 결과
  validation: SignupValidation;
  
  // 각 단계별 진행 상태
  stepStatus: SignupStepStatus;
  
  // 휴대폰 인증 데이터
  phoneVerification: PhoneVerificationData;
  
  // 아이디 중복 검사 상태
  accountDuplicateCheck: {
    isChecked: boolean;
    isDuplicate: boolean;
    isLoading: boolean;
    message: string;
  };
  
  // 로딩 상태
  isLoading: boolean;
  
  // 에러 메시지
  errorMessage: string;
}

interface SignupActions {
  // 단계 관리
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // 데이터 업데이트
  updateTerms: (terms: Partial<TermsAgreement>) => void;
  updateAccount: (account: Partial<AccountInfo>) => void;
  updatePersonal: (personal: Partial<PersonalInfo>) => void;
  updateAddress: (address: Partial<AddressInfo>) => void;
  
  // 휴대폰 인증 관리
  updatePhoneVerification: (data: Partial<PhoneVerificationData>) => void;
  startPhoneVerification: () => void;
  completePhoneVerification: () => void;
  resetPhoneVerification: () => void;
  
  // 아이디 중복 검사
  checkAccountDuplicate: (accountId: string) => Promise<boolean>;
  resetAccountDuplicateCheck: () => void;
  
  // 유효성 검사
  validateStep: (step: number) => boolean;
  validateAllSteps: () => boolean;
  clearValidation: (step: number) => void;
  
  // API 요청 데이터 변환
  getApiRequestData: () => SignupApiRequest;
  
  // 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (message: string) => void;
  clearError: () => void;
  
  // 초기화
  resetStore: () => void;
  resetStep: (step: number) => void;
}

// 초기 상태
const initialState: SignupState = {
  currentStep: 1,
  formData: {
    terms: {
      allTerms: false,
      serviceTerms: false,
      privacyTerms: false,
      marketingTerms: false,
      marketingEmail: false,
      marketingSMS: false,
      ageVerification: false,
    },
    account: {
      account: '',
      password: '',
      passwordConfirm: '',
    },
    personal: {
      name: '',
      birthDate: '',
      gender: '',
      emailLocal: '',
      emailDomain: EMAIL_DOMAINS[0],
      phonePrefix: PHONE_PREFIXES[0],
      phoneMiddle: '',
      phoneLast: '',
      isPhoneVerified: false,
      isCustomDomain: false,
    },
    address: {
      postalCode: '',
      address: '',
      addressDetail: '',
    },
  },
  validation: {
    step1: { isValid: false, errors: [] },
    step2: { isValid: false, errors: [] },
    step3: { isValid: false, errors: [] },
    step4: { isValid: false, errors: [] },
  },
  stepStatus: {
    step1: 'pending',
    step2: 'pending',
    step3: 'pending',
    step4: 'pending',
  },
  phoneVerification: {
    phoneNumber: '',
    verificationCode: '',
    countdown: 0,
    isVerified: false,
    error: '',
  },
  accountDuplicateCheck: {
    isChecked: false,
    isDuplicate: false,
    isLoading: false,
    message: '',
  },
  isLoading: false,
  errorMessage: '',
};

// 유효성 검사 함수들
const validateTerms = (terms: TermsAgreement): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!terms.serviceTerms) errors.push(SIGNUP_ERROR_MESSAGES.TERMS_REQUIRED);
  if (!terms.privacyTerms) errors.push(SIGNUP_ERROR_MESSAGES.TERMS_REQUIRED);
  if (!terms.ageVerification) errors.push(SIGNUP_ERROR_MESSAGES.AGE_VERIFICATION_REQUIRED);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateAccount = (account: AccountInfo): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!account.account) {
    errors.push(SIGNUP_ERROR_MESSAGES.ACCOUNT_REQUIRED);
  } else if (account.account.length < VALIDATION_RULES.ACCOUNT.MIN_LENGTH || 
             account.account.length > VALIDATION_RULES.ACCOUNT.MAX_LENGTH) {
    errors.push(SIGNUP_ERROR_MESSAGES.ACCOUNT_LENGTH);
  } else if (!VALIDATION_RULES.ACCOUNT.PATTERN.test(account.account)) {
    errors.push(SIGNUP_ERROR_MESSAGES.ACCOUNT_FORMAT);
  }
  
  if (!account.password) {
    errors.push(SIGNUP_ERROR_MESSAGES.PASSWORD_REQUIRED);
  } else if (account.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH || 
             account.password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    errors.push(SIGNUP_ERROR_MESSAGES.PASSWORD_LENGTH);
  } else if (!VALIDATION_RULES.PASSWORD.PATTERN.test(account.password)) {
    errors.push(SIGNUP_ERROR_MESSAGES.PASSWORD_FORMAT);
  }
  
  if (account.password !== account.passwordConfirm) {
    errors.push(SIGNUP_ERROR_MESSAGES.PASSWORD_MISMATCH);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePersonal = (personal: PersonalInfo): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!personal.name) errors.push(SIGNUP_ERROR_MESSAGES.NAME_REQUIRED);
  if (!personal.birthDate) errors.push(SIGNUP_ERROR_MESSAGES.BIRTH_REQUIRED);
  if (!personal.gender) errors.push(SIGNUP_ERROR_MESSAGES.GENDER_REQUIRED);
  
  if (!personal.emailLocal || !personal.emailDomain) {
    errors.push(SIGNUP_ERROR_MESSAGES.EMAIL_REQUIRED);
  }
  
  if (!personal.phonePrefix || !personal.phoneMiddle || !personal.phoneLast) {
    errors.push(SIGNUP_ERROR_MESSAGES.PHONE_REQUIRED);
  }
  
  // 휴대폰 인증 검증 제거 - 인증 없이도 진행 가능
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateAddress = (address: AddressInfo): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!address.postalCode) errors.push(SIGNUP_ERROR_MESSAGES.POSTAL_CODE_REQUIRED);
  if (!address.address) errors.push(SIGNUP_ERROR_MESSAGES.ADDRESS_REQUIRED);
  if (!address.addressDetail) errors.push(SIGNUP_ERROR_MESSAGES.ADDRESS_DETAIL_REQUIRED);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const useSignupStore = create<SignupState & SignupActions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 단계 관리
      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },
      
      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 4) {
          set({ currentStep: currentStep + 1 });
        }
      },
      
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      goToStep: (step: number) => {
        if (step >= 1 && step <= 4) {
          set({ currentStep: step });
        }
      },
      
      // 데이터 업데이트
      updateTerms: (terms: Partial<TermsAgreement>) => {
        set((state) => ({
          formData: {
            ...state.formData,
            terms: { ...state.formData.terms, ...terms }
          }
        }));
      },
      
      updateAccount: (account: Partial<AccountInfo>) => {
        set((state) => ({
          formData: {
            ...state.formData,
            account: { ...state.formData.account, ...account }
          }
        }));
      },
      
      updatePersonal: (personal: Partial<PersonalInfo>) => {
        set((state) => ({
          formData: {
            ...state.formData,
            personal: { ...state.formData.personal, ...personal }
          }
        }));
      },
      
      updateAddress: (address: Partial<AddressInfo>) => {
        set((state) => ({
          formData: {
            ...state.formData,
            address: { ...state.formData.address, ...address }
          }
        }));
      },
      
      // 휴대폰 인증 관리
      updatePhoneVerification: (data: Partial<PhoneVerificationData>) => {
        set((state) => ({
          phoneVerification: { ...state.phoneVerification, ...data }
        }));
      },
      
      startPhoneVerification: () => {
        set((state) => ({
          phoneVerification: {
            ...state.phoneVerification,
            countdown: 180, // 3분
            error: '',
          }
        }));
      },
      
      completePhoneVerification: () => {
        set((state) => ({
          phoneVerification: {
            ...state.phoneVerification,
            isVerified: true,
            error: '',
          },
          formData: {
            ...state.formData,
            personal: {
              ...state.formData.personal,
              isPhoneVerified: true,
            }
          }
        }));
      },
      
      resetPhoneVerification: () => {
        set((state) => ({
          phoneVerification: {
            ...state.phoneVerification,
            verificationCode: '',
            countdown: 0,
            isVerified: false,
            error: '',
          },
          formData: {
            ...state.formData,
            personal: {
              ...state.formData.personal,
              isPhoneVerified: false,
            }
          }
        }));
      },
      
      // 아이디 중복 검사
      checkAccountDuplicate: async (accountId: string) => {
        try {
          set((state) => ({
            accountDuplicateCheck: {
              ...state.accountDuplicateCheck,
              isLoading: true,
              message: '',
            }
          }));

          // authService를 통해 API 호출
          const result = await authService.checkAccountDuplicate(accountId);

          set((state) => ({
            accountDuplicateCheck: {
              isChecked: true,
              isDuplicate: result.isDuplicate,
              isLoading: false,
              message: result.message,
            }
          }));

          return !result.isDuplicate; // 중복이 아니면 true 반환
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '중복 검사 중 오류가 발생했습니다.';
          set((state) => ({
            accountDuplicateCheck: {
              ...state.accountDuplicateCheck,
              isLoading: false,
              message: errorMessage,
            }
          }));
          throw error;
        }
      },
      resetAccountDuplicateCheck: () => {
        set((state) => ({
          accountDuplicateCheck: {
            isChecked: false,
            isDuplicate: false,
            isLoading: false,
            message: '',
          }
        }));
      },
      
      // 유효성 검사
      validateStep: (step: number) => {
        const { formData } = get();
        let validationResult: { isValid: boolean; errors: string[] };
        
        switch (step) {
          case 1:
            validationResult = validateTerms(formData.terms);
            break;
          case 2:
            validationResult = validateAccount(formData.account);
            break;
          case 3:
            validationResult = validatePersonal(formData.personal);
            break;
          case 4:
            validationResult = validateAddress(formData.address);
            break;
          default:
            return false;
        }
        
        const currentState = get();
        set({
          validation: {
            ...currentState.validation,
            [`step${step}`]: validationResult
          },
          stepStatus: {
            ...currentState.stepStatus,
            [`step${step}`]: validationResult.isValid ? 'completed' : 'error'
          }
        });
        
        return validationResult.isValid;
      },
      
      validateAllSteps: () => {
        const { formData } = get();
        
        const step1Valid = validateTerms(formData.terms);
        const step2Valid = validateAccount(formData.account);
        const step3Valid = validatePersonal(formData.personal);
        const step4Valid = validateAddress(formData.address);
        
        const allValid = step1Valid.isValid && step2Valid.isValid && 
                        step3Valid.isValid && step4Valid.isValid;
        
        set({
          validation: {
            step1: step1Valid,
            step2: step2Valid,
            step3: step3Valid,
            step4: step4Valid,
          },
          stepStatus: {
            step1: step1Valid.isValid ? 'completed' : 'error',
            step2: step2Valid.isValid ? 'completed' : 'error',
            step3: step3Valid.isValid ? 'completed' : 'error',
            step4: step4Valid.isValid ? 'completed' : 'error',
          }
        });
        
        return allValid;
      },
      
      clearValidation: (step: number) => {
        set((state) => ({
          validation: {
            ...state.validation,
            [`step${step}`]: { isValid: false, errors: [] }
          }
        }));
      },
      
      // API 요청 데이터 변환
      getApiRequestData: () => {
        const { formData } = get();
        
        // 생년월일 형식 변환 (YYYY.MM.DD -> YYYY-MM-DD)
        const birthDate = formData.personal.birthDate.replace(/\./g, '-');
        
        // 성별 변환 (male/female -> M/F)
        const gender = formData.personal.gender === 'male' ? 'M' : 'F';
        
        // 전화번호 형식 변환 (하이픈 포함)
        const phoneNumber = `${formData.personal.phonePrefix}-${formData.personal.phoneMiddle}-${formData.personal.phoneLast}`;
        
        // 이메일 조합
        const email = `${formData.personal.emailLocal}@${formData.personal.emailDomain}`;
        
        // 주소 파싱 (예: "서울특별시 강남구 테헤란로 231" -> siDo: "서울특별시", siGunGu: "강남구")
        const addressParts = formData.address.address.split(' ');
        const siDo = addressParts[0] || '';
        const siGunGu = addressParts[1] || '';
        
        return {
          account: {
            accountId: formData.account.account,
            accountPassword: formData.account.password,
          },
          profile: {
            birth: birthDate,
            name: formData.personal.name,
            phNum: phoneNumber,
            email: email,
            gender: gender,
          },
          consents: {
            termsOfService: formData.terms.serviceTerms,
            privacyPolicy: formData.terms.privacyTerms,
            marketingAndAdvertisingSMS: formData.terms.marketingSMS,
            marketingAndAdvertisingEmail: formData.terms.marketingEmail,
            personalInfoCollectionAndUse: formData.terms.ageVerification,
          },
          address: {
            siDo: siDo,
            siGunGu: siGunGu,
            roadAddress: formData.address.address,
            zipCode: formData.address.postalCode,
            addressDetail: formData.address.addressDetail,
          },
        };
      },
      
      // 상태 관리
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (message: string) => {
        set({ errorMessage: message });
      },
      
      clearError: () => {
        set({ errorMessage: '' });
      },
      
      // 초기화
      resetStore: () => {
        set(initialState);
      },
      
      resetStep: (step: number) => {
        switch (step) {
          case 1:
            set((state) => ({
              formData: { ...state.formData, terms: initialState.formData.terms },
              validation: { ...state.validation, step1: initialState.validation.step1 },
              stepStatus: { ...state.stepStatus, step1: 'pending' }
            }));
            break;
          case 2:
            set((state) => ({
              formData: { ...state.formData, account: initialState.formData.account },
              validation: { ...state.validation, step2: initialState.validation.step2 },
              stepStatus: { ...state.stepStatus, step2: 'pending' }
            }));
            break;
          case 3:
            set((state) => ({
              formData: { ...state.formData, personal: initialState.formData.personal },
              validation: { ...state.validation, step3: initialState.validation.step3 },
              stepStatus: { ...state.stepStatus, step3: 'pending' }
            }));
            break;
          case 4:
            set((state) => ({
              formData: { ...state.formData, address: initialState.formData.address },
              validation: { ...state.validation, step4: initialState.validation.step4 },
              stepStatus: { ...state.stepStatus, step4: 'pending' }
            }));
            break;
        }
      },
    }),
    {
      name: 'signup-store-devtools',
    }
  )
);

// 편의를 위한 selector hooks
export const useSignupFormData = () => useSignupStore((state) => state.formData);
export const useSignupCurrentStep = () => useSignupStore((state) => state.currentStep);
export const useSignupValidation = () => useSignupStore((state) => state.validation);
export const useSignupStepStatus = () => useSignupStore((state) => state.stepStatus);
export const useSignupPhoneVerification = () => useSignupStore((state) => state.phoneVerification);
export const useSignupAccountDuplicateCheck = () => useSignupStore((state) => state.accountDuplicateCheck);
export const useSignupLoading = () => useSignupStore((state) => state.isLoading);
export const useSignupError = () => useSignupStore((state) => state.errorMessage);
export const useSignupApiData = () => useSignupStore((state) => state.getApiRequestData());

// 액션만 사용하는 hook
export const useSignupActions = () => {
  const store = useSignupStore();
  return React.useMemo(() => ({
    setCurrentStep: store.setCurrentStep,
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    goToStep: store.goToStep,
    updateTerms: store.updateTerms,
    updateAccount: store.updateAccount,
    updatePersonal: store.updatePersonal,
    updateAddress: store.updateAddress,
    updatePhoneVerification: store.updatePhoneVerification,
    startPhoneVerification: store.startPhoneVerification,
    completePhoneVerification: store.completePhoneVerification,
    resetPhoneVerification: store.resetPhoneVerification,
    checkAccountDuplicate: store.checkAccountDuplicate,
    resetAccountDuplicateCheck: store.resetAccountDuplicateCheck,
    validateStep: store.validateStep,
    validateAllSteps: store.validateAllSteps,
    clearValidation: store.clearValidation,
    getApiRequestData: store.getApiRequestData,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
    resetStore: store.resetStore,
    resetStep: store.resetStep,
  }), [store]);
};
