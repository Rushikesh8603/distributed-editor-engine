import { state } from '../state.js';
import { CRDTDocument, Item } from '../crdt-engine.js';
import { getEditorTemplate } from './editorView/editorView.template.js';
import {
  DomNodeOffset,
  SelectionRange,
  HeadingItem,
  SaveStatus,
  ListPrefixType,
  DeltaChunk,
  MenuCommand
} from './editorView/editorView.types.js';
import {
  MAX_HISTORY,
  standardColors,
  dropIds,
  toolButtons
} from './editorView/editorView.constants.js';
import {
  showToast,
  closeAllDropdowns,
  getFirstTextOrLine,
  sanitizeDeltaChunks,
  canApplyOperation as canApplyOperationUtil,
  getVisibleItemAt as getVisibleItemAtUtil,
  getEditorText as getEditorTextUtil,
  getCharOffsetOfNode as getCharOffsetOfNodeUtil,
  getNodeAndOffsetAtChar as getNodeAndOffsetAtCharUtil
} from './editorView/editorView.utils.js';
import {
  setupCompanionRailHandlers,
  setupStaticModalCloseHandlers,
  setupPaletteGrids,
  setupMenuDropdownToggle,
  setupOutsideClickListener,
  setupToolButtonsMousedown,
  setupExternalLinkMenus
} from './editorView/editorView.handlers.js';
import {
  updateDocumentOutline as updateDocumentOutlineUtil,
  setupMenuCommandSearch,
  setupWordCountModal
} from './editorView/editorView.submodules.js';

