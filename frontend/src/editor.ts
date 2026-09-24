
import { CRDTDocument ,Item} from './crdt-engine';



const clientId = "User_" + Math.floor(Math.random() * 1000);
const doc = new CRDTDocument();
const textarea = document.getElementById('editor') as HTMLTextAreaElement;
let previousValue = "";

const ws = new WebSocket('ws://localhost:8080');

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
  } else if (lengthDiff < 0) {
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
  
  if (op.type === 'insert') {
    doc.insert(op.clientId, op.clock, op.anchorClientId, op.anchorClock, op.value);
  } else if (op.type === 'delete') {
    doc.delete(op.clientId, op.clock);
  }

  const cursorPosition = textarea.selectionStart;
  
  textarea.value = doc.renderText();
  previousValue = textarea.value;
  textarea.setSelectionRange(cursorPosition, cursorPosition);
});

