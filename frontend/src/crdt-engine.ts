export class Item {
  public clientId: string;
  public clock: number;
  public val: string;
  public anchorClientId: string | null;
  public anchorClock: number | null;
  public deleted: boolean;
  public left: Item | null;
  public right: Item | null;
  public attributes: Record<string, any>;

  constructor(
    clientId: string,
    clock: number,
    val: string,
    anchorClientId: string | null = null,
    anchorClock: number | null = null,
    deleted: boolean = false,
    left: Item | null = null,
    right: Item | null = null,
    attributes: Record<string, any> = {}
  ) {
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
      } else if (item.clock < targetClock) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return null;
  }

  public insert(
    clientId: string,
    clock: number,
    anchorClientId: string | null,
    anchorClock: number | null,
    value: string,
    attributes: Record<string, any> = {}
  ): Item {
    const existing = this.findItemByClock(clientId, clock);
    if (existing) {
      return existing;
    }

    this.localClock = Math.max(this.localClock, clock);

    let anchor: Item | null = null;
    if (anchorClientId !== null && anchorClock !== null) {
      anchor = this.findItemByClock(anchorClientId, anchorClock);
      if (!anchor) {
        throw new Error(`Anchor item not found: client "${anchorClientId}" at clock ${anchorClock}`);
      }
    }

    const newItem = new Item(clientId, clock, value, anchorClientId, anchorClock, false, null, null, attributes);

    let curr = anchor ? anchor.right : this.head;

    while (curr !== null) {
      const isHigherClock = curr.clock > newItem.clock;
      const isAlphabeticalWin = curr.clock === newItem.clock && curr.clientId > newItem.clientId;

      if (isHigherClock || isAlphabeticalWin) {
        curr = curr.right;
      } else {
        break;
      }
    }

    const prev = curr ? curr.left : this.tail;

    newItem.left = prev;
    newItem.right = curr;

    if (prev !== null) {
      prev.right = newItem;
    } else {
      this.head = newItem;
    }

    if (curr !== null) {
      curr.left = newItem;
    } else {
      this.tail = newItem;
    }

    this.addToStructStore(newItem);
    return newItem;
  }

  public delete(clientId: string, clock: number): boolean {
    const item = this.findItemByClock(clientId, clock);
    if (!item) {
      return false;
    }

    this.localClock = Math.max(this.localClock, clock);
    item.deleted = true;
    return true;
  }

  public renderText(): string {
    const parts: string[] = [];
    let current = this.head;

    while (current !== null) {
      if (!current.deleted) {
        parts.push(current.val);
      }
      current = current.right;
    }

    return parts.join('');
  }

  public format(
    startClientId: string,
    startClock: number,
    endClientId: string,
    endClock: number,
    attributes: Record<string, any>
  ): void {
    const startItem = this.findItemByClock(startClientId, startClock);
    const endItem = this.findItemByClock(endClientId, endClock);
    if (!startItem || !endItem) {
      return;
    }

    let current: Item | null = startItem;
    while (current !== null) {
      if (!current.deleted) {
        for (const key of Object.keys(attributes)) {
          if (attributes[key] === null || attributes[key] === false) {
            delete current.attributes[key];
          } else {
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

  public renderHTML(): string {
    const lines: Array<{
      items: Item[];
      align?: string | undefined;
      indent?: number | undefined;
      lineSpacing?: string | undefined;
    }> = [];

    let currentLineItems: Item[] = [];
    let currentAlign: string | undefined = undefined;
    let currentIndent: number | undefined = undefined;
    let currentLineSpacing: string | undefined = undefined;

    let current = this.head;
    while (current !== null) {
      if (!current.deleted) {
        const attrs = current.attributes || {};
        if (attrs.align) currentAlign = attrs.align;
        if (typeof attrs.indent === 'number') currentIndent = attrs.indent;
        if (attrs.lineSpacing) currentLineSpacing = attrs.lineSpacing;

        if (current.val === '\n') {
          lines.push({
            items: currentLineItems,
            align: currentAlign,
            indent: currentIndent,
            lineSpacing: currentLineSpacing
          });
          currentLineItems = [];
          currentAlign = undefined;
          currentIndent = undefined;
          currentLineSpacing = undefined;
        } else {
          currentLineItems.push(current);
        }
      }
      current = current.right;
    }

    lines.push({
      items: currentLineItems,
      align: currentAlign,
      indent: currentIndent,
      lineSpacing: currentLineSpacing
    });

    const htmlLines: string[] = [];
    for (const line of lines) {
      const lineStyles: string[] = ['min-height: 1.5em;'];
      if (line.align) lineStyles.push(`text-align: ${line.align};`);
      if (line.indent) lineStyles.push(`padding-left: ${line.indent * 36}px;`);
      if (line.lineSpacing) lineStyles.push(`line-height: ${line.lineSpacing};`);

      const parts: string[] = [];
      for (const item of line.items) {
        let val = item.val;
        if (val === ' ') {
          val = '&nbsp;';
        }

        const attrs = item.attributes || {};
        const styles: string[] = [];

        if (attrs.bold) styles.push('font-weight: bold;');
        if (attrs.italic) styles.push('font-style: italic;');
        if (attrs.underline && attrs.strike) styles.push('text-decoration: underline line-through;');
        else if (attrs.underline) styles.push('text-decoration: underline;');
        else if (attrs.strike) styles.push('text-decoration: line-through;');

        if (attrs.font) styles.push(`font-family: ${attrs.font};`);
        if (attrs.color) styles.push(`color: ${attrs.color};`);
        if (attrs.background) styles.push(`background-color: ${attrs.background};`);
        if (attrs.code) styles.push('font-family: monospace; background: #f1f3f4; padding: 1px 4px; border-radius: 3px; font-size: 0.9em;');

        if (attrs.heading === 'title') styles.push('font-weight: normal; line-height: 1.2;' + (attrs.size ? '' : ' font-size: 26pt;'));
        else if (attrs.heading === 'subtitle') styles.push('color: #5f6368; line-height: 1.35;' + (attrs.size ? '' : ' font-size: 15pt;'));
        else if (attrs.heading === 'h1') styles.push('font-weight: bold; line-height: 1.25;' + (attrs.size ? '' : ' font-size: 20pt;'));
        else if (attrs.heading === 'h2') styles.push('font-weight: bold; line-height: 1.3;' + (attrs.size ? '' : ' font-size: 16pt;'));
        else if (attrs.heading === 'h3') styles.push('font-weight: bold; line-height: 1.35;' + (attrs.size ? '' : ' font-size: 14pt;'));

        if (attrs.size) styles.push(`font-size: ${attrs.size};`);

        let formatted = val;
        if (attrs.image) {
          formatted = `<img src="${attrs.image}" style="max-width: 100%; border-radius: 4px; display: inline-block; vertical-align: middle;" alt="Embedded image" />`;
        } else if (styles.length > 0) {
          formatted = `<span style="${styles.join(' ')}">${formatted}</span>`;
        }

        if (attrs.script === 'sub') {
          formatted = `<sub>${formatted}</sub>`;
        } else if (attrs.script === 'super') {
          formatted = `<sup>${formatted}</sup>`;
        }

        if (attrs.link) {
          formatted = `<a href="${attrs.link}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline;">${formatted}</a>`;
        }

        parts.push(formatted);
      }

      const content = parts.length > 0 ? parts.join('') : '<br>';
      htmlLines.push(`<div class="gdoc-line" style="${lineStyles.join(' ')}">${content}</div>`);
    }

    return htmlLines.join('');
  }

  public renderDelta(): Array<{ insert: string; attributes?: Record<string, any> }> {
    const delta: Array<{ insert: string; attributes?: Record<string, any> }> = [];
    let current = this.head;

    while (current !== null) {
      if (!current.deleted) {
        const attrs = current.attributes || {};
        const last = delta[delta.length - 1];
        const sameAttrs = last && JSON.stringify(last.attributes || {}) === JSON.stringify(attrs);

        if (last && sameAttrs) {
          last.insert += current.val;
        } else {
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

  public getItems(): Array<{
    clientId: string;
    clock: number;
    val: string;
    anchorClientId: string | null;
    anchorClock: number | null;
    deleted: boolean;
    attributes: Record<string, any>;
  }> {
    const list: Array<{
      clientId: string;
      clock: number;
      val: string;
      anchorClientId: string | null;
      anchorClock: number | null;
      deleted: boolean;
      attributes: Record<string, any>;
    }> = [];
    let current = this.head;
    while (current !== null) {
      list.push({
        clientId: current.clientId,
        clock: current.clock,
        val: current.val,
        anchorClientId: current.anchorClientId,
        anchorClock: current.anchorClock,
        deleted: current.deleted,
        attributes: current.attributes || {}
      });
      current = current.right;
    }
    return list;
  }

  public loadItems(items: Array<{
    clientId: string;
    clock: number;
    val: string;
    anchorClientId: string | null;
    anchorClock: number | null;
    deleted: boolean;
    attributes?: Record<string, any>;
  }>): void {
    this.head = null;
    this.tail = null;
    this.structStore.clear();
    this.localClock = 0;

    let prev: Item | null = null;
    for (const data of items) {
      const item = new Item(
        data.clientId,
        data.clock,
        data.val,
        data.anchorClientId,
        data.anchorClock,
        Boolean(data.deleted),
        prev,
        null,
        data.attributes || {}
      );
      if (prev !== null) {
        prev.right = item;
      } else {
        this.head = item;
      }
      prev = item;
      this.tail = item;
      this.addToStructStore(item);
      if (item.clock > this.localClock) {
        this.localClock = item.clock;
      }
    }
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
      } else {
        low = mid + 1;
      }
    }

    clientItems.splice(insertIdx, 0, item);
  }
}
