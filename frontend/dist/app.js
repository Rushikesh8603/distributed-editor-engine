import { state } from './state.js';
import { renderAuthView } from './views/authView.js';
import { renderEditorView } from './views/editorView.js';
function initRouter() {
    if (state.isAuthenticated()) {
        renderEditorView(() => {
            // Callback when user logs out
            initRouter();
        });
    }
    else {
        renderAuthView(() => {
            // Callback when user logs in successfully
            initRouter();
        });
    }
}
// Boot the application on initial load
document.addEventListener('DOMContentLoaded', () => {
    initRouter();
});
//# sourceMappingURL=app.js.map