import { CRDTDocument } from '../../crdt-engine.js';
import { MenuCommand } from './editorView.types.js';

export function updateDocumentOutline(editorDiv: HTMLElement) {
  const outlineContainer = document.getElementById('sidebar-outline-section');
  if (!outlineContainer) return;

  const headings: Array<{ text: string; level: 'h1' | 'h2' | 'h3'; index: number }> = [];
  const lines = editorDiv.querySelectorAll('.gdoc-line');

  lines.forEach((line, idx) => {
    const lineText = (line.textContent || '').trim();
    if (!lineText) return;

    const firstChild = line.firstElementChild as HTMLElement;
    if (firstChild) {
      const fs = firstChild.style.fontSize;
      const fw = firstChild.style.fontWeight;
      if (fs === '20pt' || fw === 'bold' && fs === '20pt') {
        headings.push({ text: lineText, level: 'h1', index: idx });
      } else if (fs === '16pt') {
        headings.push({ text: lineText, level: 'h2', index: idx });
      } else if (fs === '14pt') {
        headings.push({ text: lineText, level: 'h3', index: idx });
      }
    }
  });

  if (headings.length === 0) {
    outlineContainer.innerHTML = '<div class="gdoc-sidebar-caption">Headings you add to the document will appear here.</div>';
  } else {
    outlineContainer.innerHTML = headings.map((h) => {
      const cls = h.level === 'h1' ? 'gdoc-outline-h1' : (h.level === 'h2' ? 'gdoc-outline-h2' : 'gdoc-outline-h3');
      const escaped = h.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<div class="gdoc-outline-item ${cls}" data-line-idx="${h.index}" title="${escaped}">${escaped}</div>`;
    }).join('');

    outlineContainer.querySelectorAll('.gdoc-outline-item').forEach((item) => {
      item.addEventListener('click', () => {
        const lineIdx = parseInt(item.getAttribute('data-line-idx') || '0', 10);
        const targetLine = lines[lineIdx];
        if (targetLine) {
          targetLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }
}

export function setupMenuCommandSearch(
  openLinkModal: () => void,
  toggleStyle: (key: string, value?: any) => void,
  toggleCompanionRail: () => void,
  toggleSidebar: () => void
) {
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-menus-input') as HTMLInputElement;
  const searchResults = document.getElementById('search-menus-results');

  const menuCommands: MenuCommand[] = [
    { name: 'Print', action: () => window.print() },
    { name: 'Word count', action: () => document.getElementById('menu-tools-wordcount')?.click() },
    { name: 'Start Google Meet call', action: () => window.open('https://meet.google.com/new', '_blank') },
    { name: 'Open Google Calendar', action: () => window.open('https://calendar.google.com', '_blank') },
    { name: 'Open Google Keep', action: () => window.open('https://keep.google.com', '_blank') },
    { name: 'Insert link', action: () => openLinkModal() },
    { name: 'Insert image', action: () => document.getElementById('btn-insert-image')?.click() },
    { name: 'Bold', action: () => toggleStyle('bold', true) },
    { name: 'Italic', action: () => toggleStyle('italic', true) },
    { name: 'Underline', action: () => toggleStyle('underline', true) },
    { name: 'Clear formatting', action: () => document.getElementById('btn-clear-format')?.click() },
    { name: 'Keyboard shortcuts', action: () => document.getElementById('menu-help-shortcuts')?.click() },
    { name: 'Toggle side panel', action: () => toggleCompanionRail() },
    { name: 'Toggle document tabs', action: () => toggleSidebar() }
  ];

  document.getElementById('btn-search-menu')?.addEventListener('click', () => {
    if (searchModal) {
      searchModal.style.display = 'flex';
      searchInput.value = '';
      renderSearchResults('');
      searchInput?.focus();
    }
  });

  document.getElementById('search-modal-close')?.addEventListener('click', () => {
    if (searchModal) searchModal.style.display = 'none';
  });

  function renderSearchResults(q: string) {
    if (!searchResults) return;
    const filtered = menuCommands.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
    if (filtered.length === 0) {
      searchResults.innerHTML = '<div style="padding: 8px; font-size: 13px; color: #70757a;">No matching commands</div>';
    } else {
      searchResults.innerHTML = filtered.map((c, i) => `
        <div class="gdoc-autocomplete-item" data-idx="${i}">
          <span class="material-symbols-outlined" style="font-size: 18px; color: #5f6368;">terminal</span>
          <span>${c.name}</span>
        </div>
      `).join('');
      searchResults.querySelectorAll('.gdoc-autocomplete-item').forEach((item) => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.getAttribute('data-idx') || '0', 10);
          const cmd = filtered[idx];
          if (cmd) {
            cmd.action();
          }
          if (searchModal) searchModal.style.display = 'none';
        });
      });
    }
  }

  searchInput?.addEventListener('input', () => {
    renderSearchResults(searchInput.value.trim());
  });
}

export function setupWordCountModal(getDoc: () => CRDTDocument, closeAllDropdowns: () => void) {
  const wordCountModal = document.getElementById('wordcount-modal');
  document.getElementById('menu-tools-wordcount')?.addEventListener('click', () => {
    closeAllDropdowns();
    const doc = getDoc();
    const text = doc.renderText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const pages = Math.max(1, Math.ceil(chars / 3000));

    const wcPages = document.getElementById('wc-pages');
    const wcWords = document.getElementById('wc-words');
    const wcChars = document.getElementById('wc-chars');
    const wcNoSpace = document.getElementById('wc-chars-nospace');

    if (wcPages) wcPages.textContent = String(pages);
    if (wcWords) wcWords.textContent = String(words);
    if (wcChars) wcChars.textContent = String(chars);
    if (wcNoSpace) wcNoSpace.textContent = String(charsNoSpace);

    if (wordCountModal) wordCountModal.style.display = 'flex';
  });
}

