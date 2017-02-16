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

export function parse(input: ReadonlyArray<Lex.Token>): Semantic.Batch {
	let state: SyntaxState = parseBatch(input, 0);

	return state.node as Semantic.Batch;
}

function parseBatch(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	let batch: Batch = { statements: [] } as Batch;

	// Parse statements.
	while (inputIndex < input.length) {
		inputIndex = skipIgnorableTokens(input, inputIndex);
		if (inputIndex >= input.length) {
			break;
		}

		if (input[inputIndex].tokenKind == Lex.TokenKind.EndOfStatement) {
			++inputIndex;
			continue;
		}

		let state: SyntaxState = parseStatement(input, inputIndex);
		
		batch.statements.push(state.node as Semantic.Statement);
		inputIndex = state.inputIndex + 1;
	}

	// If there are tokens left, something is wrong.
	if (inputIndex < input.length) {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "USE or FROM", actual: input[inputIndex].lexeme };
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
	
	throw { lineNumber: input[inputIndex].lineNumber, expected: "USE or FROM", actual: input[inputIndex].lexeme };
}

function parseUseStatement(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	let useStatement: UseStatement = new UseStatement();

	// USE
	if (input[inputIndex].tokenKind != Lex.TokenKind.Keyword
		|| input[inputIndex].lexeme.toUpperCase() != "USE") {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "USE", actual: input[inputIndex].lexeme };
	}
	
	// databaseName
	inputIndex = skipToNextToken(input, ++inputIndex, "identifier");
	if (input[inputIndex].tokenKind != Lex.TokenKind.Identifier) {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "identifier", actual: input[inputIndex].lexeme };
	}
	useStatement.databaseName = input[inputIndex].lexeme;

	// ;
	inputIndex = skipToNextToken(input, ++inputIndex, ";");
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
	inputIndex = skipToNextToken(input, ++inputIndex, "identifier");
	if (input[inputIndex].tokenKind != Lex.TokenKind.Identifier) {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "identifier", actual: input[inputIndex].lexeme };
	}
	queryStatement.sourceName = input[inputIndex].lexeme;

	// Clauses
	while (inputIndex < input.length) {
		// ;
		inputIndex = skipToNextToken(input, ++inputIndex, ";");
		if (input[inputIndex].tokenKind == Lex.TokenKind.EndOfStatement) {
			return { inputIndex: inputIndex, node: queryStatement };
		}

		// Clause
		let state: SyntaxState = parseQueryClause(input, inputIndex);
		queryStatement.clauses.push(state.node as Semantic.QueryClause);
		inputIndex = state.inputIndex;

		// ;
		if (input[inputIndex].tokenKind == Lex.TokenKind.EndOfStatement) {
			return { inputIndex: inputIndex, node: queryStatement };
		}
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

	// WHERE
	if (input[inputIndex].tokenKind != Lex.TokenKind.Keyword
		|| input[inputIndex].lexeme.toUpperCase() != "WHERE") {
		throw { lineNumber: input[inputIndex].lineNumber, expected: "WHERE", actual: input[inputIndex].lexeme };
	}
	
	// Boolean expression
	inputIndex = skipToNextToken(input, ++inputIndex, "Boolean expression");
	let state: SyntaxState = parseBooleanExpression(input, inputIndex);
	whereClause.booleanExpression = state.node as Semantic.Expression;
	inputIndex = state.inputIndex;

	return { inputIndex: inputIndex, node: whereClause };
}

function parseBooleanExpression(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	let expression: Expression = new Expression();
	expression.expressionKind = Semantic.ExpressionKind.Boolean;

	// Term
	let state: SyntaxState = parseBooleanTerm(input, inputIndex);
	expression.binaryOperation.argument0 = state.node as Semantic.Term;
	inputIndex = state.inputIndex;

	// Binary operation
	inputIndex = skipToNextToken(input, ++inputIndex, ";");
	if (input[inputIndex].tokenKind == Lex.TokenKind.BinaryBooleanOperation) {
		//binaryOperation.binaryOperationSymbol = toBinaryOperationSymbol(input[inputIndex]);

		// Expression
		inputIndex = skipToNextToken(input, ++inputIndex, "Boolean expression");
		state = parseBooleanExpression(input, inputIndex);
		expression.binaryOperation.argument1 = state.node as Semantic.BinaryOperation;
		inputIndex = state.inputIndex;
	}

	return { inputIndex: inputIndex, node: expression };
}

