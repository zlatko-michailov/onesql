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
			let whereClause: Semantic.WhereClause = semanticClause as Semantic.WhereClause;
			let mongoCondition: any = genMongoExpression(whereClause.condition);
			return { $match: mongoCondition };

		default:
			throw "//TODO:";
	}
}

function genMongoExpression(semanticExpression: Semantic.Expression): any {
	switch (semanticExpression.expressionKind) {
		case Semantic.ExpressionKind.BinaryOperation:
			return genMongoBinaryOperation(semanticExpression as Semantic.BinaryOperation);

		case Semantic.ExpressionKind.Term:
			return genMongoTerm(semanticExpression as Semantic.Term);

		default:
			throw "//TODO:";
	}
}

function genMongoBinaryOperation(semanticBinaryOperation: Semantic.BinaryOperation): any {
	assertExpressionKind(semanticBinaryOperation, Semantic.ExpressionKind.BinaryOperation);

	let mongoBinaryOperationSymbol: string = getOperationMapping(binaryOperationMappings, semanticBinaryOperation.binaryOperationSymbol);
	let mongoArgument0: any = genMongoExpression(semanticBinaryOperation.argument0);
	let mongoArgument1: any = genMongoExpression(semanticBinaryOperation.argument1);

	let mongoBinaryOperation: any = { };
	mongoBinaryOperation[mongoBinaryOperationSymbol] = [ mongoArgument0, mongoArgument1 ];
	return mongoBinaryOperation;
}

function genMongoTerm(semanticTerm: Semantic.Term): any {
	assertExpressionKind(semanticTerm, Semantic.ExpressionKind.Term);

	switch (semanticTerm.termKind) {
		case Semantic.TermKind.UnaryOperation:
			return genMongoUnaryOperation(semanticTerm as Semantic.UnaryOperationTerm);

		case Semantic.TermKind.Literal:
			return genMongoLiteral(semanticTerm as Semantic.LiteralTerm);

		case Semantic.TermKind.Property:
			return genMongoProperty(semanticTerm as Semantic.PropertyTerm);

		case Semantic.TermKind.FunctionCall:
			return true; //TODO:

		default:
			throw "//TODO:";
	}
}

function genMongoUnaryOperation(semanticUnaryOperation: Semantic.UnaryOperationTerm): any {
	assertTermKind(semanticUnaryOperation, Semantic.TermKind.UnaryOperation);

	let mongoUnaryOperationSymbol: string = getOperationMapping(unaryOperationMappings, semanticUnaryOperation.unaryOperationSymbol);
	let mongoArgument: any = genMongoExpression(semanticUnaryOperation.argument);

	let mongoUnaryOperation: any = { };
	mongoUnaryOperation[mongoUnaryOperationSymbol] = [ mongoArgument ];
	return mongoUnaryOperation;
}

function genMongoLiteral(semanticLiteral: Semantic.LiteralTerm): any {
	assertTermKind(semanticLiteral, Semantic.TermKind.Literal);

	let mongoLiteral: any = { $literal: semanticLiteral.literal };
	return mongoLiteral;
}

function genMongoProperty(semanticProperty: Semantic.PropertyTerm): any {
	assertTermKind(semanticProperty, Semantic.TermKind.Property);

	let mongoProperty: string = "$" + semanticProperty.propertyName;
	return mongoProperty;
}

// -----------------------------------------------------------------------------
// Utilities

function assertNodeKind(node: Semantic.Node, nodeKind: Semantic.NodeKind): void {
	if (node.nodeKind !== nodeKind) {
		throw "// TODO:";
	}
}

function assertExpressionKind(expression: Semantic.Expression, expressionKind: Semantic.ExpressionKind): void {
	if (expression.expressionKind !== expressionKind) {
		throw "// TODO:";
	}
}

function assertTermKind(term: Semantic.Term, termKind: Semantic.TermKind): void {
	if (term.termKind !== termKind) {
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

// -----------------------------------------------------------------------------
// Symbol tables.

interface OperationMapping<SemanticSymbol> {
	readonly semanticSymbol: SemanticSymbol;
	readonly mongoSymbol: string;
}

function lookupOperationMapping<SemanticSymbol>(mappings: ReadonlyArray<OperationMapping<SemanticSymbol>>, semanticSymbol: SemanticSymbol): string {
	for (let i: number = 0; i < mappings.length; i++) {
		if (mappings[i].semanticSymbol === semanticSymbol) {
			return mappings[i].mongoSymbol;
		}
	}

	return undefined;
}

function getOperationMapping<SemanticSymbol>(mappings: ReadonlyArray<OperationMapping<SemanticSymbol>>, semanticSymbol: SemanticSymbol): string {
	let mongoSmbol: string = lookupOperationMapping(mappings, semanticSymbol);
	if (mongoSmbol !== undefined) {
		return mongoSmbol;
	}

	throw "// TODO:";
}

const unaryOperationMappings: ReadonlyArray<OperationMapping<Semantic.UnaryOperationSymbol>> = [
	{ semanticSymbol: Semantic.UnaryOperationSymbol.LogicalNot, mongoSymbol: "$not" },

	// Bitwise operations are not supported by Mongo.
	
	// Negation and noop operations are not supported by Mongo.
];

const binaryOperationMappings: ReadonlyArray<OperationMapping<Semantic.BinaryOperationSymbol>> = [
	{ semanticSymbol: Semantic.BinaryOperationSymbol.LogicalOr, mongoSymbol: "$or" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.LogicalAnd, mongoSymbol: "$and" },

	{ semanticSymbol: Semantic.BinaryOperationSymbol.Equal, mongoSymbol: "$eq" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.NotEqual, mongoSymbol: "$ne" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.Less, mongoSymbol: "$lt" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.LessOrEqual, mongoSymbol: "$lte" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.Greater, mongoSymbol: "$gt" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.GreaterOrEqual, mongoSymbol: "$gte" },

	// Bitwise operations are not supported by Mongo.

	{ semanticSymbol: Semantic.BinaryOperationSymbol.Add, mongoSymbol: "$add" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.Subtract, mongoSymbol: "$subtract" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.Multiply, mongoSymbol: "$multiply" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.Divide, mongoSymbol: "$divide" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.Modulo, mongoSymbol: "$mod" },

	{ semanticSymbol: Semantic.BinaryOperationSymbol.Concat, mongoSymbol: "$concat" },
	
	{ semanticSymbol: Semantic.BinaryOperationSymbol.DateTimeAdd, mongoSymbol: "$add" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.DateTimeSubtract, mongoSymbol: "$subtract" },
	{ semanticSymbol: Semantic.BinaryOperationSymbol.DateTimeDiff, mongoSymbol: "$subtract" },
];

const functionMappings: ReadonlyArray<OperationMapping<Semantic.FunctionSymbol>> = [
	// TODO:
];
