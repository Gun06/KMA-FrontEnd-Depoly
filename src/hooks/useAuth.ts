import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import { LoginFormData, LoginResponse } from '@/types/auth'

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = authService.getToken()
      setIsAuthenticated(!!token)
    }

    checkAuthStatus()
  }, [])

  // 로그인 함수
  const login = useCallback(async (credentials: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(credentials)
      setIsAuthenticated(true)
      
      // 로그인 성공 후 리다이렉션
      if (response.user) {
        // TODO: 사용자 역할에 따른 리다이렉션
        router.push('/mypage')
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await authService.logout()
      setIsAuthenticated(false)
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [router])

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
  }
}
