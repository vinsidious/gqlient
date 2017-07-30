# gqlient

[![npm](https://img.shields.io/npm/v/gqlient.svg)](https://www.npmjs.com/package/gqlient)

A lightweigh GraphQL client

[Changelog](https://github.com/vincecoppola/gqlient/blob/master/CHANGELOG.md)

## Install

```sh
# using npm
npm install --save gqlient

# using yarn
yarn add gqlient
```

## Usage

```ts
import GQLient from 'gqlient';
```

Initialize a client by passing your endpoint and an (optional) options object the the `GQLient` constructor. Then you can make requests by running `client.query`, `client.mutate`, or `client.execute` (they all do the same thing). Any of these methods accept two parameters, the first being your query (either a string or query document) and the second being a variables object.****

## License

MIT © [Vince Coppola](https://github.com/vincecoppola)
