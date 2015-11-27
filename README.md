# blaine
File type validation for [hapi](https://github.com/hapijs/hapi) raw in-memory `multipart/form-data` request payloads.

Like most modern magicians, builds on the work, knowledge and influence of others before it, in this case, [copperfield](https://github.com/ruiquelhas/copperfield).

[![NPM Version][fury-img]][fury-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependencies][david-img]][david-url]

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Example](#example)
- [Supported File Types](#supported-file-types)

## Installation
Install via [NPM](https://www.npmjs.org).

```sh
$ npm install blaine
```

## Usage

Register the package as a server plugin to enable validation for each route that does not parse — `parse: false` — into memory the request payload — `output: 'data'`. For every other route with a different configuration, the validation is skipped.

If the validation fails, a [joi](https://github.com/hapijs/joi)-like `400 Bad Request` error is returned alongside an additional `magic-pattern: invalid` response header. If everything is ok, the response will ultimately contain a `magic-pattern: valid` header.

### Example

```js
const Hapi = require('hapi');
const Blaine = require('blaine');

server = new Hapi.Server();
server.connection({
    // go nuts
});

const plugin = {
    register: Blaine,
    options: {
      // Allow png files only
      whitelist: ['png']
    }
};

server.register(plugin, (err) => {

    server.route({
        config: {
            payload: {
                output: 'data',
                parse: false
            }
            // go nuts
        }
    });

    server.start(() => {
        // go nuts
    });
});
```

## Supported File Types

The same as [magik](https://github.com/ruiquelhas/magik).

[coveralls-img]: https://coveralls.io/repos/ruiquelhas/blaine/badge.svg
[coveralls-url]: https://coveralls.io/github/ruiquelhas/blaine
[david-img]: https://david-dm.org/ruiquelhas/blaine.svg
[david-url]: https://david-dm.org/ruiquelhas/blaine
[fury-img]: https://badge.fury.io/js/blaine.svg
[fury-url]: https://badge.fury.io/js/blaine
[travis-img]: https://travis-ci.org/ruiquelhas/blaine.svg
[travis-url]: https://travis-ci.org/ruiquelhas/blaine
