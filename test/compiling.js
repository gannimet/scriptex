var should = require('should');
var scriptex = require('../../scriptex');

describe('Compiling', function() {
	it('dummy compile', function() {
		scriptex.compile('', '').should.be.true;
	});
});