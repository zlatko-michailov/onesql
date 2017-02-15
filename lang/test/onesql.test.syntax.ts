import * as OneSql from "../src/onesql";
import * as Semantic from "../src/onesql.semantic";
import * as Lex from "../src/onesql.lex";
import * as Syntax from "../src/onesql.syntax";
import * as Test from "./onesql.test";

export function empty(): boolean {
	let sql: string = ";; ;\n" +
					  " /* ignore */ ;\n" +
					  "\t\t// ignore\n" +
					  ";";
	let expectedBatch: Object = {
		statements: []
	};

	let actualBatch: Semantic.Batch = OneSql.toSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function use(): boolean {
	let sql: string = "USE _123abc;";
	let expectedBatch: Object = {
		statements: [{
			statementKind: Semantic.StatementKind.Use,
			databaseName: "_123abc"
		}]
	};

	let actualBatch: Semantic.Batch = OneSql.toSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function from(): boolean {
	let sql: string = "FROM a_b_c_;";
	let expectedBatch: Object = {
		statements: [{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a_b_c_"
		}]
	};

	let actualBatch: Semantic.Batch = OneSql.toSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function where(): boolean {
	let sql: string = "FROM _1\n" +
					  "WHERE TRUE;\n\n" +

					  "FROM a_\n" +
					  "WHERE NOT FALSE;\n" +

					  "FROM a\n" +
					  "WHERE NOT NOT TRUE;\n" //+

//					  "FROM b\n" +
//					  "WHERE prop1 == 5;\n" +

//					  "FROM cc\n" +
//					  "WHERE NOT prop1 = prop2;\n" +
					  
//					  "FROM Ddd\n" +
//					  "WHERE p1 != p2\n" +
//					  "    AND p3 <> p4\n" +
//					  "    OR NOT p4 < p5\n" +
//					  "    AND (p6 > p7 OR p8 <= p9 AND NOT p10 >= p11);"
					  ;


	let expectedBatch: Object = {
		statements: [
		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_1",
			clasues: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				booleanExpression: {
					expressionKind: Semantic.ExpressionKind.Boolean,
					binaryOperation: {
						argument0: {
							termKind: Semantic.TermKind.Literal,
							literal: true
			}}}}]
		},

		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a_",
			clasues: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				booleanExpression: {
					expressionKind: Semantic.ExpressionKind.Boolean,
					binaryOperation: {
						argument0: {
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
							argument: {
								termKind: Semantic.TermKind.Literal,
								literal: false
			}}}}}]
		},

		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a",
			clasues: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				booleanExpression: {
					expressionKind: Semantic.ExpressionKind.Boolean,
					binaryOperation: {
						argument0: {
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
							argument: {
								termKind: Semantic.TermKind.UnaryOperation,
								unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
								argument: {
									termKind: Semantic.TermKind.Literal,
									literal: true
			}}}}}}]
		}
	]};

	let actualBatch: Semantic.Batch = OneSql.toSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}
