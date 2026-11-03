import { state } from './state.js';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'http://localhost:8080/api';
  }
  return `${window.location.origin}/api`;
}

export function getWsBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'ws://localhost:8080';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

export async function apiRequest(endpoint: string, method: string = 'GET', data?: any, token?: string | null) {
  const authToken = token || state.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options: RequestInit = {
    method,
    headers
  };

  if (method !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Something went wrong');
  }

  return result;
}
