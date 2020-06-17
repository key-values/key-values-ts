import {
  StringASTNode,
  PropertyASTNode,
  ObjectASTNode,
  ASTNode,
} from './ast_node';

export type KeyValuesObject = string | Record<string, unknown>;

/** Converts a StringASTNode to a string. */
function parseStringNode(node: StringASTNode): string {
  return node.value;
}

/** Converts a PropertyASTNode to an object. */
function parsePropertyNode(node: PropertyASTNode): Record<string, unknown> {
  // Determine key and value
  const key = node.keyNode.value;
  const value = parseNode(node.valueNode);

  // Create wrapper object
  const obj: Record<string, unknown> = {};
  obj[key] = value;

  return obj;
}

/** Converts an ObjectASTNode to an object. */
function parseObjectNode(node: ObjectASTNode): Record<string, unknown> {
  // Create object
  const obj: Record<string, unknown> = {};

  // Populate with properties
  node.properties.forEach((property) => {
    // Determine key and value
    const key = property.keyNode.value;
    const value = parseNode(property.valueNode);
    // Add to object
    obj[key] = value;
  });

  return obj;
}

/** Converts an ASTNode to an object. */
function parseNode(node: ASTNode): KeyValuesObject {
  switch (node.type) {
    case 'string':
      return parseStringNode(node as StringASTNode);
    case 'property':
      return parsePropertyNode(node as PropertyASTNode);
    case 'object':
      return parseObjectNode(node as ObjectASTNode);
    default:
      throw new Error(`Unexpected node type: ${node.type}.`);
  }
}

const NodeParser = {
  parseStringNode,
  parsePropertyNode,
  parseObjectNode,
  parseNode,
};

export default NodeParser;
