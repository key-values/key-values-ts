/* eslint-disable @typescript-eslint/no-explicit-any */
import NodeParser from './node_parser';
import { parseWith, KEY_VALUES } from './parser';
import NodeStringifier from './node_stringifier';
import ObjectParser from './object_parser';
import { ASTNode } from './ast_node';
import { PropertyASTNodeImpl, ValueASTNodeImpl } from './ast_node_impl';

export class KeyValuesDocument {
  constructor(public readonly root: ASTNode | undefined) {}

  /** Creates a KeyValues document from a text. */
  public static fromText(text: string): KeyValuesDocument {
    const root = parseWith(text, KEY_VALUES);

    return new KeyValuesDocument(root);
  }

  /** Creates a KeyValues document from an object. */
  public static fromObject(obj: unknown): KeyValuesDocument {
    if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
      const keys = Object.keys(obj);
      // If the value is an object with a single property, extract it to retain the correct syntax
      if (keys.length === 1) {
        const dir = obj as Record<string, unknown>;
        const key = keys[0];
        const value = dir[keys[0]];
        // Convert to nodes
        const keyNode = ObjectParser.parseString(key);
        const valueNode = ObjectParser.parse(value) as ValueASTNodeImpl;
        const propertyNode = new PropertyASTNodeImpl(keyNode, valueNode);
        // Create document
        return new KeyValuesDocument(propertyNode);
      }
    }

    const root = ObjectParser.parse(obj);

    return new KeyValuesDocument(root);
  }

  /** Converts the KeyValues document to an object. */
  public toObject(): any {
    if (!this.root) {
      throw new Error('Trying to parse undefined root node.');
    } else {
      return NodeParser.parseNode(this.root);
    }
  }

  /** Converts the KeyValues document to a KeyValues string. */
  public toString(): string {
    if (!this.root) {
      return '';
    } else {
      return NodeStringifier.stringifyNode(this.root);
    }
  }
}

/** Converts a KeyValues string into an object. */
function parse(text: string): unknown {
  return KeyValuesDocument.fromText(text).toObject();
}

/** Converts a JavaScript value into a KeyValues string. */
function stringify(value: unknown, key?: string): string {
  if (key) {
    // Wrap the value inside an object
    const obj: Record<string, unknown> = {};
    obj[key] = value;

    return KeyValuesDocument.fromObject(obj).toString();
  } else {
    return KeyValuesDocument.fromObject(value).toString();
  }
}

const KeyValues = {
  parse,
  stringify,
};

export default KeyValues;
