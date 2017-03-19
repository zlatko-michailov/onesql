import * as Lex from "./onesql.lex";
import * as Semantic from "./onesql.semantic";

export interface SyntaxError {
	readonly lineNumber: number;
	readonly expected: string;
	readonly actual: string;
}

interface SyntaxState {
	inputIndex: number;
	node: Semantic.Node;
}

// Parsing principles:
//    1. Leave inputIndex AFTER the last token of the symbol, i.e. stay one token ahead.

export function parse(input: ReadonlyArray<Lex.Token>): Semantic.Batch {
	let state: SyntaxState = parseBatch(input, 0);

	return state.node as Semantic.Batch;
}

function parseBatch(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	let batch: Batch = { statements: [] } as Batch;

	// Parse statements.
	while (inputIndex < input.length) {
		// ;
		if (input[inputIndex].tokenKind == Lex.TokenKind.EndOfStatement) {
			inputIndex = moveInputIndex(input, inputIndex, "statement");
			continue;
		}

		let state: SyntaxState = parseStatement(input, inputIndex);
		batch.statements.push(state.node as Semantic.Statement);
		inputIndex = state.inputIndex;
	}

	return { inputIndex: inputIndex, node: batch };
}

function parseStatement(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	if (input[inputIndex].tokenKind == Lex.TokenKind.Keyword
		&& input[inputIndex].lexeme.toUpperCase() == "USE") {
		return parseUseStatement(input, inputIndex); 
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.Keyword
		&& input[inputIndex].lexeme.toUpperCase() == "FROM") {
		return parseQueryStatement(input, inputIndex); 
	}
	
	throw { lineNumber: input[inputIndex].lineNumber, expected: "statement", actual: input[inputIndex].lexeme };
}

function parseUseStatement(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	let useStatement: UseStatement = new UseStatement();

	// USE
	if (input[inputIndex].tokenKind != Lex.TokenKind.Keyword
		|| input[inputIndex].lexeme.toUpperCase() != "USE") {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "USE", actual: input[inputIndex].lexeme };
	}
	
	// databaseName
	inputIndex = moveInputIndex(input, inputIndex, "identifier");
	if (input[inputIndex].tokenKind != Lex.TokenKind.Identifier) {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "identifier", actual: input[inputIndex].lexeme };
	}
	useStatement.databaseName = input[inputIndex].lexeme;

	// ;
	inputIndex = moveInputIndex(input, inputIndex, ";");
	if (input[inputIndex].tokenKind != Lex.TokenKind.EndOfStatement) {
		throw { lineNumber: input[inputIndex].lineNumber, expected: ";", actual: input[inputIndex].lexeme };
	}

	return { inputIndex: inputIndex, node: useStatement };
}

function parseQueryStatement(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	let queryStatement: QueryStatement = new QueryStatement();

	// FROM
	if (input[inputIndex].tokenKind != Lex.TokenKind.Keyword
		|| input[inputIndex].lexeme.toUpperCase() != "FROM") {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "FROM", actual: input[inputIndex].lexeme };
	}
	
	// sourceName
	inputIndex = moveInputIndex(input, inputIndex, "identifier");
	if (input[inputIndex].tokenKind != Lex.TokenKind.Identifier) {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "identifier", actual: input[inputIndex].lexeme };
	}
	queryStatement.sourceName = input[inputIndex].lexeme;
	inputIndex = moveInputIndex(input, inputIndex, ";");

	// Clauses
	while (inputIndex < input.length) {
		// ;
		if (input[inputIndex].tokenKind == Lex.TokenKind.EndOfStatement) {
			break;
		}

		// Clause
		let state: SyntaxState = parseQueryClause(input, inputIndex);
		queryStatement.clauses.push(state.node as Semantic.QueryClause);
		inputIndex = state.inputIndex;
	}
	
	if (inputIndex < input.length
		&& input[inputIndex].tokenKind == Lex.TokenKind.EndOfStatement) {
		return { inputIndex: inputIndex, node: queryStatement };
	}
	throw { lineNumber: input[input.length - 1].lineNumber, expected: ";", actual: "" };
}

