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
			sourceName: "a_b_c_",
			clauses: []
		}]
	};

	let actualBatch: Semantic.Batch = OneSql.toSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function whereTypeMismatch(): boolean {
	let pass: boolean = true;
	
	pass = Test.throws(
		{ lineNumber: 2, expected: "Boolean expression", actual: "Number expression" },
		() => {
			let sql: string = 
				"FROM s1\n" +
				"WHERE 42;";
			OneSql.toSemantic(sql);
		},
		Test.LogLevel.Info,
		"Literal")
		&& pass;

	pass = Test.throws(
		{ lineNumber: 2, expected: "Boolean expression", actual: "Number expression" },
		() => {
			let sql: string = 
				"FROM s1\n" +
				"WHERE NOT 42;";
			OneSql.toSemantic(sql);
		},
		Test.LogLevel.Info,
		"Unary operation")
		&& pass;

	pass = Test.throws(
		{ lineNumber: 2, expected: "Boolean expression", actual: "Number expression" },
		() => {
			let sql: string = 
				"FROM s1\n" +
				"WHERE TRUE AND 42;";
			OneSql.toSemantic(sql);
		},
		Test.LogLevel.Info,
		"Binary operation")
		&& pass;

	return pass;
}

export function whereBasic(): boolean {
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

					  "";

	let expectedBatch: Object = {
		statements: [
		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_1",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.Term,
					termKind: Semantic.TermKind.Literal,
					literal: true
				}
			}]
		},

		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a_",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.Term,
					termKind: Semantic.TermKind.UnaryOperation,
					unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
					argument: {
						resultType: Semantic.ValueType.Any,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.Property,
						propertyName: "p1"
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
				condition: {
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.Term,
					termKind: Semantic.TermKind.UnaryOperation,
					unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
					argument: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.UnaryOperation,
						unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
						argument: {
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Literal,
							literal: true
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
				condition: {
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalOr,
					argument0: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
						argument0: {
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						},
						argument1: {
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
							argument: {
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p2"
							}
						}
					},
					argument1: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.UnaryOperation,
						unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
						argument: {
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p3"
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
				condition: {
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
					argument0: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalOr,
						argument0: {
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						},
						argument1: {
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
							argument: {
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p2"
							}
						}
					},
					argument1: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.UnaryOperation,
						unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
						argument: {
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p3"
						}
					}
				}
			}]
		},

	]};

	let actualBatch: Semantic.Batch = OneSql.toSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function whereParentheses(): boolean {
	let sql: string = "FROM _\n" +
					  "WHERE ( (( ((p1)) || !p2 )) && (!p3 || p4) );\n" +

					  "";

	let expectedBatch: Object = {
		statements: [
		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
					argument0: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalOr,
						argument0: {
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						},
						argument1: {
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
							argument: {
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p2"
							}
						}
					},
					argument1: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalOr,
						argument0: {
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
							argument: {
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p3"
							}
						},
						argument1: {
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p4"
						}
					}
				}
			}]
		},

	]};

	let actualBatch: Semantic.Batch = OneSql.toSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function wherePriority(): boolean {
	let sql: string = "FROM _\n" +
					  "WHERE p1 == 1 && p2 = 2;\n" +

					  "FROM _\n" +
					  "WHERE p1 - 1 > p2 - 2 && p3 - p4 * p5 < p6 + p7 / p8;\n" +

					  "";

	let expectedBatch: Object = {
		statements: [
		{
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
					argument0: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Equal,
						argument0: {
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						},
						argument1: {
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Literal,
							literal: 1
						}
					},
					argument1: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Equal,
						argument0: {
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p2"
						},
						argument1: {
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Literal,
							literal: 2
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
				condition: {
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
					argument0: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Greater,
						argument0: {
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Subtract,
							argument0: {
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p1"
							},
							argument1: {
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Literal,
								literal: 1
							}
						},
						argument1: {
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Subtract,
							argument0: {
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p2"
							},
							argument1: {
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Literal,
								literal: 2
							}
						}
					},
					argument1: {
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Less,
						argument0: {
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Subtract,
							argument0: {
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p3"
							},
							argument1: {
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.BinaryOperation,
								binaryOperationSymbol: Semantic.BinaryOperationSymbol.Multiply,
								argument0: {
									resultType: Semantic.ValueType.Any,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Property,
									propertyName: "p4"
								},
								argument1: {
									resultType: Semantic.ValueType.Any,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Property,
									propertyName: "p5"
								}
							}
						},
						argument1: {
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Add,
							argument0: {
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p6"
							},
							argument1: {
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.BinaryOperation,
								binaryOperationSymbol: Semantic.BinaryOperationSymbol.Divide,
								argument0: {
									resultType: Semantic.ValueType.Any,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Property,
									propertyName: "p7"
								},
								argument1: {
									resultType: Semantic.ValueType.Any,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Property,
									propertyName: "p8"
								}
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

