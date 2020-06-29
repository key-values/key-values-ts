import { stringify, parse, KeyValuesDocument } from '../src/key_values';
import {
  PropertyASTNodeImpl,
  StringASTNodeImpl,
  ObjectASTNodeImpl,
  NodePositionImpl,
} from '../src/ast_node_impl';
import { StringifyOptions } from '../src/node_stringifier';

describe('KeyValues', () => {
  // KeyValues document
  describe('KeyValuesDocument', () => {
    // From object
    describe('fromObject', () => {
      test('should extract single-property objects', () => {
        const obj = { key: 'value' };
        const expectedRoot = createStringPropertyNode('key', 'value');
        const result = KeyValuesDocument.fromObject(obj);

        expect(result.root).toEqual(expectedRoot);
      });
      test('should not extract multi-property objects', () => {
        const obj = { key1: 'value1', key2: 'value2' };
        const expectedRoot = new ObjectASTNodeImpl([
          createStringPropertyNode('key1', 'value1'),
          createStringPropertyNode('key2', 'value2'),
        ]);
        const result = KeyValuesDocument.fromObject(obj);

        expect(result.root).toEqual(expectedRoot);
      });
    });
    // To object
    describe('toObject', () => {
      test('should fail with undefined root node', () => {
        const doc = new KeyValuesDocument(undefined);
        const fun = () => {
          doc.toObject();
        };

        expect(fun).toThrow();
      });
      test('should convert simple string property', () => {
        const doc = new KeyValuesDocument(
          createStringPropertyNode('key', 'value')
        );
        const result = doc.toObject();
        const expected = { key: 'value' };

        expect(result).toEqual(expected);
      });
      test('should convert simple empty object property', () => {
        const doc = new KeyValuesDocument(
          new PropertyASTNodeImpl(
            new StringASTNodeImpl('key'),
            new ObjectASTNodeImpl([])
          )
        );
        const result = doc.toObject();
        const expected = { key: {} };

        expect(result).toEqual(expected);
      });
      test('should convert simple string object property', () => {
        const doc = new KeyValuesDocument(
          new PropertyASTNodeImpl(
            new StringASTNodeImpl('key1'),
            new ObjectASTNodeImpl([
              createStringPropertyNode('key1.1', 'value1.1'),
            ])
          )
        );
        const result = doc.toObject();
        const expected = { key1: { 'key1.1': 'value1.1' } };

        expect(result).toEqual(expected);
      });
    });
    // To string
    describe('toString', () => {
      test('should return empty string with undefined root node', () => {
        const doc = new KeyValuesDocument(undefined);
        const result = doc.toString();
        const expected = '';

        expect(result).toEqual(expected);
      });
      test('should stringify simple string property document', () => {
        const doc = new KeyValuesDocument(
          createStringPropertyNode('key', 'value')
        );
        const result = doc.toString();
        const expected = '"key"\t"value"';

        expect(result).toEqual(expected);
      });
      test('should stringify simple empty object property document', () => {
        const doc = new KeyValuesDocument(
          new PropertyASTNodeImpl(
            new StringASTNodeImpl('key'),
            new ObjectASTNodeImpl([])
          )
        );
        const result = doc.toString();
        const expected = '"key"\t{}';

        expect(result).toEqual(expected);
      });
      test('should stringify simple string object property document', () => {
        const doc = new KeyValuesDocument(
          new PropertyASTNodeImpl(
            new StringASTNodeImpl('key1'),
            new ObjectASTNodeImpl([
              createStringPropertyNode('key1.1', 'value1.1'),
            ])
          )
        );
        const result = doc.toString();
        const expected = '"key1"\n{ "key1.1"\t"value1.1" }';

        expect(result).toEqual(expected);
      });
    });
    // Find at offset
    describe('findAtOffset', () => {
      test('should return null for undefined root node', () => {
        const doc = new KeyValuesDocument(undefined);
        const result = doc.findAtOffset(0);
        const expected = null;

        expect(result).toEqual(expected);
      });
      test('should return key for offset in key', () => {
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl('value', true, createLinePos(6, 7));
        // "key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        const doc = new KeyValuesDocument(property);
        const result = doc.findAtOffset(0);

        expect(result).toEqual(key);
      });
      test('should return value for offset in value', () => {
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl('value', true, createLinePos(6, 7));
        // "key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        const doc = new KeyValuesDocument(property);
        const result = doc.findAtOffset(8);

        expect(result).toEqual(value);
      });
      test('should return property for offset in between key and value', () => {
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl('value', true, createLinePos(7, 7));
        // "key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(15)
        );
        const doc = new KeyValuesDocument(property);
        const result = doc.findAtOffset(6);

        expect(result).toEqual(property);
      });
    });
    // Find at cell
    describe('findAtCell', () => {
      test('should return null for undefined root node', () => {
        const doc = new KeyValuesDocument(undefined);
        const result = doc.findAtCell(1, 1);
        const expected = null;

        expect(result).toEqual(expected);
      });
      test('should return key for cell in key', () => {
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl('value', true, createLinePos(6, 7));
        // "key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        const doc = new KeyValuesDocument(property);
        const result = doc.findAtCell(1, 1);

        expect(result).toEqual(key);
      });
      test('should return value for cell in value', () => {
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl('value', true, createLinePos(6, 7));
        // "key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        const doc = new KeyValuesDocument(property);
        const result = doc.findAtCell(1, 9);

        expect(result).toEqual(value);
      });
      test('should return property for cell in between key and value', () => {
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl('value', true, createLinePos(7, 7));
        // "key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(15)
        );
        const doc = new KeyValuesDocument(property);
        const result = doc.findAtCell(1, 7);

        expect(result).toEqual(property);
      });
    });
  });
  // Parse
  describe('parse', () => {
    test('should parse single-property object', () => {
      const text = `"key"
      {
        "key 1" "value 1"
        "key 2" "value 2"
      }`;

      const expected = {
        key: {
          'key 1': 'value 1',
          'key 2': 'value 2',
        },
      };

      expect(parse(text)).toEqual(expected);
    });
    test('should parse nested text', () => {
      const text = `"key" { 
        "key1" "value1"
        "key2" {
          "key2.1" "value2.1"
          "key2.2" "value2.2"
        }
        "key3" "value3"
      }`;

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

      expect(parse(text)).toEqual(expected);
    });
  });
  // Stringify
  describe('stringify', () => {
    test('should extract simple string object', () => {
      const obj = { key: 'value' };
      const expected = `"key"\t"value"`;

      expect(stringify(obj)).toEqual(expected);
    });
    test('should extract nested single-property object', () => {
      const obj = {
        key: {
          'key 1': 'value 1',
          'key 2': 'value 2',
        },
      };
      // "key"
      // {
      //   "key 1"  "value 1"
      //   "key 2"  "value 2"
      // }
      const expected = `"key"\n{\n\t"key 1"\t"value 1"\n\t"key 2"\t"value 2"\n}`;

      expect(stringify(obj)).toEqual(expected);
    });
    test('should wrap string in property with specified key', () => {
      const value = 'value';
      // "key"  "value"
      const expected = `"key"\t"value"`;

      expect(stringify(value, undefined, 'key')).toEqual(expected);
    });
    test('should apply space indention option', () => {
      const obj = {
        key: {
          'key 1': 'value 1',
          'key 2': 'value 2',
        },
      };
      // "key"
      // {
      //   "key 1"  "value 1"
      //   "key 2"  "value 2"
      // }
      const expected = `"key"\n{\n    "key 1"    "value 1"\n    "key 2"    "value 2"\n}`;
      const options: StringifyOptions = { insertSpaces: true };

      expect(stringify(obj, options)).toEqual(expected);
    });
  });
});

/** Creates a simple string property node. */
function createStringPropertyNode(
  key: string,
  value: string
): PropertyASTNodeImpl {
  const keyNode = new StringASTNodeImpl(key);
  const valueNode = new StringASTNodeImpl(value);
  const propertyNode = new PropertyASTNodeImpl(keyNode, valueNode);

  return propertyNode;
}

function createStartPos(
  length: number,
  rowEnd: number,
  columnEnd: number
): NodePositionImpl {
  return new NodePositionImpl(0, length, 1, 1, rowEnd, columnEnd);
}

function createLinePos(
  offset: number,
  length: number,
  rowBegin?: number,
  columnBegin?: number
): NodePositionImpl {
  return new NodePositionImpl(
    offset,
    length,
    rowBegin ?? 1,
    columnBegin ?? offset + 1,
    rowBegin ?? 1,
    (columnBegin ?? offset + 1) + length
  );
}

/** Asserts that the position data of a single-line node is correct. */
function createStartLinePos(length: number): NodePositionImpl {
  return createStartPos(length, 1, length + 1);
}
