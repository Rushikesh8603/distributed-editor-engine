const API_BASE_URL = 'http://localhost:8080/api';
export async function apiRequest(endpoint, method, data, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Something went wrong');
        }
        return result;
    }
    catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
//# sourceMappingURL=api.js.map