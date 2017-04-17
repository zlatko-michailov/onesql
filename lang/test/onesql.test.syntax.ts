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
		nodeKind: Semantic.NodeKind.Batch,
		statements: []
	};

	let actualBatch: Semantic.Batch = OneSql.sqlToSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function use(): boolean {
	let sql: string = "USE _123abc;";
	let expectedBatch: Object = {
		nodeKind: Semantic.NodeKind.Batch,
		statements: [{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Use,
			databaseName: "_123abc"
		}]
	};

	let actualBatch: Semantic.Batch = OneSql.sqlToSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function from(): boolean {
	let sql: string = "FROM a_b_c_;";
	let expectedBatch: Object = {
		nodeKind: Semantic.NodeKind.Batch,
		statements: [{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a_b_c_",
			clauses: []
		}]
	};

	let actualBatch: Semantic.Batch = OneSql.sqlToSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function whereTypeMismatch(): boolean {
	let pass: boolean = true;
	
	pass = Test.throws(
		{ errorKind: Semantic.ErrorKind.SyntaxError, lineNumber: 2, expected: "Boolean expression", actual: "Number expression" },
		() => {
			let sql: string = 
				"FROM s1\n" +
				"WHERE 42;";
			OneSql.sqlToSemantic(sql);
		},
		Test.LogLevel.Info,
		"Literal")
		&& pass;

	pass = Test.throws(
		{ errorKind: Semantic.ErrorKind.SyntaxError, lineNumber: 2, expected: "Boolean expression", actual: "Number expression" },
		() => {
			let sql: string = 
				"FROM s1\n" +
				"WHERE NOT 42;";
			OneSql.sqlToSemantic(sql);
		},
		Test.LogLevel.Info,
		"Unary operation")
		&& pass;

	pass = Test.throws(
		{ errorKind: Semantic.ErrorKind.SyntaxError, lineNumber: 2, expected: "Boolean expression", actual: "Number expression" },
		() => {
			let sql: string = 
				"FROM s1\n" +
				"WHERE TRUE AND 42;";
			OneSql.sqlToSemantic(sql);
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
		nodeKind: Semantic.NodeKind.Batch,
		statements: [
		{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_1",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.Term,
					termKind: Semantic.TermKind.Literal,
					literal: true
				}
			}]
		},

		{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a_",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.Term,
					termKind: Semantic.TermKind.UnaryOperation,
					unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
					argument: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Any,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.Property,
						propertyName: "p1"
					}
				}
			}]
		},

		{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "a",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.Term,
					termKind: Semantic.TermKind.UnaryOperation,
					unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
					argument: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.UnaryOperation,
						unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
						argument: {
							nodeKind: Semantic.NodeKind.Expression,
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
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalOr,
					argument0: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
							argument: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p2"
							}
						}
					},
					argument1: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.UnaryOperation,
						unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
						argument: {
							nodeKind: Semantic.NodeKind.Expression,
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
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
					argument0: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalOr,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
							argument: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p2"
							}
						}
					},
					argument1: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.UnaryOperation,
						unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
						argument: {
							nodeKind: Semantic.NodeKind.Expression,
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

	let actualBatch: Semantic.Batch = OneSql.sqlToSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function whereParentheses(): boolean {
	let sql: string = "FROM _\n" +
					  "WHERE ( (( ((p1)) || !p2 )) && (!p3 || p4) );\n" +

					  "";

	let expectedBatch: Object = {
		nodeKind: Semantic.NodeKind.Batch,
		statements: [
		{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
					argument0: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalOr,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
							argument: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p2"
							}
						}
					},
					argument1: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalOr,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Boolean,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.UnaryOperation,
							unaryOperationSymbol: Semantic.UnaryOperationSymbol.LogicalNot,
							argument: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p3"
							}
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
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

	let actualBatch: Semantic.Batch = OneSql.sqlToSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function wherePriority(): boolean {
	let sql: string = "FROM _\n" +
					  "WHERE p1 == 1 && p2 = 2;\n" +

					  "FROM _\n" +
					  "WHERE p1 - 1 > p2 - 2 && p3 - p4 * p5 < p6 + p7 / p8;\n" +

					  "";

	let expectedBatch: Object = {
		nodeKind: Semantic.NodeKind.Batch,
		statements: [
		{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
					argument0: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Equal,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p1"
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Literal,
							literal: 1
						}
					},
					argument1: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Equal,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Any,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Property,
							propertyName: "p2"
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
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
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.LogicalAnd,
					argument0: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Greater,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Subtract,
							argument0: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p1"
							},
							argument1: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Literal,
								literal: 1
							}
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Subtract,
							argument0: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p2"
							},
							argument1: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Literal,
								literal: 2
							}
						}
					},
					argument1: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.Boolean,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.Less,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Subtract,
							argument0: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p3"
							},
							argument1: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.BinaryOperation,
								binaryOperationSymbol: Semantic.BinaryOperationSymbol.Multiply,
								argument0: {
									nodeKind: Semantic.NodeKind.Expression,
									resultType: Semantic.ValueType.Any,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Property,
									propertyName: "p4"
								},
								argument1: {
									nodeKind: Semantic.NodeKind.Expression,
									resultType: Semantic.ValueType.Any,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Property,
									propertyName: "p5"
								}
							}
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Add,
							argument0: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Any,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Property,
								propertyName: "p6"
							},
							argument1: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.BinaryOperation,
								binaryOperationSymbol: Semantic.BinaryOperationSymbol.Divide,
								argument0: {
									nodeKind: Semantic.NodeKind.Expression,
									resultType: Semantic.ValueType.Any,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Property,
									propertyName: "p7"
								},
								argument1: {
									nodeKind: Semantic.NodeKind.Expression,
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

	let actualBatch: Semantic.Batch = OneSql.sqlToSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}

