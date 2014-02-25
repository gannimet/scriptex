var should = require('should');
var scriptex = require('../../scriptex');
var constants = require('../lib/constants');

describe('Indents', function() {
	describe('Getting indents', function() {
		it('getting scalar values', function() {
			scriptex.getIndent(constants.FADEIN).should.be.exactly(15);
			scriptex.getIndent('hurz').should.be.false;
		});
		it('getting object values', function() {
			scriptex.getIndent(constants.TRANSITION).should.eql({
				minValue: 60,
				maxValue: 75
			});
		});
	});

	describe('Setting indents', function() {
		it('setting scalar values', function() {
			scriptex.setIndent(constants.CHARACTER, 35).should.be.true;
			scriptex.getIndent(constants.CHARACTER).should.be.exactly(35);
		});
		it('setting value as object', function() {
			scriptex.setIndent(constants.CHARACTER, {
				value: 36
			}).should.be.true;
			scriptex.getIndent(constants.CHARACTER).should.be.exactly(36);

			scriptex.setIndent(constants.CHARACTER, {
				minValue: 126,
				value: 130,
				maxValue: 135
			}).should.be.true;
			scriptex.getIndent(constants.CHARACTER).should.be.exactly(130);
		});
		it('setting min and max values as objects', function() {
			scriptex.setIndent(constants.ACTION, {
				minValue: 20,
				maxValue: 25
			}).should.be.true;
			scriptex.getIndent(constants.ACTION).should.eql({
				minValue: 20,
				maxValue: 25
			});
		});
		it('setting invalid values', function() {
			scriptex.setIndent(constants.DIALOGUE, 'hurz').should.be.false;
			scriptex.getIndent(constants.DIALOGUE).should.be.exactly(25);

			scriptex.setIndent(constants.DIALOGUE, {
				minValue: 22,
				maxValue: 'hurz'
			}).should.be.true;

			var dialogueIndent = scriptex.getIndent(constants.DIALOGUE);
			dialogueIndent.minValue.should.be.exactly(22);
			should.not.exist(dialogueIndent.maxValue);

			scriptex.setIndent(constants.DIALOGUE, 25).should.be.true;
			scriptex.setIndent(constants.DIALOGUE, {
				minValue: '10',
				maxValue: undefined
			}).should.be.false;
			scriptex.getIndent(constants.DIALOGUE).should.be.exactly(25);

			scriptex.setIndent(constants.ACTION, {
				value: 'hurz'
			}).should.be.false;
			scriptex.setIndent(constants.ACTION, {
				value: '10.5'
			}).should.be.false;
		});
		it('setting NaN and Infinity', function() {
			scriptex.setIndent(constants.ACTION, '10.5').should.be.false;
			scriptex.setIndent(constants.ACTION, '10').should.be.false;
			scriptex.setIndent(constants.SLUGLINE, NaN).should.be.false;
			scriptex.setIndent(constants.SLUGLINE, Infinity).should.be.false;

			scriptex.setIndent(constants.CHARACTER, {
				value: NaN
			}).should.be.false;
			scriptex.setIndent(constants.CHARACTER, {
				minValue: NaN,
				maxValue: Infinity
			}).should.be.false;
		});
	});
});