# Nice Custom Rest Errors

Create custom errors to supply meaningful error messages in response bodies, and clear readable logs. Nice Error extends the javascript Error class allowing for the creation of high quality custom errors.

## Installation:

```
npm install nice-error --save
```

## API:

### create
create is a static class method to be used as a convenience for instantiating new instances of Nice Error.

```javascript
const niceError = require('nice-error');
niceError.create('A problem', {
  code: 'Special Error',
  detail: 'You made a big Mistake',
  status: 'BAD_REQUEST',
  error: anErrorObject
})
```

Nice Error can be passed two arguments. The first argument, the "message", is required. The message should be a very short terse description of the error. The second argument is an options object. All of it's properties are optional. The options object should conform to the following
contract:

```
 {
 code: "optional - string", // slugified-error-code, use this to lookup against localization service for display
 detail: 'optional - string', //short helpful description of the problem to aid in debugging
 error: 'optional - error object', //error object to be encapsulated into NiceError.metadata
 status: 'optional - string', //String representing an accepted nice http status i.e 'BAD_REQUEST', 'SERVICE_UNAVAILABLE'
 }
```

Create will return a new error object of the type NiceError. It is important to note the behavior around status. Nice Error will only enumerate http status codes from this list:

```
BAD_REQUEST: 400,
UNAUTHORIZED: 401,
REQUEST_FAILED: 402,
FORBIDDEN: 403,
NOT_FOUND: 404,
GONE: 410,
RESOURCE_NOT_FOUND: 420,
INTERNAL_ERROR: 500,
SERVICE_UNAVAILABLE: 503,
GATEWAY_TIMEOUT: 504
```

If Anything else is passed in, or if nothing is passed in at all, it will default to a Internal Server Error/500.

### from:
From is a static class method to verify that your error is a nice error. If you pass it an instance of NiceError it will simply return that same instance back to you. If you pass it a regular error object, it will encapsulate it, assign it a status code of 500, and return you an instance of Nice Error.

```javascript
const niceError = require('nice-error');
niceError.from(error)
```

This is important, because obviously if you where to try and check the status code property of a vanilla error object the javascript engine is going to throw an undefined error for the status property.

## Recommended Usage:
You should use this any where you're trying to handle explicit errors in a micro service and would like to return a meaningful response body and clean readable logs.

Using Nice Error in actual code might look something like this:

```javascript
const niceError = require('nice-error');
module.exports = (pool, products, routeConfig) =>
  pool.query(releaseInventorySQL, [getInventoryIds(products)])
  .catch(error => {
    throw niceError.create('MySQL Error', {
      detail: 'Error releasing inventory',
      status: 'BAD_REQUEST',
      error
    })
  });
```

Using it to send a response back should look something like this:

```javascript
.catch(error => {
  let handledError = niceError.from(error);
  routeConfig.logger.error(handledError);
  return res.status(handledError.status).send(handledError);
});
```

## Development

```
run npmm install //to get started
npm run lint:live //--continuous linting
npm run test:live //--continuous unit testing.
```
