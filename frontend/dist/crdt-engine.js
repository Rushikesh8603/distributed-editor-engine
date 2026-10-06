export class Item {
    clientId;
    clock;
    val;
    anchorClientId;
    anchorClock;
    deleted;
    left;
    right;
    attributes;
    constructor(clientId, clock, val, anchorClientId = null, anchorClock = null, deleted = false, left = null, right = null, attributes = {}) {
        this.clientId = clientId;
        this.clock = clock;
        this.val = val;
        this.anchorClientId = anchorClientId;
        this.anchorClock = anchorClock;
        this.deleted = deleted;
        this.left = left;
        this.right = right;
        this.attributes = attributes;
    }
}
export class CRDTDocument {
    structStore = new Map();
    head = null;
    tail = null;
    // ─── ADDED: LAMPORT CLOCK TRACKER ───
    // Tracks the highest clock seen by this device. 
    // Use `doc.tick()` when typing locally to get your next clock number.
    localClock = 0;
    tick() {
        this.localClock++;
        return this.localClock;
    }
    findItemByClock(clientId, targetClock) {
        const items = this.structStore.get(clientId);
        if (!items || items.length === 0) {
            return null;
        }
        let low = 0;
        let high = items.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const item = items[mid];
            if (!item) {
                break;
            }
            if (item.clock === targetClock) {
                return item;
            }
            else if (item.clock < targetClock) {
                low = mid + 1;
            }
            else {
                high = mid - 1;
            }
        }
        return null;
    }
    insert(clientId, clock, anchorClientId, anchorClock, value, attributes = {}) {
        const existing = this.findItemByClock(clientId, clock);
        if (existing) {
            return existing;
        }
        this.localClock = Math.max(this.localClock, clock);
        let anchor = null;
        if (anchorClientId !== null && anchorClock !== null) {
            anchor = this.findItemByClock(anchorClientId, anchorClock);
            if (!anchor) {
                throw new Error(`Anchor item not found: client "${anchorClientId}" at clock ${anchorClock}`);
            }
        }
        const newItem = new Item(clientId, clock, value, anchorClientId, anchorClock, false, null, null, attributes);
        // ─── BUG FIX 1: UNIFIED TIE-BREAKER LOOP ───
        // A null anchor just means the "virtual root" (beginning of the document).
        // We now start the traversal safely whether we are at the head or in the middle.
        let curr = anchor ? anchor.right : this.head;
        while (curr !== null) {
            const isHigherClock = curr.clock > newItem.clock;
            const isAlphabeticalWin = curr.clock === newItem.clock && curr.clientId > newItem.clientId;
            // If the item sitting here has a higher priority, skip past it!
            if (isHigherClock || isAlphabeticalWin) {
                curr = curr.right;
            }
            else {
                break; // We found the exact mathematical slot for our item.
            }
        }
        // ─── POINTER SPLICING ───
        // Because we simplified the loop above, the pointer rewiring 
        // is now much cleaner and handles empty documents perfectly.
        const prev = curr ? curr.left : this.tail;
        newItem.left = prev;
        newItem.right = curr;
        if (prev !== null) {
            prev.right = newItem;
        }
        else {
            this.head = newItem; // We inserted at the absolute beginning
        }
        if (curr !== null) {
            curr.left = newItem;
        }
        else {
            this.tail = newItem; // We inserted at the absolute end
        }
        this.addToStructStore(newItem);
        return newItem;
    }
    delete(clientId, clock) {
        const item = this.findItemByClock(clientId, clock);
        if (!item) {
            return false; // Caller should buffer and retry if delete arrives before insert
        }
        // Lamport clock sync on delete too
        this.localClock = Math.max(this.localClock, clock);
        item.deleted = true;
        return true;
    }
    renderText() {
        const parts = [];
        let current = this.head;
        while (current !== null) {
            if (!current.deleted) {
                parts.push(current.val);
            }
            current = current.right;
        }
        return parts.join('');
    }
    format(startClientId, startClock, endClientId, endClock, attributes) {
        const startItem = this.findItemByClock(startClientId, startClock);
        const endItem = this.findItemByClock(endClientId, endClock);
        if (!startItem || !endItem) {
            return;
        }
        let current = startItem;
        while (current !== null) {
            if (!current.deleted) {
                for (const key of Object.keys(attributes)) {
                    if (attributes[key] === null || attributes[key] === false) {
                        delete current.attributes[key];
                    }
                    else {
                        current.attributes[key] = attributes[key];
                    }
                }
            }
            if (current === endItem) {
                break;
            }
            current = current.right;
        }
    }
    renderHTML() {
        const parts = [];
        let current = this.head;
        while (current !== null) {
            if (!current.deleted) {
                let val = current.val;
                if (val === '\n') {
                    parts.push('<br>');
                    current = current.right;
                    continue;
                }
                if (val === ' ') {
                    val = '&nbsp;';
                }
                const attrs = current.attributes || {};
                const styles = [];
                if (attrs.bold)
                    styles.push('font-weight: bold;');
                if (attrs.italic)
                    styles.push('font-style: italic;');
                if (attrs.underline && attrs.strike)
                    styles.push('text-decoration: underline line-through;');
                else if (attrs.underline)
                    styles.push('text-decoration: underline;');
                else if (attrs.strike)
                    styles.push('text-decoration: line-through;');
                if (attrs.font)
                    styles.push(`font-family: ${attrs.font};`);
                if (attrs.size)
                    styles.push(`font-size: ${attrs.size};`);
                if (attrs.color)
                    styles.push(`color: ${attrs.color};`);
                if (attrs.background)
                    styles.push(`background-color: ${attrs.background};`);
                if (attrs.code)
                    styles.push('font-family: monospace; background: #f1f3f4; padding: 1px 4px; border-radius: 3px; font-size: 0.9em;');
                let formatted = val;
                if (styles.length > 0) {
                    formatted = `<span style="${styles.join(' ')}">${formatted}</span>`;
                }
                if (attrs.script === 'sub') {
                    formatted = `<sub>${formatted}</sub>`;
                }
                else if (attrs.script === 'super') {
                    formatted = `<sup>${formatted}</sup>`;
                }
                parts.push(formatted);
            }
            current = current.right;
        }
        return parts.join('');
    }
    renderDelta() {
        const delta = [];
        let current = this.head;
        while (current !== null) {
            if (!current.deleted) {
                const attrs = current.attributes || {};
                const last = delta[delta.length - 1];
                const sameAttrs = last && JSON.stringify(last.attributes || {}) === JSON.stringify(attrs);
                if (last && sameAttrs) {
                    last.insert += current.val;
                }
                else {
                    delta.push({
                        insert: current.val,
                        ...(Object.keys(attrs).length > 0 ? { attributes: { ...attrs } } : {})
                    });
                }
            }
            current = current.right;
        }
        return delta;
    }
    addToStructStore(item) {
        let clientItems = this.structStore.get(item.clientId);
        if (!clientItems) {
            clientItems = [];
            this.structStore.set(item.clientId, clientItems);
        }
        const lastItem = clientItems[clientItems.length - 1];
        if (!lastItem || lastItem.clock < item.clock) {
            clientItems.push(item);
            return;
        }
        let low = 0;
        let high = clientItems.length - 1;
        let insertIdx = clientItems.length;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midItem = clientItems[mid];
            if (!midItem)
                break;
            if (midItem.clock >= item.clock) {
                insertIdx = mid;
                high = mid - 1;
            }
            else {
                low = mid + 1;
            }
        }
        clientItems.splice(insertIdx, 0, item);
    }
}
//# sourceMappingURL=crdt-engine.js.map