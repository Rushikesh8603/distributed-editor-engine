import { state } from '../state.js';
import { apiRequest } from '../api.js';
export async function renderDashboardView(onLogout, onOpenDoc) {
    const app = document.getElementById('app');
    if (!app)
        return;
    document.title = 'DocSync — Distributed Collaborative Workspace';
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
      }
      .gdoc-dash-menu-icon-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #5f6368;
        transition: background-color 0.15s ease;
      }
      .gdoc-dash-menu-icon-btn:hover {
        background-color: rgba(68, 71, 70, 0.08);
        color: #1f1f1f;
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
      .gdoc-drawer-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.35);
        z-index: 10000;
        display: none;
      }
      .gdoc-drawer-backdrop.active {
        display: block;
      }
      .gdoc-drawer {
        position: fixed;
        top: 0;
        left: 0;
        width: 300px;
        height: 100vh;
        background: #ffffff;
        box-shadow: 4px 0 24px rgba(0,0,0,0.18);
        z-index: 10001;
        transform: translateX(-100%);
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
      }
      .gdoc-drawer.active {
        transform: translateX(0);
      }
      .gdoc-drawer-header {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e0e0e0;
      }
      .gdoc-drawer-menu {
        flex: 1;
        padding: 14px 10px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .gdoc-drawer-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 18px;
        border-radius: 24px;
        font-size: 14px;
        color: #444746;
        cursor: pointer;
        transition: all 0.15s ease;
        user-select: none;
      }
      .gdoc-drawer-item:hover {
        background: #f1f3f4;
        color: #1f1f1f;
      }
      .gdoc-drawer-item.active {
        background: #c2e7ff;
        color: #001d35;
        font-weight: 500;
      }
      .gdoc-drawer-footer {
        padding: 16px 20px;
        border-top: 1px solid #e0e0e0;
        background: #fdfdfd;
      }
      .gdoc-dash-templates {
        background: #f1f3f4;
        border-bottom: 1px solid #dadce0;
        padding: 24px 24px 30px 24px;
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
        gap: 24px;
        align-items: flex-start;
        overflow-x: auto;
      }
      .gdoc-dash-template-card {
        display: inline-flex;
        flex-direction: column;
        width: 156px;
        cursor: pointer;
        flex-shrink: 0;
      }
      .gdoc-dash-template-thumb {
        width: 156px;
        height: 198px;
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(60,64,67,0.08);
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .gdoc-dash-template-card:hover .gdoc-dash-template-thumb {
        border-color: #1a73e8;
        box-shadow: 0 4px 14px rgba(60,64,67,0.18);
        transform: translateY(-3px);
      }
      .gdoc-dash-template-thumb.blank-thumb {
        align-items: center;
        justify-content: center;
      }
      .gdoc-dash-plus-icon {
        width: 48px;
        height: 48px;
      }
      .tmpl-meeting-header {
        background: #0b57d0;
        padding: 9px 12px;
        display: flex;
        align-items: center;
      }
      .tmpl-project-header {
        background: #0f5223;
        padding: 9px 12px;
        display: flex;
        align-items: center;
      }
      .tmpl-body {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 7px;
        flex: 1;
        background: #ffffff;
      }
      .tmpl-title-bar {
        height: 7px;
        border-radius: 2px;
        margin-bottom: 2px;
      }
      .tmpl-meta-row {
        display: flex;
        gap: 6px;
        margin-bottom: 4px;
      }
      .tmpl-badge {
        font-size: 8px;
        font-weight: 600;
        padding: 2px 5px;
        border-radius: 3px;
        line-height: 1;
      }
      .tmpl-line {
        height: 4px;
        background: #e8eaed;
        border-radius: 2px;
      }
      .tmpl-line-bullet {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .tmpl-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .tmpl-checklist {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-top: 4px;
      }
      .tmpl-check-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .tmpl-timeline {
        display: flex;
        align-items: center;
        gap: 4px;
        margin: 5px 0;
      }
      .tmpl-node {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #dadce0;
        flex-shrink: 0;
      }
      .tmpl-node.active {
        background: #137333;
      }
      .tmpl-track {
        flex: 1;
        height: 2px;
        background: #dadce0;
      }
      .gdoc-dash-template-label {
        font-size: 14px;
        font-weight: 500;
        color: #202124;
        margin-top: 10px;
        text-align: left;
      }
      .gdoc-dash-template-sub {
        font-size: 12px;
        color: #5f6368;
        margin-top: 2px;
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
        min-width: 180px;
        padding: 6px 0;
        display: none;
      }
      .gdoc-card-menu-item {
        padding: 8px 16px;
        font-size: 13px;
        color: #202124;
        display: flex;
        align-items: center;
        gap: 10px;
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
      .gdoc-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
      }
      .gdoc-modal-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        max-width: 90vw;
        display: flex;
        flex-direction: column;
        gap: 16px;
        box-sizing: border-box;
      }
      .gdoc-modal-title {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: #1f1f1f;
      }
      .gdoc-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 8px;
      }
      .gdoc-btn-cancel {
        background: transparent;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        color: #444746;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .gdoc-btn-cancel:hover {
        background: #f1f3f4;
      }
      .gdoc-btn-primary {
        background: #0b57d0;
        border: 1px solid #0b57d0;
        border-radius: 4px;
        padding: 8px 18px;
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .gdoc-btn-primary:hover {
        background: #0842a0;
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

    <div id="dash-drawer-backdrop" class="gdoc-drawer-backdrop"></div>
    <aside id="dash-drawer" class="gdoc-drawer">
      <div class="gdoc-drawer-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg class="gdoc-dash-logo" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="drawerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4285F4" />
                <stop offset="100%" stop-color="#1A73E8" />
              </linearGradient>
            </defs>
            <path d="M8 3C6.34 3 5 4.34 5 6v20c0 1.66 1.34 3 3 3h16c1.66 0 3-1.34 3-3V11l-8-8H8z" fill="url(#drawerGrad)"/>
            <path d="M19 3v6c0 1.1.9 2 2 2h6L19 3z" fill="#A1C2FA"/>
            <rect x="9" y="15" width="14" height="2" rx="1" fill="#FFFFFF"/>
            <rect x="9" y="19" width="14" height="2" rx="1" fill="#FFFFFF"/>
            <rect x="9" y="23" width="9" height="2" rx="1" fill="#FFFFFF"/>
            <circle cx="21" cy="22" r="4.5" fill="#1A73E8" stroke="#FFFFFF" stroke-width="1.5"/>
            <circle cx="21" cy="22" r="1.8" fill="#FFFFFF"/>
          </svg>
          <div>
            <div style="font-size: 17px; font-weight: 500; color: #1f1f1f;">DocSync Engine</div>
            <div style="font-size: 11px; color: #1a73e8; font-weight: 600;">CRDT Distributed Sync</div>
          </div>
        </div>
        <button id="dash-drawer-close" class="gdoc-dash-menu-icon-btn" title="Close menu" type="button">
          <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
        </button>
      </div>

      <div class="gdoc-drawer-menu">
        <div class="gdoc-drawer-item active" id="drawer-item-docs">
          <span class="material-symbols-outlined">description</span>
          <span>Documents Workspace</span>
        </div>
        <div class="gdoc-drawer-item" id="drawer-crdt-stats">
          <span class="material-symbols-outlined" style="color: #1a73e8;">hub</span>
          <span>CRDT Engine Diagnostics</span>
        </div>
        <div class="gdoc-drawer-item" id="drawer-nodes-info">
          <span class="material-symbols-outlined" style="color: #137333;">dns</span>
          <span>Cluster & Storage</span>
        </div>
        <div style="height: 1px; background: #e0e0e0; margin: 8px 12px;"></div>
        <div class="gdoc-drawer-item" id="drawer-new-doc">
          <span class="material-symbols-outlined" style="color: #ea4335;">add_circle</span>
          <span>Create Blank Document</span>
        </div>
        <div class="gdoc-drawer-item" id="drawer-logout">
          <span class="material-symbols-outlined">logout</span>
          <span>Sign out</span>
        </div>
      </div>

      <div class="gdoc-drawer-footer">
        <div style="font-size: 11px; color: #747775;">Distributed Editor Engine v1.4</div>
        <div style="font-size: 11px; color: #1a73e8; margin-top: 2px;">Peer-to-Peer CRDT Convergence</div>
      </div>
    </aside>

    <header class="gdoc-dash-header">
      <div class="gdoc-dash-left">
        <button id="dash-menu-btn" class="gdoc-dash-menu-icon-btn" title="Main menu" type="button">
          <span class="material-symbols-outlined" style="font-size: 24px;">menu</span>
        </button>
        <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" id="dash-brand-btn">
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
            <circle cx="21" cy="22" r="1.8" fill="#FFFFFF"/>
          </svg>
          <span class="gdoc-dash-brand">DocSync</span>
        </div>
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
            <div class="gdoc-dash-template-thumb blank-thumb">
              <svg class="gdoc-dash-plus-icon" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M22 10h4v28h-4z"/>
                <path fill="#EA4335" d="M10 22h28v4H10z"/>
                <path fill="#FBBC05" d="M22 22h4v4h-4z"/>
                <path fill="#34A853" d="M22 26h4v12h-4z"/>
              </svg>
            </div>
            <div class="gdoc-dash-template-label">Blank document</div>
            <div class="gdoc-dash-template-sub">Start fresh</div>
          </div>

          <div class="gdoc-dash-template-card" id="tmpl-meeting" data-title="Meeting Notes" data-content='[{"insert":"Meeting Notes\\nDate: Today\\nAttendees:\\n- ${username}\\n\\nAgenda:\\n1. Distributed System Review\\n2. CRDT Sync Performance\\n3. Action Items\\n"}]'>
            <div class="gdoc-dash-template-thumb">
              <div class="tmpl-meeting-header">
                <span style="font-size: 8px; font-weight: 700; letter-spacing: 0.6px; color: #ffffff;">MEETING NOTES</span>
              </div>
              <div class="tmpl-body">
                <div class="tmpl-title-bar" style="background: #1a73e8; width: 65%;"></div>
                <div class="tmpl-meta-row">
                  <span class="tmpl-badge" style="background: #e8f0fe; color: #1a73e8;">Today</span>
                  <span class="tmpl-badge" style="background: #f1f3f4; color: #5f6368;">Team Sync</span>
                </div>
                <div style="font-size: 8px; font-weight: 600; color: #444746; margin-top: 2px;">Agenda</div>
                <div class="tmpl-line-bullet"><span class="tmpl-dot" style="background: #1a73e8;"></span><div class="tmpl-line" style="width: 85%;"></div></div>
                <div class="tmpl-line-bullet"><span class="tmpl-dot" style="background: #1a73e8;"></span><div class="tmpl-line" style="width: 70%;"></div></div>
                <div class="tmpl-line-bullet"><span class="tmpl-dot" style="background: #1a73e8;"></span><div class="tmpl-line" style="width: 80%;"></div></div>
                <div class="tmpl-checklist">
                  <div class="tmpl-check-item"><span class="material-symbols-outlined" style="font-size: 11px; color: #1a73e8;">check_box</span><div class="tmpl-line" style="width: 75%;"></div></div>
                  <div class="tmpl-check-item"><span class="material-symbols-outlined" style="font-size: 11px; color: #1a73e8;">check_box_outline_blank</span><div class="tmpl-line" style="width: 60%;"></div></div>
                </div>
              </div>
            </div>
            <div class="gdoc-dash-template-label">Meeting Notes</div>
            <div class="gdoc-dash-template-sub">Agenda & action items</div>
          </div>

          <div class="gdoc-dash-template-card" id="tmpl-project" data-title="Project Proposal" data-content='[{"insert":"Project Proposal: Distributed Engine Architecture\\nScope and Deliverables:\\n- Multi-User CRDT Convergence\\n- Real-Time WebSocket Synchronization\\n- Scalable MongoDB Sharding\\n"}]'>
            <div class="gdoc-dash-template-thumb">
              <div class="tmpl-project-header">
                <span style="font-size: 8px; font-weight: 700; letter-spacing: 0.6px; color: #ffffff;">PROJECT PROPOSAL</span>
              </div>
              <div class="tmpl-body">
                <div class="tmpl-title-bar" style="background: #137333; width: 75%;"></div>
                <div class="tmpl-meta-row">
                  <span class="tmpl-badge" style="background: #e6f4ea; color: #137333;">Milestones</span>
                  <span class="tmpl-badge" style="background: #f1f3f4; color: #5f6368;">Roadmap</span>
                </div>
                <div class="tmpl-timeline">
                  <div class="tmpl-node active"></div>
                  <div class="tmpl-track"></div>
                  <div class="tmpl-node"></div>
                  <div class="tmpl-track"></div>
                  <div class="tmpl-node"></div>
                </div>
                <div class="tmpl-line-bullet"><span class="tmpl-dot" style="background: #137333;"></span><div class="tmpl-line" style="width: 90%;"></div></div>
                <div class="tmpl-line-bullet"><span class="tmpl-dot" style="background: #137333;"></span><div class="tmpl-line" style="width: 75%;"></div></div>
                <div class="tmpl-line-bullet"><span class="tmpl-dot" style="background: #137333;"></span><div class="tmpl-line" style="width: 82%;"></div></div>
              </div>
            </div>
            <div class="gdoc-dash-template-label">Project Proposal</div>
            <div class="gdoc-dash-template-sub">Scope & roadmap</div>
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
        <span class="material-symbols-outlined" style="font-size: 18px;">description</span>
        <span>Open document</span>
      </div>
      <div class="gdoc-card-menu-item" id="menu-item-newtab">
        <span class="material-symbols-outlined" style="font-size: 18px;">open_in_new</span>
        <span>Open in new tab</span>
      </div>
      <div class="gdoc-card-menu-item" id="menu-item-rename">
        <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
        <span>Rename</span>
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

    <div id="dash-delete-modal" class="gdoc-modal-overlay" style="display: none;">
      <div class="gdoc-modal-card" style="width: 440px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #fce8e6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="color: #d93025; font-size: 24px;">delete</span>
          </div>
          <div>
            <h3 class="gdoc-modal-title">Delete document?</h3>
            <div style="font-size: 13px; color: #5f6368; margin-top: 2px;">Permanently remove from distributed engine</div>
          </div>
        </div>
        <div style="font-size: 14px; color: #3c4043; line-height: 1.5;" id="dash-delete-statement">
          Are you sure you want to delete this document? This action will permanently remove all replicas from the server and revoke access for any collaborators. This cannot be undone.
        </div>
        <div class="gdoc-modal-actions">
          <button id="dash-delete-cancel" class="gdoc-btn-cancel" type="button">Cancel</button>
          <button id="dash-delete-confirm" class="gdoc-btn-primary" type="button" style="background: #d93025; color: #ffffff; border-color: #d93025;">Delete permanently</button>
        </div>
      </div>
    </div>

    <div id="dash-rename-modal" class="gdoc-modal-overlay" style="display: none;">
      <div class="gdoc-modal-card" style="width: 420px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined" style="color: #1a73e8; font-size: 24px;">edit</span>
          <h3 class="gdoc-modal-title">Rename document</h3>
        </div>
        <div>
          <label style="font-size: 12px; color: #444746; display: block; margin-bottom: 6px;">Document title</label>
          <input id="dash-rename-input" style="width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; outline: none;" placeholder="Enter document title" autocomplete="off" />
        </div>
        <div class="gdoc-modal-actions">
          <button id="dash-rename-cancel" class="gdoc-btn-cancel" type="button">Cancel</button>
          <button id="dash-rename-apply" class="gdoc-btn-primary" type="button">OK</button>
        </div>
      </div>
    </div>

    <div id="crdt-diag-modal" class="gdoc-modal-overlay" style="display: none;">
      <div class="gdoc-modal-card" style="width: 520px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #e8f0fe; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="color: #1a73e8; font-size: 22px;">hub</span>
            </div>
            <div>
              <h3 class="gdoc-modal-title">CRDT Engine Diagnostics</h3>
              <div style="font-size: 12px; color: #1a73e8; font-weight: 500;">Real-Time Distributed Synchronization</div>
            </div>
          </div>
          <button id="crdt-diag-close" class="gdoc-dash-menu-icon-btn" type="button">
            <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: #3c4043; background: #f8fafd; border: 1px solid #dadce0; border-radius: 8px; padding: 14px;">
          <div style="display: flex; justify-content: space-between;"><span>Concurrency Model:</span><b style="color: #0b57d0;">Conflict-free Replicated Data Type (CRDT)</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Conflict Resolution:</span><b>Last-Write-Wins (LWW) & Vector Clocks</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Sync Protocol:</span><b style="color: #137333;">WebSocket Real-Time Broadcast</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Backend Endpoint:</span><code>ws://localhost:8080</code></div>
          <div style="display: flex; justify-content: space-between;"><span>Storage Engine:</span><b>MongoDB Atlas Cluster</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Active Session:</span><b>${username}</b></div>
        </div>
        <div style="font-size: 12px; color: #5f6368; line-height: 1.4;">
          The distributed engine enables non-blocking local edits with guaranteed eventual consistency across distributed replicas without centralized locking.
        </div>
        <div class="gdoc-modal-actions">
          <button id="crdt-diag-ok" class="gdoc-btn-primary" type="button">Done</button>
        </div>
      </div>
    </div>
  `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        state.clearToken();
        onLogout();
    });
    const drawer = document.getElementById('dash-drawer');
    const drawerBackdrop = document.getElementById('dash-drawer-backdrop');
    const menuBtn = document.getElementById('dash-menu-btn');
    const drawerCloseBtn = document.getElementById('dash-drawer-close');
    function openDrawer() {
        drawer.classList.add('active');
        drawerBackdrop.classList.add('active');
    }
    function closeDrawer() {
        drawer.classList.remove('active');
        drawerBackdrop.classList.remove('active');
    }
    menuBtn?.addEventListener('click', openDrawer);
    drawerCloseBtn?.addEventListener('click', closeDrawer);
    drawerBackdrop?.addEventListener('click', closeDrawer);
    const crdtModal = document.getElementById('crdt-diag-modal');
    document.getElementById('drawer-crdt-stats')?.addEventListener('click', () => {
        closeDrawer();
        crdtModal.style.display = 'flex';
    });
    document.getElementById('drawer-nodes-info')?.addEventListener('click', () => {
        closeDrawer();
        crdtModal.style.display = 'flex';
    });
    document.getElementById('crdt-diag-close')?.addEventListener('click', () => {
        crdtModal.style.display = 'none';
    });
    document.getElementById('crdt-diag-ok')?.addEventListener('click', () => {
        crdtModal.style.display = 'none';
    });
    document.getElementById('drawer-item-docs')?.addEventListener('click', () => {
        closeDrawer();
    });
    document.getElementById('drawer-new-doc')?.addEventListener('click', () => {
        closeDrawer();
        createDoc('Untitled document', '');
    });
    document.getElementById('drawer-logout')?.addEventListener('click', () => {
        state.clearToken();
        onLogout();
    });
    const cardMenu = document.getElementById('card-context-menu');
    const deleteModal = document.getElementById('dash-delete-modal');
    const deleteStatement = document.getElementById('dash-delete-statement');
    const renameModal = document.getElementById('dash-rename-modal');
    const renameInput = document.getElementById('dash-rename-input');
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
    document.getElementById('menu-item-newtab')?.addEventListener('click', () => {
        if (activeMenuDoc && activeMenuDoc._id) {
            window.open(`/?docId=${activeMenuDoc._id}`, '_blank');
        }
        closeCardMenu();
    });
    document.getElementById('menu-item-rename')?.addEventListener('click', () => {
        if (!activeMenuDoc)
            return;
        const docToRename = activeMenuDoc;
        closeCardMenu();
        activeMenuDoc = docToRename;
        renameInput.value = docToRename.title || 'Untitled document';
        renameModal.style.display = 'flex';
        setTimeout(() => {
            renameInput.focus();
            renameInput.select();
        }, 50);
    });
    document.getElementById('dash-rename-cancel')?.addEventListener('click', () => {
        renameModal.style.display = 'none';
    });
    document.getElementById('dash-rename-apply')?.addEventListener('click', async () => {
        if (!activeMenuDoc)
            return;
        const docId = activeMenuDoc._id;
        const newTitle = renameInput.value.trim() || 'Untitled document';
        renameModal.style.display = 'none';
        try {
            const token = state.getToken();
            const res = await fetch(`http://localhost:8080/api/docs/${docId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: newTitle })
            });
            if (res.ok) {
                const foundMy = cachedMyDocs.find(d => d._id === docId);
                if (foundMy)
                    foundMy.title = newTitle;
                const foundShared = cachedSharedDocs.find(d => d._id === docId);
                if (foundShared)
                    foundShared.title = newTitle;
                renderFilteredGrids();
            }
            else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Failed to rename document');
            }
        }
        catch (err) {
            alert(err.message || 'Error renaming document');
        }
    });
    renameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('dash-rename-apply')?.click();
        }
        else if (e.key === 'Escape') {
            renameModal.style.display = 'none';
        }
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
    document.getElementById('menu-item-delete')?.addEventListener('click', () => {
        if (!activeMenuDoc) {
            closeCardMenu();
            return;
        }
        const docToDelete = activeMenuDoc;
        closeCardMenu();
        activeMenuDoc = docToDelete;
        if (docToDelete.owner !== username) {
            alert('Only the creator can delete this document.');
            return;
        }
        deleteStatement.textContent = `Are you sure you want to permanently delete "${docToDelete.title || 'Untitled document'}"? This action will remove the document from your library and delete all replicas. Collaborators will lose access immediately. This cannot be undone.`;
        deleteModal.style.display = 'flex';
    });
    document.getElementById('dash-delete-cancel')?.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });
    document.getElementById('dash-delete-confirm')?.addEventListener('click', async () => {
        if (!activeMenuDoc)
            return;
        const docToDelete = activeMenuDoc;
        deleteModal.style.display = 'none';
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
            cardMenu.style.left = `${Math.min(rect.left, window.innerWidth - 190)}px`;
            cardMenu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - 180)}px`;
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