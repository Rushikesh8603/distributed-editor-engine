import { state } from './state.js';
import { renderAuthView } from './views/authView.js';
import { renderEditorView } from './views/editorView.js';
import { renderDashboardView } from './views/dashboardView.js';

function initRouter() {
  if (!state.isAuthenticated()) {
    renderAuthView(() => {
      initRouter();
    });
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const docId = urlParams.get('docId');

  if (docId) {
    renderEditorView(() => {
      initRouter();
    });
  } else {
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





