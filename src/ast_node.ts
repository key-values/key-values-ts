export type KeyValuesASTNode = PropertyASTNode;

export type ASTNode = BaseASTNode;

export interface BaseASTNode {
  readonly type: 'object' | 'property' | 'string' | 'number';
  parent?: ASTNode;
  readonly offset: number;
  readonly length: number;
  readonly children?: ASTNode[];
  readonly value?: string | number | null;
}

export type KeyASTNode = StringASTNode;
export type ValueASTNode = LiteralASTNode | ObjectASTNode;

export interface PropertyASTNode extends BaseASTNode {
  readonly type: 'property';
  readonly keyNode: KeyASTNode;
  readonly valueNode?: ValueASTNode;
  readonly children: ASTNode[];
}

export interface ObjectASTNode extends BaseASTNode {
  readonly type: 'object';
  readonly properties: PropertyASTNode[];
  readonly children: ASTNode[];
}

export interface LiteralASTNode extends BaseASTNode {
  readonly type: 'string' | 'number';
  readonly isQuoted: boolean;
  readonly value: string | number;
}

export interface StringASTNode extends LiteralASTNode {
  readonly type: 'string';
  readonly value: string;
}

export interface NumberASTNode extends LiteralASTNode {
  readonly type: 'number';
  readonly value: number;
  readonly isInteger: boolean;
}
