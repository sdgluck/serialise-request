'use strict'

/* global Request:false */

import blobUtil from 'blob-util'

const BodyTypes = {
  ARRAY_BUFFER: 'ARRAY_BUFFER',
  BLOB: 'BLOB',
  FORM_DATA: 'FORM_DATA',
  JSON: 'JSON',
  TEXT: 'TEXT'
}

const BodyMethods = {
  [BodyTypes.ARRAY_BUFFER]: 'arrayBuffer',
  [BodyTypes.BLOB]: 'blob',
  [BodyTypes.FORM_DATA]: 'formData',
  [BodyTypes.JSON]: 'json',
  [BodyTypes.TEXT]: 'text'
}

/**
 * Turn a Blob into a String.
 * @param {Blob} blob
 * @returns {Promise}
 */
function blobToString (blob) {
  return blobUtil
    .blobToArrayBuffer(blob)
    .then((buffer) => {
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
    .then((blob) => {
      switch (bodyType) {
        case BodyTypes.ARRAY_BUFFER:
          return blobUtil.blobToArrayBuffer(blob)
        case BodyTypes.BLOB:
          return blob
        case BodyTypes.FORM_DATA:
          throw new Error('Cannot make FormData from serialised Request')
        case BodyTypes.JSON:
          return blobToString(blob)
            .then((str) => JSON.parse(str))
        case BodyTypes.TEXT:
          return blobToString(blob)
        default:
          throw new Error(`Unknown requested body type '${bodyType}'`)
      }
    })
}

/**
 * Serialise a Request to a string or object.
 * @param {Request} request
 * @param {Boolean} toObject serialise to an object
 * @returns {String}
 */
function serialise (request, toObject) {
  if (!(request instanceof Request)) {
    throw new Error('Expecting request to be instance of Request')
  }

  return request
    .blob()
    .then(blobUtil.blobToBase64String)
    .then((base64) => {
      return {
        method: request.method,
        url: request.url,
        headers: [...request.headers],
        context: request.context,
        referrer: request.referrer,
        mode: request.mode,
        credentials: request.credentials,
        redirect: request.redirect,
        integrity: request.integrity,
        cache: request.cache,
        bodyUsed: request.bodyUsed,
        __body: base64,
        __isRequest: true
      }
    })
    .then((obj) => {
      return toObject
        ? obj
        : JSON.stringify(obj)
    })
}

/**
 * De-serialise a Request from JSON or serialised JSON.
 * @param {Object|String} serialised
 * @returns {Request}
 */
function deserialise (serialised) {
  let options, url

  if (typeof serialised === 'string') {
    options = JSON.parse(serialised)
    url = options.url
  } else if (typeof serialised === 'object') {
    options = serialised
    url = options.url
  } else {
    throw new Error('Expecting serialised to be String or Object')
  }

  const request = new Request(url, options)

  const properties = {
    context: {
      enumerable: true,
      value: options.context
    }
  }

  const methods = Object.keys(BodyTypes).reduce((obj, key) => {
    const methodName = BodyMethods[key]
    obj[methodName] = function () {
      if (!request.bodyUsed) {
        request.bodyUsed = true
        return Promise.resolve(remakeBody(options.__body, key))
      }
      return Promise.reject(new TypeError('Already used'))
    }
    return obj
  }, properties)

  Object.defineProperties(request, methods)

  return request
}

const api = {
  serialiseRequest: serialise,
  deserialiseRequest: deserialise
}

/* global define:false window:false */
if (typeof define === 'function' && define.amd) {
  define('serialiseRequest', () => api)
} else if (typeof module === 'object' && module.exports) {
  module.exports = api
} else if (typeof window !== 'undefined') {
  window.serialiseRequest = api
} else {
  throw new Error(
    'Environment is not supported. ' +
    'Please raise an issue at https://github.com/sdgluck/serialise-request/issues'
  )
}
