export declare class Item {
    clientId: string;
    clock: number;
    val: string;
    anchorClientId: string | null;
    anchorClock: number | null;
    deleted: boolean;
    left: Item | null;
    right: Item | null;
    attributes: Record<string, any>;
    constructor(clientId: string, clock: number, val: string, anchorClientId?: string | null, anchorClock?: number | null, deleted?: boolean, left?: Item | null, right?: Item | null, attributes?: Record<string, any>);
}
export declare class CRDTDocument {
    structStore: Map<string, Item[]>;
    head: Item | null;
    tail: Item | null;
    localClock: number;
    tick(): number;
    findItemByClock(clientId: string, targetClock: number): Item | null;
    insert(clientId: string, clock: number, anchorClientId: string | null, anchorClock: number | null, value: string, attributes?: Record<string, any>): Item;
    delete(clientId: string, clock: number): boolean;
    renderText(): string;
    format(startClientId: string, startClock: number, endClientId: string, endClock: number, attributes: Record<string, any>): void;
    renderHTML(): string;
    renderDelta(): Array<{
        insert: string;
        attributes?: Record<string, any>;
    }>;
    private addToStructStore;
}
//# sourceMappingURL=crdt-engine.d.ts.map