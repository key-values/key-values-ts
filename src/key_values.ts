/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyValuesDocument } from './key-values-document';

/** Converts a KeyValues string into an object. */
function parse(text: string): any {
  return KeyValuesDocument.fromText(text).toObject();
}

/** Converts a JavaScript value into a KeyValues string. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stringify(value: any, key?: string): string {
  throw new Error('Not implemented');
}

const KeyValues = {
  parse,
  stringify,
};

export default KeyValues;
