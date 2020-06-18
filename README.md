# KeyValues.ts <!-- omit in toc -->
![npm](https://img.shields.io/npm/v/key-values-ts) ![GitHub](https://img.shields.io/github/license/key-values/key-values-ts) ![build](https://github.com/key-values/key-values-ts/workflows/build/badge.svg) ![lint](https://github.com/key-values/key-values-ts/workflows/lint/badge.svg) ![test](https://github.com/key-values/key-values-ts/workflows/test/badge.svg)

A JavaScript/TypeScript parser for the [KeyValues](https://developer.valvesoftware.com/wiki/KeyValues_class) data format. KeyValues is an easy-to-use, JSON-like format developed by [Valve Corporation](https://www.valvesoftware.com/en/). It is used in [Steamworks](https://partner.steamgames.com/doc/home) configuration files as well as in several of Valve's games, such as [Dota 2](https://blog.dota2.com).

## Index <!-- omit in toc -->
- [Installation](#installation)
- [Usage](#usage)

## Installation

Using [yarn](https://yarnpkg.com/):
```
yarn add key-values-ts
```

Using [npm](https://www.npmjs.com/):
```
npm install key-values-ts
```

## Usage

```typescript
import KeyValues from 'key-values-ts';

const input = `"key"
{
  "key 1" "value 1"
  "key 2" "value 2"
}`;

// Convert the KeyValues text to an object:
const obj = KeyValues.parse(text);
// {
//   key: {
//     'key 1': 'value 1',
//     'key 2': 'value 2'
//   }
// }

const output = KeyValues.stringify(text);
// "key"
// {
//   "key 1" "value 1"
//   "key 2" "value 2"
// }
```
