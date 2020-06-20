import {
  StringASTNodeImpl,
  PropertyASTNodeImpl,
  ObjectASTNodeImpl,
} from '../src/ast_node_impl';
import * as NodeStringifier from '../src/node_stringifier';

describe('NodeStringifier', () => {
  // String node
  describe('stringifyStringNode', () => {
    test('should stringify simple string', () => {
      const node = createStringNode('value');
      const expected = '"value"';

      expect(NodeStringifier.stringifyStringNode(node)).toEqual(expected);
    });
  });
  // Property node
  describe('stringifyPropertyNode', () => {
    test('should stringify simple string property', () => {
      const node = createStringPropertyNode('key', 'value');
      const expected = '"key"\t"value"';

      expect(NodeStringifier.stringifyPropertyNode(node)).toEqual(expected);
    });
  });
  // Object node
  describe('stringifyObjectNode', () => {
    test('should stringify empty object', () => {
      const node = new ObjectASTNodeImpl([]);
      const expected = '{}';

      expect(NodeStringifier.stringifyObjectNode(node)).toEqual(expected);
    });
    test('should stringify single-line object', () => {
      const node = new ObjectASTNodeImpl([
        createStringPropertyNode('key', 'value'),
      ]);
      const expected = '{ "key"\t"value" }';

      expect(NodeStringifier.stringifyObjectNode(node)).toEqual(expected);
    });
    test('should stringify multi-line object', () => {
      const node = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', 'value1'),
        createStringPropertyNode('key2', 'value2'),
        createStringPropertyNode('key3', 'value3'),
      ]);
      // {
      //   "key1"  "value1"
      //   "key2"  "value2"
      //   "key3"  "value3"
      // }
      const expected = `{\n\t"key1"\t"value1"\n\t"key2"\t"value2"\n\t"key3"\t"value3"\n}`;

      expect(NodeStringifier.stringifyObjectNode(node)).toEqual(expected);
    });
    test('should stringify nested multi-line object', () => {
      const node = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', 'value1'),
        new PropertyASTNodeImpl(
          createStringNode('key2'),
          new ObjectASTNodeImpl([
            createStringPropertyNode('key2.1', 'value2.1'),
            createStringPropertyNode('key2.2', 'value2.2'),
          ])
        ),
        createStringPropertyNode('key3', 'value3'),
      ]);
      // {
      //  "key2.1"  "value2.1"
      //  "key2.2"  "value2.2"
      // }
      const nestedObj = `\t{\n\t\t"key2.1"\t"value2.1"\n\t\t"key2.2"\t"value2.2"\n\t}`;
      // {
      //   "key1"  "value1"
      //   "key2"
      //   { ... }
      //   "key3"  "value3"
      // }
      const expected = `{\n\t"key1"\t"value1"\n\t"key2"\n${nestedObj}\n\t"key3"\t"value3"\n}`;

      expect(NodeStringifier.stringifyObjectNode(node)).toEqual(expected);
    });
  });
});

/** Creates a simple string node. */
function createStringNode(value: string): StringASTNodeImpl {
  return new StringASTNodeImpl(value);
}

/** Creates a simple string property node. */
function createStringPropertyNode(
  key: string,
  value: string
): PropertyASTNodeImpl {
  const keyNode = createStringNode(key);
  const valueNode = createStringNode(value);
  const propertyNode = new PropertyASTNodeImpl(keyNode, valueNode);

  return propertyNode;
}
