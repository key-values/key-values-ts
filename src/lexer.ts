import { buildLexer } from 'typescript-parsec';

export enum TokenKind {
  LBrace,
  RBrace,
  Space,
  QuotedString,
  UnquotedString,
  DoubleQuote,
}

export const lexer = buildLexer([
  [true, /^\{/g, TokenKind.LBrace],
  [true, /^\}/g, TokenKind.RBrace],
  [true, /^\s+/g, TokenKind.Space],
  [true, /^[^\s{}"]+/g, TokenKind.UnquotedString],
  [true, /^(?<!\\)"(?:[^"]|(?:\\"))*(?<!\\)"/g, TokenKind.QuotedString],
]);
