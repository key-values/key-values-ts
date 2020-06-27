import { parse, stringify } from './key_values';
export { KeyValuesDocument } from './key_values';
export * as NodeParser from './node_parser';
export * as NodeStringifier from './node_stringifier';
export * as Lexer from './lexer';
export * as ObjectParser from './object_parser';
export * as ASTNodes from './ast_node';
export * as ASTNodeImpls from './ast_node_impl';

const KeyValues = { parse, stringify };

export default KeyValues;
