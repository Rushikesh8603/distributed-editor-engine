import { state } from '../state.js';
import { apiRequest } from '../api.js';
export async function renderDashboardView(onLogout, onOpenDoc) {
    const app = document.getElementById('app');
    if (!app)
        return;
    const username = state.getUsername() || 'Collaborator';
    app.innerHTML = `
    <style>
      body {
        background-color: #ffffff !important;
        color: #202124 !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
        font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
      }
      #app {
        max-width: 100% !important;
        width: 100% !important;
        min-height: 100vh !important;
        padding: 0 !important;
        margin: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        box-sizing: border-box !important;
      }
      .gdoc-dash-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: #ffffff;
        border-bottom: 1px solid #e0e0e0;
        padding: 8px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .gdoc-dash-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 220px;
      }
      .gdoc-dash-menu-icon {
        width: 24px;
        height: 24px;
        cursor: pointer;
        fill: #5f6368;
      }
      .gdoc-dash-logo {
        width: 36px;
        height: 36px;
        cursor: pointer;
      }
      .gdoc-dash-brand {
        font-size: 22px;
        font-weight: 400;
        color: #5f6368;
        letter-spacing: -0.2px;
      }
      .gdoc-dash-search-container {
        flex: 1;
        max-width: 720px;
        position: relative;
        display: flex;
        align-items: center;
      }
      .gdoc-dash-search-icon {
        position: absolute;
        left: 16px;
        width: 20px;
        height: 20px;
        fill: #5f6368;
        pointer-events: none;
      }
      .gdoc-dash-search-input {
        width: 100%;
        height: 48px;
        background: #f1f3f4;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 0 16px 0 52px;
        font-size: 16px;
        color: #202124;
        outline: none;
        transition: all 0.2s ease;
      }
      .gdoc-dash-search-input:focus {
        background: #ffffff;
        border-color: #dadce0;
        box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
      }
      .gdoc-dash-right {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .gdoc-dash-user-badge {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #1a73e8;
        color: #ffffff;
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .gdoc-dash-logout {
        background: #ffffff;
        color: #3c4043;
        border: 1px solid #dadce0;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        padding: 7px 16px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .gdoc-dash-logout:hover {
        background: #fce8e6;
        border-color: #fad2cf;
        color: #d93025;
      }
      .gdoc-dash-templates {
        background: #f1f3f4;
        border-bottom: 1px solid #dadce0;
        padding: 20px 24px 28px 24px;
        display: flex;
        justify-content: center;
      }
      .gdoc-dash-templates-inner {
        max-width: 1040px;
        width: 100%;
      }
      .gdoc-dash-section-title {
        font-size: 15px;
        font-weight: 500;
        color: #202124;
        margin-bottom: 16px;
      }
      .gdoc-dash-template-card {
        display: inline-flex;
        flex-direction: column;
        width: 132px;
        cursor: pointer;
      }
      .gdoc-dash-blank-btn {
        width: 132px;
        height: 172px;
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        transition: all 0.2s ease;
        position: relative;
      }
      .gdoc-dash-template-card:hover .gdoc-dash-blank-btn {
        border-color: #1a73e8;
        box-shadow: 0 1px 3px 1px rgba(60,64,67,0.15), 0 2px 8px 4px rgba(60,64,67,0.1);
        transform: translateY(-2px);
      }
      .gdoc-dash-plus-icon {
        width: 48px;
        height: 48px;
      }
      .gdoc-dash-template-label {
        font-size: 14px;
        font-weight: 500;
        color: #202124;
        margin-top: 10px;
        text-align: left;
      }
      .gdoc-dash-main {
        padding: 24px;
        display: flex;
        justify-content: center;
        flex: 1;
      }
      .gdoc-dash-content {
        max-width: 1040px;
        width: 100%;
      }
      .gdoc-dash-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 20px;
        margin-top: 16px;
      }
      .gdoc-card {
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        height: 250px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        transition: all 0.2s ease;
      }
      .gdoc-card:hover {
        border-color: #1a73e8;
        box-shadow: 0 4px 12px rgba(60,64,67,0.15);
        transform: translateY(-2px);
      }
      .gdoc-card-preview {
        flex: 1;
        background: #fdfdfd;
        border-bottom: 1px solid #f1f3f4;
        padding: 20px 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .gdoc-card-preview-line {
        height: 6px;
        background: #f1f3f4;
        border-radius: 3px;
      }
      .gdoc-card-footer {
        padding: 12px 14px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .gdoc-card-title {
        font-size: 14px;
        font-weight: 500;
        color: #202124;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .gdoc-card-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #5f6368;
      }
      .gdoc-card-icon {
        width: 16px;
        height: 16px;
        fill: #1a73e8;
        flex-shrink: 0;
      }
      .gdoc-dash-empty {
        padding: 60px 20px;
        text-align: center;
        color: #5f6368;
      }
      .gdoc-dash-empty-icon {
        width: 64px;
        height: 64px;
        fill: #dadce0;
        margin-bottom: 16px;
      }
      .gdoc-dash-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 60px;
        color: #1a73e8;
      }
      .spinner-circle {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #1a73e8;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .gdoc-shared-badge {
        display: inline-block;
        background: #e8f0fe;
        color: #1a73e8;
        font-size: 11px;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 4px;
      }
    </style>

    <header class="gdoc-dash-header">
      <div class="gdoc-dash-left">
        <svg class="gdoc-dash-menu-icon" viewBox="0 0 24 24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
        <svg class="gdoc-dash-logo" viewBox="0 0 48 48">
          <defs>
            <linearGradient id="dashLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4285F4" />
              <stop offset="100%" stop-color="#1A73E8" />
            </linearGradient>
            <linearGradient id="dashFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#A1C2FA" />
              <stop offset="100%" stop-color="#70A5FF" />
            </linearGradient>
          </defs>
          <path d="M12 4C9.79 4 8 5.79 8 8v32c0 2.21 1.79 4 4 4h24c2.21 0 4-1.79 4-4V16L28 4H12z" fill="url(#dashLogoGrad)" />
          <path d="M28 4v8c0 2.21 1.79 4 4 4h8L28 4z" fill="url(#dashFoldGrad)" />
          <rect x="14" y="22" width="20" height="2.5" rx="1.25" fill="#FFFFFF" />
          <rect x="14" y="28" width="20" height="2.5" rx="1.25" fill="#FFFFFF" />
          <rect x="14" y="34" width="13" height="2.5" rx="1.25" fill="#FFFFFF" />
        </svg>
        <span class="gdoc-dash-brand">Docs</span>
      </div>

      <div class="gdoc-dash-search-container">
        <svg class="gdoc-dash-search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input id="search-docs" class="gdoc-dash-search-input" placeholder="Search" autocomplete="off" />
      </div>

      <div class="gdoc-dash-right">
        <div class="gdoc-dash-user-badge" title="Signed in as ${username}">
          ${username.charAt(0).toUpperCase()}
        </div>
        <button id="logout-btn" class="gdoc-dash-logout">Logout</button>
      </div>
    </header>

    <section class="gdoc-dash-templates">
      <div class="gdoc-dash-templates-inner">
        <div class="gdoc-dash-section-title">Start a new document</div>
        <div id="create-blank-doc" class="gdoc-dash-template-card">
          <div class="gdoc-dash-blank-btn">
            <svg class="gdoc-dash-plus-icon" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M22 10h4v28h-4z"/>
              <path fill="#EA4335" d="M10 22h28v4H10z"/>
              <path fill="#FBBC05" d="M22 22h4v4h-4z"/>
              <path fill="#34A853" d="M22 26h4v12h-4z"/>
            </svg>
          </div>
          <div class="gdoc-dash-template-label">Blank document</div>
        </div>
      </div>
    </section>

    <main class="gdoc-dash-main">
      <div class="gdoc-dash-content">
        <div id="docs-loading" class="gdoc-dash-spinner">
          <div class="spinner-circle"></div>
        </div>

        <div id="docs-container" style="display: none;">
          <div class="gdoc-dash-section-title" style="margin-top: 12px;">Recent documents</div>
          <div id="my-docs-grid" class="gdoc-dash-grid"></div>

          <div id="shared-section" style="margin-top: 40px; display: none;">
            <div class="gdoc-dash-section-title">Shared with me</div>
            <div id="shared-docs-grid" class="gdoc-dash-grid"></div>
          </div>

          <div id="empty-state" class="gdoc-dash-empty" style="display: none;">
            <svg class="gdoc-dash-empty-icon" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <div style="font-size: 16px; font-weight: 500; color: #202124;">No documents yet</div>
            <div style="font-size: 14px; margin-top: 6px;">Click the Blank document card above to start writing.</div>
          </div>
        </div>
      </div>
    </main>
  `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        state.clearToken();
        onLogout();
    });
    const blankBtn = document.getElementById('create-blank-doc');
    blankBtn?.addEventListener('click', async () => {
        try {
            const newDoc = await apiRequest('/docs', 'POST', { title: 'Untitled document' });
            if (newDoc && newDoc._id) {
                onOpenDoc(newDoc._id);
            }
        }
        catch (err) {
            if (err.message && err.message.toLowerCase().includes('token')) {
                state.clearToken();
                onLogout();
                return;
            }
            alert(err.message || 'Failed to create new document. Please try again.');
        }
    });
    try {
        const data = await apiRequest('/docs', 'GET');
        const myDocs = data.myDocs || [];
        const sharedDocs = data.sharedDocs || [];
        const loadingElem = document.getElementById('docs-loading');
        const containerElem = document.getElementById('docs-container');
        const myGridElem = document.getElementById('my-docs-grid');
        const sharedSection = document.getElementById('shared-section');
        const sharedGridElem = document.getElementById('shared-docs-grid');
        const emptyState = document.getElementById('empty-state');
        if (loadingElem)
            loadingElem.style.display = 'none';
        if (containerElem)
            containerElem.style.display = 'block';
        if (myDocs.length === 0 && sharedDocs.length === 0) {
            if (emptyState)
                emptyState.style.display = 'block';
            return;
        }
        function createDocCard(doc, isShared = false) {
            const card = document.createElement('div');
            card.className = 'gdoc-card';
            card.dataset.title = (doc.title || '').toLowerCase();
            const formattedDate = new Date(doc.updatedAt || doc.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            card.innerHTML = `
        <div class="gdoc-card-preview">
          <div class="gdoc-card-preview-line" style="width: 80%;"></div>
          <div class="gdoc-card-preview-line" style="width: 95%;"></div>
          <div class="gdoc-card-preview-line" style="width: 70%;"></div>
          <div class="gdoc-card-preview-line" style="width: 85%;"></div>
          <div class="gdoc-card-preview-line" style="width: 50%;"></div>
        </div>
        <div class="gdoc-card-footer">
          <div class="gdoc-card-title">${doc.title || 'Untitled document'}</div>
          <div class="gdoc-card-meta">
            <svg class="gdoc-card-icon" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span>${formattedDate}</span>
          </div>
          ${isShared ? `<div class="gdoc-shared-badge">Shared by ${doc.owner}</div>` : ''}
        </div>
      `;
            card.addEventListener('click', () => {
                onOpenDoc(doc._id);
            });
            return card;
        }
        if (myGridElem) {
            myDocs.forEach((doc) => {
                myGridElem.appendChild(createDocCard(doc, false));
            });
        }
        if (sharedDocs.length > 0) {
            if (sharedSection)
                sharedSection.style.display = 'block';
            if (sharedGridElem) {
                sharedDocs.forEach((doc) => {
                    sharedGridElem.appendChild(createDocCard(doc, true));
                });
            }
        }
        const searchInput = document.getElementById('search-docs');
        searchInput?.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            const allCards = document.querySelectorAll('.gdoc-card');
            allCards.forEach((card) => {
                const title = card.dataset.title || '';
                if (title.includes(query)) {
                    card.style.display = 'flex';
                }
                else {
                    card.style.display = 'none';
                }
            });
        });
    }
    catch (err) {
        if (err.message && err.message.toLowerCase().includes('token')) {
            state.clearToken();
            onLogout();
            return;
        }
        const loadingElem = document.getElementById('docs-loading');
        if (loadingElem) {
            loadingElem.innerHTML = `<div style="color: #d93025; font-size: 14px;">Failed to load documents: ${err.message || 'Please check backend server'}.</div>`;
        }
    }
}
//# sourceMappingURL=dashboardView.js.map