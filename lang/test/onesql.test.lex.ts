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
	Test.log(Test.LogLevel.Info, "Not yet implemented.");
	return false;
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
