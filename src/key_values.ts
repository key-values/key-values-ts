/* eslint-disable @typescript-eslint/no-explicit-any */
import * as NodeParser from './node_parser';
import KeyValuesParser, { parseWith, ParserOptions } from './parser';
import * as NodeStringifier from './node_stringifier';
import * as ObjectParser from './object_parser';
import { ASTNode, findAtOffset, findAtCell } from './ast_node';
import { PropertyASTNodeImpl, ValueASTNodeImpl } from './ast_node_impl';

export class KeyValuesDocument {
  constructor(public readonly root: ASTNode | undefined) {}

  /** Creates a KeyValues document from a text. */
  public static fromText(
    text: string,
    options?: ParserOptions
  ): KeyValuesDocument {
    const parser = new KeyValuesParser(options);
    const root = parseWith(text, parser.keyValues);

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
  public toString(options?: NodeStringifier.StringifyOptions): string {
    if (!this.root) {
      return '';
    } else {
      return NodeStringifier.stringifyNode(this.root, options);
    }
  }

  /**
   * Finds the deepest ASTNode at the given offset.
   * @param offset The offset to find the node at.
   * @returns The ASTNode at the given offset or null if none could be found.
   */
  public findAtOffset(offset: number): ASTNode | null {
    if (!this.root) {
      return null;
    } else {
      return findAtOffset(this.root, offset);
    }
  }

  /**
   * Finds the deepest ASTNode at the given row and column.
   * @param row The row of the cell to find the node at.
   * @param column The column of the cell to find the node at.
   * @returns The ASTNode at the given cell or null if none could be found.
   */
  public findAtCell(row: number, column: number): ASTNode | null {
    if (!this.root) {
      return null;
    } else {
      return findAtCell(this.root, row, column);
    }
  }
}

/** Converts a KeyValues string into an object. */
export function parse(text: string, options?: ParserOptions): unknown {
  return KeyValuesDocument.fromText(text, options).toObject();
}

/** Converts a JavaScript value into a KeyValues string. */
export function stringify(
  value: unknown,
  options?: NodeStringifier.StringifyOptions,
  key?: string
): string {
  if (key) {
    // Wrap the value inside an object
    const obj: Record<string, unknown> = {};
    obj[key] = value;

    return KeyValuesDocument.fromObject(obj).toString(options);
  } else {
    return KeyValuesDocument.fromObject(value).toString(options);
  }
}
