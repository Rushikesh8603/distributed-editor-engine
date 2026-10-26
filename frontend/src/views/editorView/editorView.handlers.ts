import { standardColors, toolButtons } from './editorView.constants.js';

export function setupCompanionRailHandlers() {
  document.getElementById('btn-companion-calendar')?.addEventListener('click', () => {
    window.open('https://calendar.google.com', '_blank');
  });

  document.getElementById('btn-companion-keep')?.addEventListener('click', () => {
    window.open('https://keep.google.com', '_blank');
  });

  document.getElementById('btn-companion-tasks')?.addEventListener('click', () => {
    window.open('https://calendar.google.com/calendar/u/0/r/tasks', '_blank');
  });

  document.getElementById('btn-companion-contacts')?.addEventListener('click', () => {
    window.open('https://contacts.google.com', '_blank');
  });

  document.getElementById('btn-companion-maps')?.addEventListener('click', () => {
    window.open('https://maps.google.com', '_blank');
  });

  document.getElementById('btn-companion-addons')?.addEventListener('click', () => {
    window.open('https://workspace.google.com/marketplace', '_blank');
  });

  document.getElementById('btn-video-call')?.addEventListener('click', () => {
    window.open('https://meet.google.com/new', '_blank');
  });
}

export function setupStaticModalCloseHandlers() {
  const moveModal = document.getElementById('move-modal');
  document.getElementById('move-modal-cancel')?.addEventListener('click', () => {
    if (moveModal) moveModal.style.display = 'none';
  });

  const commentsModal = document.getElementById('comments-modal');
  document.getElementById('comments-modal-close')?.addEventListener('click', () => {
    if (commentsModal) commentsModal.style.display = 'none';
  });

  const geminiModal = document.getElementById('gemini-modal');
  document.getElementById('gemini-modal-close')?.addEventListener('click', () => {
    if (geminiModal) geminiModal.style.display = 'none';
  });

  const searchModal = document.getElementById('search-modal');
  document.getElementById('search-modal-close')?.addEventListener('click', () => {
    if (searchModal) searchModal.style.display = 'none';
  });

  const imageModal = document.getElementById('image-modal');
  document.getElementById('image-modal-cancel')?.addEventListener('click', () => {
    if (imageModal) imageModal.style.display = 'none';
  });

  const shortcutsModal = document.getElementById('shortcuts-modal');
  document.getElementById('shortcuts-modal-close')?.addEventListener('click', () => {
    if (shortcutsModal) shortcutsModal.style.display = 'none';
  });

  const linkModal = document.getElementById('link-modal');
  document.getElementById('link-modal-cancel')?.addEventListener('click', () => {
    if (linkModal) linkModal.style.display = 'none';
  });

  const wordCountModal = document.getElementById('wordcount-modal');
  document.getElementById('wordcount-close')?.addEventListener('click', () => {
    if (wordCountModal) wordCountModal.style.display = 'none';
  });
}

export function setupPaletteGrids(
  onSelectColor: (hex: string) => void,
  onSelectHighlight: (hex: string) => void
) {
  const colorGrid = document.getElementById('color-palette-grid');
  if (colorGrid) {
    for (const hex of standardColors) {
      const swatch = document.createElement('div');
      swatch.className = 'gdoc-palette-swatch';
      swatch.style.backgroundColor = hex;
      swatch.addEventListener('click', () => {
        onSelectColor(hex);
      });
      colorGrid.appendChild(swatch);
    }
  }

  const highlightGrid = document.getElementById('highlight-palette-grid');
  if (highlightGrid) {
    for (const hex of standardColors) {
      const swatch = document.createElement('div');
      swatch.className = 'gdoc-palette-swatch';
      swatch.style.backgroundColor = hex;
      swatch.addEventListener('click', () => {
        onSelectHighlight(hex);
      });
      highlightGrid.appendChild(swatch);
    }
  }
}

export function setupMenuDropdownToggle(closeAllDropdowns: () => void) {
  const menuButtons = document.querySelectorAll('.gdoc-menu-item');
  menuButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuType = btn.getAttribute('data-menu');
      const popId = `menu-${menuType}-pop`;
      const pop = document.getElementById(popId);
      const isVisible = pop?.style.display === 'block';
      closeAllDropdowns();
      if (!isVisible && pop) {
        const rect = btn.getBoundingClientRect();
        pop.style.top = (rect.bottom + 2) + 'px';
        pop.style.left = rect.left + 'px';
        pop.style.display = 'block';
      }
    });
  });
}

export function setupOutsideClickListener(closeAllDropdowns: () => void, getSidebarTabMenu?: () => HTMLElement | null) {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const sidebarTabMenu = getSidebarTabMenu ? getSidebarTabMenu() : null;
    if (sidebarTabMenu && !sidebarTabMenu.contains(target as Node)) {
      sidebarTabMenu.style.display = 'none';
    }
    if (
      !target.closest('.gdoc-menu-row') &&
      !target.closest('.gdoc-tool-dropdown-btn') &&
      !target.closest('.gdoc-dropdown-menu') &&
      !target.closest('.gdoc-styles-popup') &&
      !target.closest('.gdoc-color-palette-pop') &&
      !target.closest('#btn-color-pick') &&
      !target.closest('#btn-highlight-pick') &&
      !target.closest('#btn-line-spacing') &&
      !target.closest('#btn-editing-mode') &&
      !target.closest('#avatar-btn') &&
      !target.closest('#user-popover') &&
      !target.closest('#share-username-input') &&
      !target.closest('#share-user-suggestions')
    ) {
      closeAllDropdowns();
    }
  });
}

export function setupToolButtonsMousedown(updateStoredSelection: () => void) {
  for (const btnId of toolButtons) {
    const el = document.getElementById(btnId);
    el?.addEventListener('mousedown', (e) => {
      e.preventDefault();
      updateStoredSelection();
    });
  }
}

export function setupExternalLinkMenus(closeAllDropdowns: () => void) {
  document.getElementById('menu-tools-meet')?.addEventListener('click', () => {
    closeAllDropdowns();
    window.open('https://meet.google.com/new', '_blank');
  });

  document.getElementById('menu-ext-addons')?.addEventListener('click', () => {
    closeAllDropdowns();
    window.open('https://workspace.google.com/marketplace', '_blank');
  });

  document.getElementById('menu-ext-calendar')?.addEventListener('click', () => {
    closeAllDropdowns();
    window.open('https://calendar.google.com', '_blank');
  });

  document.getElementById('menu-ext-keep')?.addEventListener('click', () => {
    closeAllDropdowns();
    window.open('https://keep.google.com', '_blank');
  });
}

