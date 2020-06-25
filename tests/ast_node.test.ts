import {
  StringASTNodeImpl,
  PropertyASTNodeImpl,
  ObjectASTNodeImpl,
  NodePositionImpl,
} from '../src/ast_node_impl';
import { next, findAtOffset, findAtCell } from '../src/ast_node';

describe('ASTNode', () => {
  // Next
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
  // Find at offset
  describe('findAtOffset', () => {
    describe('string node', () => {
      test('should be string for offset in string', () => {
        const str = new StringASTNodeImpl('value', true, createStartLinePos(7));

        expect(findAtOffset(str, 0)).toBe(str);
        expect(findAtOffset(str, 3)).toBe(str);
        expect(findAtOffset(str, 7)).toBe(str);
      });
      test('should be null for offset before string', () => {
        const str = new StringASTNodeImpl('value', true, createStartLinePos(7));

        expect(findAtOffset(str, -1)).toBe(null);
      });
      test('should be null for offset after string', () => {
        const str = new StringASTNodeImpl('value', true, createStartLinePos(7));

        expect(findAtOffset(str, 8)).toBe(null);
      });
    });
    describe('property node', () => {
      test('should be key for offset in property key', () => {
        // "key"  "value"
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl(
          'value',
          true,
          createLinePos(7, 7, 1, 7)
        );
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        expect(findAtOffset(property, 0)).toBe(key);
        expect(findAtOffset(property, 2)).toBe(key);
        expect(findAtOffset(property, 4)).toBe(key);
      });
      test('should be value for offset in property value', () => {
        // "key"  "value"
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl(
          'value',
          true,
          createLinePos(7, 7, 1, 7)
        );
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        expect(findAtOffset(property, 7)).toBe(value);
        expect(findAtOffset(property, 9)).toBe(value);
        expect(findAtOffset(property, 13)).toBe(value);
      });
      test('should be property for offset in between key and value', () => {
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl('value', true, createLinePos(7, 7));
        // "key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        expect(findAtOffset(property, 6)).toBe(property);
      });
    });
    describe('object node', () => {
      test('should be object for offset in empty object', () => {
        // {}
        const obj = new ObjectASTNodeImpl([], createStartLinePos(2));

        expect(findAtOffset(obj, 0)).toBe(obj);
        expect(findAtOffset(obj, 1)).toBe(obj);
        expect(findAtOffset(obj, 2)).toBe(obj);
      });
      test('should be property key for offset in property key for single line object', () => {
        const key = new StringASTNodeImpl('key', true, createLinePos(2, 5));
        const value = new StringASTNodeImpl('value', true, createLinePos(9, 7));
        // __"key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        // { "key"  "value" }
        const obj = new ObjectASTNodeImpl([property], createStartLinePos(18));

        expect(findAtOffset(obj, 2)).toBe(key);
        expect(findAtOffset(obj, 4)).toBe(key);
        expect(findAtOffset(obj, 7)).toBe(key);
      });
      test('should be object for offset in between property keys', () => {
        // __"key"  "value"
        const property1 = new PropertyASTNodeImpl(
          new StringASTNodeImpl('key1', true, createLinePos(4, 5, 2, 3)),
          new StringASTNodeImpl('value1', true, createLinePos(11, 8, 2, 10)),
          [],
          createLinePos(4, 15, 2, 3)
        );
        const property2 = new PropertyASTNodeImpl(
          new StringASTNodeImpl('key1', true, createLinePos(20, 5, 4, 3)),
          new StringASTNodeImpl('value1', true, createLinePos(30, 8, 4, 10)),
          [],
          createLinePos(23, 15, 4, 3)
        );
        // {
        //   "key1" "value1"
        //
        //   "key2" "value2"
        // }
        const obj = new ObjectASTNodeImpl(
          [property1, property2],
          createStartPos(40, 5, 2)
        );

        expect(findAtOffset(obj, 21)).toBe(obj);
      });
    });
  });
  // Find at cell
  describe('findAtCell', () => {
    describe('string node', () => {
      test('should be string for cell in string', () => {
        const str = new StringASTNodeImpl('value', true, createStartLinePos(7));

        expect(findAtCell(str, 1, 1)).toBe(str);
        expect(findAtCell(str, 1, 4)).toBe(str);
        expect(findAtCell(str, 1, 8)).toBe(str);
      });
      test('should be null for cell before string', () => {
        const str = new StringASTNodeImpl('value', true, createStartLinePos(7));

        expect(findAtCell(str, 1, 0)).toBe(null);
        expect(findAtCell(str, 0, 5)).toBe(null);
      });
      test('should be null for cell after string', () => {
        const str = new StringASTNodeImpl('value', true, createStartLinePos(7));

        expect(findAtCell(str, 1, 9)).toBe(null);
        expect(findAtCell(str, 2, 5)).toBe(null);
      });
    });
    describe('property node', () => {
      test('should be key for cell in property key', () => {
        // "key"  "value"
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl(
          'value',
          true,
          createLinePos(7, 7, 1, 7)
        );
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        expect(findAtCell(property, 1, 1)).toBe(key);
        expect(findAtCell(property, 1, 3)).toBe(key);
        expect(findAtCell(property, 1, 5)).toBe(key);
      });
      test('should be value for cell in property value', () => {
        // "key"  "value"
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl(
          'value',
          true,
          createLinePos(7, 7, 1, 7)
        );
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        expect(findAtCell(property, 1, 8)).toBe(value);
        expect(findAtCell(property, 1, 10)).toBe(value);
        expect(findAtCell(property, 1, 14)).toBe(value);
      });
      test('should be property for cell in between key and value', () => {
        const key = new StringASTNodeImpl('key', true, createStartLinePos(5));
        const value = new StringASTNodeImpl('value', true, createLinePos(7, 7));
        // "key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        expect(findAtCell(property, 1, 7)).toBe(property);
      });
    });
    describe('object node', () => {
      test('should be object for cell in empty object', () => {
        // {}
        const obj = new ObjectASTNodeImpl([], createStartLinePos(2));

        expect(findAtCell(obj, 1, 1)).toBe(obj);
        expect(findAtCell(obj, 1, 2)).toBe(obj);
        expect(findAtCell(obj, 1, 3)).toBe(obj);
      });
      test('should be property key for cell in property key for single line object', () => {
        const key = new StringASTNodeImpl('key', true, createLinePos(2, 5));
        const value = new StringASTNodeImpl('value', true, createLinePos(9, 7));
        // __"key"  "value"
        const property = new PropertyASTNodeImpl(
          key,
          value,
          [],
          createStartLinePos(14)
        );
        // { "key"  "value" }
        const obj = new ObjectASTNodeImpl([property], createStartLinePos(18));

        expect(findAtCell(obj, 1, 3)).toBe(key);
        expect(findAtCell(obj, 1, 5)).toBe(key);
        expect(findAtCell(obj, 1, 8)).toBe(key);
      });
      test('should be object for cell in between property keys', () => {
        // __"key"  "value"
        const property1 = new PropertyASTNodeImpl(
          new StringASTNodeImpl('key1', true, createLinePos(4, 5, 2, 3)),
          new StringASTNodeImpl('value1', true, createLinePos(11, 8, 2, 10)),
          [],
          createLinePos(4, 15, 2, 3)
        );
        const property2 = new PropertyASTNodeImpl(
          new StringASTNodeImpl('key1', true, createLinePos(20, 5, 4, 3)),
          new StringASTNodeImpl('value1', true, createLinePos(30, 8, 4, 10)),
          [],
          createLinePos(23, 15, 4, 3)
        );
        // {
        //   "key1" "value1"
        //
        //   "key2" "value2"
        // }
        const obj = new ObjectASTNodeImpl(
          [property1, property2],
          createStartPos(40, 5, 2)
        );

        expect(findAtCell(obj, 3, 1)).toBe(obj);
      });
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
