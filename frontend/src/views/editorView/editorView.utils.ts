import { CRDTDocument, Item } from '../../crdt-engine.js';
import { dropIds } from './editorView.constants.js';

export function showToast(msg: string) {
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

export function closeAllDropdowns() {
  for (const id of dropIds) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }
}

export function getFirstTextOrLine(line: Element): { node: Node; offset: number } {
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

export function sanitizeDeltaChunks(chunks: Array<{ insert: string; attributes?: Record<string, any> }>): Array<{ insert: string; attributes?: Record<string, any> }> {
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

export function canApplyOperation(doc: CRDTDocument, op: any): boolean {
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

export function getVisibleItemAt(doc: CRDTDocument, index: number): Item | null {
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

export function getEditorText(editorDiv: HTMLElement): string {
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

export function getCharOffsetOfNode(editorDiv: HTMLElement, targetNode: Node, targetOffset: number): number {
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

export function getNodeAndOffsetAtChar(editorDiv: HTMLElement, pos: number): { node: Node; offset: number } {
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

