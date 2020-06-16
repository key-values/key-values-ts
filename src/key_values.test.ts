import KeyValues from './key_values';

describe('KeyValues', () => {
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

      const result = KeyValues.parse(text);

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
