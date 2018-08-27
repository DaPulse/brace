# brace-aml

For the original README, check out the origin repository ([thlorenz/brace](https://github.com/thlorenz/brace))

<a href="https://www.patreon.com/bePatron?u=8663953"><img alt="become a patron" src="https://c5.patreon.com/external/logo/become_a_patron_button.png" height="35px"></a>

[browserify](https://github.com/substack/node-browserify) compatible version of the [ace editor](http://ajaxorg.github.io/ace/).

[![browser support](https://ci.testling.com/thlorenz/brace.png)](https://ci.testling.com/thlorenz/brace)

***This badge shows which browsers support annotations, however the editor itself works in pretty much every browser.***

[![screenshot](assets/brace.png)](http://thlorenz.github.io/brace/)
*[Try it in your browser](http://thlorenz.github.io/brace/)*

## Installation

This package is not distributed via npmjs, but can be installed using npm by adding the following to `package.json`:



    npm install brace-aml

## Example

```js
var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');

var editor = ace.edit('javascript-editor');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');
```

