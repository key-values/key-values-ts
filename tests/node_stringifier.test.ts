import {
  StringASTNodeImpl,
  PropertyASTNodeImpl,
  ObjectASTNodeImpl,
} from '../src/ast_node_impl';
import * as NodeStringifier from '../src/node_stringifier';

describe('NodeStringifier', () => {
  // Generate indent
  describe('genIndent', () => {
    test('should generate undefined indent with tabs', () => {
      const indent = NodeStringifier.genIndent(undefined, undefined);
      const expected = '';

      expect(indent).toEqual(expected);
    });
    test('should generate 0 indent with tabs', () => {
      const options: NodeStringifier.StringifyOptions = {
        tabSize: 4,
        insertSpaces: false,
      };
      const indent = NodeStringifier.genIndent(options, 0);
      const expected = '';

      expect(indent).toEqual(expected);
    });
    test('should generate 2 indent with tabs', () => {
      const options: NodeStringifier.StringifyOptions = {
        tabSize: 4,
        insertSpaces: false,
      };
      const indent = NodeStringifier.genIndent(options, 2);
      const expected = '\t\t';

      expect(indent).toEqual(expected);
    });
    test('should generate 2 indent with 4 spaces', () => {
      const options: NodeStringifier.StringifyOptions = {
        tabSize: 4,
        insertSpaces: true,
      };
      const indent = NodeStringifier.genIndent(options, 2);
      const expected = '        ';

      expect(indent).toEqual(expected);
    });
    test('should generate 2 indent with 2 spaces', () => {
      const options: NodeStringifier.StringifyOptions = {
        tabSize: 2,
        insertSpaces: true,
      };
      const indent = NodeStringifier.genIndent(options, 2);
      const expected = '    ';

      expect(indent).toEqual(expected);
    });
  });
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
    test('should stringify simple string property with tab indention', () => {
      const node = createStringPropertyNode('key', 'value');
      const expected = '"key"\t"value"';

      expect(NodeStringifier.stringifyPropertyNode(node)).toEqual(expected);
    });
    test('should stringify simple string property with 2 space indention', () => {
      const node = createStringPropertyNode('key', 'value');
      const expected = '"key"  "value"';
      const options: NodeStringifier.StringifyOptions = {
        tabSize: 2,
        insertSpaces: true,
      };
      const result = NodeStringifier.stringifyPropertyNode(node, options);

      expect(result).toEqual(expected);
    });
    test('should stringify simple string property with 4 space indention', () => {
      const node = createStringPropertyNode('key', 'value');
      const expected = '"key"    "value"';
      const options: NodeStringifier.StringifyOptions = {
        insertSpaces: true,
      };
      const result = NodeStringifier.stringifyPropertyNode(node, options);

      expect(result).toEqual(expected);
    });
    test('should stringify empty object property inline', () => {
      const node = new PropertyASTNodeImpl(
        new StringASTNodeImpl('key'),
        new ObjectASTNodeImpl([])
      );
      const expected = '"key"\t{}';

      expect(NodeStringifier.stringifyPropertyNode(node)).toEqual(expected);
    });
    test('should stringify single string-object property in multiple lines with tab indention', () => {
      const node = new PropertyASTNodeImpl(
        new StringASTNodeImpl('key1'),
        new ObjectASTNodeImpl([createStringPropertyNode('key1.1', 'value1.1')])
      );
      // "key"
      // { "key1.1"  "value1.1" }
      const expected = '"key1"\n{ "key1.1"\t"value1.1" }';

      expect(NodeStringifier.stringifyPropertyNode(node)).toEqual(expected);
    });
    test('should stringify single string-object property in multiple lines with 4 space indention', () => {
      const node = new PropertyASTNodeImpl(
        new StringASTNodeImpl('key1'),
        new ObjectASTNodeImpl([createStringPropertyNode('key1.1', 'value1.1')])
      );
      // "key"
      // { "key1.1"    "value1.1" }
      const expected = '"key1"\n{ "key1.1"    "value1.1" }';
      const options: NodeStringifier.StringifyOptions = {
        insertSpaces: true,
      };
      const result = NodeStringifier.stringifyPropertyNode(node, options);

      expect(result).toEqual(expected);
    });
    test('should stringify property with object-value with one multi-line object property', () => {
      const node = new PropertyASTNodeImpl(
        new StringASTNodeImpl('AbilitySpecial'),
        new ObjectASTNodeImpl([
          new PropertyASTNodeImpl(
            new StringASTNodeImpl('01'),
            new ObjectASTNodeImpl([
              createStringPropertyNode('var_type', 'FIELD_FLOAT'),
              createStringPropertyNode('base_capture_time', '6.0'),
            ])
          ),
        ])
      );
      // "AbilitySpecial"
      // {
      //   "01"
      //   {
      //     "var_type"  "FIELD_FLOAT"
      //     "base_capture_time"  "6.0"
      //   }
      // }
      const expected =
        '"AbilitySpecial"\n{\n\t"01"\n\t{\n\t\t"var_type"\t"FIELD_FLOAT"\n\t\t"base_capture_time"\t"6.0"\n\t}\n}';

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
    test('should stringify single string-property object', () => {
      const node = new ObjectASTNodeImpl([
        createStringPropertyNode('key', 'value'),
      ]);
      const expected = '{ "key"\t"value" }';

      expect(NodeStringifier.stringifyObjectNode(node)).toEqual(expected);
    });
    test('should stringify single object-property object', () => {
      const node = new ObjectASTNodeImpl([
        new PropertyASTNodeImpl(
          new StringASTNodeImpl('key'),
          new ObjectASTNodeImpl([])
        ),
      ]);
      const expected = '{\n\t"key"\t{}\n}';

      expect(NodeStringifier.stringifyObjectNode(node)).toEqual(expected);
    });
    test('should stringify multi-line object with tab indention', () => {
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
    test('should stringify multi-line object with 2 space indention', () => {
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
      const expected = `{\n  "key1"  "value1"\n  "key2"  "value2"\n  "key3"  "value3"\n}`;
      const options: NodeStringifier.StringifyOptions = {
        insertSpaces: true,
        tabSize: 2,
      };
      const result = NodeStringifier.stringifyObjectNode(node, options);

      expect(result).toEqual(expected);
    });
    test('should stringify multi-line object with 4 space indention', () => {
      const node = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', 'value1'),
        createStringPropertyNode('key2', 'value2'),
        createStringPropertyNode('key3', 'value3'),
      ]);
      // {
      //     "key1"    "value1"
      //     "key2"    "value2"
      //     "key3"    "value3"
      // }
      const expected = `{\n    "key1"    "value1"\n    "key2"    "value2"\n    "key3"    "value3"\n}`;
      const options: NodeStringifier.StringifyOptions = {
        insertSpaces: true,
        tabSize: 4,
      };
      const result = NodeStringifier.stringifyObjectNode(node, options);

      expect(result).toEqual(expected);
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
