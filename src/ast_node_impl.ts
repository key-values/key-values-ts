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
  public value?: string;

  constructor(pos?: NodePosition) {
    this.pos = pos;
  }

  public children: ASTNode[] = [];

  public toString(): string {
    const posStr = this.pos ? ` (${this.pos.offset}/${this.pos.length})` : '';
    const parentStr = this.parent
      ? `, parent: { ${this.parent.toString()} }`
      : '';
    const valueStr = this.value ? `, value: "${this.value}"` : '';

    return `type: ${this.type}${posStr}${valueStr}${parentStr}`;
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

  constructor(value: string, pos?: NodePosition) {
    super(pos);
    this.value = value;
  }
}

export class PropertyASTNodeImpl
  extends ASTNodeImpl
  implements PropertyASTNode {
  public type: 'property' = 'property';
  public keyNode: KeyASTNode;
  public valueNode: ValueASTNode;
  public comments: CommentASTNode[];
  public children: Array<KeyASTNode | CommentASTNode | ValueASTNode>;

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
    comments?.forEach((comment) => (comment.parent = this));
    this.comments = comments ?? [];
    this.children = [this.keyNode, ...this.comments, this.valueNode];
  }
}

export class ObjectASTNodeImpl extends ASTNodeImpl implements ObjectASTNode {
  public type: 'object' = 'object';
  public value = undefined;
  public children: Array<PropertyASTNodeImpl | CommentASTNodeImpl>;

  constructor(
    children: Array<PropertyASTNodeImpl | CommentASTNodeImpl>,
    pos?: NodePosition
  ) {
    super(pos);
    children.forEach((child) => (child.parent = this));
    this.children = children;
  }

  public get properties(): PropertyASTNode[] {
    return this.children.filter(
      (child) => child.type === 'property'
    ) as PropertyASTNodeImpl[];
  }

  public get comments(): CommentASTNode[] {
    return this.children.filter(
      (child) => child.type === 'comment'
    ) as CommentASTNodeImpl[];
  }
}
