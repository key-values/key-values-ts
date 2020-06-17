/** The position of the node in the parsed text. */
export interface NodePosition {
  /** The 0-based index indicating the start of the node. */
  readonly offset: number;
  /** The total length of the node. */
  readonly length: number;
  /** The column in which the node begins. */
  readonly columnBegin: number;
  /** The row in which the node begins. */
  readonly rowBegin: number;
  /** The column in which the node ends. */
  readonly columnEnd: number;
  /** The row in which the node ends. */
  readonly rowEnd: number;
}

export type KeyValuesASTNode = PropertyASTNode;

export type ASTNode = BaseASTNode;

export interface BaseASTNode {
  readonly type: 'object' | 'property' | 'string';
  readonly parent?: ASTNode;
  readonly pos?: NodePosition;
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
