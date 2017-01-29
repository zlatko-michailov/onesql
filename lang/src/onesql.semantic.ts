namespace onesql.semantic {
	export interface Node {
		accept(visitor: Visitor) : any;
	}

	export interface Visitor {
		visit(node: Node) : any;
	}

	export interface Batch extends Node {
		readonly statements: Array<Statement>;
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
		readonly clauses: Array<QueryClause>;
	}

	export interface QueryClause extends Node {
		readonly queryClauseKind: QueryClauseKind;
	}

	export enum QueryClauseKind {
		Where,
		Select,
		GroupBy,
		OrderBy
	}

	export interface WhereClause extends QueryClause {
		readonly booleanExpression: Expression;
	}

	export interface SelectClause extends QueryClause {
		readonly projections: Array<Projection>;
	}

	export interface Projection {
		readonly expression: Expression;
		readonly asName: string;
	}

	export interface GroupByClause extends QueryClause {
		readonly groupings: Array<Grouping>;
		readonly aggregations: Array<Aggregation>;
	}

	export interface Aggregation {
		readonly aggregationExpression: Expression;
		readonly asName: string;
	}

	export interface Grouping {
		readonly propertyName: string;
	}

	export interface OrderByClause extends QueryClause {
		readonly orderings: Array<Ordering>;
	}

	export interface Ordering {
		readonly propertyName: string;
		readonly ascending: boolean;
	}

	export enum ExpressionKind {
		Boolean = 0x0100,
		Comparison = 0x0200,
		Bitwise = 0x0400,
		Arithmetic = 0x0800,
		String = 0x1000,
		Aggregation = 0x2000,
		DateTime = 0x4000,
	}

	export interface Expression {
		readonly expressionKind: ExpressionKind;
		readonly binaryOperation: BinaryOperation;
	}

	export interface BinaryOperation {
		readonly argument0: UnaryOperation;
		readonly binaryOperationSymbol?: BinaryOperationSymbol;
		readonly argument1?: BinaryOperation;
	}

	export interface UnaryOperation {
		readonly unaryOperationSymbol?: UnaryOperationSymbol;
		readonly argument: Term;
	}

	export interface Term {
		readonly termKind: TermKind;
	}

	export enum TermKind {
		Literal,
		FunctionCall,
		Expression,
	}

	export interface LiteralTerm extends Term {
		readonly literal: any;
	}

	export interface FunctionCallTerm extends Term {
		readonly functionSymbol: FunctionSymbol;
		readonly arguments: Array<Expression>;
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
		BitAnd,
		BitOr,
		BitXor,
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
		Power,
		Exp,
		Floor,
		Ceil,
		Ln,
		Log,
		Lg,

		Len,
		IndexOf,

		Year,
		Month,
		Day,
		Hours,
		Minutes,
		Seconds,
		Milliseconds,
		ArithmeticHigh,

		StringLow = ExpressionKind.String,
		Substr,
		ToLower,
		ToUpper,
		ToString,
		StringHigh,

		AggregationLow = ExpressionKind.Aggregation,
		Count,
		Sum,
		Avg,
		Min,
		Max,
		First,
		Last,
		AggregationHigh,

		DateTimeLow = ExpressionKind.DateTime,
		Now,
		DateTimeHigh,
	}
}
