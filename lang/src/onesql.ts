import * as Semantic from "./onesql.semantic";
import * as Lex from "./onesql.lex";
import * as Syntax from "./onesql.syntax";
import * as Mongo from "../src/onesql.gen.mongo";

export function toSemantic(sql: string): Semantic.Batch {
	let tokens: ReadonlyArray<Lex.Token> = Lex.tokenize(sql, true);
	let semanticBatch: Semantic.Batch = Syntax.parse(tokens);

	return semanticBatch;
}

export function toMongo(sql: string): Mongo.Batch {
	let semanticBatch: Semantic.Batch = toSemantic(sql);
	let mongoBatch: Mongo.Batch = Mongo.genMongoBatch(semanticBatch);

	return mongoBatch;
}

export function toMongoJavascript(sql: string): string {
	let semanticBatch: Semantic.Batch = toSemantic(sql);
	let mongoJavascript: string = Mongo.genJavascript(semanticBatch);

	return mongoJavascript;
}