function parseQueryClause(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	if (input[inputIndex].tokenKind == Lex.TokenKind.Keyword
		&& input[inputIndex].lexeme.toUpperCase() == "WHERE") {
		return parseWhereClause(input, inputIndex); 
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.Keyword
		&& input[inputIndex].lexeme.toUpperCase() == "SELECT") {
		return parseSelectClause(input, inputIndex); 
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.Keyword
		&& input[inputIndex].lexeme.toUpperCase() == "GROUP") {
		return parseGroupByClause(input, inputIndex); 
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.Keyword
		&& input[inputIndex].lexeme.toUpperCase() == "ORDER") {
		return parseOrderByClause(input, inputIndex); 
	}
	
	throw { lineNumber: input[inputIndex].lineNumber, expected: "WHERE, SELECT, GROUP, or ORDER", actual: input[inputIndex].lexeme };
}

function parseWhereClause(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	let whereClause: WhereClause = new WhereClause();

	// Condition
	inputIndex = moveInputIndex(input, inputIndex, "condition");
	let state: SyntaxState = parseExpression(input, inputIndex);
	whereClause.condition = state.node as Semantic.Expression;
	assertTypeMatch(Semantic.ValueType.Boolean, whereClause.condition.resultType, input[state.inputIndex]);

	return { inputIndex: state.inputIndex, node: whereClause };
}

function parseExpression(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	// Term
	let state: SyntaxState = parseTerm(input, inputIndex);
	let expression: Semantic.Expression = state.node as Semantic.Expression;

	// Binary operation
	return parseBinaryOperation(input, state.inputIndex, OperationPriority.None, expression);
}

function parseBinaryOperation(input: ReadonlyArray<Lex.Token>, inputIndex: number, minPriority: OperationPriority, argument0: Semantic.Expression): SyntaxState {
	let expression: Semantic.Expression = argument0;

	// Binary operations
	let signature: OperationSignature = peekOperationSignature(binaryOperationSignatures, input[inputIndex], expression.resultType);
	while (signature !== undefined && signature.priority > minPriority) {
		// Binary operation
		let binaryOperation: BinaryOperation = new BinaryOperation(signature);
		binaryOperation.argument0 = expression;
		assertTypeMatch(signature.argumentTypes[0], binaryOperation.argument0.resultType, input[inputIndex]);

		// Term
		inputIndex = moveInputIndex(input, inputIndex, "Expression term");
		let state: SyntaxState = parseTerm(input, inputIndex);

		// Peek at the next binary operation.
		let signatureNext: OperationSignature = peekOperationSignature(binaryOperationSignatures, input[state.inputIndex], (state.node as Semantic.Expression).resultType);
		if (signatureNext !== undefined && signatureNext.priority > signature.priority) {
			// The next operation is of higher priority.
			let stateNext: SyntaxState = parseBinaryOperation(input, state.inputIndex, signature.priority, state.node as Semantic.Expression);
			binaryOperation.argument1 = stateNext.node as Semantic.Expression;
			inputIndex = stateNext.inputIndex;
		}
		else {
			// The next operation is non-existent or of same or lower priority.
			binaryOperation.argument1 = state.node as Semantic.Expression;
			inputIndex = state.inputIndex;
		}
		
		assertTypeMatch(signature.argumentTypes[1], binaryOperation.argument1.resultType, input[inputIndex]);
		expression = binaryOperation;

		signature = peekOperationSignature(binaryOperationSignatures, input[inputIndex], binaryOperation.resultType);
	}

	return { inputIndex: inputIndex, node: expression };
}

