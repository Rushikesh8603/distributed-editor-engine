export declare class Item {
    clientId: string;
    clock: number;
    val: string;
    anchorClientId: string | null;
    anchorClock: number | null;
    deleted: boolean;
    left: Item | null;
    right: Item | null;
    constructor(clientId: string, clock: number, val: string, anchorClientId?: string | null, anchorClock?: number | null, deleted?: boolean, left?: Item | null, right?: Item | null);
}
export declare class CRDTDocument {
    structStore: Map<string, Item[]>;
    head: Item | null;
    tail: Item | null;
    localClock: number;
    tick(): number;
    findItemByClock(clientId: string, targetClock: number): Item | null;
    insert(clientId: string, clock: number, anchorClientId: string | null, anchorClock: number | null, value: string): Item;
    delete(clientId: string, clock: number): boolean;
    renderText(): string;
    private addToStructStore;
}
//# sourceMappingURL=crdt-engine.d.ts.map