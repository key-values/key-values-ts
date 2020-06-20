import {
  StringASTNodeImpl,
  PropertyASTNodeImpl,
  ObjectASTNodeImpl,
} from '../src/ast_node_impl';
import * as ObjectParser from '../src/object_parser';

describe('ObjectParser', () => {
  // String
  describe('parseString', () => {
    test('should parse simple string', () => {
      const value = 'value';
      const expected = createStringNode('value');

      expect(ObjectParser.parseString(value)).toEqual(expected);
    });
  });
  // Number
  describe('parseNumber', () => {
    test('should parse integer', () => {
      const value = 245;
      const expected = createStringNode('245');

      expect(ObjectParser.parseNumber(value)).toEqual(expected);
    });
    test('should parse decimal', () => {
      const value = 62.3213;
      const expected = createStringNode('62.3213');

      expect(ObjectParser.parseNumber(value)).toEqual(expected);
    });
  });
  // Boolean
  describe('parseBoolean', () => {
    test('should parse true', () => {
      const value = true;
      const expected = createStringNode('1');

      expect(ObjectParser.parseBoolean(value)).toEqual(expected);
    });
    test('should parse false', () => {
      const value = false;
      const expected = createStringNode('0');

      expect(ObjectParser.parseBoolean(value)).toEqual(expected);
    });
  });
  // Missing
  describe('parseMissing', () => {
    test('should parse undefined', () => {
      const value = undefined;
      const expected = createStringNode('');

      expect(ObjectParser.parseMissing(value)).toEqual(expected);
    });
    test('should parse null', () => {
      const value = null;
      const expected = createStringNode('');

      expect(ObjectParser.parseMissing(value)).toEqual(expected);
    });
  });
  // Array
  describe('parseArray', () => {
    test('should parse empty array', () => {
      const value: unknown[] = [];
      const expected = new ObjectASTNodeImpl([]);

      expect(ObjectParser.parseArray(value)).toEqual(expected);
    });
    test('should parse number array', () => {
      const value = [1, 3, 24.5];
      const expected = new ObjectASTNodeImpl([
        createStringPropertyNode('0', '1'),
        createStringPropertyNode('1', '3'),
        createStringPropertyNode('2', '24.5'),
      ]);

      expect(ObjectParser.parseArray(value)).toEqual(expected);
    });
    test('should parse string array', () => {
      const value = ['this', 'is', 'a', 'test'];
      const expected = new ObjectASTNodeImpl([
        createStringPropertyNode('0', 'this'),
        createStringPropertyNode('1', 'is'),
        createStringPropertyNode('2', 'a'),
        createStringPropertyNode('3', 'test'),
      ]);

      expect(ObjectParser.parseArray(value)).toEqual(expected);
    });
  });
  // Object
  describe('parseObject', () => {
    test('should parse empty object', () => {
      const value = {};
      const expected = new ObjectASTNodeImpl([]);

      expect(ObjectParser.parseObject(value)).toEqual(expected);
    });
    test('should parse simple string dictionary', () => {
      const value = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };
      const expected = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', 'value1'),
        createStringPropertyNode('key2', 'value2'),
        createStringPropertyNode('key3', 'value3'),
      ]);

      expect(ObjectParser.parseObject(value)).toEqual(expected);
    });
    test('should parse simple number dictionary', () => {
      const value = {
        key1: 13,
        key2: 14,
        key3: -12412,
      };
      const expected = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', '13'),
        createStringPropertyNode('key2', '14'),
        createStringPropertyNode('key3', '-12412'),
      ]);

      expect(ObjectParser.parseObject(value)).toEqual(expected);
    });
    test('should parse simple mixed dictionary', () => {
      const value = {
        key1: 'value',
        key2: 12,
        key3: true,
        key4: undefined,
        key5: false,
        key6: null,
      };
      const expected = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', 'value'),
        createStringPropertyNode('key2', '12'),
        createStringPropertyNode('key3', '1'),
        createStringPropertyNode('key4', ''),
        createStringPropertyNode('key5', '0'),
        createStringPropertyNode('key6', ''),
      ]);

      expect(ObjectParser.parseObject(value)).toEqual(expected);
    });
    test('should parse nested mixed dictionary', () => {
      const value = {
        key1: 'value1',
        key2: 12,
        key3: true,
        key4: undefined,
        key5: {
          'key5.1': 0,
          'key5.2': 'value5.2',
          'key5.3': [2, 4, 7],
        },
        key6: null,
      };
      const expected = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', 'value1'),
        createStringPropertyNode('key2', '12'),
        createStringPropertyNode('key3', '1'),
        createStringPropertyNode('key4', ''),
        new PropertyASTNodeImpl(
          createStringNode('key5'),
          new ObjectASTNodeImpl([
            createStringPropertyNode('key5.1', '0'),
            createStringPropertyNode('key5.2', 'value5.2'),
            new PropertyASTNodeImpl(
              createStringNode('key5.3'),
              new ObjectASTNodeImpl([
                createStringPropertyNode('0', '2'),
                createStringPropertyNode('1', '4'),
                createStringPropertyNode('2', '7'),
              ])
            ),
          ])
        ),
        createStringPropertyNode('key6', ''),
      ]);

      expect(ObjectParser.parseObject(value)).toEqual(expected);
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
