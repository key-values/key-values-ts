import {
  StringASTNodeImpl,
  ObjectASTNodeImpl,
  ASTNodeImpl,
  PropertyASTNodeImpl,
  ValueASTNodeImpl,
} from './ast_node_impl';

/** Converts a string to a StringASTNode. */
function parseString(value: string): StringASTNodeImpl {
  return new StringASTNodeImpl(value);
}

/** Converts a number to a StringASTNode. */
function parseNumber(value: number): StringASTNodeImpl {
  const str = value.toString();
  return new StringASTNodeImpl(str);
}

/** Converts a boolean to a StringASTNode. */
function parseBoolean(value: boolean): StringASTNodeImpl {
  const str = value ? '1' : '0';
  return new StringASTNodeImpl(str);
}

/** Converts a missing value to a StringASTNode. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseMissing(value: undefined | null): StringASTNodeImpl {
  const str = '';
  return new StringASTNodeImpl(str);
}

/** Converts an array to an ObjectASTNode. */
function parseArray(value: unknown[]): ObjectASTNodeImpl {
  const properties = value.map(
    (value, index) =>
      new PropertyASTNodeImpl(
        new StringASTNodeImpl(index.toString()),
        parse(value) as ValueASTNodeImpl
      )
  );
  return new ObjectASTNodeImpl(properties);
}

/** Converts an object to an ObjectASTNode. */
function parseObject(value: Record<string, unknown>): ObjectASTNodeImpl {
  const properties = Object.keys(value).map(
    (key) =>
      new PropertyASTNodeImpl(
        new StringASTNodeImpl(key.toString()),
        parse(value[key]) as ValueASTNodeImpl
      )
  );

  return new ObjectASTNodeImpl(properties);
}

/** Converts any object to an ASTNode. */
function parse(value: unknown): ASTNodeImpl {
  if (value === undefined || value === null) {
    return parseMissing(value);
  } else if (typeof value === 'string') {
    return parseString(value);
  } else if (typeof value === 'number') {
    return parseNumber(value);
  } else if (typeof value === 'boolean') {
    return parseBoolean(value);
  } else if (Array.isArray(value)) {
    return parseArray(value);
  } else {
    return parseObject(value as Record<string, unknown>);
  }
}

const ObjectParser = {
  parseNumber,
  parseBoolean,
  parseMissing,
  parseString,
  parseArray,
  parseObject,
  parse,
};

export default ObjectParser;
