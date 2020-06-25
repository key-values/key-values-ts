import {
  ASTNode,
  StringASTNode,
  ObjectASTNode,
  PropertyASTNode,
  ValueASTNode,
  KeyASTNode,
  NodePosition,
  CommentASTNode,
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

export type KeyValuesASTNodeImpl = PropertyASTNodeImpl;
export type KeyASTNodeImpl = StringASTNodeImpl;
export type ValueASTNodeImpl = StringASTNodeImpl | ObjectASTNodeImpl;

export abstract class ASTNodeImpl {
  public abstract readonly type: 'object' | 'property' | 'string' | 'comment';

  public pos?: NodePosition;
  public parent: ASTNode | undefined;

  constructor(pos?: NodePosition) {
    this.pos = pos;
  }

  public get children(): ASTNode[] {
    return [];
  }

  public toString(): string {
    const parentStr = this.parent ? ` parent: {${this.parent.toString()}}` : '';
    return `type: ${this.type} (${this.pos?.offset}/${this.pos?.length})${parentStr}`;
  }
}

export class StringASTNodeImpl extends ASTNodeImpl implements StringASTNode {
  public type: 'string' = 'string';
  public isQuoted: boolean;
  public value: string;

  constructor(strValue: string, isQuoted?: boolean, pos?: NodePosition) {
    super(pos);
    this.value = strValue;
    this.isQuoted = isQuoted ?? true;
  }
}

export class CommentASTNodeImpl extends ASTNodeImpl implements CommentASTNode {
  public type: 'comment' = 'comment';
  public value: string;
  public isInline: boolean;

  constructor(value: string, isInline?: boolean, pos?: NodePosition) {
    super(pos);
    this.value = value;
    this.isInline = isInline ?? false;
  }
}

export class PropertyASTNodeImpl extends ASTNodeImpl
  implements PropertyASTNode {
  public type: 'property' = 'property';
  public keyNode: KeyASTNode;
  public valueNode: ValueASTNode;
  public comments: CommentASTNode[];

  constructor(
    keyNode: KeyASTNodeImpl,
    valueNode: ValueASTNodeImpl,
    comments?: CommentASTNodeImpl[],
    pos?: NodePosition
  ) {
    super(pos);
    this.keyNode = keyNode;
    keyNode.parent = this;
    this.valueNode = valueNode;
    valueNode.parent = this;
    this.comments = comments ?? [];
  }

  public get children(): ASTNode[] {
    return [this.keyNode, ...this.comments, this.valueNode];
  }
}

export class ObjectASTNodeImpl extends ASTNodeImpl implements ObjectASTNode {
  public type: 'object' = 'object';
  public properties: PropertyASTNode[];
  public value = undefined;

  constructor(properties: PropertyASTNodeImpl[], pos?: NodePosition) {
    super(pos);
    this.properties = properties;
    properties.forEach((property) => (property.parent = this));
  }

  public get children(): ASTNode[] {
    return this.properties;
  }
}
