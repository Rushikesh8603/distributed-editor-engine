import { state } from './state.js';
const API_BASE_URL = 'http://localhost:8080/api';
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
    }
    return result;
}
//# sourceMappingURL=api.js.map