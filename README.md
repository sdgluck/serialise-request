# serialise-request

> Serialise and deserialise a Fetch Request

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/serialise-request"><img alt="npm version" src="https://badge.fury.io/js/serialise-request.svg"></a>
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Install

    npm install serialise-request --save
    
Exported using UMD pattern, otherwise available on `window` as `serialiseRequest` and `serializeRequest`.
    
## Usage

`serialiseRequest(request[, toObject]) : String|Object`

Serialise a Request. (The function base64 encodes the result of calling `blob()`.)

<p>______</p>

- __request__ {Request} request to serialise
- __toObject__ {Boolean} serialise request to an object (default is string)

`serialiseRequest.deserialise(request) : Promise<Request>`

Deserialise a Request serialised using `serialise-request`. Caveat: as there is no way to serialise a FormData object the `formData()` method is unsupported on the result and will throw if called.

- __request__ {String|Object} request to deserialise

_Function names are also made available in American English: `serializeRequest` and `serializeRequest.deserialize`._

## Example

    import serialiseRequest from 'serialise-request'

    const serialisedRequest = serialiseRequest(
      new Request('http://foo', { bar: 'baz' })
    )

    // ...

    const request = serialiseRequest.deserialise(serialisedRequest)

    request.method //=> 'GET'
    request.url //=> 'http://foo'
    request.json().then((data) => {
      console.log(data) //=> { bar: 'baz' }
    })
    
## Gotchas

## What about serialising a Response?

Check out the [`serialise-response`](https://github.com/sdgluck/serialise-response) sibling module.

## Contributing

All pull requests and issues welcome!

If you're not sure how, check out Kent C. Dodds' [great video tutorials on egghead.io](https://egghead.io/lessons/javascript-identifying-how-to-contribute-to-an-open-source-project-on-github)!