export function renderEditorView(onLogout: () => void) {
  const container = document.getElementById('app');
  if (!container) return;

  const username = state.getUsername() || 'Anonymous';
  const userInitial = username.charAt(0).toUpperCase();

  container.innerHTML = getEditorTemplate(username, userInitial);
  const clientId = username + "_" + Math.floor(Math.random() * 1000);
  let doc = new CRDTDocument();
  const editorDiv = document.getElementById('editor') as HTMLDivElement;
  const titleInput = document.getElementById('doc-title-input') as HTMLInputElement;
  const statusSpan = document.getElementById('save-status-text') as HTMLSpanElement;
  const paperSheet = document.getElementById('paper-sheet') as HTMLDivElement;
  const starterChips = document.getElementById('starter-chips') as HTMLDivElement;
  const gdocSidebar = document.getElementById('gdoc-sidebar') as HTMLElement;
  const floatingOutlineBtn = document.getElementById('btn-floating-outline') as HTMLElement;
  const sizeInput = document.getElementById('size-input') as HTMLInputElement;
  const companionRail = document.getElementById('companion-rail') as HTMLElement;
  const companionToggleBtn = document.getElementById('companion-toggle-btn') as HTMLElement;
  const mainToolbar = document.getElementById('main-floating-toolbar') as HTMLElement;

  let previousValue = "";
  const token = state.getToken() || "";
  const urlParams = new URLSearchParams(window.location.search);
  let docId = urlParams.get('docId') || 'default-room';
  let ws: WebSocket;

  const pendingOps: any[] = [];
  let autoSaveTimer: any = null;
  let isRendering = false;
  let savedSelection: { start: number; end: number } = { start: 0, end: 0 };
  let pendingAttributes: Record<string, any> = {};
  let paintFormatAttrs: Record<string, any> | null = null;

  let cachedMyDocs: any[] = [];
  let cachedSharedDocs: any[] = [];
  let isStarred = false;


  function getEditorText(): string {
    return getEditorTextUtil(editorDiv);
  }

  function getCharOffsetOfNode(targetNode: Node, targetOffset: number): number {
    return getCharOffsetOfNodeUtil(editorDiv, targetNode, targetOffset);
  }

  function getNodeAndOffsetAtChar(pos: number): { node: Node; offset: number } {
    return getNodeAndOffsetAtCharUtil(editorDiv, pos);
  }

  function getVisibleItemAt(index: number): Item | null {
    return getVisibleItemAtUtil(doc, index);
  }

  function canApplyOperation(op: any): boolean {
    return canApplyOperationUtil(doc, op);
  }

  function updateDocumentOutline() {
    updateDocumentOutlineUtil(editorDiv);
  }

  const undoStack: Array<any[]> = [];
  const redoStack: Array<any[]> = [];
  function recordHistorySnapshot() {
    const items = doc.getItems();
    if (undoStack.length > 0) {
      const top = undoStack[undoStack.length - 1];
      if (top && top.length === items.length) {
        let same = true;
        for (let i = 0; i < items.length; i++) {
          const a = items[i];
          const b = top[i];
          if (!a || !b || a.val !== b.val || a.deleted !== b.deleted || a.clock !== b.clock) {
            same = false;
            break;
          }
        }
        if (same) return;
      }
    }
    undoStack.push(JSON.parse(JSON.stringify(items)));
    if (undoStack.length > MAX_HISTORY) {
      undoStack.shift();
    }
    redoStack.length = 0;
  }

  function performUndo() {
    if (undoStack.length === 0) return;
    const currentItems = doc.getItems();
    redoStack.push(JSON.parse(JSON.stringify(currentItems)));
    const prev = undoStack.pop();
    if (prev) {
      doc.loadItems(prev);
      renderEditor();
      previousValue = getEditorText();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'sync_response',
          items: doc.getItems()
        }));
      }
      triggerAutoSave();
      showToast('Undo');
    }
  }

  function performRedo() {
    if (redoStack.length === 0) return;
    const currentItems = doc.getItems();
    undoStack.push(JSON.parse(JSON.stringify(currentItems)));
    const next = redoStack.pop();
    if (next) {
      doc.loadItems(next);
      renderEditor();
      previousValue = getEditorText();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'sync_response',
          items: doc.getItems()
        }));
      }
      triggerAutoSave();
      showToast('Redo');
    }
  }

  function initWebSocket() {
    ws = new WebSocket(`ws://localhost:8080?docId=${encodeURIComponent(docId)}&token=${encodeURIComponent(token)}`);

    ws.addEventListener('message', async (event) => {
      let rawData = event.data;
      if (rawData instanceof Blob) {
        rawData = await rawData.text();
      } else if (typeof rawData !== 'string') {
        rawData = String(rawData);
      }

      try {
        const op = JSON.parse(rawData);

        if (op.type === 'sync_request') {
          const items = doc.getItems();
          if (items.length > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'sync_response',
              items: items
            }));
          }
          return;
        }

        if (op.type === 'sync_response') {
          if (op.items && Array.isArray(op.items) && op.items.length > 0) {
            doc.loadItems(op.items);
            renderEditor();
            previousValue = getEditorText();
          }
          return;
        }

        if (canApplyOperation(op)) {
          applyOperation(op);
          processPendingQueue();
        } else {
          pendingOps.push(op);
        }
      } catch (err) {}
    });
  }

  initWebSocket();

  function toggleSidebar(forceOpen?: boolean) {
    if (!gdocSidebar) return;
    let isCollapsed: boolean;
    if (typeof forceOpen === 'boolean') {
      if (forceOpen) {
        gdocSidebar.classList.remove('collapsed');
        isCollapsed = false;
      } else {
        gdocSidebar.classList.add('collapsed');
        isCollapsed = true;
      }
    } else {
      isCollapsed = gdocSidebar.classList.toggle('collapsed');
    }

    if (floatingOutlineBtn) {
      floatingOutlineBtn.style.display = isCollapsed ? 'flex' : 'none';
    }
  }

  document.getElementById('btn-collapse-sidebar')?.addEventListener('click', () => toggleSidebar(false));
  floatingOutlineBtn?.addEventListener('click', () => toggleSidebar(true));

  function toggleCompanionRail() {
    if (!companionRail) return;
    const isCollapsed = companionRail.classList.toggle('collapsed');
    const chevron = companionToggleBtn?.querySelector('.material-symbols-outlined');
    if (chevron) {
      chevron.textContent = isCollapsed ? 'chevron_left' : 'chevron_right';
    }
    if (companionToggleBtn) {
      companionToggleBtn.title = isCollapsed ? 'Show side panel' : 'Hide side panel';
    }
  }

  companionToggleBtn?.addEventListener('click', toggleCompanionRail);


  setupCompanionRailHandlers();
  setupStaticModalCloseHandlers();
  document.getElementById('btn-star')?.addEventListener('click', () => {
    isStarred = !isStarred;
    const starBtn = document.getElementById('btn-star');
    if (starBtn) {
      starBtn.classList.toggle('starred', isStarred);
      const icon = starBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        (icon as HTMLElement).style.fontVariationSettings = isStarred ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400";
      }
      showToast(isStarred ? 'Document starred' : 'Document unstarred');
    }
  });

  const moveModal = document.getElementById('move-modal');
  document.getElementById('btn-move')?.addEventListener('click', () => {
    if (moveModal) moveModal.style.display = 'flex';
  });

  document.getElementById('move-modal-cancel')?.addEventListener('click', () => {
    if (moveModal) moveModal.style.display = 'none';
  });

  document.getElementById('move-modal-apply')?.addEventListener('click', () => {
    if (moveModal) moveModal.style.display = 'none';
    showToast('Document moved to Projects folder');
  });

  document.getElementById('btn-cloud-status')?.addEventListener('click', () => {
    showToast('All changes saved to Drive in real-time');
  });

  const commentsModal = document.getElementById('comments-modal');
  document.getElementById('btn-comments-history')?.addEventListener('click', () => {
    if (commentsModal) commentsModal.style.display = 'flex';
  });

  document.getElementById('btn-add-comment')?.addEventListener('click', () => {
    if (commentsModal) commentsModal.style.display = 'flex';
  });

  document.getElementById('comments-modal-close')?.addEventListener('click', () => {
    if (commentsModal) commentsModal.style.display = 'none';
  });

  document.getElementById('comments-modal-post')?.addEventListener('click', () => {
    const input = document.getElementById('comment-text-input') as HTMLTextAreaElement;
    const text = input?.value.trim();
    if (text) {
      const list = document.getElementById('comments-list');
      if (list) {
        const item = document.createElement('div');
        item.style.padding = '8px';
        item.style.border = '1px solid #dadce0';
        item.style.borderRadius = '6px';
        item.style.fontSize = '13px';
        item.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><b style="color:#1a73e8;">${username}</b><span style="font-size:11px; color:#70757a;">Just now</span></div><div>${text.replace(/</g, '&lt;')}</div>`;
        list.appendChild(item);
      }
      input.value = '';
      showToast('Comment posted');
    }
  });

  const geminiModal = document.getElementById('gemini-modal');
  document.getElementById('btn-gemini-sparkle')?.addEventListener('click', () => {
    if (geminiModal) geminiModal.style.display = 'flex';
  });

  document.getElementById('gemini-modal-close')?.addEventListener('click', () => {
    if (geminiModal) geminiModal.style.display = 'none';
  });

  document.getElementById('gemini-prompt-summary')?.addEventListener('click', () => {
    const text = doc.renderText();
    const summary = '\n[Gemini Summary: This document outlines the key objectives, recent progress, and actionable steps planned by ' + username + '.]\n';
    insertAtCursor(summary, { italic: true, color: '#444746' });
    if (geminiModal) geminiModal.style.display = 'none';
    showToast('Summary inserted');
  });

  document.getElementById('gemini-prompt-professional')?.addEventListener('click', () => {
    insertAtCursor('\n[Refined with Gemini: The aforementioned points reflect formal organizational alignment and strategic execution standards.]\n', { italic: true });
    if (geminiModal) geminiModal.style.display = 'none';
    showToast('Polished tone inserted');
  });

  document.getElementById('gemini-prompt-action-items')?.addEventListener('click', () => {
    const actions = '\nAction Items (Gemini):\n☐ Follow up on implementation milestones\n☐ Verify collaborative sync updates\n☐ Schedule review with stakeholders\n';
    insertAtCursor(actions);
    if (geminiModal) geminiModal.style.display = 'none';
    showToast('Action items inserted');
  });

  document.getElementById('gemini-modal-insert')?.addEventListener('click', () => {
    const customIn = document.getElementById('gemini-custom-input') as HTMLInputElement;
    const query = customIn?.value.trim();
    if (query) {
      insertAtCursor('\n' + query + '\n');
      customIn.value = '';
    }
    if (geminiModal) geminiModal.style.display = 'none';
  });


  setupMenuCommandSearch(
    openLinkModal,
    toggleStyle,
    toggleCompanionRail,
    toggleSidebar
  );
  let isSpellcheckOn = true;
  document.getElementById('btn-spellcheck')?.addEventListener('click', () => {
    isSpellcheckOn = !isSpellcheckOn;
    editorDiv.spellcheck = isSpellcheckOn;
    document.getElementById('btn-spellcheck')?.classList.toggle('active', isSpellcheckOn);
    showToast(isSpellcheckOn ? 'Spell check enabled' : 'Spell check disabled');
  });

  let isToolbarCollapsed = false;
  document.getElementById('btn-collapse-toolbar')?.addEventListener('click', () => {
    isToolbarCollapsed = !isToolbarCollapsed;
    mainToolbar.classList.toggle('collapsed', isToolbarCollapsed);
    showToast(isToolbarCollapsed ? 'Toolbar hidden (press Alt+/ for commands)' : 'Toolbar restored');
  });

  const editingModeBtn = document.getElementById('btn-editing-mode');
  const editingModePop = document.getElementById('editing-mode-popup');
  const editingModeText = document.getElementById('editing-mode-text');

  editingModeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = editingModePop?.style.display === 'block';
    closeAllDropdowns();
    if (!isShowing && editingModePop && editingModeBtn) {
      const rect = editingModeBtn.getBoundingClientRect();
      editingModePop.style.top = (rect.bottom + 6) + 'px';
      editingModePop.style.right = '16px';
      editingModePop.style.display = 'block';
    }
  });

  editingModePop?.querySelectorAll('.gdoc-dropdown-item').forEach((item) => {
    item.addEventListener('click', () => {
      const mode = item.getAttribute('data-mode');
      if (mode === 'viewing') {
        editorDiv.contentEditable = 'false';
        if (editingModeText) editingModeText.textContent = 'Viewing';
        showToast('Switched to Viewing mode (read-only)');
      } else if (mode === 'suggesting') {
        editorDiv.contentEditable = 'true';
        if (editingModeText) editingModeText.textContent = 'Suggesting';
        showToast('Switched to Suggesting mode');
      } else {
        editorDiv.contentEditable = 'true';
        if (editingModeText) editingModeText.textContent = 'Editing';
        showToast('Switched to Editing mode');
      }
      closeAllDropdowns();
    });
  });

  function updateStarterChipsVisibility() {
    const text = doc.renderText();
    if (starterChips) {
      starterChips.style.display = text.trim().length === 0 ? 'flex' : 'none';
    }
  }
  function getCaretCharOffset(): number {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return savedSelection.start || 0;
    const range = sel.getRangeAt(0);
    if (!editorDiv.contains(range.startContainer)) return savedSelection.start || 0;
    return getCharOffsetOfNode(range.startContainer, range.startOffset);
  }

  function setCaretPosition(pos: number) {
    const sel = window.getSelection();
    if (!sel) return;
    const loc = getNodeAndOffsetAtChar(pos);
    try {
      const range = document.createRange();
      range.setStart(loc.node, loc.offset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}
  }

  function setEditorSelection(start: number, end: number) {
    const sel = window.getSelection();
    if (!sel) return;

    if (start === end) {
      setCaretPosition(start);
      return;
    }

    const startLoc = getNodeAndOffsetAtChar(start);
    const endLoc = getNodeAndOffsetAtChar(end);

    try {
      const range = document.createRange();
      range.setStart(startLoc.node, startLoc.offset);
      range.setEnd(endLoc.node, endLoc.offset);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {
      setCaretPosition(start);
    }
  }
  function updateToolbarState() {
    const { start } = savedSelection;
    const item = getVisibleItemAt(start);
    const attrs = item?.attributes || {};

    const activeColor = pendingAttributes.color || attrs.color || '#202124';
    editorDiv.style.caretColor = activeColor;

    const bar = document.getElementById('text-color-bar');
    if (bar) bar.style.backgroundColor = activeColor;

    const hlBar = document.getElementById('highlight-color-bar');
    if (hlBar) hlBar.style.backgroundColor = pendingAttributes.background || attrs.background || 'transparent';

    const btnBold = document.getElementById('btn-bold');
    if (btnBold) btnBold.classList.toggle('active', Boolean(pendingAttributes.bold ?? attrs.bold));

    const btnItalic = document.getElementById('btn-italic');
    if (btnItalic) btnItalic.classList.toggle('active', Boolean(pendingAttributes.italic ?? attrs.italic));

    const btnUnderline = document.getElementById('btn-underline');
    if (btnUnderline) btnUnderline.classList.toggle('active', Boolean(pendingAttributes.underline ?? attrs.underline));

    const curAlign = pendingAttributes.align || attrs.align || 'left';
    document.getElementById('btn-align-left')?.classList.toggle('active', curAlign === 'left');
    document.getElementById('btn-align-center')?.classList.toggle('active', curAlign === 'center');
    document.getElementById('btn-align-right')?.classList.toggle('active', curAlign === 'right');

    const sizeBox = document.getElementById('size-input') as HTMLInputElement;
    if (sizeBox && document.activeElement !== sizeBox) {
      const activeSize = pendingAttributes.size || attrs.size;
      if (activeSize) {
        sizeBox.value = String(parseInt(activeSize, 10) || 11);
      } else if (attrs.heading === 'title') {
        sizeBox.value = '26';
      } else if (attrs.heading === 'subtitle') {
        sizeBox.value = '15';
      } else if (attrs.heading === 'h1') {
        sizeBox.value = '20';
      } else if (attrs.heading === 'h2') {
        sizeBox.value = '16';
      } else if (attrs.heading === 'h3') {
        sizeBox.value = '14';
      } else {
        sizeBox.value = '11';
      }
    }

    const fontText = document.getElementById('font-current-text');
    if (fontText) {
      fontText.textContent = pendingAttributes.font || attrs.font || 'Arial';
    }

    const stylesText = document.getElementById('styles-current-text');
    if (stylesText) {
      if (attrs.heading === 'title') stylesText.textContent = 'Title';
      else if (attrs.heading === 'subtitle') stylesText.textContent = 'Subtitle';
      else if (attrs.heading === 'h1') stylesText.textContent = 'Heading 1';
      else if (attrs.heading === 'h2') stylesText.textContent = 'Heading 2';
      else if (attrs.heading === 'h3') stylesText.textContent = 'Heading 3';
      else stylesText.textContent = 'Normal text';
    }
  }

  function renderEditor(preserveRangeSelection: boolean = false) {
    isRendering = true;
    const activeIsInput = document.activeElement === sizeInput;
    const caretPos = getCaretCharOffset();
    const html = doc.renderHTML();
    editorDiv.innerHTML = html || '';

    if (preserveRangeSelection && savedSelection.start < savedSelection.end) {
      setEditorSelection(savedSelection.start, savedSelection.end);
    } else if (!activeIsInput) {
      setCaretPosition(caretPos);
    }

    if (activeIsInput && sizeInput) {
      sizeInput.focus();
    }

    isRendering = false;
    updateStarterChipsVisibility();
    updateToolbarState();
    updateDocumentOutline();
  }

  function updateStoredSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!editorDiv.contains(range.startContainer) && !editorDiv.contains(range.endContainer)) {
      return;
    }

    const start = getCharOffsetOfNode(range.startContainer, range.startOffset);
    const end = getCharOffsetOfNode(range.endContainer, range.endOffset);

    savedSelection = {
      start: Math.min(start, end),
      end: Math.max(start, end)
    };

    updateToolbarState();
  }

  document.addEventListener('selectionchange', () => {
    updateStoredSelection();
  });

  function expandSelectionToCurrentWordIfCollapsed(): { start: number; end: number } {
    let { start, end } = savedSelection;
    if (start >= end) {
      const text = getEditorText();
      if (text.length === 0) return { start, end };
      let wordStart = Math.min(start, text.length);
      while (wordStart > 0 && !/\s/.test(text.charAt(wordStart - 1))) {
        wordStart--;
      }
      let wordEnd = Math.min(start, text.length);
      while (wordEnd < text.length && !/\s/.test(text.charAt(wordEnd))) {
        wordEnd++;
      }
      if (wordStart < wordEnd) {
        savedSelection = { start: wordStart, end: wordEnd };
        return { start: wordStart, end: wordEnd };
      }
    }
    return { start, end };
  }

  function getParagraphRange(start: number, end: number): { start: number; end: number } {
    const text = getEditorText();
    if (text.length === 0) return { start: 0, end: 0 };
    let lineStart = Math.min(start, text.length);
    while (lineStart > 0 && text.charAt(lineStart - 1) !== '\n') {
      lineStart--;
    }
    let lineEnd = Math.min(end, text.length);
    while (lineEnd < text.length && text.charAt(lineEnd) !== '\n') {
      lineEnd++;
    }
    if (lineEnd < text.length && text.charAt(lineEnd) === '\n') {
      lineEnd++;
    }
    return { start: lineStart, end: lineEnd };
  }

  function applyFormatToSelection(attributes: Record<string, any>) {
    let { start, end } = savedSelection;

    if (start >= end) {
      const expanded = expandSelectionToCurrentWordIfCollapsed();
      start = expanded.start;
      end = expanded.end;
    }

    if (start >= end) {
      return;
    }

    const startItem = getVisibleItemAt(start);
    const endItem = getVisibleItemAt(end - 1);

    if (!startItem || !endItem) {
      return;
    }

    doc.format(startItem.clientId, startItem.clock, endItem.clientId, endItem.clock, attributes);
    recordHistorySnapshot();
    renderEditor(true);
    triggerAutoSave();

    if (ws && ws.readyState === WebSocket.OPEN) {
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
    let { start, end } = savedSelection;
    if (start >= end) {
      const expanded = expandSelectionToCurrentWordIfCollapsed();
      start = expanded.start;
      end = expanded.end;
    }
    if (start >= end) {
      if (pendingAttributes[key]) {
        delete pendingAttributes[key];
      } else {
        pendingAttributes[key] = value;
      }
      updateToolbarState();
      return;
    }

    const startItem = getVisibleItemAt(start);
    if (!startItem) return;

    const isCurrentlyActive = Boolean(startItem.attributes && startItem.attributes[key]);
    const attrs: Record<string, any> = {};
    attrs[key] = isCurrentlyActive ? false : value;

    if (attrs[key] === false) {
      delete pendingAttributes[key];
    } else {
      pendingAttributes[key] = value;
    }

    applyFormatToSelection(attrs);
  }

  function applyAlignment(align: string) {
    updateStoredSelection();
    pendingAttributes.align = align;
    const { start, end } = savedSelection;
    const range = getParagraphRange(start, end);
    if (range.start >= range.end) {
      updateToolbarState();
      return;
    }

    const startItem = getVisibleItemAt(range.start);
    const endItem = getVisibleItemAt(range.end - 1);
    if (!startItem || !endItem) return;

    doc.format(startItem.clientId, startItem.clock, endItem.clientId, endItem.clock, { align });
    renderEditor(true);
    triggerAutoSave();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'format',
        startClientId: startItem.clientId,
        startClock: startItem.clock,
        endClientId: endItem.clientId,
        endClock: endItem.clock,
        attributes: { align }
      }));
    }
  }

  function applyIndentDelta(delta: number) {
    updateStoredSelection();
    const { start, end } = savedSelection;
    const range = getParagraphRange(start, end);
    if (range.start >= range.end) return;

    const startItem = getVisibleItemAt(range.start);
    const endItem = getVisibleItemAt(range.end - 1);
    if (!startItem || !endItem) return;

    const currentIndent = typeof startItem.attributes?.indent === 'number' ? startItem.attributes.indent : 0;
    const newIndent = Math.max(0, Math.min(10, currentIndent + delta));
    pendingAttributes.indent = newIndent;

    doc.format(startItem.clientId, startItem.clock, endItem.clientId, endItem.clock, { indent: newIndent });
    renderEditor(true);
    triggerAutoSave();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'format',
        startClientId: startItem.clientId,
        startClock: startItem.clock,
        endClientId: endItem.clientId,
        endClock: endItem.clock,
        attributes: { indent: newIndent }
      }));
    }
  }

  function applyLineSpacing(spacing: string) {
    updateStoredSelection();
    pendingAttributes.lineSpacing = spacing;
    const { start, end } = savedSelection;
    const range = getParagraphRange(start, end);
    if (range.start >= range.end) return;

    const startItem = getVisibleItemAt(range.start);
    const endItem = getVisibleItemAt(range.end - 1);
    if (!startItem || !endItem) return;

    doc.format(startItem.clientId, startItem.clock, endItem.clientId, endItem.clock, { lineSpacing: spacing });
    renderEditor(true);
    triggerAutoSave();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'format',
        startClientId: startItem.clientId,
        startClock: startItem.clock,
        endClientId: endItem.clientId,
        endClock: endItem.clock,
        attributes: { lineSpacing: spacing }
      }));
    }
  }

  function insertAtOffset(offset: number, text: string, attrs: Record<string, any> = {}) {
    let anchorItem = offset > 0 ? getVisibleItemAt(offset - 1) : null;
    let anchorId = anchorItem ? anchorItem.clientId : null;
    let anchorClock = anchorItem ? anchorItem.clock : null;

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const newClock = doc.tick();
      doc.insert(clientId, newClock, anchorId, anchorClock, char, { ...attrs });

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'insert',
          clientId: clientId,
          clock: newClock,
          anchorClientId: anchorId,
          anchorClock: anchorClock,
          value: char,
          attributes: { ...attrs }
        }));
      }

      anchorId = clientId;
      anchorClock = newClock;
    }
  }

  function deleteRange(startOffset: number, endOffset: number) {
    const count = endOffset - startOffset;
    for (let i = 0; i < count; i++) {
      const item = getVisibleItemAt(startOffset);
      if (item) {
        doc.delete(item.clientId, item.clock);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'delete',
            clientId: item.clientId,
            clock: item.clock
          }));
        }
      }
    }
  }

  function insertAtCursor(text: string, attrs: Record<string, any> = {}) {
    updateStoredSelection();
    const { start, end } = savedSelection;
    if (start < end) {
      deleteRange(start, end);
    }
    insertAtOffset(start, text, attrs);
    recordHistorySnapshot();
    renderEditor();
    previousValue = getEditorText();
    setCaretPosition(start + text.length);
    triggerAutoSave();
  }

  function toggleLinePrefix(type: 'bullet' | 'checklist' | 'number') {
    updateStoredSelection();
    const { start, end } = savedSelection;
    const text = getEditorText();

    if (text.length === 0) {
      let insertStr = '• ';
      if (type === 'checklist') insertStr = '☐ ';
      else if (type === 'number') insertStr = '1. ';
      insertAtCursor(insertStr);
      return;
    }

    const range = getParagraphRange(start, end);
    const lineIndices: number[] = [];
    let cur = range.start;
    lineIndices.push(cur);
    while (cur < range.end) {
      const nl = text.indexOf('\n', cur);
      if (nl !== -1 && nl + 1 < range.end) {
        lineIndices.push(nl + 1);
        cur = nl + 1;
      } else {
        break;
      }
    }

    for (let lIdx = lineIndices.length - 1; lIdx >= 0; lIdx--) {
      const lineStart = lineIndices[lIdx];
      if (typeof lineStart !== 'number') continue;
      const lineText = text.substring(lineStart);

      if (type === 'bullet') {
        if (lineText.startsWith('• ')) {
          deleteRange(lineStart, lineStart + 2);
        } else {
          insertAtOffset(lineStart, '• ');
        }
      } else if (type === 'checklist') {
        if (lineText.startsWith('☐ ') || lineText.startsWith('☑ ')) {
          deleteRange(lineStart, lineStart + 2);
        } else {
          insertAtOffset(lineStart, '☐ ');
        }
      } else if (type === 'number') {
        const numMatch = lineText.match(/^(\d+)\.\s/);
        if (numMatch && numMatch[0]) {
          deleteRange(lineStart, lineStart + numMatch[0].length);
        } else {
          const numPrefix = `${lIdx + 1}. `;
          insertAtOffset(lineStart, numPrefix);
        }
      }
    }

    renderEditor(true);
    previousValue = getEditorText();
    triggerAutoSave();
  }

  setupOutsideClickListener(closeAllDropdowns, () => sidebarTabMenu);
  setupToolButtonsMousedown(updateStoredSelection);
  document.getElementById('btn-bold')?.addEventListener('click', () => toggleStyle('bold', true));
  document.getElementById('btn-italic')?.addEventListener('click', () => toggleStyle('italic', true));
  document.getElementById('btn-underline')?.addEventListener('click', () => toggleStyle('underline', true));

  document.getElementById('btn-clear-format')?.addEventListener('click', () => {
    pendingAttributes = {};
    editorDiv.style.caretColor = '#202124';
    applyFormatToSelection({
      bold: null,
      italic: null,
      underline: null,
      strike: null,
      code: null,
      color: null,
      background: null,
      font: null,
      size: null,
      heading: null,
      link: null
    });
    updateToolbarState();
    showToast('Formatting cleared');
  });

  const stylesBtn = document.getElementById('styles-dropdown-btn');
  const stylesPop = document.getElementById('styles-popup');
  stylesBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = stylesPop?.style.display === 'block';
    closeAllDropdowns();
    if (!isShowing && stylesPop && stylesBtn) {
      const rect = stylesBtn.getBoundingClientRect();
      stylesPop.style.top = (rect.bottom + 6) + 'px';
      stylesPop.style.left = rect.left + 'px';
      stylesPop.style.display = 'block';
    }
  });

  const styleOptions = document.querySelectorAll('.gdoc-style-opt');
  styleOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      const heading = opt.getAttribute('data-heading');
      const textSpan = document.getElementById('styles-current-text');
      if (heading === 'normal') {
        pendingAttributes.size = '11pt';
        delete pendingAttributes.heading;
        delete pendingAttributes.bold;
        applyFormatToSelection({ heading: null, size: '11pt', bold: null });
        if (textSpan) textSpan.textContent = 'Normal text';
      } else if (heading === 'title') {
        pendingAttributes.size = '26pt';
        pendingAttributes.heading = 'title';
        applyFormatToSelection({ heading: 'title', size: '26pt' });
        if (textSpan) textSpan.textContent = 'Title';
      } else if (heading === 'subtitle') {
        pendingAttributes.size = '15pt';
        pendingAttributes.heading = 'subtitle';
        applyFormatToSelection({ heading: 'subtitle', size: '15pt' });
        if (textSpan) textSpan.textContent = 'Subtitle';
      } else if (heading === 'h1') {
        pendingAttributes.size = '20pt';
        pendingAttributes.heading = 'h1';
        pendingAttributes.bold = true;
        applyFormatToSelection({ heading: 'h1', size: '20pt', bold: true });
        if (textSpan) textSpan.textContent = 'Heading 1';
      } else if (heading === 'h2') {
        pendingAttributes.size = '16pt';
        pendingAttributes.heading = 'h2';
        pendingAttributes.bold = true;
        applyFormatToSelection({ heading: 'h2', size: '16pt', bold: true });
        if (textSpan) textSpan.textContent = 'Heading 2';
      } else if (heading === 'h3') {
        pendingAttributes.size = '14pt';
        pendingAttributes.heading = 'h3';
        pendingAttributes.bold = true;
        applyFormatToSelection({ heading: 'h3', size: '14pt', bold: true });
        if (textSpan) textSpan.textContent = 'Heading 3';
      }
      closeAllDropdowns();
      updateToolbarState();
      updateDocumentOutline();
    });
  });

  const fontBtn = document.getElementById('font-dropdown-btn');
  const fontPop = document.getElementById('font-popup');
  fontBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = fontPop?.style.display === 'block';
    closeAllDropdowns();
    if (!isShowing && fontPop && fontBtn) {
      const rect = fontBtn.getBoundingClientRect();
      fontPop.style.top = (rect.bottom + 6) + 'px';
      fontPop.style.left = rect.left + 'px';
      fontPop.style.display = 'block';
    }
  });

  const fontItems = fontPop?.querySelectorAll('.gdoc-dropdown-item');
  fontItems?.forEach((item) => {
    item.addEventListener('click', () => {
      const fontName = item.getAttribute('data-font');
      if (fontName) {
        pendingAttributes.font = fontName;
        applyFormatToSelection({ font: fontName });
        const fontText = document.getElementById('font-current-text');
        if (fontText) fontText.textContent = fontName;
      }
      closeAllDropdowns();
    });
  });

  function applyFontSize(sizeVal: number) {
    if (isNaN(sizeVal) || sizeVal <= 0 || sizeVal > 150) return;
    pendingAttributes.size = sizeVal + 'pt';
    applyFormatToSelection({ size: sizeVal + 'pt' });
    updateToolbarState();
  }

  document.getElementById('size-minus')?.addEventListener('click', () => {
    let current = parseInt(sizeInput.value, 10) || 11;
    if (current > 6) current--;
    sizeInput.value = String(current);
    applyFontSize(current);
  });

  document.getElementById('size-plus')?.addEventListener('click', () => {
    let current = parseInt(sizeInput.value, 10) || 11;
    if (current < 96) current++;
    sizeInput.value = String(current);
    applyFontSize(current);
  });

  sizeInput?.addEventListener('input', () => {
    let val = parseInt(sizeInput.value, 10);
    if (!isNaN(val) && val >= 6 && val <= 100) {
      applyFontSize(val);
    }
  });

  sizeInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      let val = parseInt(sizeInput.value, 10);
      if (!isNaN(val) && val > 0) {
        applyFontSize(val);
      }
      editorDiv.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      let current = parseInt(sizeInput.value, 10) || 11;
      current++;
      sizeInput.value = String(current);
      applyFontSize(current);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      let current = parseInt(sizeInput.value, 10) || 11;
      if (current > 6) current--;
      sizeInput.value = String(current);
      applyFontSize(current);
    }
  });

  sizeInput?.addEventListener('change', () => {
    let val = parseInt(sizeInput.value, 10);
    if (!isNaN(val) && val > 0) {
      applyFontSize(val);
    }
  });

  document.getElementById('btn-align-left')?.addEventListener('click', () => applyAlignment('left'));
  document.getElementById('btn-align-center')?.addEventListener('click', () => applyAlignment('center'));
  document.getElementById('btn-align-right')?.addEventListener('click', () => applyAlignment('right'));

  document.getElementById('btn-indent-dec')?.addEventListener('click', () => applyIndentDelta(-1));
  document.getElementById('btn-indent-inc')?.addEventListener('click', () => applyIndentDelta(1));

  const lineSpacingBtn = document.getElementById('btn-line-spacing');
  const lineSpacingPop = document.getElementById('line-spacing-popup');
  lineSpacingBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = lineSpacingPop?.style.display === 'block';
    closeAllDropdowns();
    if (!isShowing && lineSpacingPop && lineSpacingBtn) {
      const rect = lineSpacingBtn.getBoundingClientRect();
      lineSpacingPop.style.top = (rect.bottom + 6) + 'px';
      lineSpacingPop.style.left = rect.left + 'px';
      lineSpacingPop.style.display = 'block';
    }
  });

  const spacingItems = lineSpacingPop?.querySelectorAll('.gdoc-dropdown-item');
  spacingItems?.forEach((item) => {
    item.addEventListener('click', () => {
      const spacing = item.getAttribute('data-spacing');
      if (spacing) {
        applyLineSpacing(spacing);
      }
      closeAllDropdowns();
    });
  });

  document.getElementById('btn-checklist')?.addEventListener('click', () => toggleLinePrefix('checklist'));
  document.getElementById('btn-bullet-list')?.addEventListener('click', () => toggleLinePrefix('bullet'));
  document.getElementById('btn-number-list')?.addEventListener('click', () => toggleLinePrefix('number'));

  const paintFormatBtn = document.getElementById('btn-paint-format');
  paintFormatBtn?.addEventListener('click', () => {
    updateStoredSelection();
    const item = getVisibleItemAt(savedSelection.start);
    if (item && item.attributes && Object.keys(item.attributes).length > 0) {
      paintFormatAttrs = { ...item.attributes };
      paintFormatBtn.classList.add('active');
      showToast('Paint format copied');
    } else if (Object.keys(pendingAttributes).length > 0) {
      paintFormatAttrs = { ...pendingAttributes };
      paintFormatBtn.classList.add('active');
      showToast('Paint format copied');
    } else {
      paintFormatAttrs = null;
      paintFormatBtn.classList.remove('active');
    }
  });

  editorDiv.addEventListener('mouseup', () => {
    if (paintFormatAttrs) {
      applyFormatToSelection(paintFormatAttrs);
      paintFormatAttrs = null;
      paintFormatBtn?.classList.remove('active');
      showToast('Format applied');
    }
  });

  const imageModal = document.getElementById('image-modal');
  const imageUrlInput = document.getElementById('image-url-input') as HTMLInputElement;
  document.getElementById('btn-insert-image')?.addEventListener('click', () => {
    updateStoredSelection();
    if (imageUrlInput) imageUrlInput.value = '';
    if (imageModal) imageModal.style.display = 'flex';
    imageUrlInput?.focus();
  });

  document.getElementById('image-modal-cancel')?.addEventListener('click', () => {
    if (imageModal) imageModal.style.display = 'none';
  });

  document.getElementById('image-modal-apply')?.addEventListener('click', () => {
    const url = imageUrlInput?.value.trim();
    if (url) {
      insertAtCursor('\uFFFC', { image: url });
      showToast('Image inserted');
    }
    if (imageModal) imageModal.style.display = 'none';
  });

  const shortcutsModal = document.getElementById('shortcuts-modal');
  document.getElementById('menu-help-shortcuts')?.addEventListener('click', () => {
    closeAllDropdowns();
    if (shortcutsModal) shortcutsModal.style.display = 'flex';
  });

  document.getElementById('shortcuts-modal-close')?.addEventListener('click', () => {
    if (shortcutsModal) shortcutsModal.style.display = 'none';
  });

  document.getElementById('menu-help-about')?.addEventListener('click', () => {
    closeAllDropdowns();
    alert('DocSync Engine — Distributed Real-Time Editor\nPowered by Conflict-free Replicated Data Types (CRDT) and real-time WebSocket synchronization.');
  });

  document.getElementById('btn-version-history')?.addEventListener('click', () => {
    alert("Version history: Current document is automatically synced and backed up in real time with version timestamps.");
  });


  setupPaletteGrids(
    (hex) => {
      pendingAttributes.color = hex;
      editorDiv.style.caretColor = hex;
      const bar = document.getElementById('text-color-bar');
      if (bar) bar.style.backgroundColor = hex;
      if (savedSelection.start < savedSelection.end) {
        applyFormatToSelection({ color: hex });
      }
      closeAllDropdowns();
    },
    (hex) => {
      pendingAttributes.background = hex;
      const bar = document.getElementById('highlight-color-bar');
      if (bar) bar.style.backgroundColor = hex;
      if (savedSelection.start < savedSelection.end) {
        applyFormatToSelection({ background: hex });
      }
      closeAllDropdowns();
    }
  );
  document.getElementById('btn-no-highlight')?.addEventListener('click', () => {
    delete pendingAttributes.background;
    const bar = document.getElementById('highlight-color-bar');
    if (bar) bar.style.backgroundColor = 'transparent';
    applyFormatToSelection({ background: null });
    closeAllDropdowns();
  });

  const colorBtn = document.getElementById('btn-color-pick');
  const colorPop = document.getElementById('text-color-palette');
  colorBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = colorPop?.style.display === 'block';
    closeAllDropdowns();
    if (!isShowing && colorPop && colorBtn) {
      const rect = colorBtn.getBoundingClientRect();
      colorPop.style.top = (rect.bottom + 6) + 'px';
      colorPop.style.left = (rect.left - 60) + 'px';
      colorPop.style.display = 'block';
    }
  });

  const hlBtn = document.getElementById('btn-highlight-pick');
  const hlPop = document.getElementById('highlight-palette');
  hlBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = hlPop?.style.display === 'block';
    closeAllDropdowns();
    if (!isShowing && hlPop && hlBtn) {
      const rect = hlBtn.getBoundingClientRect();
      hlPop.style.top = (rect.bottom + 6) + 'px';
      hlPop.style.left = (rect.left - 60) + 'px';
      hlPop.style.display = 'block';
    }
  });

  const zoomBtn = document.getElementById('zoom-dropdown-btn');
  const zoomPop = document.getElementById('zoom-popup');
  zoomBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = zoomPop?.style.display === 'block';
    closeAllDropdowns();
    if (!isShowing && zoomPop && zoomBtn) {
      const rect = zoomBtn.getBoundingClientRect();
      zoomPop.style.top = (rect.bottom + 6) + 'px';
      zoomPop.style.left = rect.left + 'px';
      zoomPop.style.display = 'block';
    }
  });

  const zoomItems = zoomPop?.querySelectorAll('.gdoc-dropdown-item');
  zoomItems?.forEach((item) => {
    item.addEventListener('click', () => {
      const val = item.getAttribute('data-zoom');
      if (val && paperSheet) {
        const factor = parseInt(val, 10) / 100;
        paperSheet.style.transform = `scale(${factor})`;
        paperSheet.style.transformOrigin = 'top center';
        const zt = document.getElementById('zoom-text');
        if (zt) zt.textContent = val + '%';
        showToast(`Zoom set to ${val}%`);
      }
      closeAllDropdowns();
    });
  });

  const linkModal = document.getElementById('link-modal');
  const linkTextInput = document.getElementById('link-text-input') as HTMLInputElement;
  const linkUrlInput = document.getElementById('link-url-input') as HTMLInputElement;

  function openLinkModal() {
    updateStoredSelection();
    const { start, end } = savedSelection;
    let selectedStr = "";
    if (start < end) {
      const text = getEditorText();
      selectedStr = text.substring(start, end);
    }
    if (linkTextInput) linkTextInput.value = selectedStr;
    if (linkUrlInput) linkUrlInput.value = 'https://';
    if (linkModal) linkModal.style.display = 'flex';
    linkUrlInput?.focus();
  }

  document.getElementById('btn-link')?.addEventListener('click', openLinkModal);

  document.getElementById('link-modal-cancel')?.addEventListener('click', () => {
    if (linkModal) linkModal.style.display = 'none';
  });

  document.getElementById('link-modal-apply')?.addEventListener('click', () => {
    const url = linkUrlInput.value.trim();
    if (url) {
      applyFormatToSelection({ link: url });
      showToast('Link added');
    }
    if (linkModal) linkModal.style.display = 'none';
  });


  setupMenuDropdownToggle(closeAllDropdowns);
  document.getElementById('menu-file-new')?.addEventListener('click', async () => {
    closeAllDropdowns();
    await createAndSwitchNewDocument();
  });

  document.getElementById('menu-file-download-txt')?.addEventListener('click', () => {
    const text = doc.renderText();
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (titleInput.value || 'document') + '.txt';
    a.click();
    closeAllDropdowns();
    showToast('Downloaded as .txt');
  });

  document.getElementById('menu-file-download-html')?.addEventListener('click', () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${titleInput.value}</title></head><body>${doc.renderHTML()}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (titleInput.value || 'document') + '.html';
    a.click();
    closeAllDropdowns();
    showToast('Downloaded as .html');
  });

  document.getElementById('menu-file-print')?.addEventListener('click', () => {
    window.print();
    closeAllDropdowns();
  });

  document.getElementById('tool-print')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('menu-edit-undo')?.addEventListener('click', () => {
    performUndo();
    closeAllDropdowns();
  });

  document.getElementById('menu-edit-redo')?.addEventListener('click', () => {
    performRedo();
    closeAllDropdowns();
  });

  document.getElementById('tool-undo')?.addEventListener('click', () => {
    performUndo();
  });

  document.getElementById('tool-redo')?.addEventListener('click', () => {
    performRedo();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        performRedo();
      } else {
        performUndo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      performRedo();
    }
  });

  document.getElementById('menu-edit-select-all')?.addEventListener('click', () => {
    const range = document.createRange();
    range.selectNodeContents(editorDiv);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    closeAllDropdowns();
  });

  document.getElementById('menu-view-fullscreen')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    closeAllDropdowns();
  });

  document.getElementById('menu-view-sidebar')?.addEventListener('click', () => {
    toggleSidebar();
    closeAllDropdowns();
  });

  document.getElementById('menu-view-companion')?.addEventListener('click', () => {
    toggleCompanionRail();
    closeAllDropdowns();
  });

  document.getElementById('menu-insert-link')?.addEventListener('click', () => {
    closeAllDropdowns();
    openLinkModal();
  });

  document.getElementById('menu-insert-image-item')?.addEventListener('click', () => {
    closeAllDropdowns();
    document.getElementById('btn-insert-image')?.click();
  });

  document.getElementById('menu-insert-hr')?.addEventListener('click', () => {
    insertAtCursor('\n─────────────────────────\n');
    closeAllDropdowns();
  });

  document.getElementById('menu-insert-meeting')?.addEventListener('click', () => {
    closeAllDropdowns();
    document.getElementById('chip-meeting')?.click();
  });

  document.getElementById('menu-insert-email')?.addEventListener('click', () => {
    closeAllDropdowns();
    document.getElementById('chip-email')?.click();
  });

  document.getElementById('menu-format-bold')?.addEventListener('click', () => {
    toggleStyle('bold', true);
    closeAllDropdowns();
  });

  document.getElementById('menu-format-italic')?.addEventListener('click', () => {
    toggleStyle('italic', true);
    closeAllDropdowns();
  });

  document.getElementById('menu-format-underline')?.addEventListener('click', () => {
    toggleStyle('underline', true);
    closeAllDropdowns();
  });

  document.getElementById('menu-format-strike')?.addEventListener('click', () => {
    toggleStyle('strike', true);
    closeAllDropdowns();
  });

  document.getElementById('menu-format-clear')?.addEventListener('click', () => {
    document.getElementById('btn-clear-format')?.click();
    closeAllDropdowns();
  });


  setupWordCountModal(() => doc, closeAllDropdowns);
  setupExternalLinkMenus(closeAllDropdowns);

  document.getElementById('menu-tools-gemini')?.addEventListener('click', () => {
    closeAllDropdowns();
    if (geminiModal) geminiModal.style.display = 'flex';
  });
  const shareModal = document.getElementById('share-modal');
  const shareBtn = document.getElementById('share-pill-btn');
  const shareInput = document.getElementById('share-username-input') as HTMLInputElement;
  const shareSuggestions = document.getElementById('share-user-suggestions');
  let searchTimer: any = null;

  shareBtn?.addEventListener('click', () => {
    closeAllDropdowns();
    if (shareInput) shareInput.value = '';
    if (shareSuggestions) {
      shareSuggestions.style.display = 'none';
      shareSuggestions.innerHTML = '';
    }
    if (shareModal) shareModal.style.display = 'flex';
    shareInput?.focus();
  });

  document.getElementById('share-modal-cancel')?.addEventListener('click', () => {
    if (shareModal) shareModal.style.display = 'none';
    if (shareSuggestions) shareSuggestions.style.display = 'none';
  });

  shareInput?.addEventListener('input', () => {
    const val = shareInput.value.trim();
    if (searchTimer) clearTimeout(searchTimer);
    if (!val) {
      if (shareSuggestions) shareSuggestions.style.display = 'none';
      return;
    }

    searchTimer = setTimeout(async () => {
      try {
        let users: any[] = [];
        try {
          const res = await fetch(`http://localhost:8080/api/docs/users/search?q=${encodeURIComponent(val)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            users = await res.json();
          }
        } catch (e) {}

        if (users.length === 0) {
          try {
            const res2 = await fetch(`http://localhost:8080/api/users/search?q=${encodeURIComponent(val)}`);
            if (res2.ok) {
              users = await res2.json();
            }
          } catch (e) {}
        }

        const filtered = users.filter((u: any) => u.username && u.username !== username);
        if (!shareSuggestions) return;

        if (filtered.length === 0) {
          shareSuggestions.innerHTML = `<div style="padding: 10px 14px; font-size: 13px; color: #70757a; font-style: italic;">No users found matching "${val}"</div>`;
        } else {
          shareSuggestions.innerHTML = filtered.map((u: any) => {
            const initial = (u.username.charAt(0) || 'U').toUpperCase();
            return `
              <div class="gdoc-autocomplete-item" data-uname="${u.username}">
                <div class="gdoc-autocomplete-avatar">${initial}</div>
                <span style="font-weight: 500;">${u.username}</span>
              </div>
            `;
          }).join('');

          shareSuggestions.querySelectorAll('.gdoc-autocomplete-item').forEach((item) => {
            item.addEventListener('click', () => {
              const selectedName = item.getAttribute('data-uname');
              if (selectedName) {
                shareInput.value = selectedName;
              }
              shareSuggestions.style.display = 'none';
            });
          });
        }
        shareSuggestions.style.display = 'block';
      } catch (e) {
        if (shareSuggestions) shareSuggestions.style.display = 'none';
      }
    }, 120);
  });

  document.getElementById('share-modal-send')?.addEventListener('click', async () => {
    const targetUser = shareInput?.value.trim();
    if (!targetUser) {
      if (shareModal) shareModal.style.display = 'none';
      return;
    }
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
        showToast(`Document shared successfully with ${targetUser}`);
      } else {
        alert(data.error || 'Failed to share document');
      }
    } catch (e) {
      alert('Error sharing document');
    }
    if (shareModal) shareModal.style.display = 'none';
    if (shareSuggestions) shareSuggestions.style.display = 'none';
  });

  const avatarBtn = document.getElementById('avatar-btn');
  const userPop = document.getElementById('user-popover');
  avatarBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = userPop?.style.display === 'flex';
    closeAllDropdowns();
    if (!isShowing && userPop) {
      userPop.style.display = 'flex';
    }
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    if (ws) ws.close();
    state.clearToken();
    window.history.pushState({}, '', '/');
    onLogout();
  });

  document.getElementById('btn-home')?.addEventListener('click', () => {
    if (ws) ws.close();
    window.history.pushState({}, '', '/');
    onLogout();
  });

  titleInput?.addEventListener('input', () => {
    const val = titleInput.value || 'Untitled document';
    document.title = `${val} — DocSync Distributed Engine`;
    const activeItem = document.querySelector(`.gdoc-sidebar-tab-item[data-doc-id="${docId}"] .gdoc-sidebar-tab-item-title`);
    if (activeItem) {
      activeItem.textContent = val;
    }
    const cached = cachedMyDocs.find(d => d._id === docId);
    if (cached) cached.title = val;
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
      showToast('Title updated');
    } catch (e) {}
  });

  function setSaveStatus(status: 'saving' | 'saved' | 'error') {
    if (!statusSpan) return;
    if (status === 'saving') {
      statusSpan.textContent = 'Saving...';
      statusSpan.style.color = '#e37400';
    } else if (status === 'saved') {
      statusSpan.textContent = 'Saved to Drive';
      statusSpan.style.color = '#444746';
    } else if (status === 'error') {
      statusSpan.textContent = 'Save failed';
      statusSpan.style.color = '#d93025';
    }
  }

  function triggerAutoSave() {
    if (!docId || docId === 'default-room') return;
    setSaveStatus('saving');
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(async () => {
      try {
        const deltaData = JSON.stringify(doc.renderDelta());
        const res = await fetch(`http://localhost:8080/api/docs/${docId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: deltaData })
        });
        if (res.ok) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      } catch (err) {
        setSaveStatus('error');
      }
    }, 1000);
  }

  document.getElementById('chip-meeting')?.addEventListener('click', () => {
    insertAtCursor('Meeting Notes\nDate: ' + new Date().toLocaleDateString() + '\nAttendees:\n- ' + username + '\n\nAgenda:\n1. Objective\n2. Discussion\n3. Action Items\n\n', { bold: false });
    showToast('Meeting notes template inserted');
  });

  document.getElementById('chip-email')?.addEventListener('click', () => {
    insertAtCursor('Subject: Draft Update\n\nHi Team,\n\nHere is a quick summary of the latest updates.\n\nBest regards,\n' + username + '\n', { bold: false });
    showToast('Email draft template inserted');
  });

  document.getElementById('chip-more')?.addEventListener('click', () => {
    insertAtCursor('Project Plan\n\nOverview:\nTimeline:\nDeliverables:\n', { bold: false });
    showToast('Project template inserted');
  });

  function requestPeerSync() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'sync_request' }));
    } else if (ws) {
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: 'sync_request' }));
      }, { once: true });
    }
  }

  async function loadCurrentDocument() {
    if (!docId || docId === 'default-room') {
      editorDiv.innerHTML = '';
      previousValue = '';
      renderEditor();
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/docs/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title && titleInput) {
          titleInput.value = data.title;
          document.title = `${data.title} — DocSync Distributed Engine`;
        }
        if (data.content) {
          try {
            const rawParsed = JSON.parse(data.content);
            const delta = Array.isArray(rawParsed) ? sanitizeDeltaChunks(rawParsed) : (rawParsed.ops ? sanitizeDeltaChunks(rawParsed.ops) : []);
            if (Array.isArray(delta) && delta.length > 0) {
              doc = new CRDTDocument();
              let prevId: string | null = null;
              let prevClock: number | null = null;
              for (const chunk of delta) {
                if (typeof chunk.insert === 'string') {
                  const attrs = chunk.attributes || {};
                  for (let i = 0; i < chunk.insert.length; i++) {
                    const char = chunk.insert.charAt(i);
                    const clock = doc.tick();
                    doc.insert('seed', clock, prevId, prevClock, char, attrs);
                    prevId = 'seed';
                    prevClock = clock;
                  }
                }
              }
              renderEditor();
              previousValue = getEditorText();
            } else {
              renderEditor();
              previousValue = '';
            }
          } catch (e) {
            renderEditor();
            previousValue = '';
          }
        } else {
          renderEditor();
          previousValue = '';
        }
        recordHistorySnapshot();
        requestPeerSync();
      }
    } catch (err) {}
  }

  let activeSidebarDocId: string | null = null;
  const sidebarTabMenu = document.getElementById('sidebar-tab-menu');
  const docDeleteModal = document.getElementById('doc-delete-modal');
  const docDeleteStatement = document.getElementById('doc-delete-statement');

  document.addEventListener('click', (e) => {
    if (sidebarTabMenu && !sidebarTabMenu.contains(e.target as Node)) {
      sidebarTabMenu.style.display = 'none';
    }
  });

  document.getElementById('sidebar-menu-newtab')?.addEventListener('click', () => {
    if (sidebarTabMenu) sidebarTabMenu.style.display = 'none';
    if (activeSidebarDocId) {
      window.open(`/?docId=${activeSidebarDocId}`, '_blank');
    }
  });

  document.getElementById('sidebar-menu-copy')?.addEventListener('click', () => {
    if (sidebarTabMenu) sidebarTabMenu.style.display = 'none';
    if (activeSidebarDocId) {
      const url = `${window.location.origin}/?docId=${activeSidebarDocId}`;
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard');
      }).catch(() => {});
    }
  });

  document.getElementById('sidebar-menu-delete')?.addEventListener('click', () => {
    if (sidebarTabMenu) sidebarTabMenu.style.display = 'none';
    if (!activeSidebarDocId) return;
    const targetDoc = cachedMyDocs.find(d => d._id === activeSidebarDocId);
    if (docDeleteStatement) {
      docDeleteStatement.textContent = `Are you sure you want to permanently delete "${targetDoc?.title || 'Untitled document'}"? This action will remove the document from your library and delete all replicas. Collaborators will lose access immediately. This cannot be undone.`;
    }
    if (docDeleteModal) docDeleteModal.style.display = 'flex';
  });

  document.getElementById('doc-delete-cancel')?.addEventListener('click', () => {
    if (docDeleteModal) docDeleteModal.style.display = 'none';
  });

  document.getElementById('doc-delete-confirm')?.addEventListener('click', async () => {
    if (docDeleteModal) docDeleteModal.style.display = 'none';
    if (activeSidebarDocId) {
      await deleteSidebarDoc(activeSidebarDocId);
    }
  });

  async function deleteSidebarDoc(targetId: string) {
    const targetDoc = cachedMyDocs.find(d => d._id === targetId);
    if (!targetDoc) return;

    try {
      const res = await fetch(`http://localhost:8080/api/docs/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast('Document deleted');
        cachedMyDocs = cachedMyDocs.filter(d => d._id !== targetId);
        if (targetId === docId) {
          const next = cachedMyDocs[0] || cachedSharedDocs[0];
          if (next && next._id) {
            await switchDocument(next._id, next.title);
          } else {
            await createAndSwitchNewDocument();
          }
        } else {
          renderSidebarDocuments();
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to delete document');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting document');
    }
  }

  function renderSidebarDocuments() {
    const myContainer = document.getElementById('my-docs-tabs-list');
    const sharedContainer = document.getElementById('shared-docs-tabs-list');

    if (myContainer) {
      if (cachedMyDocs.length === 0) {
        myContainer.innerHTML = '<div class="gdoc-sidebar-empty-hint">No documents yet</div>';
      } else {
        myContainer.innerHTML = cachedMyDocs.map((d: any) => {
          const isActive = d._id === docId;
          const escapedTitle = (d.title || 'Untitled document').replace(/"/g, '&quot;');
          return `
            <div class="gdoc-sidebar-tab-item ${isActive ? 'active' : ''}" data-doc-id="${d._id}" title="${escapedTitle}" style="position: relative;">
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1;">
                <span class="material-symbols-outlined" style="font-size: 18px; color: ${isActive ? '#041E49' : '#444746'};">description</span>
                <span class="gdoc-sidebar-tab-item-title">${escapedTitle}</span>
              </div>
              <button class="gdoc-tab-3dot" data-doc-id="${d._id}" title="More options" type="button" style="background: transparent; border: none; cursor: pointer; padding: 2px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${isActive ? '#041E49' : '#5f6368'};">
                <span class="material-symbols-outlined" style="font-size: 16px;">more_vert</span>
              </button>
            </div>
          `;
        }).join('');

        myContainer.querySelectorAll('.gdoc-sidebar-tab-item').forEach((item) => {
          item.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).closest('.gdoc-tab-3dot')) return;
            const id = item.getAttribute('data-doc-id');
            const titleEl = item.querySelector('.gdoc-sidebar-tab-item-title');
            if (id) switchDocument(id, titleEl?.textContent || undefined);
          });
        });

        myContainer.querySelectorAll('.gdoc-tab-3dot').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-doc-id');
            if (!id || !sidebarTabMenu) return;
            activeSidebarDocId = id;
            const rect = (btn as HTMLElement).getBoundingClientRect();
            sidebarTabMenu.style.left = `${Math.min(rect.left, window.innerWidth - 180)}px`;
            sidebarTabMenu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - 150)}px`;
            sidebarTabMenu.style.display = 'block';
          });
        });
      }
    }

    if (sharedContainer) {
      if (cachedSharedDocs.length === 0) {
        sharedContainer.innerHTML = '<div class="gdoc-sidebar-empty-hint">No shared documents</div>';
      } else {
        sharedContainer.innerHTML = cachedSharedDocs.map((d: any) => {
          const isActive = d._id === docId;
          const escapedTitle = (d.title || 'Untitled document').replace(/"/g, '&quot;');
          return `
            <div class="gdoc-sidebar-tab-item ${isActive ? 'active' : ''}" data-doc-id="${d._id}" title="${escapedTitle} (by ${d.owner})">
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1;">
                <span class="material-symbols-outlined" style="font-size: 18px; color: ${isActive ? '#041E49' : '#444746'};">group</span>
                <span class="gdoc-sidebar-tab-item-title">${escapedTitle}</span>
              </div>
              <span style="font-size: 10px; color: #5f6368; font-style: italic;">${d.owner}</span>
            </div>
          `;
        }).join('');

        sharedContainer.querySelectorAll('.gdoc-sidebar-tab-item').forEach((item) => {
          item.addEventListener('click', () => {
            const id = item.getAttribute('data-doc-id');
            const titleEl = item.querySelector('.gdoc-sidebar-tab-item-title');
            if (id) switchDocument(id, titleEl?.textContent || undefined);
          });
        });
      }
    }
  }

  async function fetchSidebarDocuments() {
    try {
      const res = await fetch('http://localhost:8080/api/docs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        cachedMyDocs = data.myDocs || [];
        cachedSharedDocs = data.sharedDocs || [];
        renderSidebarDocuments();
      }
    } catch (e) {}
  }

  async function switchDocument(targetDocId: string, targetTitle?: string) {
    if (targetDocId === docId) return;

    if (docId && docId !== 'default-room') {
      try {
        const deltaData = JSON.stringify(doc.renderDelta());
        await fetch(`http://localhost:8080/api/docs/${docId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: deltaData })
        });
      } catch (e) {}
    }

    docId = targetDocId;
    window.history.pushState({}, '', '/?docId=' + targetDocId);

    if (targetTitle && titleInput) {
      titleInput.value = targetTitle;
      document.title = `${targetTitle} — DocSync Distributed Engine`;
    }

    doc = new CRDTDocument();
    undoStack.length = 0;
    redoStack.length = 0;
    previousValue = "";
    savedSelection = { start: 0, end: 0 };
    pendingAttributes = {};
    editorDiv.innerHTML = "";
    editorDiv.style.caretColor = '#202124';

    if (ws) {
      try {
        ws.close();
      } catch (e) {}
    }

    initWebSocket();
    await loadCurrentDocument();
    renderSidebarDocuments();
  }

  async function createAndSwitchNewDocument() {
    try {
      const res = await fetch('http://localhost:8080/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'Untitled document' })
      });
      if (res.ok) {
        const newDoc = await res.json();
        await switchDocument(newDoc._id, newDoc.title);
        fetchSidebarDocuments();
      }
    } catch (e) {}
  }

  document.getElementById('btn-sidebar-add-tab')?.addEventListener('click', async () => {
    await createAndSwitchNewDocument();
  });

  loadCurrentDocument();
  fetchSidebarDocuments();
  function applyOperation(op: any) {
    if (op.type === 'insert') {
      doc.insert(op.clientId, op.clock, op.anchorClientId, op.anchorClock, op.value, op.attributes || {});
    } else if (op.type === 'delete') {
      doc.delete(op.clientId, op.clock);
    } else if (op.type === 'format') {
      doc.format(op.startClientId, op.startClock, op.endClientId, op.endClock, op.attributes);
    }

    renderEditor();
    previousValue = getEditorText();
    triggerAutoSave();
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

  editorDiv.addEventListener('input', () => {
    if (isRendering) return;

    const newValue = getEditorText();
    const caretPos = getCaretCharOffset();
    const lengthDiff = newValue.length - previousValue.length;

    if (lengthDiff > 0) {
      const insertStart = caretPos - lengthDiff;
      const insertedChars = newValue.substring(insertStart, caretPos);
      let anchorIndex = insertStart - 1;
      for (let i = 0; i < insertedChars.length; i++) {
        const char = insertedChars.charAt(i);
        const anchorItem = getVisibleItemAt(anchorIndex);
        const anchorId = anchorItem ? anchorItem.clientId : null;
        const anchorClock = anchorItem ? anchorItem.clock : null;

        const charAttrs: Record<string, any> = { ...pendingAttributes };
        const newClock = doc.tick();
        doc.insert(clientId, newClock, anchorId, anchorClock, char, charAttrs);

        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'insert',
            clientId: clientId,
            clock: newClock,
            anchorClientId: anchorId,
            anchorClock: anchorClock,
            value: char,
            attributes: charAttrs
          }));
        }
        anchorIndex++;
      }
    } else if (lengthDiff < 0) {
      const deleteCount = Math.abs(lengthDiff);
      for (let i = 0; i < deleteCount; i++) {
        const deletedItem = getVisibleItemAt(caretPos);
        if (deletedItem) {
          doc.delete(deletedItem.clientId, deletedItem.clock);

          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'delete',
              clientId: deletedItem.clientId,
              clock: deletedItem.clock
            }));
          }
        }
      }
    }

    recordHistorySnapshot();
    renderEditor();
    previousValue = getEditorText();
    triggerAutoSave();
  });
}

