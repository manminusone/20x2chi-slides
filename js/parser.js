
/*
html-def 	=> tag  [ "." contents ] *

contents	=> tag |
			|  tag "(" class-list ")" 
			|  tag "("  key "=" value ")"
			|  tag "("  string-def ")"
			| "[" contents [ "," contents ] * "]"


slide.[layer(bkg).img(src="slides/${data.image}"), layer(gridded).span(footer).[p("${data.name"), p("${data.label}")]]

*/

var Parser = (function() {

	const TOKEN_TAG = 1, TOKEN_DOT = 2, TOKEN_LBRACKET = 3, TOKEN_RBRACKET = 4,
		TOKEN_LPAREN = 5, TOKEN_RPAREN = 6, TOKEN_EQ = 7, TOKEN_STR = 8, TOKEN_COMMA = 9;


	var tokenlist = Array();


	function _HtmlDef() {
		if (tokenlist[0].token != TOKEN_TAG) {
			error("Expected tag name, but I found "+tokenlist[0].value);
			return null;
		} else {
			retval = { type: 'layer', class: '' }
		}
	}

	function tokenize(str) {
		tokenlist = Array();

		while (str != '') {
			var foo = /^\s+(.*)$/.exec(str);
			if (foo != null)
				str = foo[1];

			foo = /^([a-z]+)(.*)$/.exec(str);
			if (foo != null) {
				tokenlist.push({ token: TOKEN_TAG, value: foo[1] });
				str = foo[2];
			} else if (str.substr(0,1) == ".") {
				tokenlist.push({ token: TOKEN_DOT, value: '.' });
				str = str.substr(1);
			} else if (str.substr(0,1) == "[") {
				tokenlist.push({ token: TOKEN_LBRACKET, value: '[' });
				str = str.substr(1);
			} else if (str.substr(0,1) == "]") {
				tokenlist.push({ token: TOKEN_RBRACKET, value: ']' });
				str = str.substr(1);
			} else if (str.substr(0,1) == "(") {
				tokenlist.push({ token: TOKEN_LPAREN, value: '(' });
				str = str.substr(1);
			} else if (str.substr(0,1) == ")") {
				tokenlist.push({ token: TOKEN_RPAREN, value: ')' });
				str = str.substr(1);
			} else if (str.substr(0,1) == "=") {
				tokenlist.push({ token: TOKEN_EQ, value: '=' });
				str = str.substr(1);
			} else if (str.substr(0,1) == ",") {
				tokenlist.push({ token: TOKEN_COMMA, value: "," });
				str = str.substr(1);
			} else {
				foo = /^("[^"]*")(.*)$/.exec(str);
				if (foo != null) {
					tokenlist.push({ token: TOKEN_STR, value: foo[1] });
					str = foo[2];
				} else {
					tokenlist.push({ error: "unrecognized string", value: str });
				}
			}
		}
	}

	return {
		parse: function(str) {
			return tokenize(str);
		}
	};
	
})();