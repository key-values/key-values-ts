export type KeyValuesASTNode = PropertyASTNode;

export type ASTNode = BaseASTNode;

export interface BaseASTNode {
  readonly type: 'object' | 'property' | 'string';
  parent?: ASTNode;
  readonly offset: number;
  readonly length: number;
  readonly children?: ASTNode[];
  readonly value?: string | number | null;
}

export type KeyASTNode = StringASTNode;
export type ValueASTNode = StringASTNode | ObjectASTNode;

export interface PropertyASTNode extends BaseASTNode {
  readonly type: 'property';
  readonly keyNode: KeyASTNode;
  readonly valueNode: ValueASTNode;
  readonly children: ASTNode[];
}

export interface ObjectASTNode extends BaseASTNode {
  readonly type: 'object';
  readonly properties: PropertyASTNode[];
  readonly children: ASTNode[];
}

export interface StringASTNode extends BaseASTNode {
  readonly type: 'string';
  readonly isQuoted: boolean;
  readonly value: string;
}
