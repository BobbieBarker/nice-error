/**
 * setup assertion framework and test libraries
 */
var setup = function() {
  var chai = require('chai');
  var chaiAsPromised = require('chai-as-promised');
  var sinonChai = require('sinon-chai');
  var Promise = require('bluebird');
  require('sinon-as-promised')(Promise);

  // needed to transfer bluebird promises
  chaiAsPromised.transferPromiseness = function(assertion, promise) {
    assertion.then = promise.then.bind(promise);
    if (promise.finally) {
      assertion.finally = promise.finally.bind(promise);
    }
  };
  chai.should();
  chai.use(sinonChai).use(chaiAsPromised);
  // assign globals
  expect = chai.expect;
  sinon = require('sinon');
};

setup();
