var Lazy = require('lazy');
var fs = require('fs');
var Constants = require('./constants');

/*
 * Extended built-in classes
 */

Array.prototype.contains = function(element) {
	return this.indexOf(element) !== -1;
}

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
	this.parenOpen = false;
	this.dialogueOpen = false;
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
	if (content.isUpperCase() &&
			content.startsWithOneOf(this.sluglineBeginnings) &&
			this.indentsMatch(line, Constants.SLUGLINE)) {
		return Constants.SLUGLINE;
	}

	// ACTION
	if (this.indentsMatch(line, Constants.ACTION)) {
		return Constants.ACTION;
	}

	// CHARACTER
	if (content.isUpperCase() &&
			this.indentsMatch(line, Constants.CHARACTER)) {
		return Constants.CHARACTER;
	}

	// PARENTHETICAL
	if (this.indentsMatch(line, Constants.PARENTHETICAL)) {
		// the reason we don't check for opening and
		// closing parens is because of multi-line
		// parentheticals
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
	return false;
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

Compiler.prototype.analyzeSlugline = function(slugline) {
	// analyze the slugline for its parts
	explodedSlugline = slugline.split(this.config.slugspace_in);
	envLoc = explodedSlugline[0];
	// to tolerate sluglines with corrupted slugspace
	if (explodedSlugline.length === 1) {
		// this means no slugspace was found and therefore we
		// can't just take the last bit to determine the time
		// of day; take the last word heuristically instead
		timeOfDay = envLoc.substring(
			envLoc.lastIndexOf(' ') + 1,
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

	return {
		environment: environment,
		location: location,
		timeOfDay: timeOfDay
	};
}

function indentOfLine(line) {
	var n = line.match(/^\s*/);
	return n? n[0].length : 0;
}

Compiler.prototype.append = function(chunk) {
	this.tex += chunk;
}

Compiler.prototype.prepareParenthetical = function(content) {
	if (content.startsWith('(')) {
		if (content.endsWith(')')) {
			return content.substring(1, content.length - 1);
		} else {
			return content.substring(1, content.length);
		}
	} else {
		if (content.endsWith(')')) {
			return content.substring(0, content.length - 1);
		} else {
			return content;
		}
	}

	// shouldn't happen
	return false;
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

	if (this.context && (
			this.context === Constants.ACTION ||
			this.context === Constants.SLUGLINE)) {
		this.space();
	}

	if (this.context === Constants.PARENTHETICAL) {
		this.append('}\n');
		this.parenOpen = false;
	}

	if (this.context === Constants.DIALOGUE) {
		if (this.dialogueOpen) {
			this.append('\n\\end{dialogue}');
			this.dialogueOpen = false;
			this.space();
		}
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
	var content, lineIdentifier, slugline;
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

				// the following is to tolerate parentheticals at the
				// end of dialogue; which in theory is a no-no, but
				// happens quite a lot in the TWIN PEAKS scripts
				if (compiler.dialogueOpen) {
					compiler.append('\n\\end{dialogue}');
					compiler.space();
					compiler.dialogueOpen = false;
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

			// are we supposed to insert a page break
			// based on the content of the current line?
			if (compiler.config.pageBreakMarkers.contains(content)) {
				compiler.append('\\pagebreak\n\n');
			}

			// script has begun
			lineIdentifier = compiler.identify(line);

			if (lineIdentifier === Constants.SLUGLINE) {
				// analyze the slugline for its parts
				slugline = compiler.analyzeSlugline(content);

				// snythesize latex slugline
				compiler.append(
					compiler.sluglineTag(slugline.environment) +
					'[' + slugline.timeOfDay + ']' +
					'{' + slugline.location + '}'
				);

				// continue with next line
				return;
			}

			if (lineIdentifier === Constants.ACTION) {
				// if we are already in ACTION context,
				// add an additional space
				if (compiler.context === Constants.ACTION) {
					compiler.append(' ');
				}

				// in any case, just print the contents
				// of the current line, set context
				compiler.append(content);
				compiler.context = Constants.ACTION;

				// continue with next line
				return;
			}

			if (lineIdentifier === Constants.CHARACTER) {
				compiler.append('\\begin{dialogue}{' +
					content + '}\n');
				compiler.dialogueOpen = true;

				// continue with next line
				return;
			}

			if (lineIdentifier === Constants.PARENTHETICAL) {
				// do we need to open a new
				// paren environment
				if (!compiler.parenOpen) {
					compiler.append('\\paren{');
					compiler.parenOpen = true;
				}

				// were we in PARENTHETICAL context before?
				// if so, we need an extra space ahead
				if (compiler.context === Constants.PARENTHETICAL) {
					compiler.append(' ');
				}

				// write the actual paren bit, set context
				compiler.append(
					compiler.prepareParenthetical(content)
				);
				compiler.context = Constants.PARENTHETICAL;

				// continue with next line
				return;
			}

			if (lineIdentifier === Constants.DIALOGUE) {
				if (compiler.context === Constants.DIALOGUE) {
					// if we were in DIALOGUE context before,
					// first add an additional space
					compiler.append(' ');
				} else {
					// close paren
					compiler.finishContext();
				}

				// write the actual bit of dialogue
				compiler.append(content);
				// set context
				compiler.context = Constants.DIALOGUE;

				// continue with next line
				return;
			}

			if (lineIdentifier === Constants.TRANSITION) {
				// should transitions be written?
				if (!compiler.config.outputTransitions) {
					// continue with next line
					return;
				}

				if (content === 'FADE OUT:') {
					compiler.append('\\fadeout');
					compiler.space();
				}

				/*
				 * Placeholder for outputting transitions
				 * This is currently not supported by the
				 * latex class.
				 */
			}

			if (lineIdentifier === Constants.FADEIN) {
				compiler.append('\\fadein');
				compiler.space()
			}

			if (lineIdentifier === Constants.CENTERED) {
				compiler.append('\\sccentre{' + content + '}');
				compiler.space();
			}
		}).on('pipe', function() {
			compiler.end();
			compiler.write();
		});
}

module.exports = Compiler;
