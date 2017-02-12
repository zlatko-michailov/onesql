import * as Semantic from "./onesql.semantic";
import * as Lex from "./onesql.lex";
import * as Syntax from "./onesql.syntax";

export function toSemantic(sql: string): Semantic.Batch {
	let tokens: ReadonlyArray<Lex.Token> = Lex.tokenize(sql);
	return Syntax.parse(tokens);
}

