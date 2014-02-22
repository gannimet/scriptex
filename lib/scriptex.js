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

function isNumber(x) {
	return !isNaN(x) && isFinite(x);
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

function compile(inputFile, outputFile) {

}

module.exports = {
	getIndent: getIndent,
	setIndent: setIndent,
	compile: compile
};