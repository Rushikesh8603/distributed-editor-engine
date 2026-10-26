export interface DomNodeOffset {
  node: Node;
  offset: number;
}

export interface SelectionRange {
  start: number;
  end: number;
}

export interface HeadingItem {
  text: string;
  level: 'h1' | 'h2' | 'h3';
  index: number;
}

export type SaveStatus = 'saving' | 'saved' | 'error';

export type ListPrefixType = 'bullet' | 'checklist' | 'number';

export interface DeltaChunk {
  insert: string;
  attributes?: Record<string, any>;
}

export interface MenuCommand {
  name: string;
  action: () => void;
}

