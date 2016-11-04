'use strict';
const NiceError = require('./nice-error');

describe('Nice Error', function() {
  it('instance of', function() {
    let err = new NiceError();
    expect(err).to.be.an.instanceof(Error);
    expect(err).to.be.an.instanceof(NiceError);
  });

  it('.name', function() {
    let err = new NiceError();
    expect(err.name).to.equal('NiceError');
  });

  it('name is not enumerable', function() {
    let err = new NiceError();
    expect(err.propertyIsEnumerable('name')).to.be.false;
  });

  it('.stack', function() {
    let err = new NiceError();
    expect(err.stack).to.be.a('string');
  });

  it('#toString', function() {
    let err = new NiceError();
    expect(err.toString()).to.equal('NiceError');
  });

  it('.message', function() {
    let err = new NiceError('error occurred');
    expect(err.message).to.equal('error occurred');
  });

  it('.status', function() {
    let err = new NiceError('error occurred');
    expect(err.status).to.equal(500);
  });

  context('Nice Errors should have the correct properties', function() {
    var mvError;
    beforeEach(function() {
      mvError = new NiceError('error occured', {
        code: 'Special Error',
        detail: 'You made a big Mistake',
        status: 'BAD_REQUEST',
        error: new Error('error stuff')
      });
    });

    it('should assign options properties to the class appropriately', function() {
      expect(mvError.propertyIsEnumerable('message')).to.be.true;
      expect(mvError.propertyIsEnumerable('code')).to.be.true;
      expect(mvError.propertyIsEnumerable('detail')).to.be.true;
      expect(mvError.propertyIsEnumerable('status')).to.be.false;
      expect(mvError.propertyIsEnumerable('metadata')).to.be.false;
    });

    it('should have a static from method', function() {
      expect(NiceError.from).to.be.a('function');
      expect(mvError.from).to.not.exist;
    });

    it('should have a static create method', function() {
      expect(NiceError.create).to.be.a('function');
      expect(mvError.create).to.not.exist;
    });

    it('should enumerate the propper status Code', function() {
      expect(mvError.status).to.equal(400);
    });

    it('should assign a 500 http status code when no code is provided', function() {
      mvError = new NiceError('error occured', {
        code: 'Special Error',
        detail: 'You made a big Mistake',
        error: new Error('error stuff')
      });

      expect(mvError.status).to.equal(500);
    });

    it('should assign a 500 http status code when a bad code is passed', function() {
      mvError = new NiceError('error occured', {
        code: 'Special Error',
        detail: 'You made a big Mistake',
        status: 'I_LIKE_TO_MAKE_UP_MY_OWN_STUFF',
        error: new Error('error stuff')
      });

      expect(mvError.status).to.equal(500);
    });
  });

  context('from method', function() {
    var mvError;
    beforeEach(function() {
      mvError = new NiceError('error occured', {
        code: 'Special Error',
        detail: 'You made a big Mistake',
        status: 'BAD_REQUEST',
        error: new Error('error stuff')
      });
    });

    it('should return the error if it is already a nice error', function() {
      expect(NiceError.from(mvError)).to.deep.equal(mvError)
    });

    it('should return a new nice error if it is passed an error object', function() {
      const testyError = new Error('Testing Some Stuff');
      let niceTestyError = NiceError.from(testyError)
      expect(niceTestyError).to.be.an.instanceof(NiceError);
      expect(niceTestyError.status).to.equal(500);
    });

    it('should preserve an errors status property and assign it as a Nice Error class property', function() {
      const testyError = new Error('Testing Some Stuff');
      testyError.status = 400;
      let niceTestyError = NiceError.from(testyError)
      expect(niceTestyError).to.be.an.instanceof(NiceError);
      expect(niceTestyError.status).to.equal(400);
    })
  });

  context('create method', function() {
    it('should create a new nice error', function() {
      NiceError.create('error occured', {
        code: 'Special Error',
        detail: 'You made a big Mistake',
        status: 'BAD_REQUEST',
        error: new Error('error stuff')
      });
    });
  });
});
