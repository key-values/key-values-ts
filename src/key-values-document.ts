/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyValuesASTNode } from './ast_node';
import NodeParser from './node_parser';
import { parseWith, KEY_VALUES } from './parser';
import NodeStringifier from './node_stringifier';

export class KeyValuesDocument {
  constructor(public readonly root: KeyValuesASTNode | undefined) {}

  /** Creates a KeyValues document from a text. */
  public static fromText(text: string): KeyValuesDocument {
    const root = parseWith(text, KEY_VALUES);

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
