/* eslint-disable @typescript-eslint/no-explicit-any */
import NodeParser from './node_parser';
import { parseWith, KEY_VALUES } from './parser';
import NodeStringifier from './node_stringifier';
import ObjectParser from './object_parser';
import { ASTNode } from './ast_node';

export default class KeyValuesDocument {
  constructor(public readonly root: ASTNode | undefined) {}

  /** Creates a KeyValues document from a text. */
  public static fromText(text: string): KeyValuesDocument {
    const root = parseWith(text, KEY_VALUES);

    return new KeyValuesDocument(root);
  }

  /** Creates a KeyValues document from an object. */
  public static fromObject(obj: unknown): KeyValuesDocument {
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
