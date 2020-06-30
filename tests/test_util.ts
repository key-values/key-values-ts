import { ASTNode } from '../src/ast_node';
import {
  NodePositionImpl,
  PropertyASTNodeImpl,
  StringASTNodeImpl,
} from '../src/ast_node_impl';

/** Asserts that the position data of a node is correct. */
export function assertPos(
  node: ASTNode,
  offset: number,
  length: number,
  rowBegin: number,
  columnBegin: number,
  rowEnd: number,
  columnEnd: number
): void {
  expect(node.pos?.offset).toBe(offset);
  expect(node.pos?.length).toBe(length);
  expect(node.pos?.rowBegin).toBe(rowBegin);
  expect(node.pos?.columnBegin).toBe(columnBegin);
  expect(node.pos?.rowEnd).toBe(rowEnd);
  expect(node.pos?.columnEnd).toBe(columnEnd);
}

/** Asserts that the position of a node at the start of the text is correct. */
export function assertStartPos(
  node: ASTNode,
  length: number,
  rowEnd: number,
  columnEnd: number
): void {
  assertPos(node, 0, length, 1, 1, rowEnd, columnEnd);
}

/** Asserts that the position data of a single-line node is correct. */
export function assertSingleLinePos(node: ASTNode, length: number): void {
  assertStartPos(node, length, 1, length + 1);
}

/** Creates a simple string property node. */
export function createStringPropertyNode(
  key: string,
  value: string
): PropertyASTNodeImpl {
  const keyNode = new StringASTNodeImpl(key);
  const valueNode = new StringASTNodeImpl(value);
  const propertyNode = new PropertyASTNodeImpl(keyNode, valueNode);

  return propertyNode;
}

export function createStartPos(
  length: number,
  rowEnd: number,
  columnEnd: number
): NodePositionImpl {
  return new NodePositionImpl(0, length, 1, 1, rowEnd, columnEnd);
}

export function createLinePos(
  offset: number,
  length: number,
  rowBegin?: number,
  columnBegin?: number
): NodePositionImpl {
  return new NodePositionImpl(
    offset,
    length,
    rowBegin ?? 1,
    columnBegin ?? offset + 1,
    rowBegin ?? 1,
    (columnBegin ?? offset + 1) + length
  );
}

/** Asserts that the position data of a single-line node is correct. */
export function createStartLinePos(length: number): NodePositionImpl {
  return createStartPos(length, 1, length + 1);
}
