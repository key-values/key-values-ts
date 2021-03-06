import {
  StringASTNodeImpl,
  PropertyASTNodeImpl,
  ObjectASTNodeImpl,
} from '../src/ast_node_impl';
import * as NodeParser from '../src/node_parser';
import { createStringPropertyNode } from './test_util';

describe('NodeParser', () => {
  // String node
  describe('parseStringNode', () => {
    test('should parse simple string', () => {
      const node = new StringASTNodeImpl('value');
      const expected = 'value';

      expect(NodeParser.parseStringNode(node)).toEqual(expected);
    });
  });
  // Property node
  describe('parsePropertyNode', () => {
    test('should parse simple property', () => {
      const node = createStringPropertyNode('key', 'value');
      const expected = { key: 'value' };

      expect(NodeParser.parsePropertyNode(node)).toEqual(expected);
    });
  });
  // Object node
  describe('parseObjectNode', () => {
    test('should parse empty object', () => {
      const node = new ObjectASTNodeImpl([]);
      const expected = {};

      expect(NodeParser.parseObjectNode(node)).toEqual(expected);
    });
    test('should parse simple object', () => {
      const property = createStringPropertyNode('key', 'value');
      const node = new ObjectASTNodeImpl([property]);

      const expected = { key: 'value' };

      expect(NodeParser.parseObjectNode(node)).toEqual(expected);
    });
    test('should parse multi object', () => {
      const node = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', 'value1'),
        createStringPropertyNode('key2', 'value2'),
        createStringPropertyNode('key3', 'value3'),
      ]);

      const expected = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };

      expect(NodeParser.parseObjectNode(node)).toEqual(expected);
    });
    test('should parse nested object', () => {
      const node = new ObjectASTNodeImpl([
        createStringPropertyNode('key1', 'value1'),
        new PropertyASTNodeImpl(
          new StringASTNodeImpl('key2'),
          new ObjectASTNodeImpl([
            createStringPropertyNode('key2.1', 'value2.1'),
            createStringPropertyNode('key2.2', 'value2.2'),
            createStringPropertyNode('key2.3', 'value2.3'),
          ])
        ),
        createStringPropertyNode('key3', 'value3'),
        createStringPropertyNode('key4', 'value4'),
      ]);

      const expected = {
        key1: 'value1',
        key2: {
          'key2.1': 'value2.1',
          'key2.2': 'value2.2',
          'key2.3': 'value2.3',
        },
        key3: 'value3',
        key4: 'value4',
      };

      expect(NodeParser.parseObjectNode(node)).toEqual(expected);
    });
  });
});
