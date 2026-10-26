export function getEditorTemplate(username, userInitial) {
    return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
        vertical-align: middle;
        line-height: 1;
        display: inline-block;
      }

      :root {
        --bg-shell: #F9FBFD;
        --bg-toolbar: #EDF2FA;
        --bg-canvas: #FFFFFF;
        --border-canvas: #C7C7C7;
        --text-primary: #1F1F1F;
        --text-secondary: #444746;
        --share-pill-bg: #C2E7FF;
        --share-pill-hover: #B3D7F2;
        --share-pill-text: #001D35;
        --active-pill-bg: #D3E3FD;
        --active-pill-text: #041E49;
        --chip-bg: #EDF2FA;
        --chip-hover: #E1E9F6;
        --chip-text: #1F1F1F;
        --divider-color: #C7C7C7;
        --border-subtle: #E1E3E1;
        --docs-blue: #1A73E8;
        --avatar-bg: #5D4037;
      }

      * {
        box-sizing: border-box;
      }

      html, body {
        background-color: var(--bg-shell) !important;
        color: var(--text-primary) !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        display: block !important;
        font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
      }

      #app {
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        background: var(--bg-shell) !important;
      }

      .gdoc-header {
        width: 100%;
        height: 64px;
        padding: 8px 16px 0 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-shell);
        flex-shrink: 0;
        user-select: none;
      }

      .gdoc-header-left {
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
      }

      .gdoc-logo-link {
        display: flex;
        align-items: center;
        cursor: pointer;
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        justify-content: center;
        margin-right: 4px;
      }

      .gdoc-title-stack {
        display: flex;
        flex-direction: column;
        gap: 0;
        min-width: 0;
      }

      .gdoc-title-row {
        display: flex;
        align-items: center;
        gap: 2px;
        height: 24px;
      }

      .gdoc-doc-name {
        font-family: "Google Sans", "Roboto", sans-serif;
        font-size: 18px;
        font-weight: 400;
        color: var(--text-primary);
        line-height: 22px;
        border: 1px solid transparent;
        border-radius: 4px;
        padding: 1px 6px;
        height: 24px;
        background: transparent;
        outline: none;
        cursor: text;
        max-width: 280px;
        transition: border-color 0.15s, background-color 0.15s;
      }

      .gdoc-doc-name:hover {
        border-color: #747775;
      }

      .gdoc-doc-name:focus {
        border: 2px solid #0B57D0;
        background: #ffffff;
        padding: 0 5px;
      }

      .gdoc-header-icon-btn {
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        cursor: pointer;
        transition: background-color 0.15s;
        flex-shrink: 0;
        padding: 0;
      }

      .gdoc-header-icon-btn:hover {
        background-color: rgba(68, 71, 70, 0.08);
        color: var(--text-primary);
      }

      .gdoc-header-icon-btn.starred {
        color: #fbbc04;
      }

      .gdoc-status-cloud {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: 4px;
        font-size: 12px;
        color: var(--text-secondary);
        user-select: none;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
      }

      .gdoc-status-cloud:hover {
        background: rgba(68, 71, 70, 0.08);
      }

      .gdoc-menu-row {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-left: -4px;
        margin-top: -1px;
      }

      .gdoc-menu-item {
        background: transparent;
        border: none;
        border-radius: 4px;
        padding: 2px 7px;
        font-size: 14px;
        line-height: 20px;
        color: var(--text-primary);
        cursor: pointer;
        font-family: inherit;
        user-select: none;
        transition: background-color 0.15s;
      }

      .gdoc-menu-item:hover {
        background-color: rgba(68, 71, 70, 0.08);
      }

      .gdoc-header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .gdoc-round-action-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: transparent;
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        cursor: pointer;
        transition: background-color 0.15s;
      }

      .gdoc-round-action-btn:hover {
        background-color: rgba(68, 71, 70, 0.08);
        color: var(--text-primary);
      }

      .gdoc-share-split-pill {
        display: flex;
        align-items: center;
        height: 40px;
        background: var(--share-pill-bg);
        color: var(--share-pill-text);
        border-radius: 20px;
        overflow: hidden;
        font-family: "Google Sans", "Roboto", sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.15s, box-shadow 0.15s;
        border: none;
      }

      .gdoc-share-split-pill:hover {
        background: var(--share-pill-hover);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .gdoc-share-split-main {
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 16px;
        height: 100%;
        color: inherit;
        font-weight: inherit;
        font-size: inherit;
        font-family: inherit;
        cursor: pointer;
      }

      .gdoc-share-split-caret {
        background: transparent;
        border: none;
        border-left: 1px solid rgba(0, 29, 53, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 100%;
        padding-right: 4px;
        color: inherit;
        cursor: pointer;
      }

      .gdoc-gemini-sparkle-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s;
      }

      .gdoc-gemini-sparkle-btn:hover {
        background-color: rgba(68, 71, 70, 0.08);
      }

      .gdoc-avatar-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--avatar-bg);
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
        font-family: "Google Sans", sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        border: 2px solid transparent;
        transition: border-color 0.15s;
      }

      .gdoc-avatar-circle:hover {
        border-color: #8d6e63;
      }

      .gdoc-floating-toolbar {
        width: calc(100% - 32px);
        margin: 0 16px 8px;
        min-height: 40px;
        background: var(--bg-toolbar);
        border-radius: 24px;
        padding: 0 12px;
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
        z-index: 20;
        user-select: none;
        transition: max-height 0.2s, opacity 0.2s, margin 0.2s;
        overflow: hidden;
      }

      .gdoc-floating-toolbar.collapsed {
        min-height: 0 !important;
        height: 0 !important;
        margin: 0 16px 0 !important;
        padding: 0 12px !important;
        opacity: 0;
        pointer-events: none;
      }

      .gdoc-tool-btn {
        background: transparent;
        border: none;
        border-radius: 4px;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0;
        transition: background 0.15s, color 0.15s;
      }

      .gdoc-tool-btn:hover {
        background: rgba(68, 71, 70, 0.08);
        color: var(--text-primary);
      }

      .gdoc-tool-btn.active {
        background: #d3e3fd !important;
        color: #041E49 !important;
      }

      .gdoc-tool-divider {
        width: 1px;
        height: 20px;
        background: var(--divider-color);
        margin: 0 4px;
        flex-shrink: 0;
      }

      .gdoc-tool-dropdown-btn {
        background: transparent;
        border: none;
        border-radius: 4px;
        height: 30px;
        padding: 0 6px;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        transition: background 0.15s;
      }

      .gdoc-tool-dropdown-btn:hover {
        background: rgba(68, 71, 70, 0.08);
        color: var(--text-primary);
      }

      .gdoc-font-size-box {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .gdoc-font-size-input {
        width: 32px;
        height: 24px;
        border: 1px solid #747775;
        border-radius: 4px;
        background: transparent;
        text-align: center;
        font-size: 14px;
        color: var(--text-primary);
        outline: none;
        font-family: inherit;
        transition: border-color 0.15s, background-color 0.15s;
      }

      .gdoc-font-size-input:hover {
        border-color: #1f1f1f;
      }

      .gdoc-font-size-input:focus {
        border-color: #0b57d0;
        background: #ffffff;
      }

      .gdoc-text-color-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 1px;
      }

      .gdoc-text-color-underline {
        width: 16px;
        height: 3px;
        background: #1f1f1f;
        border-radius: 1px;
      }

      .gdoc-highlight-color-underline {
        width: 16px;
        height: 3px;
        background: #ffff00;
        border-radius: 1px;
      }

      .gdoc-main-workspace {
        display: flex;
        width: 100vw;
        height: calc(100vh - 112px);
        background: var(--bg-shell);
        overflow: hidden;
        position: relative;
      }

      .gdoc-sidebar-left {
        width: 260px;
        height: 100%;
        background: var(--bg-shell);
        border-right: 1px solid var(--border-subtle);
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1), padding 0.2s;
        overflow: hidden;
        user-select: none;
      }

      .gdoc-sidebar-left.collapsed {
        width: 0 !important;
        padding: 0 !important;
        border-right: none !important;
        visibility: hidden;
      }

      .gdoc-sidebar-tabs-scroll {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
        padding-right: 4px;
      }

      .gdoc-sidebar-section-title {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.8px;
        color: #5f6368;
        padding: 8px 6px 4px;
        text-transform: uppercase;
      }

      .gdoc-sidebar-tabs-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .gdoc-sidebar-tab-item {
        height: 38px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: #1f1f1f;
        background: transparent;
        transition: background-color 0.15s, color 0.15s;
        user-select: none;
        border: 1px solid transparent;
      }

      .gdoc-sidebar-tab-item:hover {
        background: rgba(68, 71, 70, 0.08);
      }

      .gdoc-sidebar-tab-item.active {
        background: var(--active-pill-bg) !important;
        color: var(--active-pill-text) !important;
        font-weight: 600;
      }

      .gdoc-sidebar-tab-item-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 170px;
      }

      .gdoc-sidebar-empty-hint {
        font-size: 12px;
        color: #70757a;
        padding: 6px 8px;
        font-style: italic;
      }

      .gdoc-sidebar-outline-container {
        padding: 8px 6px;
        max-height: 200px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .gdoc-outline-item {
        font-size: 12px;
        color: #1f1f1f;
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: background-color 0.15s;
      }

      .gdoc-outline-item:hover {
        background: rgba(68, 71, 70, 0.08);
      }

      .gdoc-outline-h1 {
        font-weight: 600;
        padding-left: 6px;
      }

      .gdoc-outline-h2 {
        font-weight: 500;
        padding-left: 14px;
        color: #444746;
      }

      .gdoc-outline-h3 {
        font-weight: 400;
        padding-left: 22px;
        color: #5f6368;
      }

      .gdoc-canvas-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--bg-shell);
        overflow: hidden;
        position: relative;
      }

      .gdoc-floating-outline-reopen-btn {
        position: absolute;
        top: 16px;
        left: 24px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #FFFFFF;
        border: 1px solid #DADCE0;
        box-shadow: 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        display: none;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        cursor: pointer;
        z-index: 100;
        transition: background-color 0.15s, color 0.15s;
      }

      .gdoc-floating-outline-reopen-btn:hover {
        background-color: rgba(68, 71, 70, 0.08);
        color: var(--text-primary);
      }

      .gdoc-sidebar-back-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }

      .gdoc-sidebar-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: "Google Sans", "Roboto", sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 12px;
      }

      .gdoc-sidebar-caption {
        font-size: 12px;
        font-style: italic;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .gdoc-scroll-viewport {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--bg-shell);
        position: relative;
        padding-top: 24px;
      }

      .gdoc-document-sheet {
        width: 816px;
        min-height: 1056px;
        background: var(--bg-canvas);
        border: 1px solid var(--border-canvas);
        box-shadow: 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        padding: 96px 96px;
        margin-bottom: 48px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        cursor: text;
        box-sizing: border-box;
      }

      .gdoc-starter-chips-container {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        flex-wrap: wrap;
        user-select: none;
      }

      .gdoc-canvas-chip {
        background: var(--chip-bg);
        border: 1px solid transparent;
        border-radius: 8px;
        height: 32px;
        padding: 0 12px;
        gap: 8px;
        font-size: 13px;
        color: var(--chip-text);
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        font-family: "Google Sans", "Roboto", sans-serif;
        font-weight: 500;
        transition: background-color 0.15s, box-shadow 0.15s;
      }

      .gdoc-canvas-chip:hover {
        background: var(--chip-hover);
      }

      .gdoc-canvas-chip .material-symbols-outlined {
        color: #0B57D0;
        font-size: 18px;
      }

      .gdoc-editor-surface {
        width: 100%;
        flex: 1;
        min-height: 800px;
        outline: none;
        border: none;
        font-family: "Arial", "Roboto", sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #202124;
        word-break: break-word;
        white-space: pre-wrap;
        caret-color: #202124;
      }

      .gdoc-line {
        width: 100%;
        min-height: 1.5em;
        word-break: break-word;
        box-sizing: border-box;
      }

      .gdoc-editor-surface:empty::before {
        content: "Type @ to insert";
        color: #747775;
        font-style: italic;
        pointer-events: none;
      }

      .gdoc-companion-rail {
        width: 56px;
        height: 100%;
        background-color: var(--bg-shell);
        border-left: 1px solid var(--border-subtle);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 12px;
        gap: 16px;
        flex-shrink: 0;
        position: relative;
        transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        z-index: 25;
      }

      .gdoc-companion-rail.collapsed {
        width: 0 !important;
        padding: 0 !important;
        border-left: none !important;
        overflow: hidden;
      }

      .gdoc-companion-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.15s;
        padding: 0;
      }

      .gdoc-companion-btn:hover {
        background-color: rgba(68, 71, 70, 0.08);
      }

      .gdoc-companion-divider {
        width: 20px;
        height: 1px;
        background-color: var(--border-subtle);
        margin: 4px 0;
      }

      .gdoc-companion-toggle-btn {
        position: absolute;
        bottom: 16px;
        right: 10px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #FFFFFF;
        border: 1px solid #DADCE0;
        box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        cursor: pointer;
        z-index: 100;
        transition: background-color 0.15s;
      }

      .gdoc-companion-toggle-btn:hover {
        background-color: rgba(68, 71, 70, 0.08);
        color: var(--text-primary);
      }

      .gdoc-dropdown-menu {
        position: absolute;
        background: #ffffff;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        padding: 6px 0;
        z-index: 10000;
        min-width: 180px;
        display: none;
        border: 1px solid #dadce0;
      }

      .gdoc-dropdown-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        font-size: 13px;
        color: #202124;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s;
      }

      .gdoc-dropdown-item:hover {
        background: #f1f3f4;
      }

      .gdoc-dropdown-item-shortcut {
        color: #5f6368;
        font-size: 11px;
        margin-left: 16px;
      }

      .gdoc-dropdown-divider {
        height: 1px;
        background: #dadce0;
        margin: 4px 0;
      }

      .gdoc-styles-popup {
        position: absolute;
        background: #ffffff;
        border-radius: 6px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        padding: 8px 0;
        z-index: 10000;
        min-width: 220px;
        display: none;
        border: 1px solid #dadce0;
      }

      .gdoc-style-opt {
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: background 0.15s;
      }

      .gdoc-style-opt:hover {
        background: #f1f3f4;
      }

      .gdoc-color-palette-pop {
        position: absolute;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        padding: 12px;
        z-index: 10000;
        display: none;
        border: 1px solid #dadce0;
        width: 240px;
      }

      .gdoc-palette-grid {
        display: grid;
        grid-template-columns: repeat(10, 18px);
        gap: 4px;
      }

      .gdoc-palette-swatch {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.1);
        transition: transform 0.1s;
      }

      .gdoc-palette-swatch:hover {
        transform: scale(1.2);
      }

      .gdoc-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.35);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 20000;
      }

      .gdoc-modal-card {
        background: #ffffff;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        width: 420px;
        max-width: 90vw;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .gdoc-modal-title {
        margin: 0;
        font-family: "Google Sans", sans-serif;
        font-size: 18px;
        font-weight: 500;
        color: var(--text-primary);
      }

      .gdoc-input-field {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #dadce0;
        border-radius: 6px;
        font-size: 14px;
        outline: none;
        font-family: "Roboto", sans-serif;
      }

      .gdoc-input-field:focus {
        border-color: #0b57d0;
        box-shadow: 0 0 0 1px #0b57d0;
      }

      .gdoc-autocomplete-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 6px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        max-height: 180px;
        overflow-y: auto;
        z-index: 25000;
        display: none;
        margin-top: 3px;
      }

      .gdoc-autocomplete-item {
        padding: 8px 12px;
        font-size: 13px;
        color: #1f1f1f;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: background-color 0.12s;
      }

      .gdoc-autocomplete-item:hover {
        background: #f1f3f4;
      }

      .gdoc-autocomplete-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #1a73e8;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 500;
        flex-shrink: 0;
      }

      .gdoc-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
      }

      .gdoc-btn-cancel {
        background: transparent;
        border: none;
        padding: 8px 16px;
        color: #0b57d0;
        font-weight: 500;
        border-radius: 18px;
        cursor: pointer;
      }

      .gdoc-btn-cancel:hover {
        background: #e0ebff;
      }

      .gdoc-btn-primary {
        background: #0b57d0;
        color: #ffffff;
        border: none;
        padding: 8px 20px;
        font-weight: 500;
        border-radius: 18px;
        cursor: pointer;
        transition: background 0.15s;
      }

      .gdoc-btn-primary:hover {
        background: #0842a0;
      }

      .gdoc-user-popover {
        position: absolute;
        top: 56px;
        right: 16px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
        border: 1px solid #dadce0;
        padding: 16px;
        width: 240px;
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        z-index: 15000;
      }

      .gdoc-user-popover-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--avatar-bg);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-family: "Google Sans", sans-serif;
      }

      .gdoc-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #323232;
        color: #FFFFFF;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 13px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        z-index: 30000;
        display: none;
        align-items: center;
        gap: 12px;
      }
    </style>

    <header class="gdoc-header">
      <div class="gdoc-header-left">
        <a id="btn-home" class="gdoc-logo-link" title="Docs home">
          <svg width="40" height="40" viewBox="0 0 48 48">
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
        </a>

        <div class="gdoc-title-stack">
          <div class="gdoc-title-row">
            <input id="doc-title-input" class="gdoc-doc-name" value="Untitled document" aria-label="Document Title" spellcheck="false" />
            <button id="btn-star" class="gdoc-header-icon-btn" title="Star document" type="button">
              <span class="material-symbols-outlined" style="font-size: 18px;">star</span>
            </button>
            <button id="btn-move" class="gdoc-header-icon-btn" title="Move" type="button">
              <span class="material-symbols-outlined" style="font-size: 18px;">drive_file_move</span>
            </button>
            <div id="btn-cloud-status" class="gdoc-status-cloud" title="Document save status">
              <span class="material-symbols-outlined" style="font-size: 18px;">cloud_done</span>
              <span id="save-status-text">Saved to Drive</span>
            </div>
          </div>

          <div class="gdoc-menu-row">
            <button class="gdoc-menu-item" data-menu="file" type="button">File</button>
            <button class="gdoc-menu-item" data-menu="edit" type="button">Edit</button>
            <button class="gdoc-menu-item" data-menu="view" type="button">View</button>
            <button class="gdoc-menu-item" data-menu="insert" type="button">Insert</button>
            <button class="gdoc-menu-item" data-menu="format" type="button">Format</button>
            <button class="gdoc-menu-item" data-menu="tools" type="button">Tools</button>
            <button class="gdoc-menu-item" data-menu="extensions" type="button">Extensions</button>
            <button class="gdoc-menu-item" data-menu="help" type="button">Help</button>
          </div>
        </div>
      </div>

      <div class="gdoc-header-right">
        <button class="gdoc-round-action-btn" title="Version history" type="button" id="btn-version-history">
          <span class="material-symbols-outlined" style="font-size: 20px;">history</span>
        </button>
        <button class="gdoc-round-action-btn" title="Open comment history" type="button" id="btn-comments-history">
          <span class="material-symbols-outlined" style="font-size: 20px;">comment</span>
        </button>
        <button class="gdoc-round-action-btn" title="Join or start video call (Google Meet)" type="button" id="btn-video-call" style="display: inline-flex; align-items: center; gap: 0;">
          <span class="material-symbols-outlined" style="font-size: 20px; color: #1a73e8;">videocam</span>
          <span class="material-symbols-outlined" style="font-size: 14px; margin-left: -2px;">arrow_drop_down</span>
        </button>

        <div class="gdoc-share-split-pill" id="share-pill-btn">
          <button class="gdoc-share-split-main" type="button">
            <span class="material-symbols-outlined" style="font-size: 18px;">lock</span>
            Share
          </button>
          <button class="gdoc-share-split-caret" type="button">
            <span class="material-symbols-outlined" style="font-size: 16px;">arrow_drop_down</span>
          </button>
        </div>

        <button class="gdoc-gemini-sparkle-btn" id="btn-gemini-sparkle" title="Gemini AI writing assistant" type="button">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4285F4"/>
                <stop offset="35%" stop-color="#9B72CB"/>
                <stop offset="70%" stop-color="#D96570"/>
                <stop offset="100%" stop-color="#F4AF38"/>
              </linearGradient>
            </defs>
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill="url(#gemGrad)"/>
            <path d="M19 16L19.9 19.1L23 20L19.9 20.9L19 24L18.1 20.9L15 20L18.1 19.1L19 16Z" fill="url(#gemGrad)"/>
          </svg>
        </button>

        <button id="avatar-btn" class="gdoc-avatar-circle" title="Google Account: ${username}">
          ${userInitial}
        </button>
      </div>
    </header>

    <div class="gdoc-floating-toolbar" id="main-floating-toolbar">
      <button class="gdoc-tool-btn" id="btn-search-menu" title="Search the menus (Alt+/)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">search</span>
      </button>
      <button id="tool-undo" class="gdoc-tool-btn" title="Undo (Ctrl+Z)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">undo</span>
      </button>
      <button id="tool-redo" class="gdoc-tool-btn" title="Redo (Ctrl+Y)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">redo</span>
      </button>
      <button id="tool-print" class="gdoc-tool-btn" title="Print (Ctrl+P)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">print</span>
      </button>
      <button id="btn-spellcheck" class="gdoc-tool-btn active" title="Spelling and grammar check" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">spellcheck</span>
      </button>
      <button id="btn-paint-format" class="gdoc-tool-btn" title="Paint format" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_paint</span>
      </button>

      <div class="gdoc-tool-divider"></div>

      <button id="zoom-dropdown-btn" class="gdoc-tool-dropdown-btn" type="button" title="Zoom">
        <span id="zoom-text">100%</span>
        <span class="material-symbols-outlined" style="font-size: 16px;">arrow_drop_down</span>
      </button>

      <div class="gdoc-tool-divider"></div>

      <button id="styles-dropdown-btn" class="gdoc-tool-dropdown-btn" type="button" style="min-width: 96px;" title="Paragraph styles">
        <span id="styles-current-text">Normal text</span>
        <span class="material-symbols-outlined" style="font-size: 16px;">arrow_drop_down</span>
      </button>

      <div class="gdoc-tool-divider"></div>

      <button id="font-dropdown-btn" class="gdoc-tool-dropdown-btn" type="button" style="min-width: 76px;" title="Font">
        <span id="font-current-text">Arial</span>
        <span class="material-symbols-outlined" style="font-size: 16px;">arrow_drop_down</span>
      </button>

      <div class="gdoc-tool-divider"></div>

      <div class="gdoc-font-size-box">
        <button id="size-minus" class="gdoc-tool-btn" title="Decrease font size" type="button" style="font-size: 16px;">−</button>
        <input id="size-input" class="gdoc-font-size-input" value="11" title="Font size" />
        <button id="size-plus" class="gdoc-tool-btn" title="Increase font size" type="button" style="font-size: 16px;">+</button>
      </div>

      <div class="gdoc-tool-divider"></div>

      <button id="btn-bold" class="gdoc-tool-btn" title="Bold (Ctrl+B)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_bold</span>
      </button>
      <button id="btn-italic" class="gdoc-tool-btn" title="Italic (Ctrl+I)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_italic</span>
      </button>
      <button id="btn-underline" class="gdoc-tool-btn" title="Underline (Ctrl+U)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_underlined</span>
      </button>
      
      <button id="btn-color-pick" class="gdoc-tool-btn" title="Text color" type="button">
        <div class="gdoc-text-color-stack">
          <span style="font-size: 13px; font-weight: bold; line-height: 1;">A</span>
          <div id="text-color-bar" class="gdoc-text-color-underline"></div>
        </div>
      </button>

      <button id="btn-highlight-pick" class="gdoc-tool-btn" title="Highlight color" type="button">
        <div class="gdoc-text-color-stack">
          <span class="material-symbols-outlined" style="font-size: 16px;">ink_highlighter</span>
          <div id="highlight-color-bar" class="gdoc-highlight-color-underline"></div>
        </div>
      </button>

      <div class="gdoc-tool-divider"></div>

      <button id="btn-link" class="gdoc-tool-btn" title="Insert link (Ctrl+K)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">link</span>
      </button>
      <button id="btn-add-comment" class="gdoc-tool-btn" title="Add comment" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">add_comment</span>
      </button>
      <button id="btn-insert-image" class="gdoc-tool-btn" title="Insert image" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">image</span>
      </button>

      <div class="gdoc-tool-divider"></div>

      <button id="btn-align-left" class="gdoc-tool-btn" title="Align left" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_align_left</span>
      </button>
      <button id="btn-align-center" class="gdoc-tool-btn" title="Align center" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_align_center</span>
      </button>
      <button id="btn-align-right" class="gdoc-tool-btn" title="Align right" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_align_right</span>
      </button>

      <button id="btn-line-spacing" class="gdoc-tool-btn" title="Line & paragraph spacing" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_line_spacing</span>
      </button>
      <button id="btn-checklist" class="gdoc-tool-btn" title="Checklist" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">checklist</span>
      </button>
      <button id="btn-bullet-list" class="gdoc-tool-btn" title="Bulleted list" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_list_bulleted</span>
      </button>
      <button id="btn-number-list" class="gdoc-tool-btn" title="Numbered list" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_list_numbered</span>
      </button>
      <button id="btn-indent-dec" class="gdoc-tool-btn" title="Decrease indent" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_indent_decrease</span>
      </button>
      <button id="btn-indent-inc" class="gdoc-tool-btn" title="Increase indent" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_indent_increase</span>
      </button>
      <button id="btn-clear-format" class="gdoc-tool-btn" title="Clear formatting (Ctrl+\)" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">format_clear</span>
      </button>

      <div class="gdoc-tool-divider"></div>

      <div style="flex: 1;"></div>

      <button id="btn-editing-mode" class="gdoc-tool-dropdown-btn" type="button" title="Editing mode">
        <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
        <span id="editing-mode-text" style="font-size: 12px; margin: 0 2px;">Editing</span>
        <span class="material-symbols-outlined" style="font-size: 14px;">arrow_drop_down</span>
      </button>
      <button id="btn-collapse-toolbar" class="gdoc-tool-btn" title="Hide the menus" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">expand_less</span>
      </button>
    </div>

    <div class="gdoc-main-workspace">
      <aside id="gdoc-sidebar" class="gdoc-sidebar-left">
        <div class="gdoc-sidebar-back-row">
          <button id="btn-collapse-sidebar" class="gdoc-header-icon-btn" title="Close document tabs" type="button">
            <span class="material-symbols-outlined" style="font-size: 18px;">arrow_back</span>
          </button>
        </div>

        <div class="gdoc-sidebar-header-row">
          <span style="font-size: 14px; font-weight: 500;">Document tabs</span>
          <button id="btn-sidebar-add-tab" class="gdoc-header-icon-btn" title="Add document tab" type="button">
            <span class="material-symbols-outlined" style="font-size: 20px; color: #1a73e8;">add</span>
          </button>
        </div>

        <div class="gdoc-sidebar-tabs-scroll" id="sidebar-tabs-container">
          <div class="gdoc-sidebar-section-title">MY DOCUMENTS</div>
          <div id="my-docs-tabs-list" class="gdoc-sidebar-tabs-list"></div>

          <div class="gdoc-sidebar-section-title" style="margin-top: 14px;">SHARED WITH ME</div>
          <div id="shared-docs-tabs-list" class="gdoc-sidebar-tabs-list"></div>

          <div class="gdoc-sidebar-section-title" style="margin-top: 14px;">DOCUMENT OUTLINE</div>
          <div id="sidebar-outline-section" class="gdoc-sidebar-outline-container">
            <div class="gdoc-sidebar-caption">Headings you add to the document will appear here.</div>
          </div>
        </div>
      </aside>

      <div class="gdoc-canvas-area">
        <button id="btn-floating-outline" class="gdoc-floating-outline-reopen-btn" title="Show document tabs and outline" type="button">
          <span class="material-symbols-outlined" style="font-size: 20px;">format_list_bulleted</span>
        </button>

        <div class="gdoc-scroll-viewport" id="main-scroll-area">
          <div class="gdoc-document-sheet" id="paper-sheet">
            <div id="starter-chips" class="gdoc-starter-chips-container">
              <button class="gdoc-canvas-chip" id="chip-meeting" type="button">
                <span class="material-symbols-outlined">description</span>
                Meeting notes
              </button>
              <button class="gdoc-canvas-chip" id="chip-email" type="button">
                <span class="material-symbols-outlined">mail</span>
                Email draft
              </button>
              <button class="gdoc-canvas-chip" id="chip-more" type="button">
                <span class="material-symbols-outlined">assignment</span>
                More
              </button>
            </div>

            <div id="editor" class="gdoc-editor-surface" contenteditable="true" spellcheck="true"></div>
          </div>
        </div>
      </div>

      <div id="companion-rail" class="gdoc-companion-rail">
        <button id="btn-companion-calendar" class="gdoc-companion-btn" title="Google Calendar" type="button">
          <span class="material-symbols-outlined" style="font-size: 20px; color: #1A73E8;">calendar_month</span>
        </button>
        <button id="btn-companion-keep" class="gdoc-companion-btn" title="Google Keep" type="button">
          <span class="material-symbols-outlined" style="font-size: 20px; color: #FBBC04;">lightbulb</span>
        </button>
        <button id="btn-companion-tasks" class="gdoc-companion-btn" title="Google Tasks" type="button">
          <span class="material-symbols-outlined" style="font-size: 20px; color: #1A73E8;">task_alt</span>
        </button>
        <button id="btn-companion-contacts" class="gdoc-companion-btn" title="Google Contacts" type="button">
          <span class="material-symbols-outlined" style="font-size: 20px; color: #1A73E8;">contacts</span>
        </button>
        <button id="btn-companion-maps" class="gdoc-companion-btn" title="Google Maps" type="button">
          <span class="material-symbols-outlined" style="font-size: 20px; color: #EA4335;">location_on</span>
        </button>

        <div class="gdoc-companion-divider"></div>

        <button id="btn-companion-addons" class="gdoc-companion-btn" title="Get add-ons" type="button">
          <span class="material-symbols-outlined" style="font-size: 20px; color: #444746;">add</span>
        </button>
      </div>

      <button id="companion-toggle-btn" class="gdoc-companion-toggle-btn" title="Hide side panel" type="button">
        <span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span>
      </button>
    </div>

    <div id="styles-popup" class="gdoc-styles-popup">
      <div class="gdoc-style-opt" data-heading="normal">
        <span style="font-size: 13px; font-weight: 400;">Normal text</span>
        <span style="color: #5f6368; font-size: 11px;">11 pt</span>
      </div>
      <div class="gdoc-dropdown-divider"></div>
      <div class="gdoc-style-opt" data-heading="title">
        <span style="font-size: 20px; font-weight: 400;">Title</span>
        <span style="color: #5f6368; font-size: 11px;">26 pt</span>
      </div>
      <div class="gdoc-style-opt" data-heading="subtitle">
        <span style="font-size: 15px; font-weight: 400; color: #5f6368;">Subtitle</span>
        <span style="color: #5f6368; font-size: 11px;">15 pt</span>
      </div>
      <div class="gdoc-dropdown-divider"></div>
      <div class="gdoc-style-opt" data-heading="h1">
        <span style="font-size: 18px; font-weight: bold;">Heading 1</span>
        <span style="color: #5f6368; font-size: 11px;">20 pt</span>
      </div>
      <div class="gdoc-style-opt" data-heading="h2">
        <span style="font-size: 16px; font-weight: bold;">Heading 2</span>
        <span style="color: #5f6368; font-size: 11px;">16 pt</span>
      </div>
      <div class="gdoc-style-opt" data-heading="h3">
        <span style="font-size: 14px; font-weight: bold;">Heading 3</span>
        <span style="color: #5f6368; font-size: 11px;">14 pt</span>
      </div>
    </div>

    <div id="font-popup" class="gdoc-dropdown-menu" style="min-width: 150px;">
      <div class="gdoc-dropdown-item" data-font="Arial" style="font-family: Arial;">Arial</div>
      <div class="gdoc-dropdown-item" data-font="Times New Roman" style="font-family: 'Times New Roman';">Times New Roman</div>
      <div class="gdoc-dropdown-item" data-font="Georgia" style="font-family: Georgia;">Georgia</div>
      <div class="gdoc-dropdown-item" data-font="Courier New" style="font-family: 'Courier New';">Courier New</div>
      <div class="gdoc-dropdown-item" data-font="Comic Sans MS" style="font-family: 'Comic Sans MS';">Comic Sans MS</div>
      <div class="gdoc-dropdown-item" data-font="Trebuchet MS" style="font-family: 'Trebuchet MS';">Trebuchet MS</div>
      <div class="gdoc-dropdown-item" data-font="Verdana" style="font-family: Verdana;">Verdana</div>
    </div>

    <div id="zoom-popup" class="gdoc-dropdown-menu" style="min-width: 100px;">
      <div class="gdoc-dropdown-item" data-zoom="50">50%</div>
      <div class="gdoc-dropdown-item" data-zoom="75">75%</div>
      <div class="gdoc-dropdown-item" data-zoom="90">90%</div>
      <div class="gdoc-dropdown-item" data-zoom="100">100%</div>
      <div class="gdoc-dropdown-item" data-zoom="125">125%</div>
      <div class="gdoc-dropdown-item" data-zoom="150">150%</div>
    </div>

    <div id="editing-mode-popup" class="gdoc-dropdown-menu" style="min-width: 140px;">
      <div class="gdoc-dropdown-item" data-mode="editing">Editing<span style="font-size: 11px; color: #5f6368;">Edit directly</span></div>
      <div class="gdoc-dropdown-item" data-mode="suggesting">Suggesting<span style="font-size: 11px; color: #5f6368;">Edits become notes</span></div>
      <div class="gdoc-dropdown-item" data-mode="viewing">Viewing<span style="font-size: 11px; color: #5f6368;">Read-only</span></div>
    </div>

    <div id="text-color-palette" class="gdoc-color-palette-pop">
      <div style="font-size: 11px; font-weight: 500; color: #5f6368; margin-bottom: 6px;">CUSTOM & PALETTE</div>
      <div class="gdoc-palette-grid" id="color-palette-grid"></div>
    </div>

    <div id="highlight-palette" class="gdoc-color-palette-pop">
      <div style="font-size: 11px; font-weight: 500; color: #5f6368; margin-bottom: 6px;">HIGHLIGHT COLORS</div>
      <div class="gdoc-palette-grid" id="highlight-palette-grid"></div>
      <div style="margin-top: 8px;">
        <button id="btn-no-highlight" style="width: 100%; border: none; background: #f1f3f4; padding: 6px; border-radius: 4px; font-size: 12px; cursor: pointer;">None</button>
      </div>
    </div>

    <div id="menu-file-pop" class="gdoc-dropdown-menu">
      <div class="gdoc-dropdown-item" id="menu-file-new">New document</div>
      <div class="gdoc-dropdown-item" id="menu-file-download-txt">Download (.txt)</div>
      <div class="gdoc-dropdown-item" id="menu-file-download-html">Download (.html)</div>
      <div class="gdoc-dropdown-divider"></div>
      <div class="gdoc-dropdown-item" id="menu-file-print">Print<span class="gdoc-dropdown-item-shortcut">Ctrl+P</span></div>
    </div>

    <div id="menu-edit-pop" class="gdoc-dropdown-menu">
      <div class="gdoc-dropdown-item" id="menu-edit-undo">Undo<span class="gdoc-dropdown-item-shortcut">Ctrl+Z</span></div>
      <div class="gdoc-dropdown-item" id="menu-edit-redo">Redo<span class="gdoc-dropdown-item-shortcut">Ctrl+Y</span></div>
      <div class="gdoc-dropdown-divider"></div>
      <div class="gdoc-dropdown-item" id="menu-edit-select-all">Select all<span class="gdoc-dropdown-item-shortcut">Ctrl+A</span></div>
    </div>

    <div id="menu-view-pop" class="gdoc-dropdown-menu">
      <div class="gdoc-dropdown-item" id="menu-view-fullscreen">Full screen</div>
      <div class="gdoc-dropdown-item" id="menu-view-sidebar">Toggle document tabs</div>
      <div class="gdoc-dropdown-item" id="menu-view-companion">Toggle side panel</div>
    </div>

    <div id="menu-insert-pop" class="gdoc-dropdown-menu">
      <div class="gdoc-dropdown-item" id="menu-insert-link">Link<span class="gdoc-dropdown-item-shortcut">Ctrl+K</span></div>
      <div class="gdoc-dropdown-item" id="menu-insert-image-item">Image</div>
      <div class="gdoc-dropdown-item" id="menu-insert-hr">Horizontal line</div>
      <div class="gdoc-dropdown-divider"></div>
      <div class="gdoc-dropdown-item" id="menu-insert-meeting">Meeting notes template</div>
      <div class="gdoc-dropdown-item" id="menu-insert-email">Email draft template</div>
    </div>

    <div id="menu-format-pop" class="gdoc-dropdown-menu">
      <div class="gdoc-dropdown-item" id="menu-format-bold">Bold<span class="gdoc-dropdown-item-shortcut">Ctrl+B</span></div>
      <div class="gdoc-dropdown-item" id="menu-format-italic">Italic<span class="gdoc-dropdown-item-shortcut">Ctrl+I</span></div>
      <div class="gdoc-dropdown-item" id="menu-format-underline">Underline<span class="gdoc-dropdown-item-shortcut">Ctrl+U</span></div>
      <div class="gdoc-dropdown-item" id="menu-format-strike">Strikethrough</div>
      <div class="gdoc-dropdown-divider"></div>
      <div class="gdoc-dropdown-item" id="menu-format-clear">Clear formatting<span class="gdoc-dropdown-item-shortcut">Ctrl+\</span></div>
    </div>

    <div id="menu-tools-pop" class="gdoc-dropdown-menu">
      <div class="gdoc-dropdown-item" id="menu-tools-wordcount">Word count</div>
      <div class="gdoc-dropdown-item" id="menu-tools-meet">Start Google Meet call</div>
      <div class="gdoc-dropdown-item" id="menu-tools-gemini">Ask Gemini AI</div>
    </div>

    <div id="menu-extensions-pop" class="gdoc-dropdown-menu">
      <div class="gdoc-dropdown-item" id="menu-ext-addons">Add-ons marketplace</div>
      <div class="gdoc-dropdown-item" id="menu-ext-calendar">Open Google Calendar</div>
      <div class="gdoc-dropdown-item" id="menu-ext-keep">Open Google Keep</div>
    </div>

    <div id="menu-help-pop" class="gdoc-dropdown-menu">
      <div class="gdoc-dropdown-item" id="menu-help-shortcuts">Keyboard shortcuts</div>
      <div class="gdoc-dropdown-item" id="menu-help-about">About DocSync Distributed Engine</div>
    </div>

    <div id="sidebar-tab-menu" class="gdoc-dropdown-menu" style="position: fixed; display: none; z-index: 25000; min-width: 170px; background: #ffffff; border: 1px solid #dadce0; border-radius: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); padding: 4px 0;">
      <div class="gdoc-dropdown-item" id="sidebar-menu-newtab" style="padding: 8px 14px; font-size: 13px; color: #202124; display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <span class="material-symbols-outlined" style="font-size: 18px;">open_in_new</span>
        <span>Open in new tab</span>
      </div>
      <div class="gdoc-dropdown-item" id="sidebar-menu-copy" style="padding: 8px 14px; font-size: 13px; color: #202124; display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <span class="material-symbols-outlined" style="font-size: 18px;">link</span>
        <span>Copy link</span>
      </div>
      <div class="gdoc-dropdown-item" id="sidebar-menu-delete" style="padding: 8px 14px; font-size: 13px; color: #d93025; display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <span class="material-symbols-outlined" style="font-size: 18px; color: #d93025;">delete</span>
        <span>Delete document</span>
      </div>
    </div>

    <div id="doc-delete-modal" class="gdoc-modal-overlay" style="display: none;">
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
        <div style="font-size: 14px; color: #3c4043; line-height: 1.5;" id="doc-delete-statement">
          Are you sure you want to permanently delete this document? This action will remove the document from your library and delete all replicas. Collaborators will lose access immediately. This cannot be undone.
        </div>
        <div class="gdoc-modal-actions">
          <button id="doc-delete-cancel" class="gdoc-btn-cancel" type="button">Cancel</button>
          <button id="doc-delete-confirm" class="gdoc-btn-primary" type="button" style="background: #d93025; color: #ffffff; border-color: #d93025;">Delete permanently</button>
        </div>
      </div>
    </div>

    <div id="link-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card">
        <h3 class="gdoc-modal-title">Insert link</h3>
        <div>
          <label style="font-size: 12px; color: #444746; display: block; margin-bottom: 4px;">Text</label>
          <input id="link-text-input" class="gdoc-input-field" placeholder="Text to display" />
        </div>
        <div>
          <label style="font-size: 12px; color: #444746; display: block; margin-bottom: 4px;">Link</label>
          <input id="link-url-input" class="gdoc-input-field" placeholder="Paste or search a link (https://...)" />
        </div>
        <div class="gdoc-modal-actions">
          <button id="link-modal-cancel" class="gdoc-btn-cancel" type="button">Cancel</button>
          <button id="link-modal-apply" class="gdoc-btn-primary" type="button">Apply</button>
        </div>
      </div>
    </div>

    <div id="wordcount-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card" style="width: 360px;">
        <h3 class="gdoc-modal-title">Word count</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #1f1f1f;">
          <div style="display: flex; justify-content: space-between;"><span>Pages</span><b id="wc-pages">1</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Words</span><b id="wc-words">0</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Characters</span><b id="wc-chars">0</b></div>
          <div style="display: flex; justify-content: space-between;"><span>Characters excluding spaces</span><b id="wc-chars-nospace">0</b></div>
        </div>
        <div class="gdoc-modal-actions">
          <button id="wordcount-close" class="gdoc-btn-primary" type="button">OK</button>
        </div>
      </div>
    </div>

    <div id="share-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 class="gdoc-modal-title">Share with people</h3>
          <span class="material-symbols-outlined" style="font-size: 24px; color: #5f6368;">share</span>
        </div>
        <div style="position: relative;">
          <label style="font-size: 12px; color: #444746; display: block; margin-bottom: 4px;">Collaborator Username</label>
          <input id="share-username-input" class="gdoc-input-field" placeholder="Enter username to invite" autocomplete="off" />
          <div id="share-user-suggestions" class="gdoc-autocomplete-dropdown"></div>
        </div>
        <div style="font-size: 12px; color: #5f6368;">Anyone invited can edit this document in real-time.</div>
        <div class="gdoc-modal-actions">
          <button id="share-modal-cancel" class="gdoc-btn-cancel" type="button">Cancel</button>
          <button id="share-modal-send" class="gdoc-btn-primary" type="button">Done</button>
        </div>
      </div>
    </div>

    <div id="comments-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card" style="width: 440px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 class="gdoc-modal-title">Document comments</h3>
          <span class="material-symbols-outlined" style="font-size: 24px; color: #5f6368;">comment</span>
        </div>
        <div id="comments-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
          <div style="font-size: 13px; color: #5f6368; font-style: italic;">No comments yet. Add the first comment below.</div>
        </div>
        <div>
          <textarea id="comment-text-input" class="gdoc-input-field" rows="3" placeholder="Add a comment or mention others with @" style="resize: vertical;"></textarea>
        </div>
        <div class="gdoc-modal-actions">
          <button id="comments-modal-close" class="gdoc-btn-cancel" type="button">Close</button>
          <button id="comments-modal-post" class="gdoc-btn-primary" type="button">Comment</button>
        </div>
      </div>
    </div>

    <div id="gemini-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card" style="width: 480px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-outlined" style="color: #9B72CB; font-size: 24px;">auto_awesome</span>
          <h3 class="gdoc-modal-title">Help me write with Gemini</h3>
        </div>
        <p style="font-size: 13px; color: #444746; margin: 0;">Select an AI action or enter a custom prompt to generate content directly into your document:</p>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <button class="gdoc-canvas-chip" id="gemini-prompt-summary" type="button" style="justify-content: flex-start;">
            <span class="material-symbols-outlined">summarize</span> Summarize this document
          </button>
          <button class="gdoc-canvas-chip" id="gemini-prompt-professional" type="button" style="justify-content: flex-start;">
            <span class="material-symbols-outlined">style</span> Make tone more formal and professional
          </button>
          <button class="gdoc-canvas-chip" id="gemini-prompt-action-items" type="button" style="justify-content: flex-start;">
            <span class="material-symbols-outlined">checklist</span> Extract action items and to-do list
          </button>
        </div>
        <div>
          <input id="gemini-custom-input" class="gdoc-input-field" placeholder="Or type what you want to write..." />
        </div>
        <div class="gdoc-modal-actions">
          <button id="gemini-modal-close" class="gdoc-btn-cancel" type="button">Cancel</button>
          <button id="gemini-modal-insert" class="gdoc-btn-primary" type="button">Insert</button>
        </div>
      </div>
    </div>

    <div id="move-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card" style="width: 380px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-outlined" style="color: #1a73e8; font-size: 24px;">drive_file_move</span>
          <h3 class="gdoc-modal-title">Move to folder</h3>
        </div>
        <div style="font-size: 13px; color: #1f1f1f; display: flex; flex-direction: column; gap: 8px;">
          <div><b>Current location:</b> My Drive / Documents</div>
          <div style="border: 1px solid #dadce0; border-radius: 6px; padding: 10px; max-height: 150px; overflow-y: auto;">
            <div style="padding: 6px; display: flex; align-items: center; gap: 8px; cursor: pointer; border-radius: 4px;" class="folder-option active"><span class="material-symbols-outlined" style="color: #5f6368;">folder</span> Projects</div>
            <div style="padding: 6px; display: flex; align-items: center; gap: 8px; cursor: pointer; border-radius: 4px;" class="folder-option"><span class="material-symbols-outlined" style="color: #5f6368;">folder</span> Team Notes</div>
            <div style="padding: 6px; display: flex; align-items: center; gap: 8px; cursor: pointer; border-radius: 4px;" class="folder-option"><span class="material-symbols-outlined" style="color: #5f6368;">folder</span> Archive</div>
          </div>
        </div>
        <div class="gdoc-modal-actions">
          <button id="move-modal-cancel" class="gdoc-btn-cancel" type="button">Cancel</button>
          <button id="move-modal-apply" class="gdoc-btn-primary" type="button">Move here</button>
        </div>
      </div>
    </div>

    <div id="search-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card" style="width: 440px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-outlined" style="color: #5f6368; font-size: 22px;">search</span>
          <h3 class="gdoc-modal-title">Search menus and commands</h3>
        </div>
        <input id="search-menus-input" class="gdoc-input-field" placeholder="Type a command (e.g. print, link, image, font, word count)..." />
        <div id="search-menus-results" style="display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto;"></div>
        <div class="gdoc-modal-actions">
          <button id="search-modal-close" class="gdoc-btn-cancel" type="button">Close</button>
        </div>
      </div>
    </div>

    <div id="line-spacing-popup" class="gdoc-dropdown-menu" style="min-width: 140px;">
      <div class="gdoc-dropdown-item" data-spacing="1.0">Single (1.0)</div>
      <div class="gdoc-dropdown-item" data-spacing="1.15">1.15</div>
      <div class="gdoc-dropdown-item" data-spacing="1.5">1.5</div>
      <div class="gdoc-dropdown-item" data-spacing="2.0">Double (2.0)</div>
    </div>

    <div id="image-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card">
        <h3 class="gdoc-modal-title">Insert image</h3>
        <div>
          <label style="font-size: 12px; color: #444746; display: block; margin-bottom: 4px;">Image URL</label>
          <input id="image-url-input" class="gdoc-input-field" placeholder="Paste image link (https://...)" />
        </div>
        <div class="gdoc-modal-actions">
          <button id="image-modal-cancel" class="gdoc-btn-cancel" type="button">Cancel</button>
          <button id="image-modal-apply" class="gdoc-btn-primary" type="button">Insert</button>
        </div>
      </div>
    </div>

    <div id="shortcuts-modal" class="gdoc-modal-overlay">
      <div class="gdoc-modal-card" style="width: 440px;">
        <h3 class="gdoc-modal-title">Keyboard shortcuts</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #1f1f1f; max-height: 340px; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Bold</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+B / ⌘B</kbd></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Italic</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+I / ⌘I</kbd></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Underline</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+U / ⌘U</kbd></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Insert link</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+K / ⌘K</kbd></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Clear formatting</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+\ / ⌘\</kbd></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Undo</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+Z / ⌘Z</kbd></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Redo</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+Y / ⌘Y</kbd></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Select all</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+A / ⌘A</kbd></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f3f4;"><span>Print</span><kbd style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px;">Ctrl+P / ⌘P</kbd></div>
        </div>
        <div class="gdoc-modal-actions">
          <button id="shortcuts-modal-close" class="gdoc-btn-primary" type="button">Close</button>
        </div>
      </div>
    </div>

    <div id="user-popover" class="gdoc-user-popover">
      <div class="gdoc-user-popover-avatar">${userInitial}</div>
      <div style="font-weight: 500; font-size: 15px; color: #1f1f1f;">${username}</div>
      <div style="font-size: 12px; color: #5f6368;">Collaborator</div>
      <div class="gdoc-dropdown-divider" style="width: 100%;"></div>
      <button id="btn-logout" style="width: 100%; padding: 8px 16px; border: 1px solid #dadce0; border-radius: 20px; background: #ffffff; cursor: pointer; font-size: 13px; font-weight: 500; color: #3c4043; transition: background 0.15s;">Sign out</button>
    </div>

    <div id="gdoc-global-toast" class="gdoc-toast">
      <span class="material-symbols-outlined" style="color: #81c995; font-size: 18px;">check_circle</span>
      <span id="toast-message">Notification</span>
    </div>
  `;
}
//# sourceMappingURL=editorView.template.js.map