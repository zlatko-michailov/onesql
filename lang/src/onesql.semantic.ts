export interface Node {
	accept(visitor: Visitor) : any;
}

export interface Visitor {
	visit(node: Node) : any;
}

export interface Batch extends Node {
	readonly statements: ReadonlyArray<Statement>;
}

export interface Statement extends Node {
	readonly statementKind: StatementKind;
}

export const enum StatementKind {
	Use = 1,
	Query = 2,
	Insert = 3,
	Update = 4,
	Delete = 5,
}

export interface UseStatement extends Statement {
	readonly databaseName: string;
}

export interface QueryStatement extends Statement {
	readonly sourceName: string;
	readonly clauses: ReadonlyArray<QueryClause>;
}

export interface QueryClause extends Node {
	readonly queryClauseKind: QueryClauseKind;
}

export const enum QueryClauseKind {
	Where = 1,
	Select = 2,
	GroupBy = 3,
	OrderBy = 4,
}

export interface WhereClause extends QueryClause {
	readonly condition: Expression;
}

export interface SelectClause extends QueryClause {
	readonly projections: ReadonlyArray<Projection>;
}

export interface Projection extends Node {
	readonly expression: Expression;
	readonly asName: string;
}

export interface GroupByClause extends QueryClause {
	readonly groupings: ReadonlyArray<Grouping>;
	readonly aggregations: ReadonlyArray<Aggregation>;
}

export interface Grouping extends Node {
	readonly propertyName: string;
}

export interface Aggregation extends Node {
	readonly aggregationExpression: Expression;
	readonly asName: string;
}

export interface OrderByClause extends QueryClause {
	readonly orderings: ReadonlyArray<Ordering>;
}

export interface Ordering extends Node {
	readonly propertyName: string;
	readonly ascending: boolean;
}

export const enum ValueType {
	Any = 0,
	Boolean = 1,
	Number = 2,
	String = 3,
	DateTime = 4,
}

export const enum ExpressionKind {
	Term = 1,
	BinaryOperation = 2,
}

export interface Expression extends Node {
	readonly resultType: ValueType;
	readonly expressionKind: ExpressionKind;
}

export interface BinaryOperation extends Expression {
	readonly binaryOperationSymbol: BinaryOperationSymbol;
	readonly argument0: Expression;
	readonly argument1: Expression;
}

export interface Term extends Expression {
	readonly termKind: TermKind;
}

export const enum TermKind {
	UnaryOperation = 1,
	Literal = 2,
	Property = 3,
	FunctionCall = 4,
	Expression = 5,
}

export interface UnaryOperationTerm extends Term {
	readonly unaryOperationSymbol: UnaryOperationSymbol;
	readonly argument: Term;
}

export interface LiteralTerm extends Term {
	readonly literal: any;
}

export interface PropertyTerm extends Term {
	readonly propertyName: string;
}
export interface FunctionCallTerm extends Term {
	readonly functionSymbol: FunctionSymbol;
	readonly arguments: ReadonlyArray<Expression>;
}

export interface ExpressionTerm extends Term {
	readonly expression: Expression;
}

export const enum UnaryOperationSymbol {
	LogicalNot = 1,

	BitwiseNot = 2,

	NoOp = 3,
	Negate = 4,
}

export const enum BinaryOperationSymbol {
	LogicalOr = 1,
	LogicalAnd = 2,

	Equal = 3,
	NotEqual = 4,
	Less = 5,
	LessOrEqual = 6,
	Greater = 7,
	GreaterOrEqual = 8,

	BitwiseOr = 9,
	BitwiseAnd = 10,
	BitwiseXor = 11,

	Add = 12,
	Subtract = 13,
	Multiply = 14,
	Divide = 15,
	Modulo = 16,

	Concat = 17,

	DateTimeAdd = 18,
	DateTimeSubtract = 19,
	DateTimeDiff = 20,
}

export const enum FunctionSymbol {
	Abs = 1,
	Ceil = 2,
	Exp = 3,
	Floor = 4,
	Lg = 5,
	Ln = 6,
	Log = 7,
	Power = 8,

	IndexOf = 9,
	Length = 10,

	Day = 11,
	Hours = 12,
	Milliseconds = 13,
	Minutes = 14,
	Month = 15,
	Seconds = 16,
	Year = 17,

	Substr = 18,
	ToLower = 19,
	ToString = 20,
	ToUpper = 21,

	Avg = 22,
	Count = 23,
	First = 24,
	Last = 25,
	Max = 26,
	Min = 27,
	Sum = 28,

	Now = 29,
	Today = 30,
}
