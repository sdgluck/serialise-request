'use strict'

/* global Request:false */

var blobUtil = require('blob-util')

var BodyTypes = {
  ARRAY_BUFFER: 'ARRAY_BUFFER',
  BLOB: 'BLOB',
  FORM_DATA: 'FORM_DATA',
  JSON: 'JSON',
  TEXT: 'TEXT'
}

var BodyMethods = {
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob',
  FORM_DATA: 'formData',
  JSON: 'json',
  TEXT: 'text'
}

/**
 * Turn a Blob into a String.
 * @param {Blob} blob
 * @returns {Promise}
 */
function blobToString (blob) {
  return blobUtil
    .blobToArrayBuffer(blob)
    .then(function (buffer) {
      return String.fromCharCode.apply(null, new Uint16Array(buffer))
    })
}

/**
 * De-serialise the body of a Request.
 * @param {String} body
 * @param {String} bodyType
 * @returns {Promise}
 */
function remakeBody (body, bodyType) {
  return blobUtil
    .base64StringToBlob(body)
    .then(function (blob) {
      switch (bodyType) {
        case BodyTypes.ARRAY_BUFFER:
          return blobUtil.blobToArrayBuffer(blob)
        case BodyTypes.BLOB:
          return blob
        case BodyTypes.FORM_DATA:
          throw new Error('Cannot make FormData from serialised Request')
        case BodyTypes.JSON:
          return blobToString(blob)
            .then(function (str) {
              return JSON.parse(str)
            })
        case BodyTypes.TEXT:
          return blobToString(blob)
        default:
          throw new Error('Unknown requested body type "' + bodyType + '"')
      }
    })
}

/**
 * Serialise a Request to a string or object.
 * @param {Request} request
 * @param {Boolean} [toObject] serialise to an object
 * @returns {Promise}
 */
function serialiseRequest (request, toObject) {
  if (!(request instanceof Request)) {
    throw new Error('Expecting request to be instance of Request')
  }

  var headers = []
  var headerNames = request.headers.keys()
  for (var i = 0; i < headerNames.length; i++) {
    var headerName = headerNames[i]
    headers[headerName] = request.headers.get(headerName)
  }

  var serialised = {
    method: request.method,
    url: request.url,
    headers: headers,
    context: request.context,
    referrer: request.referrer,
    mode: request.mode,
    credentials: request.credentials,
    redirect: request.redirect,
    integrity: request.integrity,
    cache: request.cache,
    bodyUsed: request.bodyUsed
  }

  return request
    .blob()
    .then(blobUtil.blobToBase64String)
    .then(function (base64) {
      serialised.__body = base64
      return toObject
        ? serialised
        : JSON.stringify(serialised)
    })
}

/**
 * De-serialise a Request from a string or object.
 * @param {Object|String} serialised
 * @returns {Request}
 */
function deserialiseRequest (serialised) {
  var options
  var url

  if (typeof serialised === 'string') {
    options = JSON.parse(serialised)
    url = options.url
  } else if (typeof serialised === 'object') {
    options = serialised
    url = options.url
  } else {
    throw new Error('Expecting serialised request to be a string or object')
  }

  const request = new Request(url, options)

  const properties = {
    context: {
      enumerable: true,
      value: options.context
    }
  }

  const methods = Object.keys(BodyTypes).reduce(function (obj, key) {
    const methodName = BodyMethods[key]
    obj[methodName] = {
      enumerable: true,
      value: function () {
        if (request.bodyUsed) {
          return Promise.reject(new TypeError('Already used'))
        }
        request.bodyUsed = true
        return Promise.resolve(remakeBody(options.__body, key))
      }
    }
    return obj
  }, properties)

  Object.defineProperties(request, methods)

  return request
}

serialiseRequest.deserialise = deserialiseRequest
serialiseRequest.deserialize = deserialiseRequest

/* global define:false window:false */
if (typeof define === 'function' && define.amd) {
  define('serialiseRequest', function () {
    return serialiseRequest
  })
  define('serializeRequest', function () {
    return serialiseRequest
  })
} else if (typeof module === 'object' && module.exports) {
  module.exports = serialiseRequest
} else if (typeof window !== 'undefined') {
  window.serialiseRequest = serialiseRequest
  window.serializeRequest = serialiseRequest
} else {
  throw new Error(
    'Environment is not supported. ' +
    'Please raise an issue at https://github.com/sdgluck/serialise-request/issues'
  )
}
