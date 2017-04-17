import * as Semantic from "./onesql.semantic";
import * as Lex from "./onesql.lex";
import * as Syntax from "./onesql.syntax";
import * as Mongo from "../src/onesql.gen.mongo";

export function sqlToSemantic(sql: string): Semantic.Batch {
	let tokens: ReadonlyArray<Lex.Token> = Lex.tokenize(sql, true);
	let semanticBatch: Semantic.Batch = Syntax.parse(tokens);

	return semanticBatch;
}

export function semanticToMongo(semanticBatch: Semantic.Batch): Mongo.Batch {
	let mongoBatch: Mongo.Batch = Mongo.genMongoBatch(semanticBatch);

	return mongoBatch;
}

export function semanticToMongoJavascript(semanticBatch: Semantic.Batch): string {
	let mongoJavascript: string = Mongo.genJavascript(semanticBatch);

	return mongoJavascript;
}

export function sqlToMongo(sql: string): Mongo.Batch {
	let semanticBatch: Semantic.Batch = sqlToSemantic(sql);
	let mongoBatch: Mongo.Batch = semanticToMongo(semanticBatch);

	return mongoBatch;
}

export function sqlToMongoJavascript(sql: string): string {
	let semanticBatch: Semantic.Batch = sqlToSemantic(sql);
	let mongoJavascript: string = semanticToMongoJavascript(semanticBatch);

	return mongoJavascript;
}
