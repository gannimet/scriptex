var should = require('should');
var scriptex = require('../../scriptex');

describe('Compiling', function() {
	it('dummy compile', function() {
		scriptex.compile(
			'/Users/richard/Documents/Drehbuecher/twin_peaks/episode_01x04.txt',
			'')
			.should.be.true;
	});
});