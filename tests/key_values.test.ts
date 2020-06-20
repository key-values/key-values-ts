import { stringify, parse, KeyValuesDocument } from '../src/key_values';
import { PropertyASTNodeImpl, StringASTNodeImpl } from '../src/ast_node_impl';

describe('KeyValues', () => {
  // KeyValues document
  describe('KeyValuesDocument', () => {
    describe('fromObject', () => {
      test('should extract single-property objects', () => {
        const obj = { key: 'value' };
        const expectedRoot = createStringPropertyNode('key', 'value');
        const result = KeyValuesDocument.fromObject(obj);

        expect(result.root).toEqual(expectedRoot);
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
