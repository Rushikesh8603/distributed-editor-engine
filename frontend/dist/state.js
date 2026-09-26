// App State Management for Authentication
export const state = {
    getToken() {
        return localStorage.getItem('jwt_token');
    },
    setToken(token) {
        localStorage.setItem('jwt_token', token);
    },
    clearToken() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('username');
    },
    getUsername() {
        return localStorage.getItem('username');
    },
    setUsername(username) {
        localStorage.setItem('username', username);
    },
    isAuthenticated() {
        return !!this.getToken();
    }
};
//# sourceMappingURL=state.js.map