function parseBooleanTerm(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	if (input[inputIndex].tokenKind == Lex.TokenKind.UnaryBooleanOperation) {
		return parseUnaryBooleanOperation(input, inputIndex);
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.BooleanLiteral) {
		return parseBooleanLiteral(input, inputIndex);
	}
	else if (input[inputIndex].tokenKind == Lex.TokenKind.Identifier) {
		return parseProperty(input, inputIndex);
	}

	throw { lineNumber: input[inputIndex].lineNumber, expected: "Boolean term", actual: input[inputIndex].lexeme };
}

function parseUnaryBooleanOperation(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	// Unary operation
	let unaryOperation: UnaryOperationTerm = new UnaryOperationTerm();
	unaryOperation.unaryOperationSymbol = Semantic.UnaryOperationSymbol.Not;

	// Term
	inputIndex = skipToNextToken(input, ++inputIndex, "Boolean term");
	let state: SyntaxState = parseBooleanTerm(input, inputIndex);
	unaryOperation.argument = state.node as Semantic.Term;
	inputIndex = state.inputIndex;

	return { inputIndex: inputIndex, node: unaryOperation };
}

function parseBooleanLiteral(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	// Literal
	let literal: LiteralTerm = new LiteralTerm();
	literal.literal = input[inputIndex].lexeme.toUpperCase() == "TRUE";

	return { inputIndex: inputIndex, node: literal };
}

function parseProperty(input: ReadonlyArray<Lex.Token>, inputIndex: number): SyntaxState {
	// Property
	let property: PropertyTerm = new PropertyTerm();
	property.propertyName = input[inputIndex].lexeme;

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

function skipToNextToken(input: ReadonlyArray<Lex.Token>, inputIndex: number, expected: string): number {
	inputIndex = skipIgnorableTokens(input, inputIndex);

	if (inputIndex >= input.length) {
		throw { lineNumber: input[input.length - 1].lineNumber, expected: expected, actual: "" };
	}
	
	return inputIndex;
}

function skipIgnorableTokens(input: ReadonlyArray<Lex.Token>, inputIndex: number): number {
	while (inputIndex < input.length
			&& isTokenIgnorable(input[inputIndex])) {
		++inputIndex;
	}

	return inputIndex;
}

function isTokenIgnorable(token: Lex.Token): boolean {
	return token.tokenKind == Lex.TokenKind.BlankSpace
		|| token.tokenKind == Lex.TokenKind.BlockComment
		|| token.tokenKind == Lex.TokenKind.LineComment;
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

class Expression extends Node implements Semantic.Expression {
	expressionKind: Semantic.ExpressionKind;
	binaryOperation: BinaryOperation = new BinaryOperation();
}

class BinaryOperation extends Node implements Semantic.BinaryOperation {
	argument0: Semantic.Term;
	binaryOperationSymbol?: Semantic.BinaryOperationSymbol;
	argument1?: Semantic.BinaryOperation;
}

class UnaryOperationTerm extends Node implements Semantic.UnaryOperationTerm {
	termKind: Semantic.TermKind = Semantic.TermKind.UnaryOperation;
	unaryOperationSymbol: Semantic.UnaryOperationSymbol;
	argument: Semantic.Term;
}

class LiteralTerm extends Node implements Semantic.LiteralTerm {
	termKind: Semantic.TermKind = Semantic.TermKind.Literal;
	literal: any;
}

class PropertyTerm extends Node implements Semantic.PropertyTerm {
	termKind: Semantic.TermKind = Semantic.TermKind.Property;
	propertyName: string;
}

class WhereClause extends Node implements Semantic.WhereClause {
	queryClauseKind: Semantic.QueryClauseKind = Semantic.QueryClauseKind.Where;
	booleanExpression: Semantic.Expression;
}
