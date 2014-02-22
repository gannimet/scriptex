var should = require('should');
var scriptex = require('../../scriptex');

describe('Indents', function() {
	describe('Getting indents', function() {
		it('getting scalar values', function() {
			scriptex.getIndent('fadein').should.be.exactly(15);
			scriptex.getIndent('hurz').should.be.false;
		});
		it('getting object values', function() {
			scriptex.getIndent('transition').should.eql({
				minValue: 60,
				maxValue: 75
			});
		});
	});

	describe('Setting indents', function() {
		it('setting scalar values', function() {
			scriptex.setIndent('character', 35).should.be.true;
			scriptex.getIndent('character').should.be.exactly(35);
		});
		it('setting value as object', function() {
			scriptex.setIndent('character', {
				value: 36
			}).should.be.true;
			scriptex.getIndent('character').should.be.exactly(36);

			scriptex.setIndent('character', {
				minValue: 126,
				value: 130,
				maxValue: 135
			}).should.be.true;
			scriptex.getIndent('character').should.be.exactly(130);
		});
		it('setting min and max values as objects', function() {
			scriptex.setIndent('action', {
				minValue: 20,
				maxValue: 25
			}).should.be.true;
			scriptex.getIndent('action').should.eql({
				minValue: 20,
				maxValue: 25
			});
		});
		it('setting invalid values', function() {
			scriptex.setIndent('dialogue', 'hurz').should.be.false;
			scriptex.getIndent('dialogue').should.be.exactly(25);

			scriptex.setIndent('dialogue', {
				minValue: 22,
				maxValue: 'hurz'
			}).should.be.true;

			var dialogueIndent = scriptex.getIndent('dialogue');
			dialogueIndent.minValue.should.be.exactly(22);
			should.not.exist(dialogueIndent.maxValue);

			scriptex.setIndent('dialogue', 25).should.be.true;
			scriptex.setIndent('dialogue', {
				minValue: '10',
				maxValue: undefined
			}).should.be.false;
			scriptex.getIndent('dialogue').should.be.exactly(25);
		});
	});
});