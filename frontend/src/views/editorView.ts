import { state } from '../state.js';

export function renderEditorView(onLogout: () => void) {
  const app = document.getElementById('app');
  if (!app) return;

  const username = state.getUsername() || 'Collaborator';

  app.innerHTML = `
    <style>
      body {
        background-color: #f1f3f4 !important;
        color: #202124 !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        height: 100vh !important;
        overflow: hidden !important;
        font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
      }
      #app {
        max-width: 100% !important;
        width: 100vw !important;
        height: 100vh !important;
        padding: 0 !important;
        margin: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      .gdoc-header {
        background: #ffffff;
        border-bottom: 1px solid #dadce0;
        padding: 8px 16px 4px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .gdoc-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .gdoc-logo {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
        cursor: pointer;
      }
      .gdoc-title-section {
        display: flex;
        flex-direction: column;
      }
      .gdoc-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .gdoc-doc-name {
        font-size: 18px;
        font-weight: 400;
        color: #202124;
        border: 1px solid transparent;
        border-radius: 4px;
        padding: 2px 6px;
        background: transparent;
        outline: none;
        cursor: text;
        transition: border-color 0.15s ease;
      }
      .gdoc-doc-name:hover, .gdoc-doc-name:focus {
        border-color: #dadce0;
        background: #ffffff;
      }
      .gdoc-status {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #5f6368;
        margin-left: 6px;
      }
      .gdoc-status-icon {
        width: 15px;
        height: 15px;
        fill: #5f6368;
      }
      .gdoc-menu-row {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }
      .gdoc-menu-item {
        font-size: 13px;
        color: #3c4043;
        padding: 2px 6px;
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.15s;
      }
      .gdoc-menu-item:hover {
        background-color: #f1f3f4;
      }
      .gdoc-header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .gdoc-share-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #c2e7ff;
        color: #001d35;
        border: none;
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
      }
      .gdoc-share-btn:hover {
        background: #b3defc;
      }
      .gdoc-user-badge {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #1a73e8;
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        cursor: default;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .gdoc-logout-btn {
        background: #ffffff;
        color: #3c4043;
        border: 1px solid #dadce0;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        padding: 6px 14px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .gdoc-logout-btn:hover {
        background: #fce8e6;
        border-color: #fad2cf;
        color: #d93025;
      }
      .gdoc-toolbar-container {
        background: #f8f9fa;
        border-bottom: 1px solid #dadce0;
        padding: 4px 16px;
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        overflow-x: auto;
      }
      .gdoc-tool-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 28px;
        min-width: 28px;
        padding: 0 6px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: #444746;
        cursor: pointer;
        font-size: 13px;
        user-select: none;
        transition: background 0.15s;
      }
      .gdoc-tool-btn:hover {
        background: rgba(0, 0, 0, 0.06);
        color: #1f1f1f;
      }
      .gdoc-tool-btn svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
      .gdoc-divider {
        width: 1px;
        height: 18px;
        background: #dadce0;
        margin: 0 4px;
        flex-shrink: 0;
      }
      .gdoc-select {
        height: 26px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: #444746;
        font-size: 12px;
        padding: 0 4px;
        cursor: pointer;
        outline: none;
      }
      .gdoc-select:hover {
        background: rgba(0, 0, 0, 0.06);
      }
      .gdoc-canvas-area {
        flex: 1;
        overflow-y: auto;
        display: flex;
        justify-content: center;
        padding: 24px 16px 60px 16px;
        box-sizing: border-box;
        background: #f1f3f4;
      }
      .gdoc-paper {
        background: #ffffff;
        width: 816px;
        min-height: 1056px;
        box-shadow: 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        border-radius: 4px;
        padding: 64px 72px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
      .gdoc-textarea {
        width: 100%;
        flex: 1;
        min-height: 850px;
        border: none !important;
        outline: none !important;
        resize: none;
        background: transparent;
        color: #202124;
        font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }
      .gdoc-textarea::placeholder {
        color: #80868b;
        font-style: italic;
      }
    </style>

    <!-- Top Google Docs Header Bar -->
    <header class="gdoc-header">
      <div class="gdoc-header-left">
        <!-- Google Docs Document Logo -->
        <svg class="gdoc-logo" viewBox="0 0 48 48">
          <defs>
            <linearGradient id="headerDocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4285F4" />
              <stop offset="100%" stop-color="#1A73E8" />
            </linearGradient>
            <linearGradient id="headerFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#A1C2FA" />
              <stop offset="100%" stop-color="#70A5FF" />
            </linearGradient>
          </defs>
          <path d="M12 4C9.79 4 8 5.79 8 8v32c0 2.21 1.79 4 4 4h24c2.21 0 4-1.79 4-4V16L28 4H12z" fill="url(#headerDocGrad)" />
          <path d="M28 4v8c0 2.21 1.79 4 4 4h8L28 4z" fill="url(#headerFoldGrad)" />
          <rect x="14" y="22" width="20" height="2.5" rx="1.25" fill="#FFFFFF" />
          <rect x="14" y="28" width="20" height="2.5" rx="1.25" fill="#FFFFFF" />
          <rect x="14" y="34" width="13" height="2.5" rx="1.25" fill="#FFFFFF" />
        </svg>

        <div class="gdoc-title-section">
          <div class="gdoc-title-row">
            <input class="gdoc-doc-name" value="Untitled document" aria-label="Document Title" spellcheck="false" />
            <div class="gdoc-status">
              <svg class="gdoc-status-icon" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 15l-3.5-3.5 1.41-1.41L10 12.17l5.59-5.59L17 8l-7 7z"/>
              </svg>
              <span>All changes saved</span>
            </div>
          </div>
          <div class="gdoc-menu-row">
            <span class="gdoc-menu-item">File</span>
            <span class="gdoc-menu-item">Edit</span>
            <span class="gdoc-menu-item">View</span>
            <span class="gdoc-menu-item">Insert</span>
            <span class="gdoc-menu-item">Format</span>
            <span class="gdoc-menu-item">Tools</span>
            <span class="gdoc-menu-item">Extensions</span>
            <span class="gdoc-menu-item">Help</span>
          </div>
        </div>
      </div>

      <div class="gdoc-header-right">
        <button class="gdoc-share-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
          </svg>
          Share
        </button>
        <div class="gdoc-user-badge" title="Signed in as ${username}">
          ${username.charAt(0).toUpperCase()}
        </div>
        <button id="logout-btn" class="gdoc-logout-btn">Logout</button>
      </div>
    </header>

    <!-- Document Formatting Toolbar -->
    <div class="gdoc-toolbar-container">
      <button class="gdoc-tool-btn" title="Undo (Ctrl+Z)" type="button">
        <svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
      </button>
      <button class="gdoc-tool-btn" title="Redo (Ctrl+Y)" type="button">
        <svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
      </button>
      <button class="gdoc-tool-btn" title="Print (Ctrl+P)" type="button">
        <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
      </button>
      <div class="gdoc-divider"></div>
      <select class="gdoc-select" title="Zoom">
        <option>100%</option>
        <option>75%</option>
        <option>90%</option>
        <option>125%</option>
        <option>150%</option>
      </select>
      <div class="gdoc-divider"></div>
      <select class="gdoc-select" title="Styles">
        <option>Normal text</option>
        <option>Title</option>
        <option>Subtitle</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
      </select>
      <select class="gdoc-select" title="Font">
        <option>Arial</option>
        <option>Roboto</option>
        <option>Georgia</option>
        <option>Times New Roman</option>
        <option>Courier New</option>
      </select>
      <div class="gdoc-divider"></div>
      <button class="gdoc-tool-btn" title="Bold (Ctrl+B)" style="font-weight: 700;" type="button">B</button>
      <button class="gdoc-tool-btn" title="Italic (Ctrl+I)" style="font-style: italic; font-family: serif;" type="button">I</button>
      <button class="gdoc-tool-btn" title="Underline (Ctrl+U)" style="text-decoration: underline;" type="button">U</button>
      <button class="gdoc-tool-btn" title="Text color" type="button">
        <span style="border-bottom: 3px solid #1a73e8; font-weight: 700; line-height: 1;">A</span>
      </button>
      <div class="gdoc-divider"></div>
      <button class="gdoc-tool-btn" title="Align left" type="button">
        <svg viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
      </button>
      <button class="gdoc-tool-btn" title="Align center" type="button">
        <svg viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>
      </button>
      <button class="gdoc-tool-btn" title="Align right" type="button">
        <svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
      </button>
      <div class="gdoc-divider"></div>
      <button class="gdoc-tool-btn" title="Numbered list" type="button">
        <svg viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
      </button>
      <button class="gdoc-tool-btn" title="Bulleted list" type="button">
        <svg viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
      </button>
    </div>

    <!-- Writing Canvas (Paper Sheet View) -->
    <main class="gdoc-canvas-area">
      <div class="gdoc-paper">
        <textarea id="editor" class="gdoc-textarea" placeholder="Start typing your document here... Changes will sync in real-time." spellcheck="true"></textarea>
      </div>
    </main>
  `;

  // Handle Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    state.clearToken();
    onLogout();
  });

  // Placeholder for connecting your CRDT engine & WebSocket connection
  const editorTextarea = document.getElementById('editor') as HTMLTextAreaElement;
  editorTextarea.addEventListener('input', () => {
    // We will wire up your CRDT local mutation engine here next!
    console.log('User typed:', editorTextarea.value);
  });
}

