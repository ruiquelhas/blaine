# blaine
File type validation for [hapi](https://github.com/hapijs/hapi) raw in-memory `multipart/form-data` request payloads.

Like most modern magicians, builds on the work, knowledge and influence of others before it, in this case, [copperfield](https://github.com/ruiquelhas/copperfield).

[![NPM Version][version-img]][version-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependencies][david-img]][david-url] [![Dev Dependencies][david-dev-img]][david-dev-url]

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
Register the package as a server plugin to enable validation for each route that does not parse — `parse: false` — into memory, the request payload — `output: 'data'`. For every other route with a different configuration, the validation is skipped.

If the validation fails, a [joi](https://github.com/hapijs/joi)-like `400 Bad Request` error is returned alongside an additional `content-validation: failure` response header. If everything is ok, the response will ultimately contain a `content-validation: success` header.

Also, if the `Content-Type` request header is not `multipart/form-data`, a `415 Unsupported Media Type` error is returned, but in this case, without any additional response header.

### Example

```js
const Hapi = require('hapi');
const Blaine = require('blaine');

try {
    const server = new Hapi.Server();

    await server.register({
        plugin: Blaine,
        options: {
            // Allow png files only
            whitelist: ['image/png']
        }
    });

    server.route({
        // go nuts
        options: {
            payload: {
                output: 'data',
                parse: false
            }
            // go nuts
        }
    });

    await server.start();
}
catch (err) {
    throw err;
}
```

## Supported File Types
The same as [file-type](https://github.com/sindresorhus/file-type/tree/v7.0.0#supported-file-types).

[coveralls-img]: https://img.shields.io/coveralls/ruiquelhas/blaine.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/ruiquelhas/blaine
[david-img]: https://img.shields.io/david/ruiquelhas/blaine.svg?style=flat-square
[david-url]: https://david-dm.org/ruiquelhas/blaine
[david-dev-img]: https://img.shields.io/david/dev/ruiquelhas/blaine.svg?style=flat-square
[david-dev-url]: https://david-dm.org/ruiquelhas/blaine?type=dev
[version-img]: https://img.shields.io/npm/v/blaine.svg?style=flat-square
[version-url]: https://www.npmjs.com/package/blaine
[travis-img]: https://img.shields.io/travis/ruiquelhas/blaine.svg?style=flat-square
[travis-url]: https://travis-ci.org/ruiquelhas/blaine
