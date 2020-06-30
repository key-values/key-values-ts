import KeyValuesParser, { parseWith } from '../src/parser';
import { assertPos, assertSingleLinePos, assertStartPos } from './test_util';

let parser: KeyValuesParser;

describe('Parser', () => {
  beforeEach(() => {
    parser = new KeyValuesParser();
  });
  // Unquoted string
  describe('unquoted string', () => {
    test('should parse simple string', () => {
      const text = `value`;
      const result = parseWith(text, parser.lexer, parser.unquotedString);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeFalsy();
      expect(result.value).toEqual('value');
      assertSingleLinePos(result, 5);
    });
    test('should fail with quotes', () => {
      const text = `value"`;
      const fun = () => {
        parseWith(text, parser.lexer, parser.unquotedString);
      };

      expect(fun).toThrow();
    });
    test('should fail with spaces', () => {
      const text = `value `;
      const fun = () => {
        parseWith(text, parser.lexer, parser.unquotedString);
      };

      expect(fun).toThrow();
    });
    test('should fail with tabs', () => {
      const text = `value\t`;
      const fun = () => {
        parseWith(text, parser.lexer, parser.unquotedString);
      };

      expect(fun).toThrow();
    });
    test('should fail with newline', () => {
      const text = `value\n`;
      const fun = () => {
        parseWith(text, parser.lexer, parser.unquotedString);
      };

      expect(fun).toThrow();
    });
    test('should fail with open brace', () => {
      const text = `value{`;
      const fun = () => {
        parseWith(text, parser.lexer, parser.unquotedString);
      };

      expect(fun).toThrow();
    });
  });
  // Quoted string
  describe('quoted string', () => {
    test('should parse simple string', () => {
      const text = `"value"`;
      const result = parseWith(text, parser.lexer, parser.quotedString);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value');
      assertSingleLinePos(result, 7);
    });
    test('should parse string with braces', () => {
      const text = `"value{}"`;
      const result = parseWith(text, parser.lexer, parser.quotedString);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value{}');
      assertSingleLinePos(result, 9);
    });
    test('should parse string with spaces and tabs', () => {
      const text = `"value \t"`;
      const result = parseWith(text, parser.lexer, parser.quotedString);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value \t');
      assertSingleLinePos(result, 9);
    });
    test('should fail with newline', () => {
      const text = `"value\n"`;
      const fun = () => {
        parseWith(text, parser.lexer, parser.quotedString);
      };

      expect(fun).toThrow();
    });
    test('should parse string with spacing', () => {
      const text = `"value 1 and 2"`;
      const result = parseWith(text, parser.lexer, parser.quotedString);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value 1 and 2');
      assertSingleLinePos(result, 15);
    });
    test('should not allow escaped double quote if disabled', () => {
      const unescapedParser = new KeyValuesParser({ escapeStrings: false });
      const text = `"value\\"WithQuote"`;
      const fun = () => {
        parseWith(text, unescapedParser.lexer, unescapedParser.quotedString);
      };

      expect(fun).toThrow();
    });
    test('should allow escaped double quote if enabled', () => {
      const escapeParser = new KeyValuesParser({ escapeStrings: true });
      const text = `"value\\"WithQuote"`;
      const result = parseWith(
        text,
        escapeParser.lexer,
        escapeParser.quotedString
      );

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value"WithQuote');
      assertSingleLinePos(result, 18);
    });
  });
  // String
  describe('string', () => {
    test('should parse simple unquoted string', () => {
      const text = `value`;
      const result = parseWith(text, parser.lexer, parser.string);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeFalsy();
      expect(result.value).toEqual('value');
      assertSingleLinePos(result, 5);
    });
    test('should parse simple quoted string', () => {
      const text = `"value"`;
      const result = parseWith(text, parser.lexer, parser.string);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value');
      assertSingleLinePos(result, 7);
    });
    test('should parse quoted string with spacing', () => {
      const text = `"value 1 and 2"`;
      const result = parseWith(text, parser.lexer, parser.string);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value 1 and 2');
      assertSingleLinePos(result, 15);
    });
  });
  // Comment
  describe('comment', () => {
    test('should parse simple comment', () => {
      const text = `// Comment`;
      const result = parseWith(text, parser.lexer, parser.comment);

      expect(result.type).toEqual('comment');
      expect(result.value).toEqual('Comment');
      assertSingleLinePos(result, 10);
    });
  });
  // Key
  describe('key', () => {
    test('should parse simple unquoted string', () => {
      const text = `value`;
      const result = parseWith(text, parser.lexer, parser.key);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeFalsy;
      expect(result.value).toEqual('value');
      assertSingleLinePos(result, 5);
    });
    test('should parse simple quoted string', () => {
      const text = `"value"`;
      const result = parseWith(text, parser.lexer, parser.key);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value');
      assertSingleLinePos(result, 7);
    });
    test('should parse quoted string with spacing', () => {
      const text = `"value 1 and 2"`;
      const result = parseWith(text, parser.lexer, parser.key);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy();
      expect(result.value).toEqual('value 1 and 2');
      assertSingleLinePos(result, 15);
    });
  });
  // Object
  describe('object', () => {
    test('should parse empty object', () => {
      const text = `{}`;
      const result = parseWith(text, parser.lexer, parser.object);

      expect(result.type).toEqual('object');
      expect(result.properties).toEqual([]);
      assertSingleLinePos(result, 2);
    });
    test('should parse simple single string object', () => {
      const text = `{ "key" "value" }`;
      const result = parseWith(text, parser.lexer, parser.object);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(1);
      assertSingleLinePos(result, 17);

      const property = result.properties[0];
      expect(property.keyNode.value).toEqual('key');
      expect(property.valueNode?.value).toEqual('value');
    });
    test('should parse simple multi string object', () => {
      const text = `{ 
        "key1" "value1"
        "key2" "value2"
        "key3" "value3"
      }`;
      const result = parseWith(text, parser.lexer, parser.object);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(3);
      assertStartPos(result, 82, 5, 8);

      const property1 = result.properties[0];
      expect(property1.keyNode.value).toEqual('key1');
      expect(property1.valueNode?.value).toEqual('value1');
      const property2 = result.properties[1];
      expect(property2.keyNode.value).toEqual('key2');
      expect(property2.valueNode?.value).toEqual('value2');
      const property3 = result.properties[2];
      expect(property3.keyNode.value).toEqual('key3');
      expect(property3.valueNode?.value).toEqual('value3');
    });
    test('should allow comments', () => {
      const text = `{// Comment 1
        "key1" "value1"//Comment 2
        // Comment 3
        "key2" "value2"
        "key3" "value3"
        // Comment 4
      }`;
      const result = parseWith(text, parser.lexer, parser.object);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(3);
      assertStartPos(result, 146, 7, 8);

      const property1 = result.properties[0];
      expect(property1.keyNode.value).toEqual('key1');
      expect(property1.valueNode?.value).toEqual('value1');
      const property2 = result.properties[1];
      expect(property2.keyNode.value).toEqual('key2');
      expect(property2.valueNode?.value).toEqual('value2');
      const property3 = result.properties[2];
      expect(property3.keyNode.value).toEqual('key3');
      expect(property3.valueNode?.value).toEqual('value3');
      expect(result.comments.length).toBe(0);
    });
    test('should include comments in the AST if enabled', () => {
      const commentParser = new KeyValuesParser({ collectComments: true });
      const text = `{// Comment 1
        "key1" "value1"//Comment 2
        // Comment 3
        "key2" "value2"
        "key3" "value3"
        // Comment 4
      }`;
      const result = parseWith(text, parser.lexer, commentParser.object);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(3);
      assertStartPos(result, 146, 7, 8);

      const property1 = result.properties[0];
      expect(property1.keyNode.value).toEqual('key1');
      expect(property1.valueNode?.value).toEqual('value1');
      const property2 = result.properties[1];
      expect(property2.keyNode.value).toEqual('key2');
      expect(property2.valueNode?.value).toEqual('value2');
      const property3 = result.properties[2];
      expect(property3.keyNode.value).toEqual('key3');
      expect(property3.valueNode?.value).toEqual('value3');
      expect(result.comments.length).toBe(4);
      expect(result.children.length).toBe(7);
    });
    test('should parse nested object', () => {
      const text = `{ 
        "key1" "value1"
        "key2" {
          "key2.1" "value2.1"
          "key2.2" "value2.2"
        }
        "key3" "value3"
      }`;
      const result = parseWith(text, parser.lexer, parser.object);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(3);
      assertStartPos(result, 145, 8, 8);

      const property1 = result.properties[0];
      expect(property1.keyNode.value).toEqual('key1');
      expect(property1.valueNode?.value).toEqual('value1');
      const property2 = result.properties[1];
      expect(property2.keyNode.value).toEqual('key2');
      expect(property2.valueNode.type).toEqual('object');
      assertPos(property2, 35, 78, 3, 9, 6, 10);
      const obj = property2.valueNode;
      assertPos(obj, 42, 71, 3, 16, 6, 10);
      const property3 = result.properties[2];
      expect(property3.keyNode.value).toEqual('key3');
      expect(property3.valueNode?.value).toEqual('value3');
    });
  });
  // Value
  describe('value', () => {
    test('should parse simple unquoted string', () => {
      const text = `value`;
      const result = parseWith(text, parser.lexer, parser.value);

      expect(result.type).toEqual('string');
      expect(result.value).toEqual('value');
      assertSingleLinePos(result, 5);
    });
    test('should parse simple quotedstring', () => {
      const text = `"value"`;
      const result = parseWith(text, parser.lexer, parser.value);

      expect(result.type).toEqual('string');
      expect(result.value).toEqual('value');
      assertSingleLinePos(result, 7);
    });
    test('should parse quoted string with spacing', () => {
      const text = `"value 1 and 2"`;
      const result = parseWith(text, parser.lexer, parser.value);

      expect(result.type).toEqual('string');
      expect(result.value).toEqual('value 1 and 2');
      assertSingleLinePos(result, 15);
    });
  });
  // Property
  describe('property', () => {
    test('should parse simple string property', () => {
      const text = `"key" "value"`;
      const result = parseWith(text, parser.lexer, parser.property);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
      assertSingleLinePos(result, 13);
    });
    test('should parse empty object property', () => {
      const text = `"key" {}`;
      const result = parseWith(text, parser.lexer, parser.property);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.type).toEqual('object');
      assertSingleLinePos(result, 8);
    });
    test('should allow comments between key and string value', () => {
      const text = `"key"// Comment\n"value"`;
      const result = parseWith(text, parser.lexer, parser.property);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
      expect(result.comments.length).toBe(0);
    });
    test('should allow comments between key and object value', () => {
      const text = `"key"// Comment\n{ "key1"\t"value1" }`;
      const result = parseWith(text, parser.lexer, parser.property);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.type).toEqual('object');
      expect(result.comments.length).toBe(0);
    });
    test('should include comments in the AST if enabled', () => {
      const commentParser = new KeyValuesParser({ collectComments: true });
      const text = `"key"// Comment\n{ "key1"\t"value1" }`;
      const result = parseWith(text, parser.lexer, commentParser.property);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.type).toEqual('object');
      expect(result.comments.length).toBe(1);
      expect(result.comments[0].value).toEqual('Comment');
    });
    test('should parse simple single string object property', () => {
      const text = `"key1" { "key1.1" "value1.1" }`;
      const result = parseWith(text, parser.lexer, parser.property);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key1');
      expect(result.valueNode.type).toEqual('object');
      assertSingleLinePos(result, 30);
    });
  });
  // KeyValues
  describe('key values', () => {
    test('should parse simple string property', () => {
      const text = `"key" "value"`;
      const result = parseWith(text, parser.lexer, parser.keyValues);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
      assertSingleLinePos(result, 13);
    });
    test('should parse object property', () => {
      const text = `"key" {}`;
      const result = parseWith(text, parser.lexer, parser.keyValues);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.type).toEqual('object');
      assertSingleLinePos(result, 8);
    });
    test('should allow surrounding whitespace', () => {
      const text = `  
         "key" "value"   
         `;
      const result = parseWith(text, parser.lexer, parser.keyValues);
      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
      assertPos(result, 12, 13, 2, 10, 2, 23);
    });
    test('should allow surrounding comments', () => {
      const text = `
        // Comment 1
        "key" "value"   // Comment 2
        // Comment 3`;
      const result = parseWith(text, parser.lexer, parser.keyValues);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
      assertPos(result, 30, 13, 3, 9, 3, 22);
    });
  });
});
