// App State Management for Authentication
export const state = {
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  },
  
  setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  },

  clearToken(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
  },

  getUsername(): string | null {
    return localStorage.getItem('username');
  },

  setUsername(username: string): void {
    localStorage.setItem('username', username);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};


