// api.presets.ts
import { request } from './useFetch';

export const userApi = {
  get: <T>(endpoint: string, init?: RequestInit) =>
    request<T>('user', endpoint, 'GET', undefined, false, init),
  authGet:   <T>(endpoint: string, init?: RequestInit) =>
    request<T>('user', endpoint, 'GET', undefined, true,  init),
  authPost:  <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<T>('user', endpoint, 'POST', body, true, init),
  authPut:   <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<T>('user', endpoint, 'PUT',  body, true, init),
  authPatch: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<T>('user', endpoint, 'PATCH',body, true, init),
  authDelete:<T>(endpoint: string, init?: RequestInit) =>
    request<T>('user', endpoint, 'DELETE', undefined, true, init),
};

export const adminApi = {
  authGet:   <T>(endpoint: string, init?: RequestInit) =>
    request<T>('admin', endpoint, 'GET', undefined, true,  init),
  authPost:  <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<T>('admin', endpoint, 'POST', body, true, init),
  authPut:   <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<T>('admin', endpoint, 'PUT',  body, true, init),
  authPatch: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<T>('admin', endpoint, 'PATCH',body, true, init),
  authDelete:<T>(endpoint: string, init?: RequestInit) =>
    request<T>('admin', endpoint, 'DELETE', undefined, true, init),
};
