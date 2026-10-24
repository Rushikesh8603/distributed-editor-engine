import { state } from '../state.js';
import { apiRequest } from '../api.js';
export async function renderDashboardView(onLogout, onOpenDoc) {
    const app = document.getElementById('app');
    if (!app)
        return;
    const username = state.getUsername() || 'Collaborator';
    let activeFilter = 'all';
    let cachedMyDocs = [];
    let cachedSharedDocs = [];
    app.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
        vertical-align: middle;
        line-height: 1;
        display: inline-block;
      }

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
        cursor: pointer;
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
        font-weight: 500;
        color: #1f1f1f;
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
      .gdoc-dash-template-gallery {
        display: flex;
        gap: 20px;
        align-items: flex-start;
        overflow-x: auto;
      }
      .gdoc-dash-template-card {
        display: inline-flex;
        flex-direction: column;
        width: 132px;
        cursor: pointer;
        flex-shrink: 0;
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
      .gdoc-dash-filter-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        margin-bottom: 16px;
      }
      .gdoc-filter-chip {
        padding: 6px 14px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 500;
        color: #444746;
        background: #f1f3f4;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .gdoc-filter-chip:hover {
        background: #e1e3e1;
      }
      .gdoc-filter-chip.active {
        background: #c2e7ff;
        color: #001d35;
        border-color: #7cacf8;
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
        position: relative;
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
        align-items: center;
        justify-content: space-between;
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
        margin-top: 2px;
      }
      .gdoc-card-icon {
        width: 16px;
        height: 16px;
        fill: #1a73e8;
        flex-shrink: 0;
      }
      .gdoc-card-3dot-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #5f6368;
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 0.15s ease;
      }
      .gdoc-card-3dot-btn:hover {
        background-color: #f1f3f4;
        color: #202124;
      }
      .gdoc-card-menu {
        position: fixed;
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 6px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        z-index: 1000;
        min-width: 160px;
        padding: 4px 0;
        display: none;
      }
      .gdoc-card-menu-item {
        padding: 8px 16px;
        font-size: 13px;
        color: #202124;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .gdoc-card-menu-item:hover {
        background-color: #f1f3f4;
      }
      .gdoc-card-menu-item.danger {
        color: #d93025;
      }
      .gdoc-card-menu-item.danger:hover {
        background-color: #fce8e6;
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
        <svg class="gdoc-dash-logo" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4285F4" />
              <stop offset="100%" stop-color="#1A73E8" />
            </linearGradient>
          </defs>
          <path d="M8 3C6.34 3 5 4.34 5 6v20c0 1.66 1.34 3 3 3h16c1.66 0 3-1.34 3-3V11l-8-8H8z" fill="url(#dashGrad)"/>
          <path d="M19 3v6c0 1.1.9 2 2 2h6L19 3z" fill="#A1C2FA"/>
          <rect x="9" y="15" width="14" height="2" rx="1" fill="#FFFFFF"/>
          <rect x="9" y="19" width="14" height="2" rx="1" fill="#FFFFFF"/>
          <rect x="9" y="23" width="9" height="2" rx="1" fill="#FFFFFF"/>
          <circle cx="21" cy="22" r="4.5" fill="#1A73E8" stroke="#FFFFFF" stroke-width="1.5"/>
          <path d="M19.5 22a1.5 1.5 0 0 1 2.3-1.2m.7 1.2a1.5 1.5 0 0 1-2.3 1.2" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <span class="gdoc-dash-brand">DocSync</span>
      </div>

      <div class="gdoc-dash-search-container">
        <svg class="gdoc-dash-search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input id="search-docs" class="gdoc-dash-search-input" placeholder="Search documents..." autocomplete="off" />
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
        <div class="gdoc-dash-template-gallery">
          <div id="create-blank-doc" class="gdoc-dash-template-card" data-title="Untitled document" data-content="">
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

          <div class="gdoc-dash-template-card" id="tmpl-meeting" data-title="Meeting Notes" data-content='[{"insert":"Meeting Notes\\nDate: Today\\nAttendees:\\n- ' + username + '\\n\\nAgenda:\\n1. Objectives\\n2. Project Review\\n3. Action Items\\n"}]'>
            <div class="gdoc-dash-blank-btn" style="flex-direction: column; padding: 14px; gap: 8px; justify-content: flex-start; align-items: stretch;">
              <div style="height: 10px; width: 60%; background: #1a73e8; border-radius: 2px;"></div>
              <div style="height: 5px; width: 90%; background: #f1f3f4; border-radius: 2px;"></div>
              <div style="height: 5px; width: 80%; background: #f1f3f4; border-radius: 2px;"></div>
              <div style="height: 5px; width: 70%; background: #f1f3f4; border-radius: 2px;"></div>
              <div style="height: 6px; width: 50%; background: #c2e7ff; border-radius: 2px; margin-top: 8px;"></div>
              <div style="height: 5px; width: 85%; background: #f1f3f4; border-radius: 2px;"></div>
            </div>
            <div class="gdoc-dash-template-label">Meeting Notes</div>
          </div>

          <div class="gdoc-dash-template-card" id="tmpl-project" data-title="Project Proposal" data-content='[{"insert":"Project Proposal\\nOverview of scope, deliverables, and timeline.\\n\\nKey Milestones:\\n- Phase 1: Planning\\n- Phase 2: Implementation\\n- Phase 3: Launch\\n"}]'>
            <div class="gdoc-dash-blank-btn" style="flex-direction: column; padding: 14px; gap: 8px; justify-content: flex-start; align-items: stretch;">
              <div style="height: 10px; width: 70%; background: #137333; border-radius: 2px;"></div>
              <div style="height: 5px; width: 95%; background: #f1f3f4; border-radius: 2px;"></div>
              <div style="height: 5px; width: 85%; background: #f1f3f4; border-radius: 2px;"></div>
              <div style="height: 6px; width: 55%; background: #ceead6; border-radius: 2px; margin-top: 8px;"></div>
              <div style="height: 5px; width: 90%; background: #f1f3f4; border-radius: 2px;"></div>
            </div>
            <div class="gdoc-dash-template-label">Project Proposal</div>
          </div>
        </div>
      </div>
    </section>

    <main class="gdoc-dash-main">
      <div class="gdoc-dash-content">
        <div id="docs-loading" class="gdoc-dash-spinner">
          <div class="spinner-circle"></div>
        </div>

        <div id="docs-container" style="display: none;">
          <div class="gdoc-dash-filter-bar">
            <div class="gdoc-filter-chip active" data-filter="all">All documents</div>
            <div class="gdoc-filter-chip" data-filter="owned">Owned by me</div>
            <div class="gdoc-filter-chip" data-filter="shared">Shared with me</div>
          </div>

          <div id="my-docs-section">
            <div class="gdoc-dash-section-title" id="my-docs-title" style="margin-top: 12px;">Recent documents</div>
            <div id="my-docs-grid" class="gdoc-dash-grid"></div>
          </div>

          <div id="shared-section" style="margin-top: 40px; display: none;">
            <div class="gdoc-dash-section-title">Shared with me</div>
            <div id="shared-docs-grid" class="gdoc-dash-grid"></div>
          </div>

          <div id="empty-state" class="gdoc-dash-empty" style="display: none;">
            <svg class="gdoc-dash-empty-icon" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <div style="font-size: 16px; font-weight: 500; color: #202124;">No documents found</div>
            <div style="font-size: 14px; margin-top: 6px;">Click a template above to start writing.</div>
          </div>
        </div>
      </div>
    </main>

    <div id="card-context-menu" class="gdoc-card-menu">
      <div class="gdoc-card-menu-item" id="menu-item-open">
        <span class="material-symbols-outlined" style="font-size: 18px;">open_in_new</span>
        <span>Open document</span>
      </div>
      <div class="gdoc-card-menu-item" id="menu-item-copy">
        <span class="material-symbols-outlined" style="font-size: 18px;">link</span>
        <span>Copy link</span>
      </div>
      <div class="gdoc-card-menu-item danger" id="menu-item-delete">
        <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        <span>Delete document</span>
      </div>
    </div>
  `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        state.clearToken();
        onLogout();
    });
    const cardMenu = document.getElementById('card-context-menu');
    let activeMenuDoc = null;
    function closeCardMenu() {
        cardMenu.style.display = 'none';
        activeMenuDoc = null;
    }
    document.addEventListener('click', (e) => {
        if (!cardMenu.contains(e.target)) {
            closeCardMenu();
        }
    });
    document.getElementById('menu-item-open')?.addEventListener('click', () => {
        if (activeMenuDoc && activeMenuDoc._id) {
            onOpenDoc(activeMenuDoc._id);
        }
        closeCardMenu();
    });
    document.getElementById('menu-item-copy')?.addEventListener('click', () => {
        if (activeMenuDoc && activeMenuDoc._id) {
            const url = `${window.location.origin}/?docId=${activeMenuDoc._id}`;
            navigator.clipboard.writeText(url).then(() => {
                alert('Document link copied to clipboard!');
            }).catch(() => { });
        }
        closeCardMenu();
    });
    document.getElementById('menu-item-delete')?.addEventListener('click', async () => {
        if (!activeMenuDoc) {
            closeCardMenu();
            return;
        }
        const docToDelete = activeMenuDoc;
        closeCardMenu();
        if (docToDelete.owner !== username) {
            alert('Only the creator can delete this document.');
            return;
        }
        const confirmDelete = window.confirm(`Delete "${docToDelete.title || 'Untitled document'}"? This action cannot be undone.`);
        if (!confirmDelete)
            return;
        try {
            const token = state.getToken();
            const res = await fetch(`http://localhost:8080/api/docs/${docToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                cachedMyDocs = cachedMyDocs.filter(d => d._id !== docToDelete._id);
                cachedSharedDocs = cachedSharedDocs.filter(d => d._id !== docToDelete._id);
                renderFilteredGrids();
            }
            else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Failed to delete document');
            }
        }
        catch (err) {
            alert(err.message || 'Error connecting to server');
        }
    });
    async function createDoc(title, contentStr = '') {
        try {
            const newDoc = await apiRequest('/docs', 'POST', { title });
            if (newDoc && newDoc._id) {
                if (contentStr) {
                    const token = state.getToken();
                    await fetch(`http://localhost:8080/api/docs/${newDoc._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ content: contentStr })
                    });
                }
                onOpenDoc(newDoc._id);
            }
        }
        catch (err) {
            if (err.message && err.message.toLowerCase().includes('token')) {
                state.clearToken();
                onLogout();
                return;
            }
            alert(err.message || 'Failed to create new document.');
        }
    }
    document.querySelectorAll('.gdoc-dash-template-card').forEach((card) => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title') || 'Untitled document';
            const content = card.getAttribute('data-content') || '';
            createDoc(title, content);
        });
    });
    function createDocCard(doc, isShared = false) {
        const card = document.createElement('div');
        card.className = 'gdoc-card';
        card.dataset.title = (doc.title || '').toLowerCase();
        card.dataset.owner = (doc.owner || '').toLowerCase();
        const formattedDate = new Date(doc.updatedAt || doc.createdAt || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const isOwner = doc.owner === username;
        card.innerHTML = `
      <div class="gdoc-card-preview">
        <div class="gdoc-card-preview-line" style="width: 80%;"></div>
        <div class="gdoc-card-preview-line" style="width: 95%;"></div>
        <div class="gdoc-card-preview-line" style="width: 70%;"></div>
        <div class="gdoc-card-preview-line" style="width: 85%;"></div>
        <div class="gdoc-card-preview-line" style="width: 50%;"></div>
      </div>
      <div class="gdoc-card-footer">
        <div style="flex: 1; overflow: hidden;">
          <div class="gdoc-card-title">${doc.title || 'Untitled document'}</div>
          <div class="gdoc-card-meta">
            <svg class="gdoc-card-icon" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span>${formattedDate}</span>
          </div>
          ${isShared ? `<div class="gdoc-shared-badge">Shared by ${doc.owner}</div>` : ''}
        </div>
        <button class="gdoc-card-3dot-btn" title="More options" type="button">
          <span class="material-symbols-outlined" style="font-size: 18px;">more_vert</span>
        </button>
      </div>
    `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.gdoc-card-3dot-btn'))
                return;
            onOpenDoc(doc._id);
        });
        const moreBtn = card.querySelector('.gdoc-card-3dot-btn');
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            activeMenuDoc = doc;
            const deleteItem = document.getElementById('menu-item-delete');
            if (isOwner) {
                deleteItem.style.display = 'flex';
            }
            else {
                deleteItem.style.display = 'none';
            }
            const rect = moreBtn.getBoundingClientRect();
            cardMenu.style.left = `${Math.min(rect.left, window.innerWidth - 180)}px`;
            cardMenu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - 120)}px`;
            cardMenu.style.display = 'block';
        });
        return card;
    }
    function renderFilteredGrids() {
        const myGridElem = document.getElementById('my-docs-grid');
        const sharedSection = document.getElementById('shared-section');
        const sharedGridElem = document.getElementById('shared-docs-grid');
        const emptyState = document.getElementById('empty-state');
        const mySection = document.getElementById('my-docs-section');
        const searchInput = document.getElementById('search-docs');
        const query = (searchInput?.value || '').toLowerCase().trim();
        myGridElem.innerHTML = '';
        sharedGridElem.innerHTML = '';
        let visibleMy = cachedMyDocs;
        let visibleShared = cachedSharedDocs;
        if (query) {
            visibleMy = visibleMy.filter(d => (d.title || '').toLowerCase().includes(query));
            visibleShared = visibleShared.filter(d => (d.title || '').toLowerCase().includes(query) || (d.owner || '').toLowerCase().includes(query));
        }
        if (activeFilter === 'owned') {
            visibleShared = [];
        }
        else if (activeFilter === 'shared') {
            visibleMy = [];
        }
        if (visibleMy.length > 0) {
            mySection.style.display = 'block';
            visibleMy.forEach(d => myGridElem.appendChild(createDocCard(d, false)));
        }
        else {
            mySection.style.display = 'none';
        }
        if (visibleShared.length > 0) {
            sharedSection.style.display = 'block';
            visibleShared.forEach(d => sharedGridElem.appendChild(createDocCard(d, true)));
        }
        else {
            sharedSection.style.display = 'none';
        }
        if (visibleMy.length === 0 && visibleShared.length === 0) {
            emptyState.style.display = 'block';
        }
        else {
            emptyState.style.display = 'none';
        }
    }
    document.querySelectorAll('.gdoc-filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.gdoc-filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter') || 'all';
            renderFilteredGrids();
        });
    });
    const searchInput = document.getElementById('search-docs');
    searchInput?.addEventListener('input', () => {
        renderFilteredGrids();
    });
    try {
        const data = await apiRequest('/docs', 'GET');
        cachedMyDocs = data.myDocs || [];
        cachedSharedDocs = data.sharedDocs || [];
        const loadingElem = document.getElementById('docs-loading');
        const containerElem = document.getElementById('docs-container');
        if (loadingElem)
            loadingElem.style.display = 'none';
        if (containerElem)
            containerElem.style.display = 'block';
        renderFilteredGrids();
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