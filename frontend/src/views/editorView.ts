import { state } from '../state.js';
import { CRDTDocument, Item } from '../crdt-engine.js';

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
        <svg id="back-to-dash" class="gdoc-logo" title="Docs home" viewBox="0 0 48 48">
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
      <select id="font-select" class="gdoc-select" title="Font">
        <option value="Roboto">Roboto</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
      </select>
      <select id="size-select" class="gdoc-select" title="Font size">
        <option value="11pt">11pt</option>
        <option value="14pt">14pt</option>
        <option value="18pt">18pt</option>
        <option value="24pt">24pt</option>
        <option value="36pt">36pt</option>
      </select>
      <div class="gdoc-divider"></div>
      <button id="btn-bold" class="gdoc-tool-btn" title="Bold (Ctrl+B)" style="font-weight: 700;" type="button">B</button>
      <button id="btn-italic" class="gdoc-tool-btn" title="Italic (Ctrl+I)" style="font-style: italic; font-family: serif;" type="button">I</button>
      <button id="btn-underline" class="gdoc-tool-btn" title="Underline (Ctrl+U)" style="text-decoration: underline;" type="button">U</button>
      <button id="btn-strike" class="gdoc-tool-btn" title="Strikethrough" style="text-decoration: line-through;" type="button">S</button>
      <button id="btn-code" class="gdoc-tool-btn" title="Inline Code" style="font-family: monospace; font-size: 11px;" type="button">&lt;/&gt;</button>
      <div class="gdoc-divider"></div>
      <input type="color" id="input-color" style="display:none;" value="#ea4335" />
      <button id="btn-color" class="gdoc-tool-btn" title="Text color" type="button">
        <span style="border-bottom: 3px solid #1a73e8; font-weight: 700; line-height: 1;">A</span>
      </button>
      <input type="color" id="input-highlight" style="display:none;" value="#fef08a" />
      <button id="btn-highlight" class="gdoc-tool-btn" title="Highlight color" type="button">
        <span style="background: #fef08a; padding: 0 4px; font-weight: 700; border-radius: 2px;">H</span>
      </button>
      <div class="gdoc-divider"></div>
      <button id="btn-sub" class="gdoc-tool-btn" title="Subscript" type="button">X₂</button>
      <button id="btn-super" class="gdoc-tool-btn" title="Superscript" type="button">X²</button>
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f1f3f4; padding-bottom: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #5f6368; font-weight: 600; letter-spacing: 0.5px;">Document Canvas</div>
          <div style="display: flex; gap: 6px;">
            <button id="view-mode-edit" class="gdoc-tool-btn" style="background: #e8f0fe; color: #1a73e8; font-weight: 500; font-size: 12px; padding: 2px 10px; border-radius: 12px;" type="button">Edit Mode</button>
            <button id="view-mode-rich" class="gdoc-tool-btn" style="color: #5f6368; font-size: 12px; padding: 2px 10px; border-radius: 12px;" type="button">Styled View</button>
          </div>
        </div>
        <textarea id="editor" class="gdoc-textarea" placeholder="Start typing your document here... Changes will sync in real-time." spellcheck="true"></textarea>
        <div id="rich-view" style="display: none; width: 100%; flex: 1; min-height: 850px; line-height: 1.6; font-size: 15px; outline: none; padding: 0; margin: 0; word-break: break-word; font-family: 'Roboto', sans-serif;"></div>
      </div>
    </main>
  `;

  const clientId = username + "_" + Math.floor(Math.random() * 1000);
  const doc = new CRDTDocument();
  const textarea = document.getElementById('editor') as HTMLTextAreaElement;
  const richView = document.getElementById('rich-view') as HTMLDivElement;
  const titleInput = document.querySelector('.gdoc-doc-name') as HTMLInputElement;
  const shareBtn = document.querySelector('.gdoc-share-btn');
  const btnEdit = document.getElementById('view-mode-edit');
  const btnRich = document.getElementById('view-mode-rich');

  let previousValue = "";
  const token = state.getToken() || "";
  const urlParams = new URLSearchParams(window.location.search);
  const docId = urlParams.get('docId') || 'default-room';
  const ws = new WebSocket(`ws://localhost:8080?docId=${encodeURIComponent(docId)}&token=${encodeURIComponent(token)}`);

  const pendingOps: any[] = [];

  function updateRichView() {
    if (richView) {
      richView.innerHTML = doc.renderHTML() || '<span style="color: #80868b; font-style: italic;">Empty document</span>';
    }
  }

  if (docId && docId !== 'default-room') {
    fetch(`http://localhost:8080/api/docs/${docId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.title && titleInput) {
          titleInput.value = data.title;
        }
        if (data.content && doc.renderText() === "") {
          let prevClock: number | null = null;
          for (let i = 0; i < data.content.length; i++) {
            const char = data.content[i];
            const clock = doc.tick();
            doc.insert('init', clock, prevClock !== null ? 'init' : null, prevClock, char);
            prevClock = clock;
          }
          textarea.value = doc.renderText();
          previousValue = textarea.value;
          updateRichView();
        }
      })
      .catch(() => {});
  }

  function getVisibleItemAt(index: number): Item | null {
    if (index < 0) return null;
    let current = doc.head;
    let seen = 0;
    while (current !== null) {
      if (!current.deleted) {
        if (seen === index) return current;
        seen++;
      }
      current = current.right;
    }
    return null;
  }

  function applyFormatToSelection(attributes: Record<string, any>) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start >= end) {
      return;
    }

    const startItem = getVisibleItemAt(start);
    const endItem = getVisibleItemAt(end - 1);

    if (!startItem || !endItem) {
      return;
    }

    doc.format(startItem.clientId, startItem.clock, endItem.clientId, endItem.clock, attributes);
    updateRichView();

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'format',
        startClientId: startItem.clientId,
        startClock: startItem.clock,
        endClientId: endItem.clientId,
        endClock: endItem.clock,
        attributes: attributes
      }));
    }
  }

  function toggleStyle(key: string, value: any = true) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start >= end) return;

    const startItem = getVisibleItemAt(start);
    if (!startItem) return;

    const isCurrentlyActive = Boolean(startItem.attributes && startItem.attributes[key]);
    const attrs: Record<string, any> = {};
    attrs[key] = isCurrentlyActive ? false : value;

    applyFormatToSelection(attrs);
  }

  function toggleScript(targetScript: 'sub' | 'super') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start >= end) return;

    const startItem = getVisibleItemAt(start);
    if (!startItem) return;

    const currentScript = startItem.attributes ? startItem.attributes['script'] : null;
    const attrs: Record<string, any> = {};
    if (currentScript === targetScript) {
      attrs['script'] = null;
    } else {
      attrs['script'] = targetScript;
    }

    applyFormatToSelection(attrs);
  }

  document.getElementById('btn-bold')?.addEventListener('click', () => toggleStyle('bold', true));
  document.getElementById('btn-italic')?.addEventListener('click', () => toggleStyle('italic', true));
  document.getElementById('btn-underline')?.addEventListener('click', () => toggleStyle('underline', true));
  document.getElementById('btn-strike')?.addEventListener('click', () => toggleStyle('strike', true));
  document.getElementById('btn-code')?.addEventListener('click', () => toggleStyle('code', true));
  document.getElementById('btn-sub')?.addEventListener('click', () => toggleScript('sub'));
  document.getElementById('btn-super')?.addEventListener('click', () => toggleScript('super'));

  const fontSelect = document.getElementById('font-select') as HTMLSelectElement;
  fontSelect?.addEventListener('change', () => {
    applyFormatToSelection({ font: fontSelect.value });
  });

  const sizeSelect = document.getElementById('size-select') as HTMLSelectElement;
  sizeSelect?.addEventListener('change', () => {
    applyFormatToSelection({ size: sizeSelect.value });
  });

  const btnColor = document.getElementById('btn-color');
  const inputColor = document.getElementById('input-color') as HTMLInputElement;
  btnColor?.addEventListener('click', () => inputColor?.click());
  inputColor?.addEventListener('input', () => {
    applyFormatToSelection({ color: inputColor.value });
  });

  const btnHighlight = document.getElementById('btn-highlight');
  const inputHighlight = document.getElementById('input-highlight') as HTMLInputElement;
  btnHighlight?.addEventListener('click', () => inputHighlight?.click());
  inputHighlight?.addEventListener('input', () => {
    applyFormatToSelection({ background: inputHighlight.value });
  });

  btnEdit?.addEventListener('click', () => {
    textarea.style.display = 'block';
    if (richView) richView.style.display = 'none';
    if (btnEdit) {
      btnEdit.style.background = '#e8f0fe';
      btnEdit.style.color = '#1a73e8';
      btnEdit.style.fontWeight = '500';
    }
    if (btnRich) {
      btnRich.style.background = 'transparent';
      btnRich.style.color = '#5f6368';
      btnRich.style.fontWeight = '400';
    }
  });

  btnRich?.addEventListener('click', () => {
    updateRichView();
    textarea.style.display = 'none';
    if (richView) richView.style.display = 'block';
    if (btnRich) {
      btnRich.style.background = '#e8f0fe';
      btnRich.style.color = '#1a73e8';
      btnRich.style.fontWeight = '500';
    }
    if (btnEdit) {
      btnEdit.style.background = 'transparent';
      btnEdit.style.color = '#5f6368';
      btnEdit.style.fontWeight = '400';
    }
  });

  titleInput?.addEventListener('change', async () => {
    if (!docId || docId === 'default-room') return;
    try {
      await fetch(`http://localhost:8080/api/docs/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: titleInput.value })
      });
    } catch (e) {}
  });

  shareBtn?.addEventListener('click', async () => {
    const targetUser = prompt('Enter username to share this document with:');
    if (!targetUser) return;
    try {
      const res = await fetch(`http://localhost:8080/api/docs/${docId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: targetUser })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Document shared successfully with ${targetUser}`);
      } else {
        alert(data.error || 'Failed to share document');
      }
    } catch (e) {
      alert('Error sharing document');
    }
  });

  function canApplyOperation(op: any): boolean {
    if (op.type === 'insert') {
      return op.anchorClock === null || doc.findItemByClock(op.anchorClientId, op.anchorClock) !== null;
    }
    if (op.type === 'delete') {
      return doc.findItemByClock(op.clientId, op.clock) !== null;
    }
    if (op.type === 'format') {
      const hasStart = doc.findItemByClock(op.startClientId, op.startClock) !== null;
      const hasEnd = doc.findItemByClock(op.endClientId, op.endClock) !== null;
      return hasStart && hasEnd;
    }
    return true;
  }

  function applyOperation(op: any) {
    if (op.type === 'insert') {
      doc.insert(op.clientId, op.clock, op.anchorClientId, op.anchorClock, op.value, op.attributes || {});
    } else if (op.type === 'delete') {
      doc.delete(op.clientId, op.clock);
    } else if (op.type === 'format') {
      doc.format(op.startClientId, op.startClock, op.endClientId, op.endClock, op.attributes);
    }

    const currentCursor = textarea.selectionStart;
    textarea.value = doc.renderText();
    previousValue = textarea.value;
    textarea.setSelectionRange(currentCursor, currentCursor);
    updateRichView();
  }

  function processPendingQueue() {
    let processedAny = false;

    for (let i = 0; i < pendingOps.length; i++) {
      const op = pendingOps[i];

      if (canApplyOperation(op)) {
        pendingOps.splice(i, 1);
        i--;

        applyOperation(op);
        processedAny = true;
      }
    }

    if (processedAny) {
      processPendingQueue();
    }
  }

  textarea.addEventListener('input', () => {
    const newValue = textarea.value;
    const cursorPosition = textarea.selectionStart;
    const lengthDiff = newValue.length - previousValue.length;

    if (lengthDiff > 0) {
      const insertedChar = newValue.substring(cursorPosition - lengthDiff, cursorPosition);
      const anchorIndex = cursorPosition - lengthDiff - 1;
      const anchorItem = getVisibleItemAt(anchorIndex);
      const anchorId = anchorItem ? anchorItem.clientId : null;
      const anchorClock = anchorItem ? anchorItem.clock : null;

      const newClock = doc.tick();
      doc.insert(clientId, newClock, anchorId, anchorClock, insertedChar);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'insert',
          clientId: clientId,
          clock: newClock,
          anchorClientId: anchorId,
          anchorClock: anchorClock,
          value: insertedChar
        }));
      }
    } else if (lengthDiff < 0) {
      const deletedItem = getVisibleItemAt(cursorPosition);
      if (deletedItem) {
        doc.delete(deletedItem.clientId, deletedItem.clock);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'delete',
            clientId: deletedItem.clientId,
            clock: deletedItem.clock
          }));
        }
      }
    }

    textarea.value = doc.renderText();
    previousValue = textarea.value;
    textarea.setSelectionRange(cursorPosition, cursorPosition);
    updateRichView();
  });

  ws.addEventListener('message', (event) => {
    const op = JSON.parse(event.data);

    if (canApplyOperation(op)) {
      applyOperation(op);
      processPendingQueue();
    } else {
      pendingOps.push(op);
    }
  });

  document.getElementById('back-to-dash')?.addEventListener('click', () => {
    ws.close();
    window.history.pushState({}, '', '/');
    onLogout();
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    ws.close();
    state.clearToken();
    window.history.pushState({}, '', '/');
    onLogout();
  });
}

