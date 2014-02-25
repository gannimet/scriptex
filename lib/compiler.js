var Lazy = require('lazy');
var fs = require('fs');
var Constants = require('./constants');

String.prototype.startsWith = function(s) {
	return this.indexOf(s) === 0;
}

String.prototype.endsWith = function(s) {
	return this.indexOf(s) === (this.length - s.length);
}

String.prototype.startsWithOneOf = function(strings) {
	var check = false;
	for (var i = 0; i < strings.length; i++) {
		if (this.startsWith(strings[i])) {
			check = true;
		}
	}
	return check;
}

String.prototype.isUpperCase = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i] !== this[i].toUpperCase() &&
			this[i] !== 'ß') {
			return false;
		}
	}
	return true;
}

/*
Constructor
*/
function Compiler(inputFile, outputFile, config, doneCallback) {
	this.inputFile = inputFile;
	this.outputFile = outputFile;
	this.config = config;
	this.scriptBegun = false;
	this.tex = '';
	this.doneCallback = doneCallback;
	this.context = null;
	this.sluglineBeginnings = ['INT. ', 'EXT. ', 'INT./EXT. ', 'EXT./INT. '];
}

/*
private:
*/

Compiler.prototype.identify = function(line) {
	var content = line.trim();

	// this function only makes sense
	// in the actual script part
	if (!this.scriptBegun) {
		return false;
	}

	// FADEIN
	if (content === 'FADE IN:' && this.indentsMatch(line, Constants.FADEIN)) {
		return Constants.FADEIN;
	}

	// SLUGLINE
	if (content.startsWithOneOf(this.sluglineBeginnings) &&
			this.indentsMatch(line, Constants.SLUGLINE)) {
		return Constants.SLUGLINE;
	}

	// ACTION
	if (this.indentsMatch(line, Constants.ACTION)) {
		return Constants.ACTION;
	}

	// CHARACTER
	if (this.indentsMatch(line, Constants.CHARACTER) &&
			content.isUpperCase()) {
		return Constants.CHARACTER;
	}

	// PARENTHETICAL
	if (this.indentsMatch(line, Constants.PARENTHETICAL) &&
			content.startsWith('(') && content.endsWith(')')) {
		return Constants.PARENTHETICAL;
	}

	// DIALOGUE
	if (this.indentsMatch(line, Constants.DIALOGUE)) {
		return Constants.DIALOGUE;
	}

	// TRANSITION
	if (this.indentsMatch(line, Constants.TRANSITION) &&
			content.isUpperCase()) {
		return Constants.TRANSITION;
	}

	// CENTERED
	if (this.indentsMatch(line, Constants.CENTERED) &&
			content.isUpperCase()) {
		return Constants.CENTERED;
	}

	// no match made ...
	return false;P
}

Compiler.prototype.indentsMatch = function(line, what) {
	var indent = this.config.indents[what];

	// straightforward numerical value?
	if (typeof indent === 'number') {
		return indentOfLine(line) === indent;
	}

	// then it must be an object

	// value defined in that object?
	if (indent.value) {
		return indentOfLine(line) === indent.value;
	}

	// then at least one of minValue and
	// maxValue must be defined
	var minValue = indent.minValue;
	var maxValue = indent.maxValue;

	// check for those bounds
	if (!minValue) {
		return indentOfLine(line) <= maxValue;
	}
	if (!maxValue) {
		return indentOfLine(line) >= minValue;
	}
	return indentOfLine(line) <= maxValue &&
		   indentOfLine(line) >= minValue;
}

function indentOfLine(line) {
	var n = line.match(/^\s*/);
	return n? n[0].length : 0;
}

Compiler.prototype.append = function(chunk) {
	this.tex += chunk;
}

Compiler.prototype.sluglineTag = function(environment) {
	if (environment === Constants.INT) {
		return '\\intslug';
	}
	if (environment === Constants.EXT) {
		return '\\extslug';
	}
	if (environment === Constants.INTEXT) {
		return '\\intextslug';
	}
	if (environment === Constants.EXTINT) {
		return '\\extintslug';
	}
	return false;
}

Compiler.prototype.start = function() {
	this.append("\\documentclass{screenplay}\n\n");
	this.append("\\renewcommand*{\\slugspace}{" + this.config.slugspace_out + "}\n\n");
}

