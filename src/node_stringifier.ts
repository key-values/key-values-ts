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
  /** True if the values of an object's properties should be aligned, else false. Defaults to false. */
  alignValues?: boolean;
}

export interface StringifySettings extends StringifyOptions {
  tabSize: number;
  insertSpaces: boolean;
  alignValues: boolean;
}

/** The default stringify settings. */
export const DEFAULT_SETTINGS: StringifySettings = {
  tabSize: 4,
  insertSpaces: false,
  alignValues: false,
};

/** Converts the given options to settings. */
export function getSettings(options?: StringifyOptions): StringifySettings {
  if (!options) return DEFAULT_SETTINGS;

  return {
    tabSize: options.tabSize ?? DEFAULT_SETTINGS.tabSize,
    insertSpaces: options.insertSpaces ?? DEFAULT_SETTINGS.insertSpaces,
    alignValues: options.alignValues ?? DEFAULT_SETTINGS.alignValues,
  };
}

function genStr(str: string, count: number): string {
  let result = '';

  for (let i = 0; i < count; i++) {
    result += str;
  }

  return result;
}

/** Generates the specified amount of indention. */
export function genIndent(options?: StringifyOptions, indent?: number): string {
  if (!indent) return '';

  const settings = getSettings(options);

  return settings.insertSpaces
    ? genStr(genStr(' ', settings.tabSize), indent)
    : genStr('\t', indent);
}

/** Converts a StringASTNode to a KeyValues string. */
export function stringifyStringNode(
  node: StringASTNode,
  options?: StringifyOptions,
  indent?: number
): string {
  const indentStr = genIndent(options, indent);
  return `${indentStr}"${node.value}"`;
}

/** Converts a PropertyASTNode to a KeyValues string. */
export function stringifyPropertyNode(
  node: PropertyASTNode,
  options?: StringifyOptions,
  indent?: number,
  maxKeyLength?: number
): string {
  const key = stringifyStringNode(node.keyNode, options, indent);

  if (node.valueNode.type == 'object' && node.valueNode.properties.length > 0) {
    // Object values are placed in a new line
    const value = stringifyObjectNode(node.valueNode, options, indent);
    return `${key}\n${value}`;
  } else {
    // String values and empty objects are placed in the same line
    let indentStr = genIndent(options, 1);
    const settings = getSettings(options);

    if (settings.alignValues && maxKeyLength) {
      // Align the values
      const tabSize = settings.tabSize;

      const keyLength =
        node.keyNode.value.length + (node.keyNode.isQuoted ? 2 : 0);

      const target = Math.floor(maxKeyLength / tabSize) * tabSize + tabSize;

      if (settings.insertSpaces) {
        indentStr = genStr(' ', target - keyLength);
      } else {
        indentStr = genStr(
          '\t',
          target / tabSize - Math.floor(keyLength / tabSize)
        );
      }
    }

    const value = stringifyNode(node.valueNode);
    return `${key}${indentStr}${value}`;
  }
}

/** Converts an ObjectASTNode to a KeyValues string. */
export function stringifyObjectNode(
  node: ObjectASTNode,
  options?: StringifyOptions,
  indent?: number
): string {
  const indentStr = genIndent(options, indent);

  if (node.properties.length === 0) {
    // Empty object
    return `${indentStr}{}`;
  } else if (
    node.properties.length === 1 &&
    node.properties[0].valueNode.type === 'string'
  ) {
    // Single-line object
    const property = stringifyPropertyNode(node.properties[0], options);
    return `${indentStr}{ ${property} }`;
  } else {
    // Multi-line object
    let maxKeyLength = 0;
    if (getSettings(options).alignValues) {
      // Determine maximum key length
      node.properties.forEach((property) => {
        const keyLength =
          property.keyNode.value.length + (property.keyNode.isQuoted ? 2 : 0);
        if (keyLength > maxKeyLength) {
          maxKeyLength = keyLength;
        }
      });
    }
    const properties = node.properties
      .map((property) => {
        return stringifyPropertyNode(
          property,
          options,
          (indent ?? 0) + 1,
          maxKeyLength
        );
      })
      .join('\n');

    return `${indentStr}{\n${properties}\n${indentStr}}`;
  }
}

/** Converts an ASTNode to a KeyValues string. */
export function stringifyNode(
  node: ASTNode,
  options?: StringifyOptions,
  indent?: number
): string {
  switch (node.type) {
    case 'string':
      return stringifyStringNode(node as StringASTNode, options, indent);
    case 'property':
      return stringifyPropertyNode(node as PropertyASTNode, options, indent);
    case 'object':
      return stringifyObjectNode(node as ObjectASTNode, options, indent);
    default:
      throw new Error(`Unexpected node type: ${node.type}.`);
  }
}
