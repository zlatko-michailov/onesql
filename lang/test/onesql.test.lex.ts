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

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
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

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function literals(): boolean {
	let input: string = "tRue faLse 123 -123 +123 12.34 +12.34 -12.34 \"abc\" 'def' " +
						"datetime'1111-11-11' DATETIME\"2222-22-22T22:22:22\" daTetiMe'3333-33-33T33:33:33.333' " +
						"DateTime'4444-44-44T44:44:44Z' dAtetIme\"5555-55-55T55:55:55.555Z\"";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
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
	
	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function keywords(): boolean {
	let input: string = "uSe frOm WhEre sElECt gROUp bY orDEr aS aSc dESc";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "uSe", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "frOm", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "WhEre", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "sElECt", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "gROUp", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "bY", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "orDEr", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "aS", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "aSc", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "dESc", lineNumber: 1},
	];

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function punctuation(): boolean {
	let input: string = "(( )) ,, ;;";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.OpeningParenthesis, lexeme: "(", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.OpeningParenthesis, lexeme: "(", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.ClosingParenthesis, lexeme: ")", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.ClosingParenthesis, lexeme: ")", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.ItemSeparator, lexeme: ",", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.ItemSeparator, lexeme: ",", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.EndOfStatement, lexeme: ";", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.EndOfStatement, lexeme: ";", lineNumber: 1},
	];

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function operations(): boolean {
	let input: string = "* / % + - ~ & | ^ == = < <= > >= != <> nOt aNd && oR ||";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "*", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "/", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "%", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "+", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "-", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.UnaryOperation, lexeme: "~", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "&", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "|", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "^", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "==", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "=", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "<", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "<=", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: ">", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: ">=", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "!=", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "<>", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.UnaryOperation, lexeme: "nOt", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "aNd", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "&&", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "oR", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "||", lineNumber: 1},
	];

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function identifiers(): boolean {
	let input: string = "a bB c1 _ __ _A _b2 c_23D_e_";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "a", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "bB", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "c1", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "_", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "__", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "_A", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "_b2", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "c_23D_e_", lineNumber: 1},
	];

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}

export function functions(): boolean {
	let input: string = "aBs ceIl eXp flOOr lG Ln LOG PowER " +
						"inDExoF lENgth " +
						"dAY hoUrS miLLisECOnds MinUtes mONTh Seconds yEar " +
						"sUBstr tOloWEr tostRIng toupPer " +
						"aVg cOUnt fiRsT lAsT MAX mIn suM " +
						"noW toDay";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "aBs", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "ceIl", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "eXp", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "flOOr", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "lG", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "Ln", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "LOG", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "PowER", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "inDExoF", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "lENgth", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "dAY", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "hoUrS", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "miLLisECOnds", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "MinUtes", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "mONTh", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "Seconds", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "yEar", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "sUBstr", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "tOloWEr", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "tostRIng", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "toupPer", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "aVg", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "cOUnt", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "fiRsT", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "lAsT", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "MAX", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "mIn", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "suM", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},

		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "noW", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 1},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "toDay", lineNumber: 1},
	];

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}
export function batch(): boolean {
	let input: string = "// Select database\n" +
						"USE demo;\n" +
						"\n" +
						"/* Query */\n" +
						"FROM Demography\n" +
						"WHERE Population > 1000000 AND SomeDate != DATETIME'2017-02-04T22:10:30'\n" +
						"GROUP BY State\n" +
						"SELECT State, COUNT(City) AS BigCityCount\n" +
						"ORDER BY BigCityCount DESC;\n";
	let expectedTokens: ReadonlyArray<Lex.Token> = [
		{ tokenKind: Lex.TokenKind.LineComment, lexeme: "// Select database\n", lineNumber: 2},

		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "USE", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "demo", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.EndOfStatement, lexeme: ";", lineNumber: 2},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n\n", lineNumber: 4},

		{ tokenKind: Lex.TokenKind.BlockComment, lexeme: "/* Query */", lineNumber: 4},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 5},

		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "FROM", lineNumber: 5},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 5},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "Demography", lineNumber: 5},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 6},

		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "WHERE", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "Population", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: ">", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.NumberLiteral, lexeme: "1000000", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "AND", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "SomeDate", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BinaryOperation, lexeme: "!=", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.DateTimeLiteral, lexeme: "DATETIME'2017-02-04T22:10:30'", lineNumber: 6},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 7},

		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "GROUP", lineNumber: 7},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 7},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "BY", lineNumber: 7},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 7},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "State", lineNumber: 7},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 8},

		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "SELECT", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "State", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.ItemSeparator, lexeme: ",", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "COUNT", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.OpeningParenthesis, lexeme: "(", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "City", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.ClosingParenthesis, lexeme: ")", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "AS", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "BigCityCount", lineNumber: 8},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 9},

		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "ORDER", lineNumber: 9},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 9},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "BY", lineNumber: 9},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 9},
		{ tokenKind: Lex.TokenKind.Identifier, lexeme: "BigCityCount", lineNumber: 9},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: " ", lineNumber: 9},
		{ tokenKind: Lex.TokenKind.Keyword, lexeme: "DESC", lineNumber: 9},
		{ tokenKind: Lex.TokenKind.EndOfStatement, lexeme: ";", lineNumber: 9},
		{ tokenKind: Lex.TokenKind.BlankSpace, lexeme: "\n", lineNumber: 10},
	];

	let actualTokens: ReadonlyArray<Lex.Token> = Lex.tokenize(input, false);
	return Test.areEqualArrays(expectedTokens, actualTokens, Test.LogLevel.Info, "tokens");
}