function parseTerm(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	let state: SyntaxState = undefined;

	if (input[inputIndex].tokenKind == Lex.TokenKind.UnaryOperation) {
		return parseUnaryOperation(input, inputIndex);
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.BooleanLiteral
			|| input[inputIndex].tokenKind == Lex.TokenKind.NumberLiteral
			|| input[inputIndex].tokenKind == Lex.TokenKind.StringLiteral
			|| input[inputIndex].tokenKind == Lex.TokenKind.DateTimeLiteral) {
		return parseLiteral(input, inputIndex);
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.Identifier) {
		let signature: OperationSignature = peekOperationSignature(functionSignatures, input[inputIndex], Semantic.ValueType.Any);
		if (signature !== undefined) {
			return parseFunctionCall(input, inputIndex, signature);
		}
		else {
			return parseProperty(input, inputIndex);
		}
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.OpeningParenthesis) {
		inputIndex = moveInputIndex(input, inputIndex, ")");
		let state: SyntaxState = parseExpression(input, inputIndex);
		inputIndex = state.inputIndex;

		// )
		if (input[inputIndex].tokenKind !== Lex.TokenKind.ClosingParenthesis) {
			throw { lineNumber: input[inputIndex].lineNumber, expected: ")", actual: input[inputIndex].lexeme };
		}
		inputIndex = moveInputIndex(input, inputIndex, ";");

		return { inputIndex: inputIndex, node: state.node as Semantic.Expression };
	}

	throw { lineNumber: input[inputIndex].lineNumber, expected: "Expression term", actual: input[inputIndex].lexeme };
}

function parseUnaryOperation(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	// Unary operation
	let signature: OperationSignature = getOperationSignature(unaryOperationSignatures, input[inputIndex], Semantic.ValueType.Any);
	let unaryOperation: UnaryOperationTerm = new UnaryOperationTerm(signature);

	// Term
	inputIndex = moveInputIndex(input, inputIndex, "Expression term");
	let state: SyntaxState = parseTerm(input, inputIndex);
	unaryOperation.argument = state.node as Semantic.Term;
	assertTypeMatch(signature.argumentTypes[0], unaryOperation.argument.resultType, input[state.inputIndex]);

	return { inputIndex: state.inputIndex, node: unaryOperation };
}

function parseFunctionCall(input: ReadonlyArray<Lex.Token>, inputIndex: number, signature: OperationSignature): SyntaxState {
	let functionCall: FunctionCallTerm = new FunctionCallTerm(signature);
	
	// (
	inputIndex = moveInputIndex(input, inputIndex, "(");
	if (input[inputIndex].tokenKind !== Lex.TokenKind.OpeningParenthesis) {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "(", actual: input[inputIndex].lexeme };
	}

	// Arguments
	inputIndex = moveInputIndex(input, inputIndex, ")");
	for (let i: number = 0; i < signature.argumentTypes.length; i++) {
		// Argument
		let state: SyntaxState = parseExpression(input, inputIndex);
		inputIndex = state.inputIndex;
		functionCall.arguments[i] = state.node as Semantic.Expression;
		assertTypeMatch(signature.argumentTypes[i], functionCall.arguments[i].resultType, input[inputIndex])

		// ,
		if (i < signature.argumentTypes.length - 1) {
			if (input[inputIndex].tokenKind !== Lex.TokenKind.ItemSeparator) {
				throw { lineNumber: input[inputIndex].lineNumber, expected: ",", actual: input[inputIndex].lexeme };
			}

			inputIndex = moveInputIndex(input, inputIndex, "argument");
		}
	}

	// )
	if (input[inputIndex].tokenKind !== Lex.TokenKind.ClosingParenthesis) {
		throw { lineNumber: input[inputIndex].lineNumber, expected: ")", actual: input[inputIndex].lexeme };
	}
	inputIndex = moveInputIndex(input, inputIndex, ")");

	return { inputIndex: inputIndex, node: functionCall };
}

function parseLiteral(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	// Literal
	let literal: LiteralTerm = new LiteralTerm(input[inputIndex]);
	inputIndex = moveInputIndex(input, inputIndex, ";");

	return { inputIndex: inputIndex, node: literal };
}

function parseProperty(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	// Property
	let property: PropertyTerm = new PropertyTerm(input[inputIndex]);
	inputIndex = moveInputIndex(input, inputIndex, ";");

	return { inputIndex: inputIndex, node: property };
}

function parseSelectClause(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	return { inputIndex: inputIndex, node: undefined };
}

function parseGroupByClause(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	return { inputIndex: inputIndex, node: undefined };
}

function parseOrderByClause(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	return { inputIndex: inputIndex, node: undefined };
}

// -----------------------------------------------------------------------------
// Utilities

function moveInputIndex(input: ReadonlyArray<Lex.Token>, inputIndex: number, expected: string): number {
	if (++inputIndex > input.length) {
		throw { lineNumber: input[input.length - 1].lineNumber, expected: expected, actual: input[input.length - 1] };
	}
	
	return inputIndex;
}

