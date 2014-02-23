var Lazy = require('lazy');
var fs = require('fs');

function Compiler(inputFile, outputFile, config) {
	this.inputFile = inputFile;
	this.outputFile = outputFile;
	this.config = config;
}

Compiler.prototype.compile = function() {
	var i = 0;
	new Lazy(fs.createReadStream(this.inputFile))
		.lines.forEach(function(line) {
			line = line.toString();

			
		});
	return true;
}

module.exports = Compiler;
