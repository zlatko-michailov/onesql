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
		Boolean = 1000,
		Comparison = 2000,
		Bitwise = 3000,
		Arithmetic = 4000,
		String = 5000,
		Aggregation = 6000,
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
		Sub,
		Mul,
		Div,
		ArithmeticHigh,

		StringLow = ExpressionKind.String,
		Concat,
		StringHigh,
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
		ArithmeticHigh,

		StringLow = ExpressionKind.String,
		StringHigh,

		AggregationLow = ExpressionKind.Aggregation,
		AggregationHigh,
	}
}
