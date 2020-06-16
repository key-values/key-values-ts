import {
  buildLexer,
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
} from 'typescript-parsec';
import {
  StringASTNode,
  NumberASTNode,
  PropertyASTNode,
  ObjectASTNode,
  LiteralASTNode,
  KeyASTNode,
  ValueASTNode,
  KeyValuesASTNode,
} from './ast_node';
import {
  NumberASTNodeImpl,
  StringASTNodeImpl,
  PropertyASTNodeImpl,
  ObjectASTNodeImpl,
} from './ast_node_impl';

enum TokenKind {
  UnquotedString,
  QuotedString,
  DoubleQuote,
  LBrace,
  RBrace,
  Space,
  Whitespace,
  Linebreak,
}

const lexer = buildLexer([
  [true, /^(?:\w|\d|[_.#*+~-?])*/g, TokenKind.QuotedString],
  [true, /^(?:\w|\d|[_.#*+~-? \t{}]|(?:\\["\\]))*/g, TokenKind.UnquotedString],
  [true, /^"/g, TokenKind.DoubleQuote],
  [true, /^{/g, TokenKind.LBrace],
  [true, /^}/g, TokenKind.RBrace],
  [false, /^[ \t]+/g, TokenKind.Space],
  [false, /^\s*/g, TokenKind.Whitespace],
  [false, /^\n+/g, TokenKind.Linebreak],
]);

const STRING_UNQUOTED = rule<TokenKind, StringASTNode>();
const STRING_QUOTED = rule<TokenKind, StringASTNode>();
const STRING = rule<TokenKind, StringASTNode>();
const LITERAL = rule<TokenKind, LiteralASTNode>();
const KEY = rule<TokenKind, KeyASTNode>();
const VALUE = rule<TokenKind, ValueASTNode>();
const PROPERTY = rule<TokenKind, PropertyASTNode>();
const OBJECT = rule<TokenKind, ObjectASTNode>();
const KEY_VALUES = rule<TokenKind, KeyValuesASTNode>();

function applyUnquoted(value: Token<TokenKind.UnquotedString>): StringASTNode {
  const node = new StringASTNodeImpl(
    undefined,
    value.text,
    value.pos.index,
    value.text.length
  );
  node.isQuoted = false;
  return node;
}

function applyQuoted(
  value: [
    Token<TokenKind.DoubleQuote>,
    Token<TokenKind.QuotedString>,
    Token<TokenKind.DoubleQuote>
  ]
): StringASTNode {
  const str = value[1];
  return new StringASTNodeImpl(
    undefined,
    str.text,
    str.pos.index - 1,
    str.text.length + 2
  );
}

function applyString(value: StringASTNode): StringASTNode {
  return value;
}

function applyLiteral(value: LiteralASTNode): LiteralASTNode {
  return value;
}

function applyKey(value: KeyASTNode): KeyASTNode {
  return value;
}

function applyValue(value: ValueASTNode): ValueASTNode {
  return value;
}

function applyProperty(
  values: [KeyASTNode, Token<TokenKind.Space>, ValueASTNode]
): PropertyASTNode {
  const key = values[0];
  const space = values[1];
  const value = values[2];

  const offset = key.offset;
  const length = key.length + space.text.length + value.length;

  const property = new PropertyASTNodeImpl(
    undefined,
    key,
    value,
    offset,
    length
  );
  key.parent = property;
  value.parent = property;

  return property;
}

function applyObject(
  values: [
    Token<TokenKind.LBrace>,
    Token<TokenKind.Whitespace>,
    PropertyASTNode[] | undefined,
    Token<TokenKind.Whitespace>,
    Token<TokenKind.RBrace>
  ]
): ObjectASTNode {
  const lBrace = values[0];
  const properties = values[2] || [];
  const rBrace = values[4];

  const offset = lBrace.pos.index;
  const length = rBrace.pos.index + 1 - offset;

  const object = new ObjectASTNodeImpl(undefined, properties, offset, length);
  properties.forEach((property) => (property.parent = object));

  return object;
}

function applyKeyValues(value: KeyValuesASTNode): KeyValuesASTNode {
  return value;
}

/** Unquoted string */
STRING_UNQUOTED.setPattern(apply(tok(TokenKind.UnquotedString), applyUnquoted));
/** Quoted string */
STRING_QUOTED.setPattern(
  apply(
    seq(
      tok(TokenKind.DoubleQuote), // quotation marks (")...
      tok(TokenKind.QuotedString), // ...followed by a string...
      tok(TokenKind.DoubleQuote) // ...followed by quotation marks (")
    ),
    applyQuoted
  )
);
/** String */
STRING.setPattern(apply(alt(STRING_UNQUOTED, STRING_QUOTED), applyString));
/** Literal */
LITERAL.setPattern(apply(STRING, applyLiteral));
/** Key */
KEY.setPattern(apply(STRING, applyKey));
/** Value */
VALUE.setPattern(apply(alt(LITERAL, OBJECT), applyValue));
/** Property */
PROPERTY.setPattern(
  apply(seq(KEY, tok(TokenKind.Space), VALUE), applyProperty)
);
/** Object */
OBJECT.setPattern(
  apply(
    seq(
      tok(TokenKind.LBrace), // A left brace ({) ...
      tok(TokenKind.Whitespace), // ...followed by some whitespace...
      opt_sc(
        // ...follwed by an optional list of properties...
        list_sc(
          PROPERTY, //...containing properties...
          kmid(
            tok(TokenKind.Whitespace),
            tok(TokenKind.Linebreak), // ...seperated by linebreaks.
            tok(TokenKind.Whitespace)
          )
        )
      ),
      tok(TokenKind.Whitespace), //...followed by some whitespace...
      tok(TokenKind.RBrace) // ...followed by a right brace (}).
    ),
    applyObject
  )
);
/** Key Values */
KEY_VALUES.setPattern(
  apply(
    kmid(tok(TokenKind.Whitespace), PROPERTY, tok(TokenKind.Whitespace)),
    applyKeyValues
  )
);

function parseAST(text: string): KeyValuesASTNode {
  return expectSingleResult(expectEOF(KEY_VALUES.parse(lexer.parse(text))));
}
