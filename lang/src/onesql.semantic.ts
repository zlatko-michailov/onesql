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

export enum ToRefactorCategory {
	Any = 0x0000,
	Boolean = 0x0100,
	Comparison = 0x0200,
	Bitwise = 0x0400,
	Arithmetic = 0x0800,
	String = 0x1000,
	Aggregation = 0x2000,
	DateTime = 0x4000,
}

export enum ExpressionKind {
	Term,
	BinaryOperation,
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
	BooleanLow = ToRefactorCategory.Boolean,
	And,
	Or,
	BooleanHigh,

	ComparisonLow = ToRefactorCategory.Comparison,
	Equal,
	NotEqual,
	Less,
	LessOrEqual,
	Greater,
	GreaterOrEqual,
	ComparisonHigh,

	BitwiseLow = ToRefactorCategory.Bitwise,
	BitwiseAnd,
	BitwiseOr,
	BitwiseXor,
	BitwiseHigh,

	ArithmeticLow = ToRefactorCategory.Arithmetic,
	Add,
	Subtract,
	Multiply,
	Divide,
	Modulo,
	ArithmeticHigh,

	StringLow = ToRefactorCategory.String,
	Concat,
	StringHigh,

	DateTimeLow = ToRefactorCategory.DateTime,
	DateTimeAdd,
	DateTimeSubtract,
	DateTimeDiff,
	DateTimeHigh,
}

export enum UnaryOperationSymbol {
	BooleanLow = ToRefactorCategory.Boolean,
	Not,
	BooleanHigh,

	BitwiseLow = ToRefactorCategory.Bitwise,
	BitNot,
	BitwiseHigh,

	ArithmeticLow = ToRefactorCategory.Arithmetic,
	Neg,
	ArithmeticHigh,
}

export enum FunctionSymbol {
	ArithmeticLow = ToRefactorCategory.Arithmetic,
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

	StringLow = ToRefactorCategory.String,
	Substr,
	ToLower,
	ToString,
	ToUpper,
	StringHigh,

	AggregationLow = ToRefactorCategory.Aggregation,
	Avg,
	Count,
	First,
	Last,
	Max,
	Min,
	Sum,
	AggregationHigh,

	DateTimeLow = ToRefactorCategory.DateTime,
	Now,
	Today,
	DateTimeHigh,
}