export function whereFunctions(): boolean {
	let sql: string = "FROM _\n" +
					  "WHERE 'a' == substr('abc', 1 + 2, floor(4 - 3));\n" +

					  "FROM _\n" +
					  "WHERE DATETIME'2017-03-13T21:37:12.345' < now() - 100;\n" +

						"";

	let expectedBatch: Object = {
		nodeKind: Semantic.NodeKind.Batch,
		statements: [
		{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.Equal,
					argument0: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.String,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.Literal,
						literal: "a"
					},
					argument1: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.String,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.FunctionCall,
						functionSymbol: Semantic.FunctionSymbol.Substr,
						arguments: [
						{
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.String,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Literal,
							literal: "abc"
						},
						{
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.BinaryOperation,
							binaryOperationSymbol: Semantic.BinaryOperationSymbol.Add,
							argument0: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Literal,
								literal: 1
							},
							argument1: {
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.Term,
								termKind: Semantic.TermKind.Literal,
								literal: 2
							},
						},
						{
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.FunctionCall,
							functionSymbol: Semantic.FunctionSymbol.Floor,
							arguments: [
							{
								nodeKind: Semantic.NodeKind.Expression,
								resultType: Semantic.ValueType.Number,
								expressionKind: Semantic.ExpressionKind.BinaryOperation,
								binaryOperationSymbol: Semantic.BinaryOperationSymbol.Subtract,
								argument0: {
									nodeKind: Semantic.NodeKind.Expression,
									resultType: Semantic.ValueType.Number,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Literal,
									literal: 4
								},
								argument1: {
									nodeKind: Semantic.NodeKind.Expression,
									resultType: Semantic.ValueType.Number,
									expressionKind: Semantic.ExpressionKind.Term,
									termKind: Semantic.TermKind.Literal,
									literal: 3
								},
							}]
						}]
					},
				}
			}]
		},

		{
			nodeKind: Semantic.NodeKind.Statement,
			statementKind: Semantic.StatementKind.Query,
			sourceName: "_",
			clauses: [
			{
				nodeKind: Semantic.NodeKind.QueryClause,
				queryClauseKind: Semantic.QueryClauseKind.Where,
				condition: {
					nodeKind: Semantic.NodeKind.Expression,
					resultType: Semantic.ValueType.Boolean,
					expressionKind: Semantic.ExpressionKind.BinaryOperation,
					binaryOperationSymbol: Semantic.BinaryOperationSymbol.Less,
					argument0: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.DateTime,
						expressionKind: Semantic.ExpressionKind.Term,
						termKind: Semantic.TermKind.Literal,
						literal: new Date('2017-03-13T21:37:12.345')
					},
					argument1: {
						nodeKind: Semantic.NodeKind.Expression,
						resultType: Semantic.ValueType.DateTime,
						expressionKind: Semantic.ExpressionKind.BinaryOperation,
						binaryOperationSymbol: Semantic.BinaryOperationSymbol.DateTimeSubtract,
						argument0: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.DateTime,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.FunctionCall,
							functionSymbol: Semantic.FunctionSymbol.Now,
							arguments: []
						},
						argument1: {
							nodeKind: Semantic.NodeKind.Expression,
							resultType: Semantic.ValueType.Number,
							expressionKind: Semantic.ExpressionKind.Term,
							termKind: Semantic.TermKind.Literal,
							literal: 100
						},
					},
				}
			}]
		},

	]};

	let actualBatch: Semantic.Batch = OneSql.sqlToSemantic(sql);
	return Test.areEqual(expectedBatch, actualBatch, Test.LogLevel.Info, "batch");
}