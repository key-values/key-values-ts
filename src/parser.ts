import {
  expectEOF,
  expectSingleResult,
  rule,
  Token,
  tok,
  apply,
  seq,
  alt,
  opt_sc,
  list_sc,
  kmid,
  Parser,
  kleft,
  kright,
  rep_sc,
} from 'typescript-parsec';

import {
  StringASTNodeImpl,
  PropertyASTNodeImpl,
  ObjectASTNodeImpl,
  NodePositionImpl,
  KeyASTNodeImpl,
  ValueASTNodeImpl,
  KeyValuesASTNodeImpl,
} from './ast_node_impl';

import { TokenKind, lexer } from './lexer';

export const TRIVIA_BASE = alt(tok(TokenKind.Space), tok(TokenKind.Comment));
export const TRIVIA = rep_sc(TRIVIA_BASE);
export const TRIVIA_SOME = seq(TRIVIA_BASE, TRIVIA);
export const STRING_UNQUOTED = rule<TokenKind, StringASTNodeImpl>();
export const STRING_QUOTED = rule<TokenKind, StringASTNodeImpl>();
export const STRING = rule<TokenKind, StringASTNodeImpl>();
export const KEY = rule<TokenKind, KeyASTNodeImpl>();
export const VALUE = rule<TokenKind, ValueASTNodeImpl>();
export const PROPERTY = rule<TokenKind, PropertyASTNodeImpl>();
export const OBJECT = rule<TokenKind, ObjectASTNodeImpl>();
export const KEY_VALUES = rule<TokenKind, KeyValuesASTNodeImpl>();

function applyUnquoted(
  value: Token<TokenKind.UnquotedString>
): StringASTNodeImpl {
  const pos = new NodePositionImpl(
    value.pos.index,
    value.text.length,
    value.pos.rowBegin,
    value.pos.columnBegin,
    value.pos.rowEnd,
    value.pos.columnEnd
  );

  const node = new StringASTNodeImpl(undefined, value.text, pos);
  node.isQuoted = false;
  return node;
}

function applyQuoted(value: Token<TokenKind.QuotedString>): StringASTNodeImpl {
  const pos = new NodePositionImpl(
    value.pos.index,
    value.text.length,
    value.pos.rowBegin,
    value.pos.columnBegin,
    value.pos.rowEnd,
    value.pos.columnEnd
  );

  // Extract string value
  let str = value.text.slice(1, value.text.length - 1);
  // Resolve escaped quotes
  str = str.replace(/\\"/, '"');

  return new StringASTNodeImpl(undefined, str, pos);
}

function applyString(value: StringASTNodeImpl): StringASTNodeImpl {
  return value;
}

function applyKey(value: KeyASTNodeImpl): KeyASTNodeImpl {
  return value;
}

function applyValue(value: ValueASTNodeImpl): ValueASTNodeImpl {
  return value;
}

function applyProperty(
  values: [KeyASTNodeImpl, Token<TokenKind.Space>, ValueASTNodeImpl]
): PropertyASTNodeImpl {
  const key = values[0];
  const value = values[2];

  if (!key.pos || !value.pos) throw new Error('Missing position data.');

  const pos = new NodePositionImpl(
    key.pos.offset,
    value.pos.offset + value.pos.length - key.pos.offset,
    key.pos.rowBegin,
    key.pos.columnBegin,
    value.pos.rowEnd,
    value.pos.columnEnd
  );

  const property = new PropertyASTNodeImpl(undefined, key, value, pos);

  return property;
}

function applyObject(
  values: [
    Token<TokenKind.LBrace>,
    PropertyASTNodeImpl[] | undefined,
    Token<TokenKind.RBrace>
  ]
): ObjectASTNodeImpl {
  const lBrace = values[0];
  const properties = values[1] || [];
  const rBrace = values[2];

  const pos = new NodePositionImpl(
    lBrace.pos.index,
    rBrace.pos.index + 1 - lBrace.pos.index,
    lBrace.pos.rowBegin,
    lBrace.pos.columnBegin,
    rBrace.pos.rowEnd,
    rBrace.pos.columnEnd
  );

  const object = new ObjectASTNodeImpl(undefined, properties, pos);
  properties.forEach((property) => (property.parent = object));

  return object;
}

function applyKeyValues(value: KeyValuesASTNodeImpl): KeyValuesASTNodeImpl {
  return value;
}

/** Unquoted string */
STRING_UNQUOTED.setPattern(apply(tok(TokenKind.UnquotedString), applyUnquoted));
/** Quoted string */
STRING_QUOTED.setPattern(apply(tok(TokenKind.QuotedString), applyQuoted));
/** String */
STRING.setPattern(apply(alt(STRING_UNQUOTED, STRING_QUOTED), applyString));
/** Key */
KEY.setPattern(apply(STRING, applyKey));
/** Value */
VALUE.setPattern(apply(alt(STRING, OBJECT), applyValue));
/** Property */
PROPERTY.setPattern(
  apply(seq(KEY, tok(TokenKind.Space), VALUE), applyProperty)
);
/** Object */
OBJECT.setPattern(
  apply(
    seq(
      kleft(
        tok(TokenKind.LBrace), // A left brace ({) ...
        TRIVIA // ...followed by some trivia...
      ),
      opt_sc(
        // ...followed by an optional list of properties...
        list_sc(
          PROPERTY, //...containing properties...
          TRIVIA_SOME // ...separated by space or comments.
        )
      ),
      kright(
        TRIVIA, // ...followed by some trivia...
        tok(TokenKind.RBrace) // ...follwed by a right brace (}).
      )
    ),
    applyObject
  )
);
/** Key Values */
KEY_VALUES.setPattern(apply(kmid(TRIVIA, PROPERTY, TRIVIA), applyKeyValues));

export function parseWith<TResult>(
  text: string,
  parser: Parser<TokenKind, TResult>
): TResult {
  return expectSingleResult(expectEOF(parser.parse(lexer.parse(text))));
}
