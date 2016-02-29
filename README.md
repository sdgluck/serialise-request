# serialise-request

> Serialise and de-serialise HTML5 Requests

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/serialise-request"><img alt="npm version" src="https://badge.fury.io/js/serialise-request.svg"></a>
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Install

    npm install serialise-request --save
    
## Import

__ES6 Import (w/ Babel)__

    import serialiseRequest from 'serialise-request'

__CommonJS Require__

    var serialiseRequest = require('serialise-request')
    
__RequireJS__

    define(['serialiseRequest'], ...)

__Script__

    <script src="/node_modules/serialise-request/dist/serialise-request.min.js"></script>
    typeof window.serialiseRequest === 'object'

## Usage

`serialiseRequest(request[, toObject]) : String|Object`

- __request__ {Request} request to serialise
- __toObject__ {Boolean} serialise request to an object (default is string)

`serialiseRequest.deserialise(request) : Promise<Request>`

- __request__ {String|Object} serialised request to deserialise

_Function names are also made available in American English: `serializeRequest` and `serializeRequest.deserialize`_

## Example

    import serialiseRequest from 'serialise-request'

    const serialisedRequest = serialiseRequest(
      new Request('http://foo', { bar: 'baz' })
    )

    // ...

    const request = serialisedRequest.deserialise(serialisedRequest)

    request.method //=> 'GET'
    request.url //=> 'http://foo'
    request.json().then((data) => {
      console.log(data) //=> { bar: baz }
    })

## What about serialising a Response?

Check out the [`serialise-response`](https://github.com/sdgluck/serialise-response) sibling module.

## Contributing

All pull requests and issues welcome!

If you're not sure how, check out Kent C. Dodds' [great video tutorials on egghead.io](https://egghead.io/lessons/javascript-identifying-how-to-contribute-to-an-open-source-project-on-github)!
