var Lazy = require('lazy');
var fs = require('fs');
var Constants = require('./constants');

String.prototype.startsWith = function(s) {
	return this.indexOf(s) === 0;
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
}

/*
private:
*/

Compiler.prototype.identify = function(line) {

}

function indentOfLine(line) {
	var n = s.match(/^\s*/);
	return n? n[0].length : 0;
}

Compiler.prototype.append = function(chunk) {
	this.tex += chunk;
}

Compiler.prototype.start = function() {
	this.append("\\documentclass{screenplay}\n\n");
	this.append("\\renewcommand*{\\slugspace}{" + this.config.slugspace + "}\n\n");
}

Compiler.prototype.end = function() {
	this.space();
	this.append("\\end{document}");
}

// print the appropriate ending marker for current context (end tag, empty line, etc.)
Compiler.prototype.finishContext = function() {
	if (this.context === Constants.AUTHOR) {
		this.append('}');
	}

	if (this.context &&
			this.context !== Constants.AUTHOR &&
			this.context !== Constants.LOOKING_FOR_AUTHOR &&
			this.context !== Constants.TITLE) {
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

	// reuse this variable inside callback function
	var content;
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
					compiler.scriptBegun = true;
				} else {
					// look for a beginning indicator at the start of the line
					for (var i = 0; i < compiler.config.beginningIndicators.length; i++) {
						if (content.startsWith(compiler.config.beginningIndicators[i])) {
							compiler.scriptBegun = true;
						}
					}
				}
			}

			// has it still not begun in this line?
			if (!compiler.scriptBegun) {
				if (compiler.context === Constants.TITLE) {
					// title found -> write it and remove context
					compiler.append("\\title{" + content + "}");
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
		}).on('pipe', function() {
			compiler.end();
			compiler.write();
		});
}

module.exports = Compiler;
