var should = require('should');
var scriptex = require('../../scriptex');

describe('Compiling', function() {
	it('dummy compile', function(done) {
		scriptex.compile(
			'/Users/richard/Developer/Javascript/scriptex/test-data/input/episode_01x04.txt',
			'/Users/richard/Developer/Javascript/scriptex/test-data/output/episode_01x04.tex',
			function(err) {
				should.not.exist(err);
				done();
			});
	});
});