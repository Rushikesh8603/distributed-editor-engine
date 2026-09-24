export class Item {
  public clientId: string;
  public clock: number;
  public val: string;
  public anchorClientId: string | null;
  public anchorClock: number | null;
  public deleted: boolean;
  public left: Item | null;
  public right: Item | null;

  constructor(
    clientId: string,
    clock: number,
    val: string,
    anchorClientId: string | null = null,
    anchorClock: number | null = null,
    deleted: boolean = false,
    left: Item | null = null,
    right: Item | null = null
  ) {
    this.clientId = clientId;
    this.clock = clock;
    this.val = val;
    this.anchorClientId = anchorClientId;
    this.anchorClock = anchorClock;
    this.deleted = deleted;
    this.left = left;
    this.right = right;
  }
}

export class CRDTDocument {
  public structStore: Map<string, Item[]> = new Map();
  public head: Item | null = null;
  public tail: Item | null = null;
  public localClock: number = 0;

  public tick(): number {
    this.localClock++;
    return this.localClock;
  }

  public findItemByClock(clientId: string, targetClock: number): Item | null {
    const items = this.structStore.get(clientId);
    if (!items || items.length === 0) return null;
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const item = items[mid];
      if (!item) break;
      if (item.clock === targetClock) return item;
      if (item.clock < targetClock) low = mid + 1;
      else high = mid - 1;
    }
    return null;
  }

  public insert(clientId: string, clock: number, anchorClientId: string | null, anchorClock: number | null, value: string): Item {
    const existing = this.findItemByClock(clientId, clock);
    if (existing) return existing;

    this.localClock = Math.max(this.localClock, clock);

    let anchor: Item | null = null;
    if (anchorClientId !== null && anchorClock !== null) {
      anchor = this.findItemByClock(anchorClientId, anchorClock);
      if (!anchor) throw new Error(`Anchor not found`);
    }

    const newItem = new Item(clientId, clock, value, anchorClientId, anchorClock);
    let curr = anchor ? anchor.right : this.head;

    while (curr !== null) {
      const isHigherClock = curr.clock > newItem.clock;
      const isAlphabeticalWin = curr.clock === newItem.clock && curr.clientId > newItem.clientId;
      if (isHigherClock || isAlphabeticalWin) curr = curr.right;
      else break;
    }

    const prev = curr ? curr.left : this.tail;
    newItem.left = prev;
    newItem.right = curr;

    if (prev !== null) prev.right = newItem;
    else this.head = newItem;

    if (curr !== null) curr.left = newItem;
    else this.tail = newItem;

    this.addToStructStore(newItem);
    return newItem;
  }

  public delete(clientId: string, clock: number): boolean {
    const item = this.findItemByClock(clientId, clock);
    if (!item) return false;
    this.localClock = Math.max(this.localClock, clock);
    item.deleted = true;
    return true;
  }

  public renderText(): string {
    const parts: string[] = [];
    let current = this.head;
    while (current !== null) {
      if (!current.deleted) parts.push(current.val);
      current = current.right;
    }
    return parts.join('');
  }

  private addToStructStore(item: Item): void {
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
      if (!midItem) break;
      if (midItem.clock >= item.clock) {
        insertIdx = mid;
        high = mid - 1;
      } else low = mid + 1;
    }
    clientItems.splice(insertIdx, 0, item);
  }
}
