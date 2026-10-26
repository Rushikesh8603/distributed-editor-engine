import { CRDTDocument, Item } from '../../crdt-engine.js';
export declare function showToast(msg: string): void;
export declare function closeAllDropdowns(): void;
export declare function getFirstTextOrLine(line: Element): {
    node: Node;
    offset: number;
};
export declare function sanitizeDeltaChunks(chunks: Array<{
    insert: string;
    attributes?: Record<string, any>;
}>): Array<{
    insert: string;
    attributes?: Record<string, any>;
}>;
export declare function canApplyOperation(doc: CRDTDocument, op: any): boolean;
export declare function getVisibleItemAt(doc: CRDTDocument, index: number): Item | null;
export declare function getEditorText(editorDiv: HTMLElement): string;
export declare function getCharOffsetOfNode(editorDiv: HTMLElement, targetNode: Node, targetOffset: number): number;
export declare function getNodeAndOffsetAtChar(editorDiv: HTMLElement, pos: number): {
    node: Node;
    offset: number;
};
//# sourceMappingURL=editorView.utils.d.ts.map