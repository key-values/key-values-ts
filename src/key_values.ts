import { ASTNode, KeyValuesASTNode } from './ast_node';
import { parseWith, KEY_VALUES } from './parser';
import {
  StringASTNodeImpl,
  ObjectASTNodeImpl,
  PropertyASTNodeImpl,
} from './ast_node_impl';

/** Converts a KeyValues string to a KeyValues abstract syntax tree (AST). */
function parseAsAST(text: string): KeyValuesASTNode {
  return parseWith(text, KEY_VALUES);
}

/** Converts a KeyValues string into an object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parse(text: string): any {
  const ast = parseAsAST(text);
  return parseNode(ast);
}

/** Converts a JavaScript value into a KeyValues string. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringify(key: string, value: any): string {
  throw new Error('Not implemented');
}

/** Converts a given AST node to a JS object. */
function parseNode(node: ASTNode): unknown {
  if (node instanceof StringASTNodeImpl) {
    return node.value;
  } else if (node instanceof ObjectASTNodeImpl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = {};
    node.properties.forEach((property) => {
      const value = parseNode(property.valueNode);
      obj[property.keyNode.value] = value;
    });
    return obj;
  } else if (node instanceof PropertyASTNodeImpl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = {};
    obj[node.keyNode.value] = parseNode(node.valueNode);
    return obj;
  } else {
    throw new Error('Unexpected node type.');
  }
}

const KeyValues = {
  parse,
  stringify,
  parseAsAST,
  parseNode,
};

export default KeyValues;
