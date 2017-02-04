import * as Lex from "../src/onesql.lex";
import * as Test from "./onesql.test";

export function blankSpace(): boolean {
	let input: string = "\na2 b2\tc2\na3\n\na5\n";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "a2", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "b2", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\t", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "c2", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 3},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "a3", lineNumber: 3},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n\n", lineNumber: 5},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "a5", lineNumber: 5},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 6},
	];

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function comments(): boolean {
	let input: string = "/*a1\na2\na3*/b3//c3\na4";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.BlockComment, lexeme: "/*a1\na2\na3*/", lineNumber: 3},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "b3", lineNumber: 3},
		{ tokenKind: Lex.TokenKind.LineComment, lexeme: "//c3\n", lineNumber: 4},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "a4", lineNumber: 4},
	];

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function literals(): boolean {
	let input: string = "true false TRUE FALSE tRue faLse 123 -123 +123 12.34 +12.34 -12.34 \"abc\" 'def' " +
						"datetime'1111-11-11' DATETIME\"2222-22-22T22:22:22\" daTetiMe'3333-33-33T33:33:33.333' " +
						"DateTime'4444-44-44T44:44:44Z' dAtetIme\"5555-55-55T55:55:55.555Z\"";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.BooleanLiteral, lexeme: "true", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BooleanLiteral, lexeme: "false", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BooleanLiteral, lexeme: "TRUE", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BooleanLiteral, lexeme: "FALSE", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BooleanLiteral, lexeme: "tRue", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BooleanLiteral, lexeme: "faLse", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.NumberLiteral, lexeme: "123", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.NumberLiteral, lexeme: "-123", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.NumberLiteral, lexeme: "+123", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.NumberLiteral, lexeme: "12.34", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.NumberLiteral, lexeme: "+12.34", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.NumberLiteral, lexeme: "-12.34", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.StringLiteral, lexeme: "\"abc\"", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.StringLiteral, lexeme: "'def'", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.DateTimeLiteral, lexeme: "datetime'1111-11-11'", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.DateTimeLiteral, lexeme: "DATETIME\"2222-22-22T22:22:22\"", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.DateTimeLiteral, lexeme: "daTetiMe'3333-33-33T33:33:33.333'", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.DateTimeLiteral, lexeme: "DateTime'4444-44-44T44:44:44Z'", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.DateTimeLiteral, lexeme: "dAtetIme\"5555-55-55T55:55:55.555Z\"", lineNumber: 1},
	];
	
	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function keywords(): boolean {
	Test.log(Test.LogLevel.Info, "Not yet implemented.");
	return false;
}

export function punctuation(): boolean {
	Test.log(Test.LogLevel.Info, "Not yet implemented.");
	return false;
}

export function operations(): boolean {
	Test.log(Test.LogLevel.Info, "Not yet implemented.");
	return false;
}

export function identifiers(): boolean {
	Test.log(Test.LogLevel.Info, "Not yet implemented.");
	return false;
}

export function batch(): boolean {
	Test.log(Test.LogLevel.Info, "Not yet implemented.");
	return false;
}
