import {
  StringASTNode,
  PropertyASTNode,
  ObjectASTNode,
  ASTNode,
} from './ast_node';

/** Generates the specified amount of indention. */
function genIndent(indent?: number): string {
  if (!indent) return '';

  let indentStr = '';

  for (let i = 0; i < indent; i++) {
    // Add tab indention
    indentStr += '\t';
  }

  return indentStr;
}

/** Converts a StringASTNode to a KeyValues string. */
function stringifyStringNode(node: StringASTNode, indent?: number): string {
  const indentStr = genIndent(indent);
  return `${indentStr}"${node.value}"`;
}

/** Converts a PropertyASTNode to a KeyValues string. */
function stringifyPropertyNode(node: PropertyASTNode, indent?: number): string {
  const key = stringifyNode(node.keyNode, indent);

  if (node.valueNode.type == 'object') {
    // Object values are placed in a new line
    const value = stringifyNode(node.valueNode, indent);
    return `${key}\n${value}`;
  } else {
    // String values are placed in the same line, seperated by tabs
    const value = stringifyNode(node.valueNode, 1);
    return `${key}${value}`;
  }
}

/** Converts an ObjectASTNode to a KeyValues string. */
function stringifyObjectNode(node: ObjectASTNode, indent?: number): string {
  const indentStr = genIndent(indent);

  switch (node.properties.length) {
    case 0:
      // Empty object
      return `${indentStr}{}`;
    case 1: {
      // Single-line object
      const property = stringifyNode(node.properties[0]);
      return `${indentStr}{ ${property} }`;
    }
    default: {
      // Multi-line object
      const properties = node.properties
        .map((property) => stringifyNode(property, (indent ?? 0) + 1))
        .join('\n');

      return `${indentStr}{\n${properties}\n${indentStr}}`;
    }
  }
}

/** Converts an ASTNode to a KeyValues string. */
function stringifyNode(node: ASTNode, indent?: number): string {
  switch (node.type) {
    case 'string':
      return stringifyStringNode(node as StringASTNode, indent);
    case 'property':
      return stringifyPropertyNode(node as PropertyASTNode, indent);
    case 'object':
      return stringifyObjectNode(node as ObjectASTNode, indent);
    default:
      throw new Error(`Unexpected node type: ${node.type}.`);
  }
}

const NodeStringifier = {
  genIndent,
  stringifyStringNode,
  stringifyPropertyNode,
  stringifyObjectNode,
  stringifyNode,
};

export default NodeStringifier;
