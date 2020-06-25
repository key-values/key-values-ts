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
  Lexer,
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

export default class KeyValuesParser {
  public lexer: Lexer<TokenKind>;

  // Non-recursive parsers
  public space: Parser<TokenKind, unknown>;
  public comment: Parser<TokenKind, unknown>;
  public trivia: Parser<TokenKind, unknown>;
  public openBrace: Parser<TokenKind, Token<TokenKind.LBrace>>;
  public closeBrace: Parser<TokenKind, Token<TokenKind.RBrace>>;
  public unquotedString: Parser<TokenKind, StringASTNodeImpl>;
  public quotedString: Parser<TokenKind, StringASTNodeImpl>;
  public string: Parser<TokenKind, StringASTNodeImpl>;
  public key: Parser<TokenKind, KeyASTNodeImpl>;

  // Recursive parsers
  public value: Parser<TokenKind, ValueASTNodeImpl>;
  public property: Parser<TokenKind, PropertyASTNodeImpl>;
  public object: Parser<TokenKind, ObjectASTNodeImpl>;
  public keyValues: Parser<TokenKind, KeyValuesASTNodeImpl>;

  constructor() {
    this.lexer = lexer;

    // Apply functions
    const applyUnquotedString: (
      value: Token<TokenKind.UnquotedString>
    ) => StringASTNodeImpl = (value) => {
      const pos = new NodePositionImpl(
        value.pos.index,
        value.text.length,
        value.pos.rowBegin,
        value.pos.columnBegin,
        value.pos.rowEnd,
        value.pos.columnEnd
      );

      return new StringASTNodeImpl(value.text, false, pos);
    };

    const applyQuotedString: (
      value: Token<TokenKind.QuotedString>
    ) => StringASTNodeImpl = (value) => {
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

      return new StringASTNodeImpl(str, true, pos);
    };

    const applyString: (value: StringASTNodeImpl) => StringASTNodeImpl = (
      value
    ) => {
      return value;
    };

    const applyKey: (value: StringASTNodeImpl) => KeyASTNodeImpl = (value) => {
      return value;
    };

    const applyValue: (value: ValueASTNodeImpl) => ValueASTNodeImpl = (
      value
    ) => {
      return value;
    };

    const applyProperty: (
      value: [KeyASTNodeImpl, ValueASTNodeImpl]
    ) => PropertyASTNodeImpl = (values) => {
      const key = values[0];
      const value = values[1];

      if (!key.pos || !value.pos) throw new Error('Missing position data.');

      const pos = new NodePositionImpl(
        key.pos.offset,
        value.pos.offset + value.pos.length - key.pos.offset,
        key.pos.rowBegin,
        key.pos.columnBegin,
        value.pos.rowEnd,
        value.pos.columnEnd
      );

      const property = new PropertyASTNodeImpl(key, value, pos);

      return property;
    };

    const applyObject: (
      values: [
        Token<TokenKind.LBrace>,
        PropertyASTNodeImpl[] | undefined,
        Token<TokenKind.RBrace>
      ]
    ) => ObjectASTNodeImpl = (values) => {
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

      const object = new ObjectASTNodeImpl(properties, pos);
      properties.forEach((property) => (property.parent = object));

      return object;
    };

    const applyKeyValues = (value: KeyValuesASTNodeImpl) => {
      return value;
    };

    // Non-recursive parsers
    this.space = tok(TokenKind.Space);
    this.comment = tok(TokenKind.Comment);
    this.trivia = alt(this.space, this.comment);
    this.openBrace = tok(TokenKind.LBrace);
    this.closeBrace = tok(TokenKind.RBrace);
    this.unquotedString = apply(
      tok(TokenKind.UnquotedString),
      applyUnquotedString
    );
    this.quotedString = apply(tok(TokenKind.QuotedString), applyQuotedString);
    this.string = apply(
      alt(this.unquotedString, this.quotedString),
      applyString
    );
    this.key = apply(this.string, applyKey);

    // Recursive parsers
    const value = rule<TokenKind, ValueASTNodeImpl>();
    const property = rule<TokenKind, PropertyASTNodeImpl>();
    const object = rule<TokenKind, ObjectASTNodeImpl>();
    const keyValues = rule<TokenKind, KeyValuesASTNodeImpl>();

    value.setPattern(apply(alt(this.string, object), applyValue));
    property.setPattern(
      apply(seq(kleft(this.key, this.trivia), value), applyProperty)
    );
    object.setPattern(
      apply(
        seq(
          kleft(
            this.openBrace, // A left brace ({) ...
            rep_sc(this.trivia) // ...followed by some trivia...
          ),
          opt_sc(
            // ...followed by an optional list of properties...
            list_sc(
              property, //...containing properties...
              some_sc(this.trivia) // ...separated by space or comments.
            )
          ),
          kright(
            rep_sc(this.trivia), // ...followed by some trivia...
            this.closeBrace // ...follwed by a right brace (}).
          )
        ),
        applyObject
      )
    );
    keyValues.setPattern(
      apply(
        kmid(rep_sc(this.trivia), property, rep_sc(this.trivia)),
        applyKeyValues
      )
    );

    this.value = value;
    this.property = property;
    this.object = object;
    this.keyValues = keyValues;
  }
}

export function some_sc<TKind, TResult>(
  p: Parser<TKind, TResult>
): Parser<TKind, TResult[]> {
  return apply(seq(p, rep_sc(p)), (value: [TResult, TResult[]]) => {
    return [value[0]].concat(value[1]);
  });
}

export function parseWith<TResult>(
  text: string,
  parser: Parser<TokenKind, TResult>
): TResult {
  return expectSingleResult(expectEOF(parser.parse(lexer.parse(text))));
}
