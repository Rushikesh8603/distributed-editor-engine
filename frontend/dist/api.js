import { state } from './state.js';
export function getApiBaseUrl() {
    if (typeof window !== 'undefined' && window.location.port === '3000') {
        return 'http://localhost/api';
    }
    return `${window.location.origin}/api`;
}
export function getWsBaseUrl() {
    if (typeof window !== 'undefined' && window.location.port === '3000') {
        return 'ws://localhost';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
}
export async function apiRequest(endpoint, method = 'GET', data, token) {
    const authToken = token || state.getToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    const options = {
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
//# sourceMappingURL=api.js.map