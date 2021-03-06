var should = require('should');
var scriptex = require('../../scriptex');
var Compiler = require('../lib/compiler');
var Constants = require('../lib/constants');

var compiler;

beforeEach(function() {
	var indents = {};
	indents[Constants.DIALOGUE] = 25;
	indents[Constants.PARENTHETICAL] = 30;
	indents[Constants.SLUGLINE] = 15;
	indents[Constants.ACTION] = 15;
	indents[Constants.CHARACTER] = 37;
	indents[Constants.CENTERED] = 41;
	indents[Constants.TRANSITION] = {
		minValue: 60,
		maxValue: 75
	};
	indents[Constants.FADEIN] = 15;

	compiler = new Compiler('', '', {
		indents: indents,
		beginningIndicators: ['ACT ONE', 'FADE IN:', 'EXT. ', 'INT. ', 'EXT./INT. ', 'INT./EXT. '],
		outputTransitions: true,
		slugspace_in: ' - ',
		slugspace_out: ' - '
	});
	compiler.scriptBegun = true;
});

describe('String extensions', function() {
	it('#isUpperCase()', function() {
		'LEO JOHNSON\'S HOUSE'.isUpperCase().should.be.true;
		'Int. Kathrin\'s office - Day'.isUpperCase().should.be.false;
	});
});

describe('Compiling', function() {
	it('#dummy compile', function(done) {
		scriptex.compile(
			'/Users/richard/Developer/Javascript/scriptex/test-data/input/twin_peaks_pilot.txt',
			'/Users/richard/Developer/Javascript/scriptex/test-data/output/pilot/twin_peaks_pilot.tex',
			function(err) {
				should.not.exist(err);
				done();
			});
	});
	describe('#identifying', function() {
		it('#initialization', function() {
			should.exist(compiler);
		});
		it('#fadein', function() {
			compiler.identify('               FADE IN:').should.eql(Constants.FADEIN);
		});
		it('#slugline', function() {
			compiler.identify('               EXT. WHITE HOUSE - KITCHEN - DAY').should.eql(Constants.SLUGLINE);
			compiler.identify('               Int. Kathrin\'s office - Day').should.eql(Constants.ACTION);
		});
		it('#transition', function() {
			compiler.identify('                                                                 CUT TO:').should.eql(Constants.TRANSITION);
		});
		it('#dialogue', function() {
			compiler.identify('                         Who says that?').should.eql(Constants.DIALOGUE);
		});
		it('#character', function() {
			compiler.identify('                                     SARAH').should.eql(Constants.CHARACTER);
		});
		it('#parenthetical', function() {
			compiler.identify('                              (trembling)').should.eql(Constants.PARENTHETICAL);
		});
		it('#action', function() {
			compiler.identify('               Truman starts for the conference room.').should.eql(Constants.ACTION);
		});
		it('#centered', function() {
			compiler.identify('                                         ACT ONE').should.eql(Constants.CENTERED);
		});
	});
	describe('#analyzing sluglines', function() {
		it('#initialization', function() {
			should.exist(compiler);
		});
		it('#regular sluglines', function() {
			var slugline = compiler.analyzeSlugline('INT. LEO JOHNSON\'S HOUSE - DAY');
			slugline.should.have.properties({
				environment: 'INT.',
				location: 'LEO JOHNSON\'S HOUSE',
				timeOfDay: 'DAY'
			});

			slugline = compiler.analyzeSlugline('INT./EXT. COOPER\'S CAR - EARLY MORNING');
			slugline.should.have.properties({
				environment: 'INT./EXT.',
				location: 'COOPER\'S CAR',
				timeOfDay: 'EARLY MORNING'
			});
		});
		it('#corrupted but tolerated sluglines', function() {
			var slugline = compiler.analyzeSlugline('EXT. THE PALMER HOUSE MORNING');
			slugline.should.have.properties({
				environment: 'EXT.',
				location: 'THE PALMER HOUSE',
				timeOfDay: 'MORNING'
			});
		});
	});
});
