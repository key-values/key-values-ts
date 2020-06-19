import {
  StringASTNodeImpl,
  PropertyASTNodeImpl,
  ObjectASTNodeImpl,
} from '../src/ast_node_impl';
import { next } from '../src/ast_node';

describe('ASTNode', () => {
  describe('next', () => {
    test('should be null for simple string node', () => {
      const node = new StringASTNodeImpl('value');
      expect(next(node)).toBe(null);
    });
    test('should be key for property', () => {
      const key = new StringASTNodeImpl('key');
      const value = new StringASTNodeImpl('value');
      const property = new PropertyASTNodeImpl(key, value);
      expect(next(property)).toBe(key);
    });
    test('should be value for key', () => {
      const key = new StringASTNodeImpl('key');
      const value = new StringASTNodeImpl('value');
      new PropertyASTNodeImpl(key, value);
      expect(next(key)).toBe(value);
    });
    test('should be null for string value in property without parent', () => {
      const property = createStringPropertyNode('key', 'value');
      const value = property.valueNode;
      expect(next(value)).toBe(null);
    });
    test('should be null for empty object without parent', () => {
      const obj = new ObjectASTNodeImpl([]);
      expect(next(obj)).toBe(null);
    });
    test('should be first property for object', () => {
      const property1 = createStringPropertyNode('key1', 'value1');
      const property2 = createStringPropertyNode('key2', 'value2');
      const obj = new ObjectASTNodeImpl([property1, property2]);
      expect(next(obj)).toBe(property1);
    });
    test('should be next property for string value in object', () => {
      const property1 = createStringPropertyNode('key1', 'value1');
      const property2 = createStringPropertyNode('key2', 'value2');
      new ObjectASTNodeImpl([property1, property2]);
      const value = property1.valueNode;
      expect(next(value)).toBe(property2);
    });
    test('should be null for last property value in obj without parent', () => {
      const property1 = createStringPropertyNode('key1', 'value1');
      const property2 = createStringPropertyNode('key2', 'value2');
      new ObjectASTNodeImpl([property1, property2]);
      const value = property2.valueNode;
      expect(next(value)).toBe(null);
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