function assertTypeMatch(resultTypeExpected: Semantic.ValueType, resultTypeActual: Semantic.ValueType, token: Lex.Token) {
	if (!areTypesMatching(resultTypeExpected, resultTypeActual)) {
		throw { 
			lineNumber: token.lineNumber,
			expected: stringifyValueType(resultTypeExpected) + " expression",
			actual: stringifyValueType(resultTypeActual) + " expression"
		};
	}
}

function areTypesMatching(resultType1: Semantic.ValueType, resultType2: Semantic.ValueType): boolean {
	return resultType1 == Semantic.ValueType.Any
		|| resultType2 == Semantic.ValueType.Any
		|| resultType1 == resultType2;
}

function stringifyValueType(resultType: Semantic.ValueType): string {
	switch (resultType) {
		case Semantic.ValueType.Any:
			return "Any";

		case Semantic.ValueType.Boolean:
			return "Boolean";

		case Semantic.ValueType.Number:
			return "Number";

		case Semantic.ValueType.String:
			return "String";

		case Semantic.ValueType.DateTime:
			return "DateTime";
	}
}

// -----------------------------------------------------------------------------
// Semantic contract implementations.

class Node implements Semantic.Node {
	accept(visitor: Semantic.Visitor) : any {
	}
}

class Batch extends Node implements Semantic.Batch {
	statements: Array<Semantic.Statement>;

	accept(visitor: Semantic.Visitor): Array<any> {
		let result: Array<any> = [];

		if (this.statements) {
			for (let i: number = 0; i < this.statements.length; i++) {
				result.push(visitor.visit(this.statements[i]));
			}
		}

		return result;
	}
}

class UseStatement extends Node implements Semantic.UseStatement {
	statementKind: Semantic.StatementKind = Semantic.StatementKind.Use;
	databaseName: string;
}

class QueryStatement extends Node implements Semantic.QueryStatement {
	statementKind: Semantic.StatementKind = Semantic.StatementKind.Query;
	sourceName: string;
	clauses: Array<Semantic.QueryClause> = [];
}

class WhereClause extends Node implements Semantic.WhereClause {
	queryClauseKind: Semantic.QueryClauseKind = Semantic.QueryClauseKind.Where;
	condition: Semantic.Expression;
}

class Expression extends Node implements Semantic.Expression {
	resultType: Semantic.ValueType;
	expressionKind: Semantic.ExpressionKind;
}

class BinaryOperation extends Expression implements Semantic.BinaryOperation {
	constructor (signature: OperationSignature) {
		super();

		this.binaryOperationSymbol = signature.symbol;
		this.resultType = signature.resultType;
	}

	expressionKind = Semantic.ExpressionKind.BinaryOperation;
	binaryOperationSymbol: Semantic.BinaryOperationSymbol;
	argument0: Semantic.Expression;
	argument1: Semantic.Expression;
}

class UnaryOperationTerm extends Expression implements Semantic.UnaryOperationTerm {
	constructor (signature: OperationSignature) {
		super();

		this.unaryOperationSymbol = signature.symbol;
		this.resultType = signature.resultType;
	}

	expressionKind = Semantic.ExpressionKind.Term;
	termKind: Semantic.TermKind = Semantic.TermKind.UnaryOperation;
	unaryOperationSymbol: Semantic.UnaryOperationSymbol;
	argument: Semantic.Term;
}

class LiteralTerm extends Expression implements Semantic.LiteralTerm {
	constructor (token: Lex.Token) {
		super();

		switch (token.tokenKind) {
			case Lex.TokenKind.BooleanLiteral:
				this.literal = token.lexeme.toUpperCase() == "TRUE";
				this.resultType = Semantic.ValueType.Boolean;
				break;

			case Lex.TokenKind.NumberLiteral:
				this.literal = parseFloat(token.lexeme);
				this.resultType = Semantic.ValueType.Number;
				break;

			case Lex.TokenKind.StringLiteral:
				this.literal = token.lexeme.substring(1, token.lexeme.length - 1);
				this.resultType = Semantic.ValueType.String;
				break;

			case Lex.TokenKind.DateTimeLiteral:
				this.literal = new Date(token.lexeme.substring(9, token.lexeme.length - 1));
				this.resultType = Semantic.ValueType.DateTime;
				break;
		}
	}

