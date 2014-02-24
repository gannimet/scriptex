var should = require('should');
var scriptex = require('../../scriptex');

describe('Beginning indicators', function() {
	it('Set beginning indicators', function() {
		scriptex.setBeginningIndicators([]).should.be.true;
		scriptex.getBeginningIndicators().should.be.empty;
		scriptex.setBeginningIndicators(['ACT ONE', 'FADE IN:', 'EXT. ']).should.be.true;
		scriptex.getBeginningIndicators().should.be.eql(['ACT ONE', 'FADE IN:', 'EXT. ']);
	});
	it('Add beginning indicators', function() {
		scriptex.setBeginningIndicators([]).should.be.true;
		scriptex.addBeginningIndicators('ACT ONE').should.be.true;
		scriptex.getBeginningIndicators().should.be.eql(['ACT ONE']);
		scriptex.addBeginningIndicators(['FADE IN:', 'EXT. ']).should.be.true;
		scriptex.getBeginningIndicators().should.be.eql(['ACT ONE', 'FADE IN:', 'EXT. ']);
		scriptex.setBeginningIndicators([]).should.be.true;
		scriptex.addBeginningIndicators('ACT ONE', 'ACT TWO', 'ACT THREE').should.be.true;
		scriptex.getBeginningIndicators().should.be.eql(['ACT ONE', 'ACT TWO', 'ACT THREE']);
		scriptex.addBeginningIndicators('ACT FOUR').should.be.true;
		scriptex.getBeginningIndicators().should.be.eql(['ACT ONE', 'ACT TWO', 'ACT THREE', 'ACT FOUR']);
	});
	it('Set/add invalid values', function() {
		scriptex.setBeginningIndicators([]).should.be.true;
		scriptex.setBeginningIndicators(2).should.be.false;
		scriptex.getBeginningIndicators().should.be.empty;
		scriptex.setBeginningIndicators([45, undefined, null, [], {}, 'ACT ONE']).should.be.true;
		scriptex.getBeginningIndicators().should.be.eql(['ACT ONE']);
		scriptex.setBeginningIndicators([]).should.be.true;
		scriptex.addBeginningIndicators([45, undefined, null, [], {}, 'ACT ONE']).should.be.true;
		scriptex.getBeginningIndicators().should.be.eql(['ACT ONE']);
	});
});

describe('Output transitions?', function() {
	it('setting and getting whether transitions should be outputted', function() {
		scriptex.shouldOutputTransitions().should.be.true;
		scriptex.setShouldOutputTransitions(false).should.be.true;
		scriptex.shouldOutputTransitions().should.be.false;
		scriptex.setShouldOutputTransitions(true).should.be.true;
		scriptex.shouldOutputTransitions().should.be.true;
		scriptex.setShouldOutputTransitions(false).should.be.true;

		scriptex.setShouldOutputTransitions('sdfs').should.be.false;
		scriptex.shouldOutputTransitions().should.be.false;
	});
});