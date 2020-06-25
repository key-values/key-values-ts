import {
  PropertyASTNodeImpl,
  StringASTNodeImpl,
  CommentASTNodeImpl,
  ObjectASTNodeImpl,
} from '../src/ast_node_impl';

describe('ASTNodeImpl', () => {
  // String
  describe('StringASTNodeImpl', () => {
    test('should correctly assign type to "string"', () => {
      const str = new StringASTNodeImpl('value');
      expect(str.type).toEqual('string');
    });
    test('should correctly assign value for quoted string', () => {
      const str = new StringASTNodeImpl('value', true);
      expect(str.value).toEqual('value');
    });
    test('should correctly assign value for unquoted string', () => {
      const str = new StringASTNodeImpl('value', false);
      expect(str.value).toEqual('value');
    });
    test('should correctly assign children to empty array', () => {
      const str = new StringASTNodeImpl('value');
      expect(str.children).toEqual([]);
    });
  });
  // Comment
  describe('CommentASTNodeImpl', () => {
    test('should correctly assign type to "comment"', () => {
      const comment = new CommentASTNodeImpl('test comment');
      expect(comment.type).toEqual('comment');
    });
    test('should correctly assign value', () => {
      const comment = new CommentASTNodeImpl('test comment');
      expect(comment.value).toEqual('test comment');
    });
    test('should correctly assign children to empty array', () => {
      const comment = new CommentASTNodeImpl('test comment');
      expect(comment.children).toEqual([]);
    });
  });
  // Property
  describe('PropertyASTNodeImpl', () => {
    test('should correctly assign type to "property"', () => {
      const property = new PropertyASTNodeImpl(
        new StringASTNodeImpl('key'),
        new StringASTNodeImpl('value')
      );
      expect(property.type).toEqual('property');
    });
    test('should correctly assign key node', () => {
      const key = new StringASTNodeImpl('key');
      const value = new StringASTNodeImpl('value');
      const property = new PropertyASTNodeImpl(key, value);

      expect(property.keyNode).toBe(key);
    });
    test('should correctly assign value node', () => {
      const key = new StringASTNodeImpl('key');
      const value = new StringASTNodeImpl('value');
      const property = new PropertyASTNodeImpl(key, value);

      expect(property.valueNode).toBe(value);
    });
    test('should correctly assign children with key and value', () => {
      const key = new StringASTNodeImpl('key');
      const value = new StringASTNodeImpl('value');
      const property = new PropertyASTNodeImpl(key, value);

      const expected = [key, value];
      expect(property.children).toEqual(expected);
    });
    test('should correctly assign children with key, comments and value', () => {
      const key = new StringASTNodeImpl('key');
      const value = new StringASTNodeImpl('value');

      const comment1 = new CommentASTNodeImpl('comment1');
      const comment2 = new CommentASTNodeImpl('comment2');
      const comments = [comment1, comment2];

      const property = new PropertyASTNodeImpl(key, value, comments);

      const expected = [key, comment1, comment2, value];
      expect(property.children).toEqual(expected);
    });
  });
  // Object
  describe('ObjectASTNodeImpl', () => {
    test('should correctly assign type to "object"', () => {
      const obj = new ObjectASTNodeImpl([]);
      expect(obj.type).toEqual('object');
    });
    test('should correctly assign children to properties', () => {
      const property1 = new PropertyASTNodeImpl(
        new StringASTNodeImpl('key 1'),
        new StringASTNodeImpl('value 1')
      );
      const property2 = new PropertyASTNodeImpl(
        new StringASTNodeImpl('key 2'),
        new StringASTNodeImpl('value 2')
      );
      const obj = new ObjectASTNodeImpl([property1, property2]);

      const expected = [property1, property2];
      expect(obj.children).toEqual(expected);
    });
    test("should correctly assign properties' parents to object", () => {
      const property1 = new PropertyASTNodeImpl(
        new StringASTNodeImpl('key 1'),
        new StringASTNodeImpl('value 1')
      );
      const property2 = new PropertyASTNodeImpl(
        new StringASTNodeImpl('key 2'),
        new StringASTNodeImpl('value 2')
      );
      const obj = new ObjectASTNodeImpl([property1, property2]);

      expect(obj.properties[0].parent).toBe(obj);
      expect(obj.properties[1].parent).toBe(obj);
    });
  });
});
