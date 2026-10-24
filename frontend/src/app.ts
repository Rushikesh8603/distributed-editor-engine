import { state } from './state.js';
import { renderAuthView } from './views/authView.js';
import { renderEditorView } from './views/editorView.js';
import { renderDashboardView } from './views/dashboardView.js';

function initRouter() {
  if (!state.isAuthenticated()) {
    document.title = 'Sign In — DocSync Distributed Engine';
    renderAuthView(() => {
      initRouter();
    });
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const docId = urlParams.get('docId');

  if (docId) {
    document.title = 'Document — DocSync Distributed Engine';
    renderEditorView(() => {
      initRouter();
    });
  } else {
    document.title = 'DocSync — Distributed Collaborative Workspace';
    renderDashboardView(
      () => {
        initRouter();
      },
      (selectedDocId: string) => {
        window.history.pushState({}, '', `/?docId=${selectedDocId}`);
        initRouter();
      }
    );
  }
}




window.addEventListener('popstate', () => {
  initRouter();
});

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});