	expressionKind = Semantic.ExpressionKind.Term;
	termKind: Semantic.TermKind = Semantic.TermKind.Literal;
	literal: any;
}

class PropertyTerm extends Expression implements Semantic.PropertyTerm {
	constructor (token: Lex.Token) {
		super();

		this.propertyName = token.lexeme;
		this.resultType = Semantic.ValueType.Any;
	}

	expressionKind = Semantic.ExpressionKind.Term;
	termKind: Semantic.TermKind = Semantic.TermKind.Property;
	propertyName: string;
}

class FunctionCallTerm extends Expression implements Semantic.FunctionCallTerm {
	constructor (signature: OperationSignature) {
		super();

		this.functionSymbol = signature.symbol;
		this.resultType = signature.resultType;
		this.arguments = new Array<Expression>();
	}

	expressionKind = Semantic.ExpressionKind.Term;
	termKind: Semantic.TermKind = Semantic.TermKind.FunctionCall;
	functionSymbol: Semantic.FunctionSymbol;
	arguments: Array<Expression>;
}

// -----------------------------------------------------------------------------
// Symbol tables.

function getOperationSignature(signatures: ReadonlyArray<OperationSignature>, token: Lex.Token, argument0Type: Semantic.ValueType): OperationSignature {
	let signature: OperationSignature = peekOperationSignature(signatures, token, argument0Type);
	if (signature !== undefined) {
		return signature;
	}

	throw { lineNumber: token.lineNumber, expected: stringifyValueType(argument0Type) + " operation", actual: token.lexeme };
}

function peekOperationSignature(signatures: ReadonlyArray<OperationSignature>, token: Lex.Token, argument0Type: Semantic.ValueType): OperationSignature {
	let index: number = lookupOperationSignature(signatures, token.lexeme.toUpperCase(), argument0Type);
	if (index !== undefined) {
		return signatures[index];
	}

	return undefined;
}

function lookupOperationSignature(signatures: ReadonlyArray<OperationSignature>, name: string, argument0Type: Semantic.ValueType): number {
	for (let i = 0; i < signatures.length; i++) {
		if (argument0Type == Semantic.ValueType.Any 
			|| (signatures[i].argumentTypes.length > 0 
				&& (signatures[i].argumentTypes[0] === Semantic.ValueType.Any
					|| signatures[i].argumentTypes[0] === argument0Type))) {
			for (let n = 0; n < signatures[i].names.length; n++) {
				if (name === signatures[i].names[n]) {
					return i;
				}
			}
		}
	}

	return undefined;
}

const enum OperationPriority {
	None,
	Logical,
	Comparison,
	String,
	DateTime,
	Bitwise,
	Addition,
	Multiplication,
}

interface OperationSignature {
	readonly names: ReadonlyArray<string>;
	readonly symbol: number;
	readonly priority?: OperationPriority;
	readonly argumentTypes: ReadonlyArray<Semantic.ValueType>;
	readonly resultType: Semantic.ValueType;
}

