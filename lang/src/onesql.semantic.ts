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

export enum ValueType {
	Any,
	Boolean,
	Number,
	String,
	DateTime,
	Array = 0x100,
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
	readonly binaryOperand: BinaryOperand;
}

export enum BinaryOperandKind {
	Term,
	BinaryOperation,
}

export interface BinaryOperand extends Node {
	readonly binaryOperandKind: BinaryOperandKind;
}

export interface BinaryOperation extends BinaryOperand {
	readonly binaryOperationSymbol: BinaryOperationSymbol;
	readonly argument0: BinaryOperand;
	readonly argument1: BinaryOperand;
}

export interface Term extends BinaryOperand {
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
