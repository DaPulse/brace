ace.define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../lib/oop");
var TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;

var DocCommentHighlightRules = function() {
    this.$rules = {
        "start" : [ {
            token : "comment.doc.tag",
            regex : "@[\\w\\d_]+" // TODO: fix email addresses
        },
        DocCommentHighlightRules.getTagRule(),
        {
            defaultToken : "comment.doc",
            caseInsensitive: true
        }]
    };
};

oop.inherits(DocCommentHighlightRules, TextHighlightRules);

DocCommentHighlightRules.getTagRule = function(start) {
    return {
        token : "comment.doc.tag.storage.type",
        regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
    };
};

DocCommentHighlightRules.getStartRule = function(start) {
    return {
        token : "comment.doc", // doc comment
        regex : "\\/\\*(?=\\*)",
        next  : start
    };
};

DocCommentHighlightRules.getEndRule = function (start) {
    return {
        token : "comment.doc", // closing comment
        regex : "\\*\\/",
        next  : start
    };
};


exports.DocCommentHighlightRules = DocCommentHighlightRules;

});

ace.define("ace/mode/aml_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../lib/oop");
var DocCommentHighlightRules = acequire("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;
var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";

var AMLHighlightRules = function(options) {
    var keywordMapper = this.createKeywordMapper(
      {
        keyword: 'if|elsif|else|end|test|between|default|and|or|not|on|variant',
        'constant.language.boolean': 'true|false'
      },
      'identifier'
    );

    var timeRe = '([1-9]\\d*)\\s+(?:(second|minute|hour|day|week|month|year)s?)\\s+(from now|ago)';

    var nowRe = '(?<=[^\\w-\'"]|^)now(?=[^\\w-\'"]|$)';

    var nullRe = '(?<![\\w\'"])null(?![\\w\'"])';

    var escapedRe =
      '\\\\(?:x[0-9a-fA-F]{2}|' + // hex
      'u[0-9a-fA-F]{4}|' + // unicode
      'u{[0-9a-fA-F]{1,6}}|' + // es6 unicode
      '[0-2][0-7]{0,2}|' + // oct
      '3[0-7][0-7]?|' + // oct
      '[4-7][0-7]?|' + //oct
      '.)';

    this.$rules = {
      no_regex: [
        DocCommentHighlightRules.getStartRule('doc-start'),
        comments('no_regex'),
        {
          token: 'constant.numeric',
          regex: timeRe
        },
        {
          token: 'constant.numeric',
          regex: nowRe
        },
        {
          token: 'constant.language',
          regex: nullRe
        },
        {
          token: 'string',
          regex: "'(?=.)",
          next: 'qstring'
        },
        {
          token: 'string',
          regex: '"(?=.)',
          next: 'qqstring'
        },
        {
          token: 'constant.numeric', // hexadecimal, octal and binary
          regex: /0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/
        },
        {
          token: 'constant.numeric', // decimal integers and floats
          regex: /(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/
        },
        {
          token: keywordMapper,
          regex: identifierRe
        },
        {
          token: 'punctuation.operator',
          regex: /[.](?![.])/,
          next: 'property'
        },
        {
          token: 'keyword.operator',
          regex: /--|\+\+|\.{3}|===|==|=|!=|!==|<+=?|>+=?|!|&&|\|\||\?:|[!$%&*+\-~\/^]=?/,
          next: 'start'
        },
        {
          token: 'paren.lparen',
          regex: /[\[({]/,
          next: 'start'
        },
        {
          token: 'paren.rparen',
          regex: /[\])}]/
        },
        {
          token: 'comment',
          regex: /^#!.*$/
        }
      ],
      property: [
        {
          token: 'text',
          regex: '\\s+'
        },
        {
          token: 'punctuation.operator',
          regex: /[.](?![.])/
        },
        {
          token: 'identifier',
          regex: identifierRe
        },
        {
          regex: '',
          token: 'empty',
          next: 'no_regex'
        }
      ],
      // regular expressions are only allowed after certain tokens. This
      // makes sure we don't mix up regexps with the divison operator
      start: [
        DocCommentHighlightRules.getStartRule('doc-start'),
        comments('start'),
        {
          token: 'string.regexp',
          regex: '\\/',
          next: 'regex'
        },
        {
          token: 'text',
          regex: '\\s+|^$',
          next: 'start'
        },
        {
          // immediately return to the start mode without matching
          // anything
          token: 'empty',
          regex: '',
          next: 'no_regex'
        }
      ],
      qqstring: [
        {
          token: 'constant.language.escape',
          regex: escapedRe
        },
        {
          token: 'string',
          regex: '\\\\$',
          consumeLineEnd: true
        },
        {
          token: 'string',
          regex: '"|$',
          next: 'no_regex'
        },
        {
          defaultToken: 'string'
        }
      ],
      qstring: [
        {
          token: 'constant.language.escape',
          regex: escapedRe
        },
        {
          token: 'string',
          regex: '\\\\$',
          consumeLineEnd: true
        },
        {
          token: 'string',
          regex: "'|$",
          next: 'no_regex'
        },
        {
          defaultToken: 'string'
        }
      ]
    };

    this.embedRules(DocCommentHighlightRules, 'doc-', [
      DocCommentHighlightRules.getEndRule('no_regex')
    ]);

    this.normalizeRules();
};

  oop.inherits(AMLHighlightRules, TextHighlightRules);

  function comments(next) {
    return [
      {
        token: 'comment',
        regex: '\\/\\/',
        next: [
          DocCommentHighlightRules.getTagRule(),
          { token: 'comment', regex: '$|^', next: next || 'pop' },
          { defaultToken: 'comment', caseInsensitive: true }
        ]
      }
    ];
  }

  exports.AMLHighlightRules = AMLHighlightRules;
});

ace.define("ace/mode/aml",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/aml_highlight_rules","ace/worker/worker_client","ace/mode/behaviour/cstyle"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../lib/oop");
var TextMode = acequire("./text").Mode;
var JavaScriptHighlightRules = acequire('./aml_highlight_rules').AMLHighlightRules;
var MatchingBraceOutdent = acequire("./matching_brace_outdent").MatchingBraceOutdent;
var WorkerClient = acequire("../worker/worker_client").WorkerClient;
var CstyleBehaviour = acequire("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = acequire("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = JavaScriptHighlightRules;

    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};
    this.$quotes = {'"': '"', "'": "'", "`": "`"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start" || state == "no_regex") {
            var match = line.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);
            if (match) {
                indent += tab;
            }
        } else if (state == "doc-start") {
            if (endState == "start" || endState == "no_regex") {
                return "";
            }
            var match = line.match(/^\s*(\/?)\*/);
            if (match) {
                if (match[1]) {
                    indent += " ";
                }
                indent += "* ";
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    /*this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], require("../worker/aml"), "AMLWorker");
        worker.attachToDocument(session.getDocument());

        worker.on("annotate", function(results) {
            session.setAnnotations(results.data);
        });

        worker.on("terminate", function() {
            session.clearAnnotations();
        });

        return worker;
    };*/

    this.$id = "ace/mode/aml";
}).call(Mode.prototype);

exports.Mode = Mode;
});
