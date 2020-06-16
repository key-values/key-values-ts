import { buildLexer } from 'typescript-parsec';

export enum TokenKind {
  LBrace,
  RBrace,
  Space,
  Comment,
  UnquotedString,
  QuotedString,
}

export const lexer = buildLexer([
  [true, /^\{/g, TokenKind.LBrace],
  [true, /^\}/g, TokenKind.RBrace],
  [true, /^\s+/g, TokenKind.Space],
  [true, /^[/][/][^\n]*\s*/g, TokenKind.Comment],
  [true, /^[^\s{}"]+/g, TokenKind.UnquotedString],
  [true, /^(?<!\\)"(?:[^"]|(?:\\"))*(?<!\\)"/g, TokenKind.QuotedString],
]);
