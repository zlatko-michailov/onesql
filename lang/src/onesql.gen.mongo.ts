import * as Semantic from "./onesql.semantic";

export interface Batch {
	readonly statements: ReadonlyArray<Statement>;
}

export interface Statement {
	readonly databaseName: string;
	readonly collectionName: string;
	readonly aggregationStages: ReadonlyArray<Object>;
}

export function genJavascript(semanticBatch: Semantic.Batch): string {
	let mongoBatch: Batch = genMongoBatch(semanticBatch);
	let javascriptBatch: string = genJavascriptBatch(mongoBatch);

	return javascriptBatch;
}

export function genJavascriptBatch(mongoBatch: Batch): string {
	// TODO:
	return "// TODO:";
}

export function genMongoBatch(semanticBatch: Semantic.Batch): Batch {
	assertNodeKind(semanticBatch, Semantic.NodeKind.Batch);

	let mongoBatch: MongoBatch = new MongoBatch();

	for (let i: number = 0; i < semanticBatch.statements.length; i++) {
		let mongoStatement: MongoStatement = genMongoStatement(semanticBatch.statements[i]);
		mergeMongoStatement(mongoStatement, mongoBatch);
	}

	return mongoBatch;
} 

function mergeMongoStatement(mongoStatement: MongoStatement, mongoBatch: MongoBatch): void {
	if (mongoBatch.statements === undefined) {
		mongoBatch.statements = [];
	}

	if (mongoBatch.statements.length === 0
		|| mongoBatch.statements[mongoBatch.statements.length - 1].collectionName !== undefined) {
		mongoBatch.statements.push(mongoStatement);
	}
	else {
		if (mongoStatement.databaseName !== undefined) {
			mongoBatch.statements[mongoBatch.statements.length - 1].databaseName = mongoStatement.databaseName;
		}

		if (mongoStatement.collectionName !== undefined) {
			mongoBatch.statements[mongoBatch.statements.length - 1].collectionName = mongoStatement.collectionName;
			mongoBatch.statements[mongoBatch.statements.length - 1].aggregationStages = mongoStatement.aggregationStages;
		}
	}
}

function genMongoStatement(semanticStatement: Semantic.Statement): MongoStatement {
	assertNodeKind(semanticStatement, Semantic.NodeKind.Statement);

	switch (semanticStatement.statementKind) {
		case Semantic.StatementKind.Use:
			let useStatement: Semantic.UseStatement = semanticStatement as Semantic.UseStatement;
			return { databaseName: useStatement.databaseName } as MongoStatement;

		case Semantic.StatementKind.Query:
			let queryStatement: Semantic.QueryStatement = semanticStatement as Semantic.QueryStatement;
			let aggregationStages: Array<Object> = [];
			
			for (let i: number = 0; i < queryStatement.clauses.length; i++) {
				let aggregationStage: Object = genMongoAggregationStage(queryStatement.clauses[i])
				aggregationStages.push(aggregationStage);
			}

			return { collectionName: queryStatement.sourceName, aggregationStages: aggregationStages } as MongoStatement;

		default:
			throw "//TODO:";
	}
}

function genMongoAggregationStage(semanticClause: Semantic.QueryClause): Object {
	assertNodeKind(semanticClause, Semantic.NodeKind.QueryClause);

	switch (semanticClause.queryClauseKind) {
		case Semantic.QueryClauseKind.Where:
			return { $match: true }; // TODO: expression

		default:
			throw "//TODO:";
	}
}

// -----------------------------------------------------------------------------
// Utilities

function assertNodeKind(node: Semantic.Node, nodeKind: Semantic.NodeKind): void {
	if (node.nodeKind != nodeKind) {
		throw "// TODO:";
	}
}

// -----------------------------------------------------------------------------
// Mongo implementations.

class MongoBatch implements Batch {
	statements: Array<MongoStatement>;
}

class MongoStatement implements Statement {
	databaseName: string;
	collectionName: string;
	aggregationStages: Array<Object>;
}

