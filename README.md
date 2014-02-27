# scriptex

scriptex is a *node.js* module that turns screenplays as plain text files into LaTeX files using the excellent [screenplay](http://www.ctan.org/tex-archive/macros/latex/contrib/screenplay) LaTeX class.

## Installation

Simply install via npm (Node Package Manager), either explicitly by:

```
$ npm install scriptex
```

… or by listing `scriptex` inside the `dependencies` field of your `package.json`.

## Usage

Translating your .txt screenplays into .tex files is as simple as:

```javascript
var scriptex = require('scriptex');

scriptex.compile(
	'/path/to/input_screenplay.txt',
	'/path/to/output_screenplay.tex',
	function(err) {
		if (!err) {
			console.log('compiling successful!');
		}
	}
);
```

## Configuration options

Depending on the exact format of your input .txt file, you might need to set up some configurations in order to correctly compile it into a LaTeX file. These options include:

-to be continued-
