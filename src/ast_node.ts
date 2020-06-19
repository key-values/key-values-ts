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

/** Determines the next node to traverse. */
export function next(node: ASTNode): ASTNode | null {
  if (!node.children || node.children.length === 0) {
    // The node does not have children, go up in the hierachy.
    return nextParentChild(node);
  } else {
    // The node has children, return the first child.
    return node.children[0];
  }
}

function nextParentChild(node: ASTNode): ASTNode | null {
  const parent = node.parent;
  if (parent !== undefined) {
    // If the node has a parent...
    const children = parent.children;
    if (children !== undefined) {
      // ...find this node in its children...
      const index = children.findIndex((value) => value === node);
      const nextIndex = index + 1;
      if (index !== -1 && nextIndex < children.length) {
        // ...and return the next child, if possible...
        return children[nextIndex];
      } else {
        // ...if there is no next child, go up in the hierachy.
        return nextParentChild(parent);
      }
    } else {
      // The parent should always have children (at least this node).
      throw new Error('Unexpected missing children during node traversal.');
    }
  } else {
    // The node does not have a parent, return null.
    return null;
  }
}

/** Finds the deepest AST node at the given offset. */
export function findAtOffset(node: ASTNode, offset: number): ASTNode | null {
  // Check if the offset is contained in the node
  if (
    node.pos &&
    node.pos.offset <= offset &&
    node.pos.offset + node.pos.length >= offset
  ) {
    let result = node;
    if (node.children) {
      // Check if the offset is contained in a child
      node.children.forEach((child) => {
        const childResult = findAtOffset(child, offset);
        if (childResult) {
          result = childResult;
          return;
        }
      });
    }
    return result;
  } else {
    return null;
  }
}

/** Finds the deepest AST node at the given row and column. */
export function findAtCell(
  node: ASTNode,
  row: number,
  column: number
): ASTNode | null {
  // Check if cell is contained in the node
  if (
    node.pos &&
    (node.pos.rowBegin < row ||
      (node.pos.rowBegin === row && node.pos.columnBegin <= column)) &&
    (node.pos.rowEnd > row ||
      (node.pos.rowEnd === row && node.pos.columnEnd >= column))
  ) {
    let result = node;
    if (node.children) {
      // Check if the cell is contained in a child
      node.children.forEach((child) => {
        const childResult = findAtCell(child, row, column);
        if (childResult) {
          result = childResult;
          return;
        }
      });
    }
    return result;
  } else {
    return null;
  }
}
