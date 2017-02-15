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

export enum StatementKind {
	Use,
	Query,
	Insert,
	Update,
	Delete,
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

export enum QueryClauseKind {
	Where,
	Select,
	GroupBy,
	OrderBy,
}

export interface WhereClause extends QueryClause {
	readonly booleanExpression: Expression;
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

export enum ExpressionKind {
	Any = 0x0000,
	Boolean = 0x0100,
	Comparison = 0x0200,
	Bitwise = 0x0400,
	Arithmetic = 0x0800,
	String = 0x1000,
	Aggregation = 0x2000,
	DateTime = 0x4000,
}

export interface Expression extends Node {
	readonly expressionKind: ExpressionKind;
	readonly binaryOperation: BinaryOperation;
}

export interface BinaryOperation extends Node {
	readonly argument0: Term;
	readonly binaryOperationSymbol?: BinaryOperationSymbol;
	readonly argument1?: BinaryOperation;
}

export interface Term extends Node {
	readonly termKind: TermKind;
}

export enum TermKind {
	UnaryOperation,
	Literal,
	Property,
	FunctionCall,
	Expression,
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

export enum BinaryOperationSymbol {
	BooleanLow = ExpressionKind.Boolean,
	And,
	Or,
	BooleanHigh,

	ComparisonLow = ExpressionKind.Comparison,
	Equal,
	NotEqual,
	Less,
	LessOrEqual,
	Greater,
	GreaterOrEqual,
	ComparisonHigh,

	BitwiseLow = ExpressionKind.Bitwise,
	BitwiseAnd,
	BitwiseOr,
	BitwiseXor,
	ShiftLeft,
	ShiftRight,
	BitwiseHigh,

	ArithmeticLow = ExpressionKind.Arithmetic,
	Add,
	Subtract,
	Multiply,
	Divide,
	Modulo,
	ArithmeticHigh,

	StringLow = ExpressionKind.String,
	Concat,
	StringHigh,

	DateTimeLow = ExpressionKind.DateTime,
	DateTimeAdd,
	DateTimeSubtract,
	DateTimeDiff,
	DateTimeHigh,
}

export enum UnaryOperationSymbol {
	BooleanLow = ExpressionKind.Boolean,
	Not,
	BooleanHigh,

	BitwiseLow = ExpressionKind.Bitwise,
	BitNot,
	BitwiseHigh,

	ArithmeticLow = ExpressionKind.Arithmetic,
	Neg,
	ArithmeticHigh,
}

export enum FunctionSymbol {
	ArithmeticLow = ExpressionKind.Arithmetic,
	Abs,
	Ceil,
	Exp,
	Floor,
	Lg,
	Ln,
	Log,
	Power,

	IndexOf,
	Length,

	Day,
	Hours,
	Milliseconds,
	Minutes,
	Month,
	Seconds,
	Year,
	ArithmeticHigh,

	StringLow = ExpressionKind.String,
	Substr,
	ToLower,
	ToString,
	ToUpper,
	StringHigh,

	AggregationLow = ExpressionKind.Aggregation,
	Avg,
	Count,
	First,
	Last,
	Max,
	Min,
	Sum,
	AggregationHigh,

	DateTimeLow = ExpressionKind.DateTime,
	Now,
	Today,
	DateTimeHigh,
}

export interface FunctionSignature {
	readonly name: string;
	readonly argumentKinds: ReadonlyArray<ExpressionKind>;
	readonly resultKind: ExpressionKind;
}

export const functionSignatures: ReadonlyArray<FunctionSignature> = [
	// Result: Arithmetic
	{ name: "abs", argumentKinds: [ ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },
	{ name: "ceil", argumentKinds: [ ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },
	{ name: "exp", argumentKinds: [ ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },
	{ name: "floor", argumentKinds: [ ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },
	{ name: "lg", argumentKinds: [ ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },
	{ name: "ln", argumentKinds: [ ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },
	{ name: "log", argumentKinds: [ ExpressionKind.Arithmetic, ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },
	{ name: "power", argumentKinds: [ ExpressionKind.Arithmetic, ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },

	{ name: "indexOf", argumentKinds: [ ExpressionKind.String ], resultKind: ExpressionKind.Arithmetic },
	{ name: "length", argumentKinds: [ ExpressionKind.String ], resultKind: ExpressionKind.Arithmetic },

	{ name: "day", argumentKinds: [ ExpressionKind.DateTime ], resultKind: ExpressionKind.Arithmetic },
	{ name: "hours", argumentKinds: [ ExpressionKind.DateTime ], resultKind: ExpressionKind.Arithmetic },
	{ name: "milliseconds", argumentKinds: [ ExpressionKind.DateTime ], resultKind: ExpressionKind.Arithmetic },
	{ name: "minutes", argumentKinds: [ ExpressionKind.DateTime ], resultKind: ExpressionKind.Arithmetic },
	{ name: "month", argumentKinds: [ ExpressionKind.DateTime ], resultKind: ExpressionKind.Arithmetic },
	{ name: "seconds", argumentKinds: [ ExpressionKind.DateTime ], resultKind: ExpressionKind.Arithmetic },
	{ name: "year", argumentKinds: [ ExpressionKind.DateTime ], resultKind: ExpressionKind.Arithmetic },

	// Result: String
	{ name: "substr", argumentKinds: [ ExpressionKind.String, ExpressionKind.Arithmetic, ExpressionKind.Arithmetic ], resultKind: ExpressionKind.String },
	{ name: "toLower", argumentKinds: [ ExpressionKind.String ], resultKind: ExpressionKind.String },
	{ name: "toString", argumentKinds: [ ExpressionKind.Any ], resultKind: ExpressionKind.String },
	{ name: "toUpper", argumentKinds: [ ExpressionKind.String ], resultKind: ExpressionKind.String },

	// Result: Aggregation
	{ name: "avg", argumentKinds: [ ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },
	{ name: "count", argumentKinds: [ ExpressionKind.Any ], resultKind: ExpressionKind.Arithmetic },
	{ name: "first", argumentKinds: [ ExpressionKind.Any ], resultKind: ExpressionKind.Any },
	{ name: "last", argumentKinds: [ ExpressionKind.Any ], resultKind: ExpressionKind.Any },
	{ name: "max", argumentKinds: [ ExpressionKind.Any ], resultKind: ExpressionKind.Any },
	{ name: "min", argumentKinds: [ ExpressionKind.Any ], resultKind: ExpressionKind.Any },
	{ name: "sum", argumentKinds: [ ExpressionKind.Arithmetic ], resultKind: ExpressionKind.Arithmetic },

	// Result: DateTime
	{ name: "now", argumentKinds: [], resultKind: ExpressionKind.DateTime },
	{ name: "today", argumentKinds: [], resultKind: ExpressionKind.DateTime },
];
