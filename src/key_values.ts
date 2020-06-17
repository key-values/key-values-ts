import { KeyValuesDocument } from './key-values-document';

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
