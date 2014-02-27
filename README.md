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

**NOTE:** scriptex does not render the screenplay as a PDF file automatically, so you will need to run `pdftex` yourself.

There is an example screenplay of episode 4 of the brilliant 90's show TWIN PEAKS included in the `test-data` directory, which you can compile using scriptex. If you play around with the configuration a bit (see below), you'll notice how these changes will affect the output up to the point where the input data cannot be identified correctly anymore, resulting in wrong output.

## Configuration options

Depending on the exact format of your input .txt file, you might need to set up some configurations in order to correctly compile it into a LaTeX file. These options include:

### indents

It is essential for the scriptex compiler to be able to classify the input data inside the .txt file correctly. Since that file doesn't contain any markup information, the compiler needs to use a set of heuristics to figure out what category a chunk of data belongs to (action, character name, dialogue etc.). This works mostly based on the `indents` variable, specifying the *number of leading whitespaces before a line of a particular category* inside the .txt file.

By default, scriptex comes with a set of predefined `indents` designed to fit in with the TWIN PEAKS screenplay in the *test-data* folder. These are:

```javascript
{
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
```

As you can see, in the simple case this is just a constant number. Lines will then always be classified into a category using this exact value.

But with the `transition` category it's a bit more difficult, since these are aligned flushright and have different numbers of leading spaces depending on the lengths of their contents. It is therefore possible to supply a range of indents using an object as seen above. Don't make the difference between `minValue` and `maxValue` too big to avoid ambiguities.

So how do you set these indent values? Easy:

```javascript
scriptex.setIndent('character', 25);
```

Or, with a range:

```javascript
scriptex.setIndent('transition', {
	minValue: 60,
	maxValue: 75
});
```

You can also set an explicit value inside an object, but note that any `minValue` and `maxValue` properties will be ignored if there is also a `value` property present:

```javascript
scriptex.setIndent('dialogue', {
	value: 25
});
```
