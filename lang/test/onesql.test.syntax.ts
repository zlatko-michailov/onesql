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

export function whereBoolean(): boolean {
	let sql: string = "FROM _1\n" +
					  "WHERE TRUE;\n\n" +

					  "FROM a_\n" +
					  "WHERE NOT p1;\n" +

					  "FROM a\n" +
					  "WHERE NOT!TRUE;\n" +

					  "FROM _\n" +
					  "WHERE p1 AND NOT p2 OR NOT p3;\n" +

					  "FROM _\n" +
					  "WHERE p1 OR NOT p2 AND NOT p3;\n" +

//					  "FROM _\n" +
//					  "WHERE (p1 || !p2) && !p3;\n" +

//					  "FROM b\n" +
//					  "WHERE prop1 == 5;\n" +

//					  "FROM cc\n" +
//					  "WHERE NOT prop1 = prop2;\n" +
					  
//					  "FROM Ddd\n" +
//					  "WHERE p1 != p2\n" +
//					  "    AND p3 <> p4\n" +
//					  "    OR NOT p4 < p5\n" +
//					  "    AND (p6 > p7 OR p8 <= p9 AND NOT p10 >= p11);"
					  "";


	let expectedBatch: Object = {
		statements: [
		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_1",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				booleanExpression: {
					expressionKind: Semantic.ExpressionKind.Boolean,
					binaryOperand: {
						binaryOperandKind: Semantic.BinaryOperandKind.Term,
						termKind: Semantic.TermKind.Literal,
						literal: true
					}
				}
			}]
		},

		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a_",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				booleanExpression: {
					expressionKind: Semantic.ExpressionKind.Boolean,
					binaryOperand: {
						binaryOperandKind: Semantic.BinaryOperandKind.Term,
						termKind: Semantic.TermKind.UnaryOperation,
						unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
						argument: {
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						}
					}
				}
			}]
		},

		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				booleanExpression: {
					expressionKind: Semantic.ExpressionKind.Boolean,
					binaryOperand: {
						binaryOperandKind: Semantic.BinaryOperandKind.Term,
						termKind: Semantic.TermKind.UnaryOperation,
						unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
						argument: {
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
							argument: {
								termKind: Semantic.TermKind.Literal,
								literal: true
							}
						}
					}
				}
			}]
		},

		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				booleanExpression: {
					expressionKind: Semantic.ExpressionKind.Boolean,
					binaryOperand: {
						binaryOperandKind: Semantic.BinaryOperandKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Or,
						argument0: {
							binaryOperandKind: Semantic.BinaryOperandKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.And,
							argument0: {
								binaryOperandKind: Semantic.BinaryOperandKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p1"
							},
							argument1: {
								binaryOperandKind: Semantic.BinaryOperandKind.Term,
								termKind: Semantic.TermKind.UnaryOperation,
								unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
								argument: {
									termKind: Semantic.TermKind.Property,
									propertyName: "p2"
								}
							}
						},
						argument1: {
							binaryOperandKind: Semantic.BinaryOperandKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
							argument: {
								termKind: Semantic.TermKind.Property,
								propertyName: "p3"
							}
						}
					}
				}
			}]
		},

		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				booleanExpression: {
					expressionKind: Semantic.ExpressionKind.Boolean,
					binaryOperand: {
						binaryOperandKind: Semantic.BinaryOperandKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.And,
						argument0: {
							binaryOperandKind: Semantic.BinaryOperandKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Or,
							argument0: {
								binaryOperandKind: Semantic.BinaryOperandKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p1"
							},
							argument1: {
								binaryOperandKind: Semantic.BinaryOperandKind.Term,
								termKind: Semantic.TermKind.UnaryOperation,
								unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
								argument: {
									termKind: Semantic.TermKind.Property,
									propertyName: "p2"
								}
							}
						},
						argument1: {
							binaryOperandKind: Semantic.BinaryOperandKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.Not,
							argument: {
								termKind: Semantic.TermKind.Property,
								propertyName: "p3"
							}
						}
					}
				}
			}]
		},

	]};

	let actualBatch: Semantic.Batch = OneSql.toSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}