Compiler.prototype.begin = function() {
	this.append("\\begin{document}");
	this.space();
	this.append("\\coverpage");
	this.space();
	this.scriptBegun = true;
}

Compiler.prototype.end = function() {
	this.space();
	this.append("\\end{document}");
}

// print the appropriate ending marker for current context (end tag, empty line, etc.)
Compiler.prototype.finishContext = function() {
	if (this.context === Constants.AUTHOR) {
		this.append('}\n');
	}

	if (this.context &&
			this.context !== Constants.AUTHOR &&
			this.context !== Constants.LOOKING_FOR_AUTHOR &&
			this.context !== Constants.TITLE) {
		this.space();
	}

	if (this.scriptBegun) {
		this.space();
	}

	this.context = null;
}

Compiler.prototype.space = function() {
	this.append("\n\n");
}

Compiler.prototype.write = function() {
	fs.writeFile(this.outputFile, this.tex, this.doneCallback);
}

/*
public:
*/

Compiler.prototype.compile = function() {
	this.start();

	// reuse this variables inside callback function
	var content, lineIdentifier, explodedSlugline,
		timeOfDay, environment, location, envLoc;
	// store context
	var compiler = this;

	// the first content we'll find will
	// be interpreted as the title
	compiler.context = Constants.TITLE;

	new Lazy(fs.createReadStream(this.inputFile))
		.lines.forEach(function(line) {
			line = line.toString();
			content = line.trim();

			// skip empty lines
			if (!content) {
				if (compiler.context !== Constants.LOOKING_FOR_AUTHOR) {
					// empty line means leave the context, except
					// when we're looking for an author
					compiler.finishContext();
				}
				return;
			}

			// has the actual script begun yet?
			if (!compiler.scriptBegun) {
				if (!compiler.config.beginningIndicators.length) {
					compiler.begin();
				} else {
					// look for a beginning indicator at the start of the line
					for (var i = 0; i < compiler.config.beginningIndicators.length; i++) {
						if (content.startsWith(compiler.config.beginningIndicators[i])) {
							compiler.begin();
						}
					}
				}
			}

			// has it still not begun in this line?
			if (!compiler.scriptBegun) {
				if (compiler.context === Constants.TITLE) {
					// title found -> write it and remove context
					compiler.append("\\title{" + content + "}\n");
					compiler.finishContext();
					// continue with next line
					return;
				}

				if (content === 'by') {
					// the next thing we read will be the author
					compiler.context = Constants.LOOKING_FOR_AUTHOR;
					// continue with next line
					return;
				}

				if (compiler.context === Constants.LOOKING_FOR_AUTHOR) {
					// write the first chunk for the author
					compiler.append("\\author{" + content);
					compiler.context = Constants.AUTHOR;
					// continue with next line
					return;
				}

				if (compiler.context === Constants.AUTHOR) {
					// found another line of author field
					compiler.append(' ' + content);
					// continue with next line
					return;
				}
			}

			// script has begun
			lineIdentifier = compiler.identify(line);

			if (lineIdentifier === Constants.SLUGLINE) {
				// analyze the slugline for its parts
				explodedSlugline = content.split(compiler.config.slugspace_in);
				envLoc = explodedSlugline[0];
				// to tolerate sluglines with corrupted slugspace
				if (explodedSlugline.length === 1) {
					// this means no slugspace was found and therefore we
					// can't just take the last bit to determine the time
					// of day; take the last word heuristically instead
					timeOfDay = envLoc.substring(
						envLoc.lastIndexOf(' '),
						envLoc.length
					);
					// thus for the location we must
					// omit the last word
					location = envLoc.substring(
						envLoc.indexOf(' ') + 1,
						envLoc.lastIndexOf(' ')
					);
				} else {
					// this means the slugline had a proper slugspace
					timeOfDay = explodedSlugline.pop();
					location = envLoc.substring(
						envLoc.indexOf(' ') + 1,
						envLoc.length
					);
				}
				
				// everything up to the first space is environment
				// (INT., EXT. etc.)
				environment = envLoc.split(' ')[0];

				// snythesize latex slugline
				compiler.append(
					compiler.sluglineTag(environment) +
					'[' + timeOfDay + ']' +
					'{' + location + '}'
				);

				// continue with next line
				return;
			}
		}).on('pipe', function() {
			compiler.end();
			compiler.write();
		});
}

module.exports = Compiler;
