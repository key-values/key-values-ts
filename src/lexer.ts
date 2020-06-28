import { buildLexer, Lexer, Token } from 'typescript-parsec';
import { ParserOptions, ParserSettings, getSettings } from './parser';

export enum TokenKind {
  LBrace,
  RBrace,
  Space,
  Comment,
  UnquotedString,
  QuotedString,
}

export type TokenDef = [boolean, RegExp, TokenKind];

export default class KeyValuesLexer {
  public lexer: Lexer<TokenKind>;
  public settings: ParserSettings;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options?: ParserOptions) {
    this.settings = getSettings(options);

    const openBrace: TokenDef = [true, /^\{/g, TokenKind.LBrace];
    const closeBrace: TokenDef = [true, /^\}/g, TokenKind.RBrace];
    const space: TokenDef = [true, /^\s+/g, TokenKind.Space];
    const comment: TokenDef = [true, /^[/][/][^\n]*\s*/g, TokenKind.Comment];
    const unquotedString: TokenDef = [
      true,
      /^[^\s{}"]+/g,
      TokenKind.UnquotedString,
    ];
    let quotedString: TokenDef;

    if (this.settings.escapeStrings) {
      quotedString = [
        true,
        /^(?<!\\)"(?:[^"]|(?:\\"))*(?<!\\)"/g,
        TokenKind.QuotedString,
      ];
    } else {
      quotedString = [true, /^"[^"]*"/g, TokenKind.QuotedString];
    }

    this.lexer = buildLexer([
      openBrace,
      closeBrace,
      space,
      comment,
      unquotedString,
      quotedString,
    ]);
  }

  /** Parses the given text into tokens. */
  public parse(input: string): Token<TokenKind> | undefined {
    return this.lexer.parse(input);
  }
}
