var Lazy = require('lazy');
var fs = require('fs');
var constants = require('./constants');

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
	this.append("\\end{document}");
}

// print the appropriate ending marker for current context (end tag, empty line, etc.)
Compiler.prototype.finishContext = function() {

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

	new Lazy(fs.createReadStream(this.inputFile))
		.lines.forEach(function(line) {
			line = line.toString();
			content = line.trim();

			// skip empty lines
			if (!content) {
				compiler.finishContext();
				return;
			}

			// has the actual script begun yet?
			if (!compiler.scriptBegun) {
				if (!compiler.config.beginningIndicators.length) {
					compiler.scriptBegun = true;
				} else {
					// look for a beginning indicator at the start of the line
					for (var i = 0; i < compiler.config.beginningIndicators; i++) {
						if (content.startsWith(compiler.config.beginningIndicators[i])) {
							compiler.scriptBegun = true;
						}
					}
				}
			}
		});

	this.end();
	this.write();
}

module.exports = Compiler;
