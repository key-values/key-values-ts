import {
  expectEOF,
  expectSingleResult,
  rule,
  Token,
  tok,
  apply,
  seq,
  alt,
  kmid,
  Parser,
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
  CommentASTNodeImpl,
} from './ast_node_impl';

import KeyValuesLexer, { TokenKind } from './lexer';

export type Trivia = CommentASTNodeImpl | null;
export type ObjectChild = PropertyASTNodeImpl | CommentASTNodeImpl;
export type PropertyChild =
  | KeyASTNodeImpl
  | ValueASTNodeImpl
  | CommentASTNodeImpl;

export interface ParserOptions {
  /** Determines if the parser should include comments in the AST.
   * Defaults to false.
   */
  collectComments?: boolean;
  /** Determines if string escaping should be enabled.
   * Defaults to false.
   */
  escapeStrings?: boolean;
}

export interface ParserSettings extends ParserOptions {
  collectComments: boolean;
  escapeStrings: boolean;
}

export const DEFAULT_SETTINGS: ParserSettings = {
  collectComments: false,
  escapeStrings: false,
};

/** Converts the given options to settings. */
export function getSettings(options?: ParserOptions): ParserSettings {
  if (!options) return DEFAULT_SETTINGS;

  return {
    collectComments:
      options.collectComments ?? DEFAULT_SETTINGS.collectComments,
    escapeStrings: options.escapeStrings ?? DEFAULT_SETTINGS.escapeStrings,
  };
}

export default class KeyValuesParser {
  public lexer: KeyValuesLexer;
  public settings: ParserSettings;

  // Non-recursive parsers
  public space: Parser<TokenKind, null>;
  public comment: Parser<TokenKind, CommentASTNodeImpl>;
  public trivia: Parser<TokenKind, Trivia>;
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

  constructor(options?: ParserOptions) {
    this.lexer = new KeyValuesLexer(options);
    this.settings = getSettings(options);

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

      if (this.settings.escapeStrings) {
        // Resolve escaped quotes
        str = str.replace(/\\"/, '"');
        str = str.replace(/\\n/, '\n');
        str = str.replace(/\\t/, '\t');
      }

      return new StringASTNodeImpl(str, true, pos);
    };

    const applyString: (value: StringASTNodeImpl) => StringASTNodeImpl = (
      value
    ) => {
      return value;
    };

    const applyComment: (
      value: Token<TokenKind.Comment>
    ) => CommentASTNodeImpl = (value) => {
      // Strip the comment value of the slashes and trim sourrounding whitespace
      const comment = value.text.substr(2).trim();

      const pos = new NodePositionImpl(
        value.pos.index,
        value.text.length,
        value.pos.rowBegin,
        value.pos.columnBegin,
        value.pos.rowEnd,
        value.pos.columnEnd
      );

      return new CommentASTNodeImpl(comment, pos);
    };

    const applySpace: (value: Token<TokenKind.Space>) => null = () => null;

    const applyTrivia: (value: Trivia) => Trivia = (value) => {
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
      value: [KeyASTNodeImpl, Trivia[], ValueASTNodeImpl]
    ) => PropertyASTNodeImpl = (values) => {
      const key = values[0];
      const trivia = values[1];
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

      // If enabled, include comments in the AST
      const comments = this.settings.collectComments
        ? (trivia.filter((item) => item !== null) as CommentASTNodeImpl[])
        : [];
      const property = new PropertyASTNodeImpl(key, value, comments, pos);

      return property;
    };

    const applyObject: (
      values: [
        Token<TokenKind.LBrace>,
        Trivia[],
        [PropertyASTNodeImpl, Trivia[]][],
        Trivia[],
        Token<TokenKind.RBrace>
      ]
    ) => ObjectASTNodeImpl = (values) => {
      const lBrace = values[0];
      const preComments: ObjectChild[] = triviaToComments(values[1]);
      const rawChildren = values[2];
      const postComments: ObjectChild[] = triviaToComments(values[3]);
      const rBrace = values[4];

      const children: ObjectChild[] = this.settings.collectComments
        ? // Include comments in the AST if enabled
          // The comments before the properties...
          preComments
            .concat(
              // ...combined with the properties and comments...
              rawChildren
                .map((child) => {
                  // Combine property and comments
                  return ([child[0]] as ObjectChild[]).concat(
                    triviaToComments(child[1]) as ObjectChild[]
                  );
                })
                .reduce((a, b) => a.concat(b), [])
            )
            // ...combined with the comments after the properties.
            .concat(postComments)
        : // If comments are disabled, only include the properties
          rawChildren.map((child) => {
            // Extract property
            return child[0] as ObjectChild;
          });

      const pos = new NodePositionImpl(
        lBrace.pos.index,
        rBrace.pos.index + 1 - lBrace.pos.index,
        lBrace.pos.rowBegin,
        lBrace.pos.columnBegin,
        rBrace.pos.rowEnd,
        rBrace.pos.columnEnd
      );

      const object = new ObjectASTNodeImpl(children, pos);
      return object;
    };

    const applyKeyValues = (value: KeyValuesASTNodeImpl) => {
      return value;
    };

    // Non-recursive parsers
    this.space = apply(tok(TokenKind.Space), applySpace);
    this.comment = apply(tok(TokenKind.Comment), applyComment);
    this.trivia = apply(alt(this.space, this.comment), applyTrivia);
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
      apply(seq(this.key, rep_sc(this.trivia), value), applyProperty)
    );
    object.setPattern(
      apply(
        seq(
          this.openBrace, // A left brace ({) ...
          rep_sc(this.trivia), // ...followed by some trivia...
          // ...followed by an optional list of properties...
          rep_sc(
            seq(
              property, //...containing properties...
              some_sc(this.trivia) // ...separated by space or comments.
            )
          ),
          rep_sc(this.trivia), // ...followed by some trivia...
          this.closeBrace // ...follwed by a right brace (}).
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

function triviaToComments(trivia: Trivia[]): CommentASTNodeImpl[] {
  return trivia.filter((item) => item !== null) as CommentASTNodeImpl[];
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
  lexer: KeyValuesLexer,
  parser: Parser<TokenKind, TResult>
): TResult {
  return expectSingleResult(expectEOF(parser.parse(lexer.parse(text))));
}
