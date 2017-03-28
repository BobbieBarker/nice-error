'use strict';
const errorDictionary = require('./error-dictionary');

const enumerableProps = ['code', 'detail'];
const INTERNAL_ERROR = 500;
const mapEnumProps = object => Object.keys(object)
  .filter(key => enumerableProps.indexOf(key) !== -1)
  .reduce((accum, key) => {
    accum[key] = object[key];
    return accum;
  }, {});

/**
 * Nice Error Options
 * {
 * code: 'optional - string', // error code.
 * detail: 'optional - string', //short helpful description of the problem to aid in debugging
 * error: 'optional - error object', //error object to be encapsulated into NiceError.metadata
 * statusCode: 'optional - string', //String representing an accepted nice http statusCode i.e 'BAD_REQUEST', 'SERVICE_UNAVAILABLE'
 * }
 */

/**
 * NiceError class for custom errors.
 */
class NiceError extends Error {
  /**
   * NiceError Constructor
   * @param  {String} message short description of the error
   * @param  {Object} options Options object for error can contain: code, detail,  statusCode, error
   */
  constructor(message, options) {
    super(message);

    if (typeof options === 'object') {
      Object.assign(this, mapEnumProps(options));
    }

    if (typeof options === 'object' && typeof options.error === 'object') {
      Object.defineProperty(this, 'metadata', {
        configurable: true,
        enumerable: false,
        value: options.error,
        writable: true
      });
    }

    if (typeof options === 'object' && typeof options.statusCode !== 'number') {
      Object.defineProperty(this, 'statusCode', {
        configurable: true,
        enumerable: false,
        value: errorDictionary[options.statusCode] || INTERNAL_ERROR,
        writable: true
      });
    } else if (typeof options === 'object' && typeof options.statusCode === 'number') {
      Object.defineProperty(this, 'statusCode', {
        configurable: true,
        enumerable: false,
        value: options.statusCode,
        writable: true
      });
    } else {
      Object.defineProperty(this, 'statusCode', {
        configurable: true,
        enumerable: false,
        value: INTERNAL_ERROR,
        writable: true
      });
    }

    Object.defineProperty(this, 'message', {
      configurable: true,
      enumerable: true,
      value: message,
      writable: true
    });

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true
    });

    if (typeof options === 'object'
    && typeof options.error === 'object'
    && options.error.hasOwnProperty('stack')) {
      Object.defineProperty(this, 'stack', {
        configurable: true,
        enumerable: false,
        value: options.error.stack,
        writable: true
      });
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * From is a convienence method to verify that an error is an instance of niceError.
   * If it isn't, the error will be passed to NiceError and a new NiceError will be returned.
   * @param  {[type]} error instance of Error
   * @return {Object} niceError instance of NiceError
   */
  static from(error) {
    if (error instanceof NiceError) {
      return error;
    } else if (error instanceof Error) {
      const options = {};
      if (error.hasOwnProperty('statusCode')) {
        Object.assign(options, {statusCode: error.statusCode});
      }
      return new NiceError(error.message, Object.assign(options, {error}));
    }
  }

  /**
   * convienence method for creating nice errors
   * @param  {String} message     short description of the error
   * @param  {Object} options     Options object for error can contain: code, detail,  statusCode, error
   * @return {Object} NiceError new instance of NiceError
   */
  static create(message, options) {
    return new NiceError(message, options);
  }
}

module.exports = NiceError;
