import {
  StringASTNode,
  PropertyASTNode,
  ObjectASTNode,
  ASTNode,
} from './ast_node';

export interface StringifyOptions {
  /** The number of spaces a tab is equal to. Defaults to 4. */
  tabSize?: number;
  /** True if spaces should be inserted instead of tabs, else false. Defaults to false. */
  insertSpaces?: boolean;
}

interface StringifySettings extends StringifyOptions {
  tabSize: number;
  insertSpaces: boolean;
}

/** The default stringify settings. */
const DEFAULT_SETTINGS: StringifySettings = {
  tabSize: 4,
  insertSpaces: false,
};

/** Converts the given options to settings. */
function getSettings(options?: StringifyOptions): StringifySettings {
  if (!options) return DEFAULT_SETTINGS;

  return {
    tabSize: options.tabSize ?? DEFAULT_SETTINGS.tabSize,
    insertSpaces: options.insertSpaces ?? DEFAULT_SETTINGS.insertSpaces,
  };
}

/** Generates the specified amount of indention. */
export function genIndent(indent?: number, options?: StringifyOptions): string {
  if (!indent) return '';

  const settings = getSettings(options);

  let indentStr = '';

  // Determine the string to indent by
  let str = '';
  if (settings.insertSpaces) {
    for (let i = 0; i < settings.tabSize; i++) {
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
  const key = stringifyStringNode(node.keyNode, indent, options);

  if (node.valueNode.type == 'object' && node.valueNode.properties.length > 0) {
    // Object values are placed in a new line
    const value = stringifyObjectNode(node.valueNode, indent, options);
    return `${key}\n${value}`;
  } else {
    // String values and empty objects are placed in the same line
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
    const property = stringifyPropertyNode(node.properties[0], 0, options);
    return `${indentStr}{ ${property} }`;
  } else {
    // Multi-line object
    const properties = node.properties
      .map((property) =>
        stringifyPropertyNode(property, (indent ?? 0) + 1, options)
      )
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
