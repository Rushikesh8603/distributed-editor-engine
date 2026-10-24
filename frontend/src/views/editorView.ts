import { state } from '../state.js';
import { CRDTDocument, Item } from '../crdt-engine.js';

export function renderEditorView(onLogout: () => void) {
  const container = document.getElementById('app');
  if (!container) return;

  const username = state.getUsername() || 'Anonymous';
  const userInitial = username.charAt(0).toUpperCase();

  container.innerHTML = `
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
      <div class="gdoc-dropdown-item" id="menu-help-about">About Google Docs Clone</div>
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

  function showToast(msg: string) {
    const toast = document.getElementById('gdoc-global-toast');
    const toastMsg = document.getElementById('toast-message');
    if (toast && toastMsg) {
      toastMsg.textContent = msg;
      toast.style.display = 'flex';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 2500);
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

  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-menus-input') as HTMLInputElement;
  const searchResults = document.getElementById('search-menus-results');

  const menuCommands = [
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

  function updateDocumentOutline() {
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

  function getFirstTextOrLine(line: Element): { node: Node; offset: number } {
    let found: { node: Node; offset: number } | null = null;
    function walk(n: Node): boolean {
      if (n.nodeType === Node.TEXT_NODE) {
        found = { node: n, offset: 0 };
        return true;
      }
      for (let i = 0; i < n.childNodes.length; i++) {
        const child = n.childNodes[i];
        if (child && walk(child)) return true;
      }
      return false;
    }
    walk(line);
    if (found) return found;
    return { node: line, offset: 0 };
  }

  function getCharOffsetOfNode(targetNode: Node, targetOffset: number): number {
    const lines = Array.from(editorDiv.querySelectorAll('.gdoc-line'));
    if (lines.length === 0) {
      return 0;
    }
    let offset = 0;
    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      if (!line) continue;
      if (l > 0) {
        offset++;
      }
      if (line === targetNode) {
        let childLen = 0;
        for (let i = 0; i < targetOffset && i < line.childNodes.length; i++) {
          const child = line.childNodes[i];
          if (!child) continue;
          if (child.nodeType === Node.TEXT_NODE) {
            childLen += (child.textContent || '').length;
          } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName === 'IMG') {
            childLen += 1;
          } else {
            childLen += (child.textContent || '').length;
          }
        }
        return offset + childLen;
      }
      if (line.contains(targetNode)) {
        let insideOffset = 0;
        function walkLine(n: Node): boolean {
          if (n === targetNode) {
            if (n.nodeType === Node.TEXT_NODE) {
              insideOffset += targetOffset;
            } else {
              for (let i = 0; i < targetOffset && i < n.childNodes.length; i++) {
                const c = n.childNodes[i];
                if (!c) continue;
                if (c.nodeType === Node.TEXT_NODE) insideOffset += (c.textContent || '').length;
                else if (c.nodeType === Node.ELEMENT_NODE && (c as Element).tagName === 'IMG') insideOffset += 1;
                else insideOffset += (c.textContent || '').length;
              }
            }
            return true;
          }
          if (n.nodeType === Node.TEXT_NODE) {
            insideOffset += (n.textContent || '').length;
          } else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'IMG') {
            insideOffset += 1;
          } else {
            for (let i = 0; i < n.childNodes.length; i++) {
              const child = n.childNodes[i];
              if (child && walkLine(child)) return true;
            }
          }
          return false;
        }
        walkLine(line);
        return offset + insideOffset;
      }
      let lineTextLen = 0;
      function countLen(n: Node) {
        if (n.nodeType === Node.TEXT_NODE) lineTextLen += (n.textContent || '').length;
        else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'IMG') lineTextLen += 1;
        else {
          for (let i = 0; i < n.childNodes.length; i++) {
            const child = n.childNodes[i];
            if (child) countLen(child);
          }
        }
      }
      countLen(line);
      offset += lineTextLen;
    }
    return offset;
  }

  function getNodeAndOffsetAtChar(pos: number): { node: Node; offset: number } {
    const lines = Array.from(editorDiv.querySelectorAll('.gdoc-line'));
    if (lines.length === 0) {
      return { node: editorDiv, offset: 0 };
    }
    let remaining = pos;
    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      if (!line) continue;
      if (l > 0) {
        if (remaining === 0) {
          return getFirstTextOrLine(line);
        }
        remaining--;
      }

      let lineLen = 0;
      function getLen(n: Node) {
        if (n.nodeType === Node.TEXT_NODE) lineLen += (n.textContent || '').length;
        else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'IMG') lineLen += 1;
        else {
          for (let i = 0; i < n.childNodes.length; i++) {
            const child = n.childNodes[i];
            if (child) getLen(child);
          }
        }
      }
      getLen(line);

      if (remaining <= lineLen || l === lines.length - 1) {
        let insideRem = remaining;
        let target: { node: Node; offset: number } | null = null;
        const currentLine: Element = line;
        function findInLine(n: Node): boolean {
          if (n.nodeType === Node.TEXT_NODE) {
            const len = (n.textContent || '').length;
            if (insideRem <= len) {
              target = { node: n, offset: Math.max(0, insideRem) };
              return true;
            }
            insideRem -= len;
          } else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'IMG') {
            if (insideRem <= 1) {
              const p: Node = n.parentNode ? n.parentNode : currentLine;
              const idx = Array.prototype.indexOf.call(p.childNodes, n);
              target = { node: p, offset: idx + insideRem };
              return true;
            }
            insideRem -= 1;
          } else if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'BR') {
            target = { node: currentLine, offset: 0 };
            return true;
          } else {
            for (let i = 0; i < n.childNodes.length; i++) {
              const child = n.childNodes[i];
              if (child && findInLine(child)) return true;
            }
          }
          return false;
        }
        findInLine(currentLine);
        if (target) return target;
        return getFirstTextOrLine(currentLine);
      }
      remaining -= lineLen;
    }
    return { node: editorDiv, offset: editorDiv.childNodes.length };
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

  function getEditorText(): string {
    const lines = editorDiv.querySelectorAll('.gdoc-line');
    if (lines.length === 0) {
      return (editorDiv.textContent || '').replace(/\u00A0/g, ' ');
    }
    const result: string[] = [];
    lines.forEach((line) => {
      let text = '';
      function walkText(n: Node) {
        if (n.nodeType === Node.TEXT_NODE) {
          text += (n.textContent || '').replace(/\u00A0/g, ' ');
        } else if (n.nodeType === Node.ELEMENT_NODE) {
          const el = n as HTMLElement;
          if (el.tagName === 'IMG') {
            text += '\uFFFC';
          } else {
            for (let i = 0; i < n.childNodes.length; i++) {
              const child = n.childNodes[i];
              if (child) walkText(child);
            }
          }
        }
      }
      walkText(line);
      result.push(text);
    });
    return result.join('\n');
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

  function closeAllDropdowns() {
    const dropIds = [
      'styles-popup', 'font-popup', 'zoom-popup', 'editing-mode-popup',
      'text-color-palette', 'highlight-palette', 'menu-file-pop', 'menu-edit-pop',
      'menu-view-pop', 'menu-insert-pop', 'menu-format-pop', 'menu-tools-pop',
      'menu-extensions-pop', 'menu-help-pop', 'user-popover', 'line-spacing-popup',
      'share-user-suggestions'
    ];
    for (const id of dropIds) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    }
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
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

  const toolButtons = [
    'btn-bold', 'btn-italic', 'btn-underline', 'styles-dropdown-btn',
    'font-dropdown-btn', 'size-minus', 'size-plus', 'btn-color-pick',
    'btn-highlight-pick', 'btn-link', 'btn-clear-format', 'btn-align-left',
    'btn-align-center', 'btn-align-right', 'zoom-dropdown-btn',
    'btn-checklist', 'btn-bullet-list', 'btn-number-list', 'btn-insert-image',
    'btn-line-spacing', 'btn-indent-dec', 'btn-indent-inc', 'btn-paint-format',
    'btn-editing-mode'
  ];

  for (const btnId of toolButtons) {
    const el = document.getElementById(btnId);
    el?.addEventListener('mousedown', (e) => {
      e.preventDefault();
      updateStoredSelection();
    });
  }

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
    alert('Google Docs Material 3 Clone\nBuilt with CRDT real-time multi-user synchronization engine.');
  });

  document.getElementById('btn-version-history')?.addEventListener('click', () => {
    alert("Version history: Current document is automatically synced and backed up in real time with version timestamps.");
  });

  const standardColors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c1c', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1155cc', '#0b5394', '#351c75', '#741b47'
  ];

  const colorGrid = document.getElementById('color-palette-grid');
  if (colorGrid) {
    for (const hex of standardColors) {
      const swatch = document.createElement('div');
      swatch.className = 'gdoc-palette-swatch';
      swatch.style.backgroundColor = hex;
      swatch.addEventListener('click', () => {
        pendingAttributes.color = hex;
        editorDiv.style.caretColor = hex;
        const bar = document.getElementById('text-color-bar');
        if (bar) bar.style.backgroundColor = hex;
        if (savedSelection.start < savedSelection.end) {
          applyFormatToSelection({ color: hex });
        }
        closeAllDropdowns();
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
        pendingAttributes.background = hex;
        const bar = document.getElementById('highlight-color-bar');
        if (bar) bar.style.backgroundColor = hex;
        if (savedSelection.start < savedSelection.end) {
          applyFormatToSelection({ background: hex });
        }
        closeAllDropdowns();
      });
      highlightGrid.appendChild(swatch);
    }
  }

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
    document.execCommand('undo');
    closeAllDropdowns();
  });

  document.getElementById('menu-edit-redo')?.addEventListener('click', () => {
    document.execCommand('redo');
    closeAllDropdowns();
  });

  document.getElementById('tool-undo')?.addEventListener('click', () => {
    document.execCommand('undo');
  });

  document.getElementById('tool-redo')?.addEventListener('click', () => {
    document.execCommand('redo');
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

  const wordCountModal = document.getElementById('wordcount-modal');
  document.getElementById('menu-tools-wordcount')?.addEventListener('click', () => {
    closeAllDropdowns();
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

  document.getElementById('menu-tools-meet')?.addEventListener('click', () => {
    closeAllDropdowns();
    window.open('https://meet.google.com/new', '_blank');
  });

  document.getElementById('menu-tools-gemini')?.addEventListener('click', () => {
    closeAllDropdowns();
    if (geminiModal) geminiModal.style.display = 'flex';
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

  document.getElementById('wordcount-close')?.addEventListener('click', () => {
    if (wordCountModal) wordCountModal.style.display = 'none';
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

  function sanitizeDeltaChunks(chunks: Array<{ insert: string; attributes?: Record<string, any> }>): Array<{ insert: string; attributes?: Record<string, any> }> {
    return chunks.map(chunk => {
      let val = chunk.insert;
      if (typeof val === 'string' && val.includes('"id":')) {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed.value === 'string') val = parsed.value;
        } catch (e) {}
      }
      return { ...chunk, insert: val };
    });
  }

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
        requestPeerSync();
      }
    } catch (err) {}
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
            <div class="gdoc-sidebar-tab-item ${isActive ? 'active' : ''}" data-doc-id="${d._id}" title="${escapedTitle}">
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
                <span class="material-symbols-outlined" style="font-size: 18px; color: ${isActive ? '#041E49' : '#444746'};">description</span>
                <span class="gdoc-sidebar-tab-item-title">${escapedTitle}</span>
              </div>
              <span class="material-symbols-outlined" style="font-size: 16px; opacity: 0.7;">${isActive ? 'check' : ''}</span>
            </div>
          `;
        }).join('');

        myContainer.querySelectorAll('.gdoc-sidebar-tab-item').forEach((item) => {
          item.addEventListener('click', () => {
            const id = item.getAttribute('data-doc-id');
            const titleEl = item.querySelector('.gdoc-sidebar-tab-item-title');
            if (id) switchDocument(id, titleEl?.textContent || undefined);
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
              <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
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
    }

    doc = new CRDTDocument();
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

  function canApplyOperation(op: any): boolean {
    if (op.type === 'insert') {
      if (op.anchorClock === null || op.anchorClientId === null) return true;
      return doc.findItemByClock(op.anchorClientId, op.anchorClock) !== null;
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

    renderEditor();
    previousValue = getEditorText();
    triggerAutoSave();
  });
}
