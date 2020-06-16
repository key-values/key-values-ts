import {
  parseAsAST,
  parseWith,
  STRING_UNQUOTED,
  STRING_QUOTED,
  STRING,
  PROPERTY,
  VALUE,
  KEY,
  OBJECT,
  parse,
} from './parser';

describe('Parser', () => {
  // Unquoted string
  describe('unquoted string', () => {
    test('should parse simple string', () => {
      const text = `value`;
      const result = parseWith(text, STRING_UNQUOTED);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeFalsy;
      expect(result.value).toEqual('value');
    });
  });
  // Quoted string
  describe('quoted string', () => {
    test('should parse simple string', () => {
      const text = `"value"`;
      const result = parseWith(text, STRING_QUOTED);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy;
      expect(result.value).toEqual('value');
    });
    test('should parse string with spacing', () => {
      const text = `"value 1 and 2"`;
      const result = parseWith(text, STRING_QUOTED);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy;
      expect(result.value).toEqual('value 1 and 2');
    });
    test('should allow escaped double quote', () => {
      const text = `"value\\"WithQuote"`;
      const result = parseWith(text, STRING_QUOTED);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy;
      expect(result.value).toEqual('value"WithQuote');
    });
  });
  // String
  describe('string', () => {
    test('should parse simple unquoted string', () => {
      const text = `value`;
      const result = parseWith(text, STRING);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeFalsy;
      expect(result.value).toEqual('value');
    });
    test('should parse simple quotedstring', () => {
      const text = `"value"`;
      const result = parseWith(text, STRING);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy;
      expect(result.value).toEqual('value');
    });
    test('should parse quoted string with spacing', () => {
      const text = `"value 1 and 2"`;
      const result = parseWith(text, STRING);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy;
      expect(result.value).toEqual('value 1 and 2');
    });
  });
  // Key
  describe('key', () => {
    test('should parse simple unquoted string', () => {
      const text = `value`;
      const result = parseWith(text, KEY);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeFalsy;
      expect(result.value).toEqual('value');
    });
    test('should parse simple quotedstring', () => {
      const text = `"value"`;
      const result = parseWith(text, KEY);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy;
      expect(result.value).toEqual('value');
    });
    test('should parse quoted string with spacing', () => {
      const text = `"value 1 and 2"`;
      const result = parseWith(text, KEY);

      expect(result.type).toEqual('string');
      expect(result.isQuoted).toBeTruthy;
      expect(result.value).toEqual('value 1 and 2');
    });
  });
  // Object
  describe('object', () => {
    test('should parse empty object', () => {
      const text = `{}`;
      const result = parseWith(text, OBJECT);

      expect(result.type).toEqual('object');
      expect(result.properties).toEqual([]);
    });
    test('should parse simple single string object', () => {
      const text = `{ "key" "value" }`;
      const result = parseWith(text, OBJECT);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(1);

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
      const result = parseWith(text, OBJECT);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(3);

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
      const result = parseWith(text, OBJECT);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(3);

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
    test('should parse nested object', () => {
      const text = `{ 
        "key1" "value1"
        "key2" {
          "key2.1" "value2.1"
          "key2.2" "value2.2"
        }
        "key3" "value3"
      }`;
      const result = parseWith(text, OBJECT);

      expect(result.type).toEqual('object');
      expect(result.properties.length).toBe(3);

      const property1 = result.properties[0];
      expect(property1.keyNode.value).toEqual('key1');
      expect(property1.valueNode?.value).toEqual('value1');
      const property2 = result.properties[1];
      expect(property2.keyNode.value).toEqual('key2');
      expect(property2.valueNode.type).toEqual('object');
      const property3 = result.properties[2];
      expect(property3.keyNode.value).toEqual('key3');
      expect(property3.valueNode?.value).toEqual('value3');
    });
  });
  // Value
  describe('value', () => {
    test('should parse simple unquoted string', () => {
      const text = `value`;
      const result = parseWith(text, VALUE);

      expect(result.type).toEqual('string');
      expect(result.value).toEqual('value');
    });
    test('should parse simple quotedstring', () => {
      const text = `"value"`;
      const result = parseWith(text, VALUE);

      expect(result.type).toEqual('string');
      expect(result.value).toEqual('value');
    });
    test('should parse quoted string with spacing', () => {
      const text = `"value 1 and 2"`;
      const result = parseWith(text, VALUE);

      expect(result.type).toEqual('string');
      expect(result.value).toEqual('value 1 and 2');
    });
  });
  // Property
  describe('property', () => {
    test('should parse simple string property', () => {
      const text = `"key" "value"`;
      const result = parseWith(text, PROPERTY);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
    });
    test('should parse empty object property', () => {
      const text = `"key" {}`;
      const result = parseWith(text, PROPERTY);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.type).toEqual('object');
    });
    test('should parse simple single string object property', () => {
      const text = `"key1" { "key1.1" "value1.1" }`;
      const result = parseWith(text, PROPERTY);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key1');
      expect(result.valueNode.type).toEqual('object');
    });
  });
  // KeyValues
  describe('key values', () => {
    test('should parse simple string property', () => {
      const text = `"key" "value"`;
      const result = parseAsAST(text);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
    });
    test('should parse object property', () => {
      const text = `"key" {}`;
      const result = parseAsAST(text);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.type).toEqual('object');
    });
    test('should allow surrounding whitespace', () => {
      const text = `  
         "key" "value"   
         `;
      const result = parseAsAST(text);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
    });
    test('should allow surrounding comments', () => {
      const text = `
        // Comment 1
        "key" "value"   // Comment 2
        // Comment 3`;
      const result = parseAsAST(text);

      expect(result.type).toEqual('property');
      expect(result.keyNode.value).toEqual('key');
      expect(result.valueNode.value).toEqual('value');
    });
  });
  describe('parse', () => {
    test('should parse nested text', () => {
      const text = `"key" { 
        "key1" "value1"
        "key2" {
          "key2.1" "value2.1"
          "key2.2" "value2.2"
        }
        "key3" "value3"
      }`;

      const result = parse(text);

      const expected = {
        key: {
          key1: 'value1',
          key2: {
            'key2.1': 'value2.1',
            'key2.2': 'value2.2',
          },
          key3: 'value3',
        },
      };

      expect(result).toEqual(expected);
    });
  });
});
