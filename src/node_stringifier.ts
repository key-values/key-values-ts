import {
  StringASTNode,
  PropertyASTNode,
  ObjectASTNode,
  ASTNode,
} from './ast_node';

export type StringifyOptions = {
  /** The number of spaces a tab is equal to. */
  tabSize: number;
  /** True if spaces should be inserted instead of tabs, else false. */
  insertSpaces: boolean;
};

/** The default stringify options. */
const DEFAULT_OPTIONS: StringifyOptions = {
  tabSize: 4,
  insertSpaces: false,
};

/** Generates the specified amount of indention. */
export function genIndent(indent?: number, options?: StringifyOptions): string {
  if (!indent) return '';

  const _options = options ?? DEFAULT_OPTIONS;

  let indentStr = '';

  // Determine the string to indent by
  let str = '';
  if (_options.insertSpaces) {
    for (let i = 0; i < _options.tabSize; i++) {
      str += ' ';
    }
  } else {
    str = '\t';
  }

  for (let i = 0; i < indent; i++) {
    // Add indention
    indentStr += str;
  }

  return indentStr;
}

/** Converts a StringASTNode to a KeyValues string. */
export function stringifyStringNode(
  node: StringASTNode,
  indent?: number,
  options?: StringifyOptions
): string {
  const indentStr = genIndent(indent, options);
  return `${indentStr}"${node.value}"`;
}

/** Converts a PropertyASTNode to a KeyValues string. */
export function stringifyPropertyNode(
  node: PropertyASTNode,
  indent?: number,
  options?: StringifyOptions
): string {
  const key = stringifyNode(node.keyNode, indent);

  if (node.valueNode.type == 'object' && node.valueNode.properties.length > 0) {
    // Object values are placed in a new line
    const value = stringifyNode(node.valueNode, indent, options);
    return `${key}\n${value}`;
  } else {
    // String values are placed in the same line, seperated by tabs
    const value = stringifyNode(node.valueNode, 1, options);
    return `${key}${value}`;
  }
}

/** Converts an ObjectASTNode to a KeyValues string. */
export function stringifyObjectNode(
  node: ObjectASTNode,
  indent?: number,
  options?: StringifyOptions
): string {
  const indentStr = genIndent(indent, options);

  if (node.properties.length === 0) {
    // Empty object
    return `${indentStr}{}`;
  } else if (
    node.properties.length === 1 &&
    node.properties[0].valueNode.type === 'string'
  ) {
    // Single-line object
    const property = stringifyNode(node.properties[0]);
    return `${indentStr}{ ${property} }`;
  } else {
    // Multi-line object
    const properties = node.properties
      .map((property) => stringifyNode(property, (indent ?? 0) + 1), options)
      .join('\n');

    return `${indentStr}{\n${properties}\n${indentStr}}`;
  }
}

/** Converts an ASTNode to a KeyValues string. */
export function stringifyNode(
  node: ASTNode,
  indent?: number,
  options?: StringifyOptions
): string {
  switch (node.type) {
    case 'string':
      return stringifyStringNode(node as StringASTNode, indent, options);
    case 'property':
      return stringifyPropertyNode(node as PropertyASTNode, indent, options);
    case 'object':
      return stringifyObjectNode(node as ObjectASTNode, indent, options);
    default:
      throw new Error(`Unexpected node type: ${node.type}.`);
  }
}
