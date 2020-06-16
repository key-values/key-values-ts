import {
  ASTNode,
  StringASTNode,
  ObjectASTNode,
  PropertyASTNode,
  ValueASTNode,
  KeyASTNode,
  NodePosition,
} from './ast_node';

export class NodePositionImpl implements NodePosition {
  public offset: number;
  public length: number;
  public columnBegin: number;
  public rowBegin: number;
  public columnEnd: number;
  public rowEnd: number;

  constructor(
    offset: number,
    length: number,
    rowBegin: number,
    columnBegin: number,
    rowEnd: number,
    columnEnd: number
  ) {
    this.offset = offset;
    this.length = length;
    this.rowBegin = rowBegin;
    this.columnBegin = columnBegin;
    this.rowEnd = rowEnd;
    this.columnEnd = columnEnd;
  }
}

export abstract class ASTNodeImpl {
  public abstract readonly type:
    | 'object'
    | 'property'
    | 'array'
    | 'string'
    | 'number';

  public pos: NodePosition;
  public parent: ASTNode | undefined;

  constructor(parent: ASTNode | undefined, pos: NodePosition) {
    this.pos = pos;
    this.parent = parent;
  }

  public get children(): ASTNode[] {
    return [];
  }

  public toString(): string {
    const parentStr = this.parent ? ` parent: {${this.parent.toString()}}` : '';
    return `type: ${this.type} (${this.pos.offset}/${this.pos.length})${parentStr}`;
  }
}

export class StringASTNodeImpl extends ASTNodeImpl implements StringASTNode {
  public type: 'string' = 'string';
  public isQuoted: boolean;
  public value: string;

  constructor(
    parent: ASTNode | undefined,
    strValue: string,
    pos: NodePosition
  ) {
    super(parent, pos);
    this.value = strValue;
    this.isQuoted = true;
  }
}

export class PropertyASTNodeImpl extends ASTNodeImpl
  implements PropertyASTNode {
  public type: 'property' = 'property';
  public keyNode: KeyASTNode;
  public valueNode: ValueASTNode;

  constructor(
    parent: ObjectASTNode | undefined,
    keyNode: KeyASTNode,
    valueNode: ValueASTNode,
    pos: NodePosition
  ) {
    super(parent, pos);
    this.keyNode = keyNode;
    this.valueNode = valueNode;
  }
}

export class ObjectASTNodeImpl extends ASTNodeImpl implements ObjectASTNode {
  public type: 'object' = 'object';
  public properties: PropertyASTNode[];

  constructor(
    parent: ASTNode | undefined,
    properties: PropertyASTNode[],
    pos: NodePosition
  ) {
    super(parent, pos);
    this.properties = properties;
  }

  public get children(): ASTNode[] {
    return this.properties;
  }
}