const unaryOperationSignatures: ReadonlyArray<OperationSignature> = [
	{
		names: ["NOT", "!"],
		symbol: Semantic.UnaryOperationSymbol.LogicalNot,
		argumentTypes: [ Semantic.ValueType.Boolean ],
		resultType: Semantic.ValueType.Boolean
	},

	{
		names: ["~"],
		symbol: Semantic.UnaryOperationSymbol.BitwiseNot,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},

	{
		names: ["+"],
		symbol: Semantic.UnaryOperationSymbol.NoOp,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["-"],
		symbol: Semantic.UnaryOperationSymbol.Negate,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
];

const binaryOperationSignatures: ReadonlyArray<OperationSignature> = [
	{
		names: ["OR", "||"],
		symbol: Semantic.BinaryOperationSymbol.LogicalOr,
		priority: OperationPriority.Logical,
		argumentTypes: [ Semantic.ValueType.Boolean, Semantic.ValueType.Boolean ],
		resultType: Semantic.ValueType.Boolean
	},
	{
		names: ["AND", "&&"],
		symbol: Semantic.BinaryOperationSymbol.LogicalAnd,
		priority: OperationPriority.Logical,
		argumentTypes: [ Semantic.ValueType.Boolean, Semantic.ValueType.Boolean ],
		resultType: Semantic.ValueType.Boolean
	},

	{
		names: ["==", "="],
		symbol: Semantic.BinaryOperationSymbol.Equal,
		priority: OperationPriority.Comparison,
		argumentTypes: [ Semantic.ValueType.Any, Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Boolean
	},
	{
		names: ["!=", "<>"],
		symbol: Semantic.BinaryOperationSymbol.NotEqual,
		priority: OperationPriority.Comparison,
		argumentTypes: [ Semantic.ValueType.Any, Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Boolean
	},
	{
		names: ["<"],
		symbol: Semantic.BinaryOperationSymbol.Less,
		priority: OperationPriority.Comparison,
		argumentTypes: [ Semantic.ValueType.Any, Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Boolean
	},
	{
		names: ["<="],
		symbol: Semantic.BinaryOperationSymbol.LessOrEqual,
		priority: OperationPriority.Comparison,
		argumentTypes: [ Semantic.ValueType.Any, Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Boolean
	},
	{
		names: [">"],
		symbol: Semantic.BinaryOperationSymbol.Greater,
		priority: OperationPriority.Comparison,
		argumentTypes: [ Semantic.ValueType.Any, Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Boolean
	},
	{
		names: [">="],
		symbol: Semantic.BinaryOperationSymbol.GreaterOrEqual,
		priority: OperationPriority.Comparison,
		argumentTypes: [ Semantic.ValueType.Any, Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Boolean
	},

	{
		names: ["|"],
		symbol: Semantic.BinaryOperationSymbol.BitwiseOr,
		priority: OperationPriority.Bitwise,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["&"],
		symbol: Semantic.BinaryOperationSymbol.BitwiseAnd,
		priority: OperationPriority.Bitwise,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["^"],
		symbol: Semantic.BinaryOperationSymbol.BitwiseXor,
		priority: OperationPriority.Bitwise,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},

	{
		names: ["+"],
		symbol: Semantic.BinaryOperationSymbol.Add,
		priority: OperationPriority.Addition,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["-"],
		symbol: Semantic.BinaryOperationSymbol.Subtract,
		priority: OperationPriority.Addition,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["*"],
		symbol: Semantic.BinaryOperationSymbol.Multiply,
		priority: OperationPriority.Multiplication,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["/"],
		symbol: Semantic.BinaryOperationSymbol.Divide,
		priority: OperationPriority.Multiplication,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["%"],
		symbol: Semantic.BinaryOperationSymbol.Modulo,
		priority: OperationPriority.Multiplication,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},

	{
		names: ["+"],
		symbol: Semantic.BinaryOperationSymbol.Concat,
		priority: OperationPriority.String,
		argumentTypes: [ Semantic.ValueType.String, Semantic.ValueType.String ],
		resultType: Semantic.ValueType.String
	},

	{
		names: ["+"],
		symbol: Semantic.BinaryOperationSymbol.DateTimeAdd,
		priority: OperationPriority.DateTime,
		argumentTypes: [ Semantic.ValueType.DateTime, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.DateTime
	},
	{
		names: ["-"],
		symbol: Semantic.BinaryOperationSymbol.DateTimeSubtract,
		priority: OperationPriority.DateTime,
		argumentTypes: [ Semantic.ValueType.DateTime, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.DateTime
	},
	{
		names: ["-"],
		symbol: Semantic.BinaryOperationSymbol.DateTimeDiff,
		priority: OperationPriority.DateTime,
		argumentTypes: [ Semantic.ValueType.DateTime, Semantic.ValueType.DateTime ],
		resultType: Semantic.ValueType.Number
	},
];

const functionSignatures: ReadonlyArray<OperationSignature> = [
	// Result: Number
	{
		names: ["ABS"],
		symbol: Semantic.FunctionSymbol.Abs,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["CEIL"],
		symbol: Semantic.FunctionSymbol.Ceil,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["EXP"],
		symbol: Semantic.FunctionSymbol.Exp,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["FLOOR"],
		symbol: Semantic.FunctionSymbol.Floor,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["LG"],
		symbol: Semantic.FunctionSymbol.Lg,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["LN"],
		symbol: Semantic.FunctionSymbol.Ln,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["LOG"],
		symbol: Semantic.FunctionSymbol.Log,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["POWER"],
		symbol: Semantic.FunctionSymbol.Power,
		argumentTypes: [ Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},

	{
		names: ["INDEXOF"],
		symbol: Semantic.FunctionSymbol.IndexOf,
		argumentTypes: [ Semantic.ValueType.String, Semantic.ValueType.String ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["LENGTH"],
		symbol: Semantic.FunctionSymbol.Length,
		argumentTypes: [ Semantic.ValueType.String ],
		resultType: Semantic.ValueType.Number
	},

	{
		names: ["DAY"],
		symbol: Semantic.FunctionSymbol.Day,
		argumentTypes: [ Semantic.ValueType.DateTime ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["HOURS"],
		symbol: Semantic.FunctionSymbol.Hours,
		argumentTypes: [ Semantic.ValueType.DateTime ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["MILLISECONDS"],
		symbol: Semantic.FunctionSymbol.Milliseconds,
		argumentTypes: [ Semantic.ValueType.DateTime ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["MINUTES"],
		symbol: Semantic.FunctionSymbol.Minutes,
		argumentTypes: [ Semantic.ValueType.DateTime ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["MONTH"],
		symbol: Semantic.FunctionSymbol.Month,
		argumentTypes: [ Semantic.ValueType.DateTime ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["SECONDS"],
		symbol: Semantic.FunctionSymbol.Seconds,
		argumentTypes: [ Semantic.ValueType.DateTime ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["YEAR"],
		symbol: Semantic.FunctionSymbol.Year,
		argumentTypes: [ Semantic.ValueType.DateTime ],
		resultType: Semantic.ValueType.Number
	},

	// Result: String
	{
		names: ["SUBSTR"],
		symbol: Semantic.FunctionSymbol.Substr,
		argumentTypes: [ Semantic.ValueType.String, Semantic.ValueType.Number, Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.String
	},
	{
		names: ["TOLOWER"],
		symbol: Semantic.FunctionSymbol.ToLower,
		argumentTypes: [ Semantic.ValueType.String ],
		resultType: Semantic.ValueType.String
	},
	{
		names: ["TOSTRING"],
		symbol: Semantic.FunctionSymbol.ToString,
		argumentTypes: [ Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.String
	},
	{
		names: ["TOUPPER"],
		symbol: Semantic.FunctionSymbol.ToUpper,
		argumentTypes: [ Semantic.ValueType.String ],
		resultType: Semantic.ValueType.String
	},

	// Result: Aggregation
	{
		names: ["AVG"],
		symbol: Semantic.FunctionSymbol.Avg,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["COUNT"],
		symbol: Semantic.FunctionSymbol.Count,
		argumentTypes: [ Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Number
	},
	{
		names: ["FIRST"],
		symbol: Semantic.FunctionSymbol.First,
		argumentTypes: [ Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Any
	},
	{
		names: ["LAST"],
		symbol: Semantic.FunctionSymbol.Last,
		argumentTypes: [ Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Any
	},
	{
		names: ["MAX"],
		symbol: Semantic.FunctionSymbol.Max,
		argumentTypes: [ Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Any
	},
	{
		names: ["MIN"],
		symbol: Semantic.FunctionSymbol.Min,
		argumentTypes: [ Semantic.ValueType.Any ],
		resultType: Semantic.ValueType.Any
	},
	{
		names: ["SUM"],
		symbol: Semantic.FunctionSymbol.Sum,
		argumentTypes: [ Semantic.ValueType.Number ],
		resultType: Semantic.ValueType.Number
	},

	// Result: DateTime
	{
		names: ["NOW"],
		symbol: Semantic.FunctionSymbol.Now,
		argumentTypes: [],
		resultType: Semantic.ValueType.DateTime
	},
	{
		names: ["TODAY"],
		symbol: Semantic.FunctionSymbol.Today,
		argumentTypes: [],
		resultType: Semantic.ValueType.DateTime
	},
];
