import { CRDTDocument, Item } from './crdt/crdt-engine.js';
const clientId = 'UserA';
const doc = new CRDTDocument();
const textarea = document.getElementById('editor');
let previousValue = '';
function getVisibleItemAt(index) {
    if (index < 0) {
        return null;
    }
    let currentIndex = 0;
    let current = doc.head;
    while (current !== null) {
        if (!current.deleted) {
            if (currentIndex === index) {
                return current;
            }
            currentIndex++;
        }
        current = current.right;
    }
    return null;
}
textarea.addEventListener('input', () => {
    const newValue = textarea.value;
    const cursorPosition = textarea.selectionStart;
    if (newValue.length > previousValue.length) {
        const char = newValue.charAt(cursorPosition - 1);
        const anchor = getVisibleItemAt(cursorPosition - 2);
        const clock = doc.tick();
        const anchorClientId = anchor ? anchor.clientId : null;
        const anchorClock = anchor ? anchor.clock : null;
        doc.insert(clientId, clock, anchorClientId, anchorClock, char);
        const operation = {
            type: 'insert',
            clientId: clientId,
            clock: clock,
            anchorClientId: anchorClientId,
            anchorClock: anchorClock,
            value: char
        };
        console.log(operation);
    }
    else if (newValue.length < previousValue.length) {
        const item = getVisibleItemAt(cursorPosition);
        if (item) {
            doc.tick();
            doc.delete(item.clientId, item.clock);
            const operation = {
                type: 'delete',
                clientId: item.clientId,
                clock: item.clock
            };
            console.log(operation);
        }
    }
    const renderedText = doc.renderText();
    textarea.value = renderedText;
    textarea.setSelectionRange(cursorPosition, cursorPosition);
    previousValue = renderedText;
});
//# sourceMappingURL=editor.js.map