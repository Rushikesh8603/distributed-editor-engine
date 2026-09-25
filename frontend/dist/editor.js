import { CRDTDocument } from './crdt-engine.js';
const clientId = "User_" + Math.floor(Math.random() * 1000);
const doc = new CRDTDocument();
const textarea = document.getElementById('editor');
let previousValue = "";
const ws = new WebSocket('ws://localhost:8080');
// ==========================================
// CAUSAL DELIVERY BUFFER & QUEUE LOGIC
// ==========================================
const pendingOps = [];
// Helper to check if an item exists by its clock and client ID
function findItemByClock(document, clientId, clock) {
    let current = document.head;
    while (current !== null) {
        if (current.clientId === clientId && current.clock === clock) {
            return current;
        }
        current = current.right;
    }
    return null;
}
// Helper to apply an operation safely and update the UI
function applyOperation(op) {
    if (op.type === 'insert') {
        doc.insert(op.clientId, op.clock, op.anchorClientId, op.anchorClock, op.value);
    }
    else if (op.type === 'delete') {
        doc.delete(op.clientId, op.clock);
    }
    const currentCursor = textarea.selectionStart;
    textarea.value = doc.renderText();
    previousValue = textarea.value;
    textarea.setSelectionRange(currentCursor, currentCursor);
}
// Helper to scan the waiting room whenever a new anchor arrives
function processPendingQueue() {
    let processedAny = false;
    for (let i = 0; i < pendingOps.length; i++) {
        const op = pendingOps[i];
        // Check if the anchor for this buffered operation now exists
        const anchorExists = op.anchorClock === null || findItemByClock(doc, op.anchorClientId, op.anchorClock);
        if (anchorExists) {
            // Remove it from the waiting room array
            pendingOps.splice(i, 1);
            i--; // Adjust index counter after removal
            // Apply the operation now that its prerequisite is met
            applyOperation(op);
            processedAny = true;
        }
    }
    // If we unlocked one operation, check again in case it unlocked another chain reaction
    if (processedAny) {
        processPendingQueue();
    }
}
function getVisibleItemAt(index) {
    if (index < 0)
        return null;
    let current = doc.head;
    let seen = 0;
    while (current !== null) {
        if (!current.deleted) {
            if (seen === index)
                return current;
            seen++;
        }
        current = current.right;
    }
    return null;
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
        ws.send(JSON.stringify({
            type: 'insert',
            clientId: clientId,
            clock: newClock,
            anchorClientId: anchorId,
            anchorClock: anchorClock,
            value: insertedChar
        }));
    }
    else if (lengthDiff < 0) {
        const deletedItem = getVisibleItemAt(cursorPosition);
        if (deletedItem) {
            doc.delete(deletedItem.clientId, deletedItem.clock);
            ws.send(JSON.stringify({
                type: 'delete',
                clientId: deletedItem.clientId,
                clock: deletedItem.clock
            }));
        }
    }
    textarea.value = doc.renderText();
    previousValue = textarea.value;
    textarea.setSelectionRange(cursorPosition, cursorPosition);
});
ws.addEventListener('message', (event) => {
    const op = JSON.parse(event.data);
    // Check if its anchor exists locally in our CRDT document
    const anchorExists = op.anchorClock === null || findItemByClock(doc, op.anchorClientId, op.anchorClock);
    if (anchorExists) {
        // Anchor is present! Process the operation immediately.
        applyOperation(op);
        // Check if this newly added item unlocks any waiting operations in the buffer
        processPendingQueue();
    }
    else {
        // Anchor is missing (out-of-order packet). Safely store it in the waiting room!
        console.warn(`Anchor missing for op from ${op.clientId} (clock: ${op.clock}). Holding in causal buffer.`);
        pendingOps.push(op);
    }
});
//# sourceMappingURL=editor.js.map