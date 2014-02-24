var Compiler = require('./compiler.js');

Array.prototype.clone = function() {
	return this.slice();
}

/*
 * Some reasonable default values
 */
var indents = {
	'dialogue': 25,
	'parenthetical': 30,
	'slugline': 15,
	'action': 15,
	'character': 37,
	'centered': 41,
	'transition': {
		minValue: 60,
		maxValue: 75
	},
	'fadein': 15
};
var beginningIndicators = ['ACT ONE', 'FADE IN:', 'EXT. ', 'INT. ', 'EXT./INT. ', 'INT./EXT. '];
var outputTransitions = true;
var slugspace = ' - ';

function compile(inputFile, outputFile, done) {
	var compiler = new Compiler(
		inputFile,
		outputFile,
		{
			indents: indents,
			beginningIndicators: beginningIndicators,
			outputTransitions: outputTransitions,
			slugspace: slugspace
		},
		done
	);
	compiler.compile();
}

function isNumber(x) {
	return !isNaN(x) && isFinite(x);
}

function shouldOutputTransitions() {
	return outputTransitions;
}

function setShouldOutputTransitions(should) {
	if (should === true) {
		outputTransitions = true;
		return true;
	}
	if (should === false) {
		outputTransitions = false;
		return true;
	}
	return false;
}

function getSlugspace() {
	return slugspace;
}

function setSlugspace(space) {
	if (typeof space === 'string') {
		slugspace = space;
		return true;
	}
	return false;
}

function getIndent(what) {
	var indent = indents[what];
	if (indent !== undefined) {
		return indent;
	}

	return false;
}

function setIndent(what, how) {
	if (indents[what] === undefined) {
		return false;
	}

	if (typeof how === 'number') {
		// indent given as a single number... or is it?
		var indentValue = parseInt(how, 10);
		if (isNumber(indentValue)) {
			// ... it is, so set the indent to that
			indents[what] = indentValue;
			return true;
		} else {
			// ... nah, this doesn't work
			return false;
		}
	} else if (typeof how === 'object') {
		// an object was given, does it contain a 'value' field?
		if (how.value !== undefined && typeof how.value === 'number') {
			// yes, so check whether it's a number
			var indentValue = parseInt(how.value, 10);
			if (isNumber(indentValue)) {
				indents[what] = indentValue;
				return true;
			} else {
				return false;
			}
		} else {
			var indentObject = {};
			// no, but is there a minValue and/or a maxValue field?
			if (how.minValue !== undefined && typeof how.minValue === 'number') {
				var minValue = parseInt(how.minValue);
				if (isNumber(minValue)) {
					indentObject.minValue = minValue;
				}
			}
			if (how.maxValue !== undefined && typeof how.maxValue === 'number') {
				var maxValue = parseInt(how.maxValue);
				if (isNumber(maxValue)) {
					indentObject.maxValue = maxValue;
				}
			}
			
			// has at least one of minValue and maxValue been set?
			if (indentObject.minValue !== undefined ||
					indentObject.maxValue !== undefined) {
				indents[what] = indentObject;
				return true;
			} else {
				return false;
			}
		}
	}
	
	// we shouldn't really ever get here
	return false;
}

/**
adds the supplied indicators (indicating where the title page is over
and the actual script begins)
@param indicator String or Array containing Strings to be added to the existing
beginning indicators
@return true if at least one of the supplied indicators has been added, false otherwise
Example calls:
	- addBeginningIndicators('ACT ONE', 'FADE IN:')
	- addBeginningIndicators(['ACT ONE', 'FADE IN:'])
	- addBeginningIndicators('EXT. ');
 */
function addBeginningIndicators(indicator) {
	if (!arguments.length) {
		return false;
	}

	if (arguments.length === 1) {
		// single argument must either be string ...
		if (typeof indicator === 'string') {
			beginningIndicators.push(indicator);
			return true;
		}
		// ... or array
		if (Array.isArray(indicator)) {
			if (!indicator.length) {
				// tolerate empty array (= reset)
				return true;
			}
			// add each string inside array to the indicators
			var ok = false;
			for (var i = 0; i < indicator.length; i++) {
				var singleInd = indicator[i];
				// omit non-strings
				if (typeof singleInd === 'string') {
					beginningIndicators.push(singleInd);
					ok = true;
				}
			}
			return ok;
		}
		return false;
	}

	var ok = false;
	for (var i = 0; i < arguments.length; i++) {
		var singleInd = arguments[i];
		// omit non-strings
		if (typeof singleInd === 'string') {
			beginningIndicators.push(singleInd);
			ok = true;
		}
	}
	return ok;
}

/**
sets the supplied indicators (indicating where the title page is over
and the actual script begins)
@param indicator String or Array containing Strings to be set as beginning indicators
@return true if at least one of the supplied indicators has been set, false otherwise
Example calls:
	- setBeginningIndicators('ACT ONE', 'FADE IN:')
	- setBeginningIndicators(['ACT ONE', 'FADE IN:'])
	- setBeginningIndicators('EXT. ');
*/
function setBeginningIndicators(indicators) {
	var oldIndicators = beginningIndicators.clone(); // backup
	beginningIndicators = [];
	if (addBeginningIndicators(indicators)) {
		return true;
	} else {
		// the supplied values were all invalid, so
		// restore the old indicators
		beginningIndicators = oldIndicators;
		return false;
	}
}

function getBeginningIndicators() {
	return beginningIndicators;
}

module.exports = {
	getIndent: getIndent,
	setIndent: setIndent,
	setBeginningIndicators: setBeginningIndicators,
	addBeginningIndicators: addBeginningIndicators,
	getBeginningIndicators: getBeginningIndicators,
	compile: compile,
	shouldOutputTransitions: shouldOutputTransitions,
	setShouldOutputTransitions: setShouldOutputTransitions
};