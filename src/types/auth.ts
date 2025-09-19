export interface LoginFormData {
  id: string
  password: string
  rememberId: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  token?: string
  accessToken?: string
  refreshToken?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface AuthError {
  field?: string
  message: string
}
