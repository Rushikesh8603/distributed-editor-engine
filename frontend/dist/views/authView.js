import { apiRequest } from '../api.js';
import { state } from '../state.js';
export function renderAuthView(onLoginSuccess) {
    const app = document.getElementById('app');
    if (!app)
        return;
    let isLoginMode = true;
    app.innerHTML = `
    <style>
      body {
        background-color: #f0f4f9 !important;
        color: #202124 !important;
      }
      .google-auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 16px;
        box-sizing: border-box;
      }
      .google-card {
        background: #ffffff !important;
        border: 1px solid #dadce0 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(60, 64, 67, 0.1) !important;
        width: 100%;
        max-width: 440px;
        padding: 40px 40px 36px 40px !important;
        box-sizing: border-box;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      .doc-logo {
        width: 44px;
        height: 44px;
        margin: 0 auto 16px auto;
        display: block;
        filter: drop-shadow(0 2px 6px rgba(26, 115, 232, 0.25));
      }
      .google-title {
        color: #202124;
        font-size: 24px;
        font-weight: 500;
        line-height: 1.33;
        margin: 0 0 6px 0;
        text-align: center;
        letter-spacing: -0.2px;
      }
      .google-subtitle {
        color: #5f6368;
        font-size: 15px;
        font-weight: 400;
        line-height: 1.4;
        margin: 0 0 28px 0;
        text-align: center;
      }
      .google-form-group {
        margin-bottom: 20px;
        text-align: left;
      }
      .google-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #5f6368;
        margin-bottom: 6px;
        letter-spacing: 0.1px;
      }
      .google-input {
        width: 100%;
        padding: 13px 15px;
        font-size: 15px;
        line-height: 1.5;
        color: #202124;
        background-color: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 6px;
        box-sizing: border-box;
        transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .google-input::placeholder {
        color: #80868b;
      }
      .google-input:hover {
        border-color: #bdc1c6;
      }
      .google-input:focus {
        outline: none;
        border-color: #1a73e8;
        box-shadow: 0 0 0 1px #1a73e8;
      }
      .google-btn {
        width: 100%;
        height: 44px;
        padding: 0 24px;
        background-color: #1a73e8;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.25px;
        cursor: pointer;
        box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease;
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .google-btn:hover {
        background-color: #1557b0;
        box-shadow: 0 2px 6px 2px rgba(60, 64, 67, 0.15), 0 1px 2px 0 rgba(60, 64, 67, 0.3);
      }
      .google-btn:active {
        background-color: #174ea6;
        box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3);
        transform: scale(0.99);
      }
      .google-btn:disabled {
        background-color: rgba(60, 64, 67, 0.12);
        color: rgba(60, 64, 67, 0.38);
        box-shadow: none;
        cursor: not-allowed;
      }
      .google-error {
        color: #d93025;
        font-size: 13px;
        line-height: 1.4;
        margin-top: 14px;
        text-align: center;
        font-weight: 400;
        min-height: 18px;
      }
      .google-switch-text {
        text-align: center;
        margin-top: 24px;
        font-size: 14px;
        color: #5f6368;
        cursor: pointer;
        line-height: 1.4;
        transition: color 0.15s ease;
      }
      .google-switch-text span {
        color: #1a73e8;
        font-weight: 500;
        text-decoration: none;
      }
      .google-switch-text:hover span {
        color: #1557b0;
        text-decoration: underline;
      }
    </style>
    <div class="google-auth-container">
      <div class="card google-card">
        <svg class="doc-logo" viewBox="0 0 48 48" width="42" height="42">
          <defs>
            <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4285F4" />
              <stop offset="100%" stop-color="#1A73E8" />
            </linearGradient>
            <linearGradient id="foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#A1C2FA" />
              <stop offset="100%" stop-color="#70A5FF" />
            </linearGradient>
          </defs>
          <path d="M12 4C9.79 4 8 5.79 8 8v32c0 2.21 1.79 4 4 4h24c2.21 0 4-1.79 4-4V16L28 4H12z" fill="url(#docGrad)" />
          <path d="M28 4v8c0 2.21 1.79 4 4 4h8L28 4z" fill="url(#foldGrad)" />
          <rect x="14" y="22" width="20" height="2.5" rx="1.25" fill="#FFFFFF" />
          <rect x="14" y="28" width="20" height="2.5" rx="1.25" fill="#FFFFFF" />
          <rect x="14" y="34" width="13" height="2.5" rx="1.25" fill="#FFFFFF" />
        </svg>
        <h2 id="form-title" class="google-title">Login</h2>
        <p class="google-subtitle">to continue to Collaborative Docs</p>
        <form id="auth-form">
          <div class="google-form-group">
            <label for="username-input" class="google-label">Username</label>
            <input type="text" id="username-input" class="google-input" placeholder="Enter username" required autocomplete="username" />
          </div>
          <div class="google-form-group">
            <label for="password-input" class="google-label">Password</label>
            <input type="password" id="password-input" class="google-input" placeholder="Enter password" required autocomplete="current-password" />
          </div>
          <button type="submit" id="submit-btn" class="google-btn">Login</button>
        </form>
        <div id="error-box" class="error google-error"></div>
        <div class="switch-text google-switch-text" id="toggle-mode-btn">
          Don't have an account? <span>Sign up</span>
        </div>
      </div>
    </div>
  `;
    // Fix quick HTML tag typo cleanup on innerHTML
    const formTitle = document.getElementById('form-title');
    const authForm = document.getElementById('auth-form');
    const submitBtn = document.getElementById('submit-btn');
    const toggleBtn = document.getElementById('toggle-mode-btn');
    const errorBox = document.getElementById('error-box');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    // Toggle between Login and Signup modes
    toggleBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        formTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
        submitBtn.textContent = isLoginMode ? 'Login' : 'Create Account';
        toggleBtn.innerHTML = isLoginMode
            ? `Don't have an account? <span>Sign up</span>`
            : `Already have an account? <span>Login</span>`;
        errorBox.textContent = '';
    });
    // Handle Form Submission
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.textContent = '';
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const endpoint = isLoginMode ? '/login' : '/signup';
        try {
            submitBtn.textContent = 'Processing...';
            submitBtn.setAttribute('disabled', 'true');
            const result = await apiRequest(endpoint, 'POST', { username, password });
            if (!isLoginMode) {
                // If signup was successful, automatically log them in or prompt them
                alert('Account created successfully! Please log in.');
                isLoginMode = true;
                formTitle.textContent = 'Login';
                submitBtn.textContent = 'Login';
                toggleBtn.innerHTML = `Don't have an account? <span>Sign up</span>`;
                submitBtn.removeAttribute('disabled');
                return;
            }
            // If login was successful, save JWT token and username to state
            state.setToken(result.token);
            state.setUsername(result.username);
            // Trigger router transition to dashboard
            onLoginSuccess();
        }
        catch (err) {
            errorBox.textContent = err.message || 'Authentication failed';
            submitBtn.textContent = isLoginMode ? 'Login' : 'Create Account';
            submitBtn.removeAttribute('disabled');
        }
    });
}
//# sourceMappingURL=authView.js.map