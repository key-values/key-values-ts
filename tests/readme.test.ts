import KeyValues from '../src/index';

// Tests for examples used in the README
describe('README', () => {
  // Usage example
  test('usage example should work', () => {
    const input = `"key"
{
"key 1"  "value 1"
"key 2"  "value 2"
}`;

    const obj = KeyValues.parse(input);
    const expectedObj = {
      key: {
        'key 1': 'value 1',
        'key 2': 'value 2',
      },
    };
    expect(obj).toEqual(expectedObj);

    const output = KeyValues.stringify(obj);
    const expectedOutput = `"key"
{
\t"key 1"\t"value 1"
\t"key 2"\t"value 2"
}`;
    expect(output).toEqual(expectedOutput);
  });
});
