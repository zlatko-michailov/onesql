(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Semantic = require("./onesql.semantic");
function genJavascript(semanticBatch) {
    var mongoBatch = genMongoBatch(semanticBatch);
    var javascriptBatch = genJavascriptBatch(mongoBatch);
    return javascriptBatch;
}
exports.genJavascript = genJavascript;
function genMongoBatch(semanticBatch) {
    assertNodeKind(semanticBatch, 1 /* Batch */);
    var mongoBatch = new MongoBatch();
    for (var i = 0; i < semanticBatch.statements.length; i++) {
        var mongoStatement = genMongoStatement(semanticBatch.statements[i]);
        mergeMongoStatement(mongoStatement, mongoBatch);
    }
    return mongoBatch;
}
exports.genMongoBatch = genMongoBatch;
function mergeMongoStatement(mongoStatement, mongoBatch) {
    if (mongoBatch.statements === undefined) {
        mongoBatch.statements = [];
    }
    if (mongoBatch.statements.length === 0
        || mongoBatch.statements[mongoBatch.statements.length - 1].collectionName !== undefined) {
        mongoBatch.statements.push(mongoStatement);
    }
    else {
        if (mongoStatement.databaseName !== undefined) {
            mongoBatch.statements[mongoBatch.statements.length - 1].databaseName = mongoStatement.databaseName;
        }
        if (mongoStatement.collectionName !== undefined) {
            mongoBatch.statements[mongoBatch.statements.length - 1].collectionName = mongoStatement.collectionName;
            mongoBatch.statements[mongoBatch.statements.length - 1].aggregationStages = mongoStatement.aggregationStages;
        }
    }
}
function genMongoStatement(semanticStatement) {
    assertNodeKind(semanticStatement, 2 /* Statement */);
    switch (semanticStatement.statementKind) {
        case 1 /* Use */:
            var useStatement = semanticStatement;
            return { databaseName: useStatement.databaseName };
        case 2 /* Query */:
            var queryStatement = semanticStatement;
            var aggregationStages = [];
            for (var i = 0; i < queryStatement.clauses.length; i++) {
                var aggregationStage = genMongoAggregationStage(queryStatement.clauses[i]);
                aggregationStages.push(aggregationStage);
            }
            return { collectionName: queryStatement.sourceName, aggregationStages: aggregationStages };
        default:
            throw new GenError("StatementKind", "1..2", semanticStatement.statementKind.toString());
    }
}
function genMongoAggregationStage(semanticClause) {
    assertNodeKind(semanticClause, 3 /* QueryClause */);
    switch (semanticClause.queryClauseKind) {
        case 1 /* Where */:
            var whereClause = semanticClause;
            var mongoCondition = genMongoExpression(whereClause.condition);
            return { $match: mongoCondition };
        default:
            throw new GenError("QueryClauseKind", "1", semanticClause.queryClauseKind.toString());
    }
}
function genMongoExpression(semanticExpression) {
    switch (semanticExpression.expressionKind) {
        case 2 /* BinaryOperation */:
            return genMongoBinaryOperation(semanticExpression);
        case 1 /* Term */:
            return genMongoTerm(semanticExpression);
        default:
            throw new GenError("ExpressionKind", "1..2", semanticExpression.expressionKind);
    }
}
function genMongoBinaryOperation(semanticBinaryOperation) {
    assertExpressionKind(semanticBinaryOperation, 2 /* BinaryOperation */);
    var mongoBinaryOperationSymbol = getOperationMapping(binaryOperationMappings, semanticBinaryOperation.binaryOperationSymbol);
    var mongoArgument0 = genMongoExpression(semanticBinaryOperation.argument0);
    var mongoArgument1 = genMongoExpression(semanticBinaryOperation.argument1);
    var mongoBinaryOperation = {};
    mongoBinaryOperation[mongoBinaryOperationSymbol] = [mongoArgument0, mongoArgument1];
    return mongoBinaryOperation;
}
function genMongoTerm(semanticTerm) {
    assertExpressionKind(semanticTerm, 1 /* Term */);
    switch (semanticTerm.termKind) {
        case 1 /* UnaryOperation */:
            return genMongoUnaryOperation(semanticTerm);
        case 2 /* Literal */:
            return genMongoLiteral(semanticTerm);
        case 3 /* Property */:
            return genMongoProperty(semanticTerm);
        case 4 /* FunctionCall */:
            return genMongoFunctionCall(semanticTerm);
        default:
            throw new GenError("TermKind", "1..4", semanticTerm.termKind);
    }
}
function genMongoUnaryOperation(semanticUnaryOperation) {
    assertTermKind(semanticUnaryOperation, 1 /* UnaryOperation */);
    var mongoUnaryOperationSymbol = getOperationMapping(unaryOperationMappings, semanticUnaryOperation.unaryOperationSymbol);
    var mongoArgument = genMongoExpression(semanticUnaryOperation.argument);
    var mongoUnaryOperation = {};
    mongoUnaryOperation[mongoUnaryOperationSymbol] = [mongoArgument];
    return mongoUnaryOperation;
}
function genMongoLiteral(semanticLiteral) {
    assertTermKind(semanticLiteral, 2 /* Literal */);
    var mongoLiteral = { $literal: semanticLiteral.literal };
    return mongoLiteral;
}
function genMongoProperty(semanticProperty) {
    assertTermKind(semanticProperty, 3 /* Property */);
    var mongoProperty = "$" + semanticProperty.propertyName;
    return mongoProperty;
}
function genMongoFunctionCall(semanticFunctionCall) {
    assertTermKind(semanticFunctionCall, 4 /* FunctionCall */);
    var mongoFunctionSymbol = getOperationMapping(functionMappings, semanticFunctionCall.functionSymbol);
    var mongoArguments = [];
    for (var i = 0; i < semanticFunctionCall.arguments.length; i++) {
        mongoArguments.push(genMongoExpression(semanticFunctionCall.arguments[i]));
    }
    var mongoFunctionCall = {};
    mongoFunctionCall[mongoFunctionSymbol] = mongoArguments.length === 1 ? mongoArguments[0] : (mongoArguments.length === 0 ? null : mongoArguments);
    return mongoFunctionCall;
}
// -----------------------------------------------------------------------------
// Javascript
function genJavascriptBatch(mongoBatch) {
    var script = "";
    script += "\n{\n";
    script += "    let _db = db;\n";
    for (var i = 0; i < mongoBatch.statements.length; i++) {
        var mongoStatement = mongoBatch.statements[i];
        script += "\n";
        if (mongoStatement.databaseName !== undefined) {
            script += "    _db = db.getMongo().getDB('" + mongoStatement.databaseName + "');\n";
        }
        if (mongoStatement.collectionName !== undefined) {
            script += "    _db." + mongoStatement.collectionName;
            if (mongoStatement.aggregationStages !== undefined) {
                script += ".aggregate(" + JSON.stringify(mongoStatement.aggregationStages, undefined, 2) + ");\n";
            }
            else {
                script += ".find();\n";
            }
        }
    }
    script += "}\n";
    return script;
}
exports.genJavascriptBatch = genJavascriptBatch;
// -----------------------------------------------------------------------------
// Utilities
function assertNodeKind(node, nodeKind) {
    if (node.nodeKind !== nodeKind) {
        throw new GenError("NodeKind", nodeKind.toString(), node.nodeKind.toString());
    }
}
function assertExpressionKind(expression, expressionKind) {
    if (expression.expressionKind !== expressionKind) {
        throw new GenError("ExpressionKind", expressionKind.toString(), expression.expressionKind.toString());
    }
}
function assertTermKind(term, termKind) {
    if (term.termKind !== termKind) {
        throw new GenError("TermKind", termKind.toString(), term.termKind.toString());
    }
}
// -----------------------------------------------------------------------------
// Mongo implementations.
var MongoBatch = (function () {
    function MongoBatch() {
    }
    return MongoBatch;
}());
var MongoStatement = (function () {
    function MongoStatement() {
    }
    return MongoStatement;
}());
var GenError = (function () {
    function GenError(subjectKind, expected, actual) {
        this.errorKind = 2 /* GenError */;
        this.subjectKind = subjectKind;
        this.expected = expected;
        this.actual = actual;
    }
    return GenError;
}());
function lookupOperationMapping(mappings, semanticSymbol) {
    for (var i = 0; i < mappings.length; i++) {
        if (mappings[i].semanticSymbol === semanticSymbol) {
            return mappings[i].mongoSymbol;
        }
    }
    return undefined;
}
function getOperationMapping(mappings, semanticSymbol) {
    var mongoSmbol = lookupOperationMapping(mappings, semanticSymbol);
    if (mongoSmbol !== undefined) {
        return mongoSmbol;
    }
    throw new GenError("Operation", semanticSymbol.toString(), undefined);
}
var unaryOperationMappings = [
    { semanticSymbol: 1 /* LogicalNot */, mongoSymbol: "$not" },
];
var binaryOperationMappings = [
    { semanticSymbol: 1 /* LogicalOr */, mongoSymbol: "$or" },
    { semanticSymbol: 2 /* LogicalAnd */, mongoSymbol: "$and" },
    { semanticSymbol: 3 /* Equal */, mongoSymbol: "$eq" },
    { semanticSymbol: 4 /* NotEqual */, mongoSymbol: "$ne" },
    { semanticSymbol: 5 /* Less */, mongoSymbol: "$lt" },
    { semanticSymbol: 6 /* LessOrEqual */, mongoSymbol: "$lte" },
    { semanticSymbol: 7 /* Greater */, mongoSymbol: "$gt" },
    { semanticSymbol: 8 /* GreaterOrEqual */, mongoSymbol: "$gte" },
    // Bitwise operations are not supported by Mongo.
    { semanticSymbol: 12 /* Add */, mongoSymbol: "$add" },
    { semanticSymbol: 13 /* Subtract */, mongoSymbol: "$subtract" },
    { semanticSymbol: 14 /* Multiply */, mongoSymbol: "$multiply" },
    { semanticSymbol: 15 /* Divide */, mongoSymbol: "$divide" },
    { semanticSymbol: 16 /* Modulo */, mongoSymbol: "$mod" },
    { semanticSymbol: 17 /* Concat */, mongoSymbol: "$concat" },
    { semanticSymbol: 18 /* DateTimeAdd */, mongoSymbol: "$add" },
    { semanticSymbol: 19 /* DateTimeSubtract */, mongoSymbol: "$subtract" },
    { semanticSymbol: 20 /* DateTimeDiff */, mongoSymbol: "$subtract" },
];
var functionMappings = [
    { semanticSymbol: 1 /* Abs */, mongoSymbol: "$abs" },
    { semanticSymbol: 2 /* Ceil */, mongoSymbol: "$ceil" },
    { semanticSymbol: 3 /* Exp */, mongoSymbol: "$exp" },
    { semanticSymbol: 4 /* Floor */, mongoSymbol: "$floor" },
    { semanticSymbol: 5 /* Lg */, mongoSymbol: "$log10" },
    { semanticSymbol: 6 /* Ln */, mongoSymbol: "$ln" },
    { semanticSymbol: 7 /* Log */, mongoSymbol: "$log" },
    { semanticSymbol: 8 /* Power */, mongoSymbol: "$pow" },
    { semanticSymbol: 9 /* IndexOf */, mongoSymbol: "$indexOfCP" },
    { semanticSymbol: 10 /* Length */, mongoSymbol: "$strLenCP" },
    { semanticSymbol: 11 /* Day */, mongoSymbol: "$dayOfMonth" },
    { semanticSymbol: 12 /* Hour */, mongoSymbol: "$hour" },
    { semanticSymbol: 13 /* Millisecond */, mongoSymbol: "$millisecond" },
    { semanticSymbol: 14 /* Minute */, mongoSymbol: "$minute" },
    { semanticSymbol: 15 /* Month */, mongoSymbol: "$month" },
    { semanticSymbol: 16 /* Second */, mongoSymbol: "$second" },
    { semanticSymbol: 17 /* Year */, mongoSymbol: "$year" },
    { semanticSymbol: 18 /* Substr */, mongoSymbol: "$substrCP" },
    { semanticSymbol: 19 /* ToLower */, mongoSymbol: "$toLower" },
    // ToString function is not supported by Mongo.
    { semanticSymbol: 21 /* ToUpper */, mongoSymbol: "$toUpper" },
    { semanticSymbol: 22 /* Avg */, mongoSymbol: "$avg" },
    // Count function is not supported by Mongo.
    { semanticSymbol: 24 /* First */, mongoSymbol: "$first" },
    { semanticSymbol: 25 /* Last */, mongoSymbol: "$last" },
    { semanticSymbol: 26 /* Max */, mongoSymbol: "$max" },
    { semanticSymbol: 27 /* Min */, mongoSymbol: "$min" },
    { semanticSymbol: 28 /* Sum */, mongoSymbol: "$sum" },
];

},{"./onesql.semantic":4}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lex = require("./onesql.lex");
var Syntax = require("./onesql.syntax");
var Mongo = require("../src/onesql.gen.mongo");
function sqlToSemantic(sql) {
    var tokens = Lex.tokenize(sql, true);
    var semanticBatch = Syntax.parse(tokens);
    return semanticBatch;
}
exports.sqlToSemantic = sqlToSemantic;
function semanticToMongo(semanticBatch) {
    var mongoBatch = Mongo.genMongoBatch(semanticBatch);
    return mongoBatch;
}
exports.semanticToMongo = semanticToMongo;
function semanticToMongoJavascript(semanticBatch) {
    var mongoJavascript = Mongo.genJavascript(semanticBatch);
    return mongoJavascript;
}
exports.semanticToMongoJavascript = semanticToMongoJavascript;
function sqlToMongo(sql) {
    var semanticBatch = sqlToSemantic(sql);
    var mongoBatch = semanticToMongo(semanticBatch);
    return mongoBatch;
}
exports.sqlToMongo = sqlToMongo;
function sqlToMongoJavascript(sql) {
    var semanticBatch = sqlToSemantic(sql);
    var mongoJavascript = semanticToMongoJavascript(semanticBatch);
    return mongoJavascript;
}
exports.sqlToMongoJavascript = sqlToMongoJavascript;

},{"../src/onesql.gen.mongo":1,"./onesql.lex":3,"./onesql.syntax":5}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["BlankSpace"] = 0] = "BlankSpace";
    TokenKind[TokenKind["BlockComment"] = 1] = "BlockComment";
    TokenKind[TokenKind["LineComment"] = 2] = "LineComment";
    TokenKind[TokenKind["BooleanLiteral"] = 3] = "BooleanLiteral";
    TokenKind[TokenKind["NumberLiteral"] = 4] = "NumberLiteral";
    TokenKind[TokenKind["StringLiteral"] = 5] = "StringLiteral";
    TokenKind[TokenKind["DateTimeLiteral"] = 6] = "DateTimeLiteral";
    TokenKind[TokenKind["Keyword"] = 7] = "Keyword";
    TokenKind[TokenKind["OpeningParenthesis"] = 8] = "OpeningParenthesis";
    TokenKind[TokenKind["ClosingParenthesis"] = 9] = "ClosingParenthesis";
    TokenKind[TokenKind["ItemSeparator"] = 10] = "ItemSeparator";
    TokenKind[TokenKind["EndOfStatement"] = 11] = "EndOfStatement";
    TokenKind[TokenKind["BinaryOperation"] = 12] = "BinaryOperation";
    TokenKind[TokenKind["UnaryOperation"] = 13] = "UnaryOperation";
    TokenKind[TokenKind["Identifier"] = 14] = "Identifier";
    TokenKind[TokenKind["Unknown"] = 15] = "Unknown";
})(TokenKind = exports.TokenKind || (exports.TokenKind = {}));
var tokenRules = [
    { tokenKind: TokenKind.BlankSpace, regexp: /\s+/im },
    { tokenKind: TokenKind.BlockComment, regexp: /\/\*(?:.|\n)*?\*\//im },
    { tokenKind: TokenKind.LineComment, regexp: /\/\/.*?\n/im },
    { tokenKind: TokenKind.BooleanLiteral, regexp: /TRUE|FALSE/i },
    { tokenKind: TokenKind.NumberLiteral, regexp: /(\+|\-)?\d+(\.\d+)?/i },
    { tokenKind: TokenKind.StringLiteral, regexp: /\".*?\"|\'.*?\'/i },
    { tokenKind: TokenKind.DateTimeLiteral, regexp: /DATETIME[\'|\"]\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)?[\'|\"]/i },
    { tokenKind: TokenKind.Keyword, regexp: /ASC|AS|BY|DESC|FROM|GROUP|ORDER|SELECT|USE|WHERE/i },
    { tokenKind: TokenKind.OpeningParenthesis, regexp: /\(/i },
    { tokenKind: TokenKind.ClosingParenthesis, regexp: /\)/i },
    { tokenKind: TokenKind.ItemSeparator, regexp: /,/i },
    { tokenKind: TokenKind.EndOfStatement, regexp: /;/i },
    { tokenKind: TokenKind.BinaryOperation, regexp: /==|!=|<>|<=|>=|=|<|>/i },
    { tokenKind: TokenKind.BinaryOperation, regexp: /AND|OR|&&|\|\|/i },
    { tokenKind: TokenKind.BinaryOperation, regexp: /\*|\/|\%/i },
    { tokenKind: TokenKind.BinaryOperation, regexp: /\+|\-/i },
    { tokenKind: TokenKind.UnaryOperation, regexp: /\~/i },
    { tokenKind: TokenKind.BinaryOperation, regexp: /\&|\||\^/i },
    { tokenKind: TokenKind.UnaryOperation, regexp: /NOT|\!/i },
    { tokenKind: TokenKind.Identifier, regexp: /\w+/i },
    { tokenKind: TokenKind.Unknown, regexp: /\S+/i },
];
function tokenize(input, skipIgnorable) {
    var tokens = [];
    var state = readToken({ token: undefined, input: input, lineNumber: 1 });
    while (state) {
        if (!skipIgnorable
            || (state.token.tokenKind != TokenKind.BlankSpace
                && state.token.tokenKind != TokenKind.BlockComment
                && state.token.tokenKind != TokenKind.LineComment)) {
            tokens.push(state.token);
        }
        state = readToken(state);
    }
    return tokens;
}
exports.tokenize = tokenize;
function readToken(state) {
    if (state.input) {
        for (var i = 0; i < tokenRules.length; i++) {
            if (state.input.search(tokenRules[i].regexp) == 0) {
                var lexeme = state.input.match(tokenRules[i].regexp)[0];
                var tokenKind = tokenRules[i].tokenKind;
                var lineNumber = state.lineNumber;
                switch (tokenKind) {
                    case TokenKind.BlankSpace:
                    case TokenKind.BlockComment:
                        lineNumber += countNewLines(lexeme);
                        break;
                    case TokenKind.LineComment:
                        lineNumber++;
                        break;
                }
                return {
                    token: { tokenKind: tokenKind, lexeme: lexeme, lineNumber: lineNumber },
                    input: state.input.substr(lexeme.length),
                    lineNumber: lineNumber
                };
            }
        }
    }
    return undefined;
}
function countNewLines(input) {
    return input.match(/$/mg).length - 1; // There is always an extra one.
}

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lex = require("./onesql.lex");
var Semantic = require("./onesql.semantic");
// Parsing principles:
//    1. Leave inputIndex AFTER the last token of the symbol, i.e. stay one token ahead.
function parse(input) {
    var state = parseBatch(input, 0);
    return state.node;
}
exports.parse = parse;
function parseBatch(input, inputIndex) {
    var batch = new Batch();
    // Parse statements.
    while (inputIndex < input.length) {
        // ;
        if (input[inputIndex].tokenKind == Lex.TokenKind.EndOfStatement) {
            inputIndex = moveInputIndex(input, inputIndex, "statement");
            continue;
        }
        var state = parseStatement(input, inputIndex);
        batch.statements.push(state.node);
        inputIndex = state.inputIndex;
    }
    return { inputIndex: inputIndex, node: batch };
}
function parseStatement(input, inputIndex) {
    if (input[inputIndex].tokenKind == Lex.TokenKind.Keyword
        && input[inputIndex].lexeme.toUpperCase() == "USE") {
        return parseUseStatement(input, inputIndex);
    }
    else if (input[inputIndex].tokenKind == Lex.TokenKind.Keyword
        && input[inputIndex].lexeme.toUpperCase() == "FROM") {
        return parseQueryStatement(input, inputIndex);
    }
    throw new SyntaxError(input[inputIndex].lineNumber, "statement", input[inputIndex].lexeme);
}
function parseUseStatement(input, inputIndex) {
    var useStatement = new UseStatement();
    // USE
    if (input[inputIndex].tokenKind != Lex.TokenKind.Keyword
        || input[inputIndex].lexeme.toUpperCase() != "USE") {
        throw new SyntaxError(input[inputIndex].lineNumber, "USE", input[inputIndex].lexeme);
    }
    // databaseName
    inputIndex = moveInputIndex(input, inputIndex, "identifier");
    if (input[inputIndex].tokenKind != Lex.TokenKind.Identifier) {
        throw new SyntaxError(input[inputIndex].lineNumber, "identifier", input[inputIndex].lexeme);
    }
    useStatement.databaseName = input[inputIndex].lexeme;
    // ;
    inputIndex = moveInputIndex(input, inputIndex, ";");
    if (input[inputIndex].tokenKind != Lex.TokenKind.EndOfStatement) {
        throw new SyntaxError(input[inputIndex].lineNumber, ";", input[inputIndex].lexeme);
    }
    return { inputIndex: inputIndex, node: useStatement };
}
function parseQueryStatement(input, inputIndex) {
    var queryStatement = new QueryStatement();
    // FROM
    if (input[inputIndex].tokenKind != Lex.TokenKind.Keyword
        || input[inputIndex].lexeme.toUpperCase() != "FROM") {
        throw new SyntaxError(input[inputIndex].lineNumber, "FROM", input[inputIndex].lexeme);
    }
    // sourceName
    inputIndex = moveInputIndex(input, inputIndex, "identifier");
    if (input[inputIndex].tokenKind != Lex.TokenKind.Identifier) {
        throw new SyntaxError(input[inputIndex].lineNumber, "identifier", input[inputIndex].lexeme);
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
        var state = parseQueryClause(input, inputIndex);
        queryStatement.clauses.push(state.node);
        inputIndex = state.inputIndex;
    }
    if (inputIndex < input.length
        && input[inputIndex].tokenKind == Lex.TokenKind.EndOfStatement) {
        return { inputIndex: inputIndex, node: queryStatement };
    }
    throw new SyntaxError(input[input.length - 1].lineNumber, ";", "");
}
function parseQueryClause(input, inputIndex) {
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
    throw new SyntaxError(input[inputIndex].lineNumber, "WHERE, SELECT, GROUP, or ORDER", input[inputIndex].lexeme);
}
function parseWhereClause(input, inputIndex) {
    var whereClause = new WhereClause();
    // Condition
    inputIndex = moveInputIndex(input, inputIndex, "condition");
    var state = parseExpression(input, inputIndex);
    whereClause.condition = state.node;
    assertTypeMatch(1 /* Boolean */, whereClause.condition.resultType, input[state.inputIndex]);
    return { inputIndex: state.inputIndex, node: whereClause };
}
function parseExpression(input, inputIndex) {
    // Term
    var state = parseTerm(input, inputIndex);
    var expression = state.node;
    // Binary operation
    return parseBinaryOperation(input, state.inputIndex, 0 /* None */, expression);
}
function parseBinaryOperation(input, inputIndex, minPriority, argument0) {
    var expression = argument0;
    // Binary operations
    var signature = peekOperationSignature(binaryOperationSignatures, input[inputIndex], expression.resultType);
    while (signature !== undefined && signature.priority > minPriority) {
        // Binary operation
        var binaryOperation = new BinaryOperation(signature);
        binaryOperation.argument0 = expression;
        assertTypeMatch(signature.argumentTypes[0], binaryOperation.argument0.resultType, input[inputIndex]);
        // Term
        inputIndex = moveInputIndex(input, inputIndex, "Expression term");
        var state = parseTerm(input, inputIndex);
        // Peek at the next binary operation.
        var signatureNext = peekOperationSignature(binaryOperationSignatures, input[state.inputIndex], state.node.resultType);
        if (signatureNext !== undefined && signatureNext.priority > signature.priority) {
            // The next operation is of higher priority.
            var stateNext = parseBinaryOperation(input, state.inputIndex, signature.priority, state.node);
            binaryOperation.argument1 = stateNext.node;
            inputIndex = stateNext.inputIndex;
        }
        else {
            // The next operation is non-existent or of same or lower priority.
            binaryOperation.argument1 = state.node;
            inputIndex = state.inputIndex;
        }
        assertTypeMatch(signature.argumentTypes[1], binaryOperation.argument1.resultType, input[inputIndex]);
        expression = binaryOperation;
        signature = peekOperationSignature(binaryOperationSignatures, input[inputIndex], binaryOperation.resultType);
    }
    return { inputIndex: inputIndex, node: expression };
}
function parseTerm(input, inputIndex) {
    var state = undefined;
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
        var signature = peekOperationSignature(functionSignatures, input[inputIndex], 0 /* Any */);
        if (signature !== undefined) {
            return parseFunctionCall(input, inputIndex, signature);
        }
        else {
            return parseProperty(input, inputIndex);
        }
    }
    else if (input[inputIndex].tokenKind == Lex.TokenKind.OpeningParenthesis) {
        inputIndex = moveInputIndex(input, inputIndex, ")");
        var state_1 = parseExpression(input, inputIndex);
        inputIndex = state_1.inputIndex;
        // )
        if (input[inputIndex].tokenKind !== Lex.TokenKind.ClosingParenthesis) {
            throw new SyntaxError(input[inputIndex].lineNumber, ")", input[inputIndex].lexeme);
        }
        inputIndex = moveInputIndex(input, inputIndex, ";");
        return { inputIndex: inputIndex, node: state_1.node };
    }
    throw new SyntaxError(input[inputIndex].lineNumber, "Expression term", input[inputIndex].lexeme);
}
function parseUnaryOperation(input, inputIndex) {
    // Unary operation
    var signature = getOperationSignature(unaryOperationSignatures, input[inputIndex], 0 /* Any */);
    var unaryOperation = new UnaryOperationTerm(signature);
    // Term
    inputIndex = moveInputIndex(input, inputIndex, "Expression term");
    var state = parseTerm(input, inputIndex);
    unaryOperation.argument = state.node;
    assertTypeMatch(signature.argumentTypes[0], unaryOperation.argument.resultType, input[state.inputIndex]);
    return { inputIndex: state.inputIndex, node: unaryOperation };
}
function parseFunctionCall(input, inputIndex, signature) {
    var functionCall = new FunctionCallTerm(signature);
    // (
    inputIndex = moveInputIndex(input, inputIndex, "(");
    if (input[inputIndex].tokenKind !== Lex.TokenKind.OpeningParenthesis) {
        throw new SyntaxError(input[inputIndex].lineNumber, "(", input[inputIndex].lexeme);
    }
    // Arguments
    inputIndex = moveInputIndex(input, inputIndex, ")");
    for (var i = 0; i < signature.argumentTypes.length; i++) {
        // Argument
        var state = parseExpression(input, inputIndex);
        inputIndex = state.inputIndex;
        functionCall.arguments[i] = state.node;
        assertTypeMatch(signature.argumentTypes[i], functionCall.arguments[i].resultType, input[inputIndex]);
        // ,
        if (i < signature.argumentTypes.length - 1) {
            if (input[inputIndex].tokenKind !== Lex.TokenKind.ItemSeparator) {
                throw new SyntaxError(input[inputIndex].lineNumber, ",", input[inputIndex].lexeme);
            }
            inputIndex = moveInputIndex(input, inputIndex, "argument");
        }
    }
    // )
    if (input[inputIndex].tokenKind !== Lex.TokenKind.ClosingParenthesis) {
        throw new SyntaxError(input[inputIndex].lineNumber, ")", input[inputIndex].lexeme);
    }
    inputIndex = moveInputIndex(input, inputIndex, ")");
    return { inputIndex: inputIndex, node: functionCall };
}
function parseLiteral(input, inputIndex) {
    // Literal
    var literal = new LiteralTerm(input[inputIndex]);
    inputIndex = moveInputIndex(input, inputIndex, ";");
    return { inputIndex: inputIndex, node: literal };
}
function parseProperty(input, inputIndex) {
    // Property
    var property = new PropertyTerm(input[inputIndex]);
    inputIndex = moveInputIndex(input, inputIndex, ";");
    return { inputIndex: inputIndex, node: property };
}
function parseSelectClause(input, inputIndex) {
    return { inputIndex: inputIndex, node: undefined };
}
function parseGroupByClause(input, inputIndex) {
    return { inputIndex: inputIndex, node: undefined };
}
function parseOrderByClause(input, inputIndex) {
    return { inputIndex: inputIndex, node: undefined };
}
// -----------------------------------------------------------------------------
// Utilities
function moveInputIndex(input, inputIndex, expected) {
    if (++inputIndex > input.length) {
        throw new SyntaxError(input[input.length - 1].lineNumber, expected, input[input.length - 1].lexeme);
    }
    return inputIndex;
}
function assertTypeMatch(resultTypeExpected, resultTypeActual, token) {
    if (!areTypesMatching(resultTypeExpected, resultTypeActual)) {
        throw new SyntaxError(token.lineNumber, stringifyValueType(resultTypeExpected) + " expression", stringifyValueType(resultTypeActual) + " expression");
    }
}
function areTypesMatching(resultType1, resultType2) {
    return resultType1 == 0 /* Any */
        || resultType2 == 0 /* Any */
        || resultType1 == resultType2;
}
function stringifyValueType(resultType) {
    switch (resultType) {
        case 0 /* Any */:
            return "Any";
        case 1 /* Boolean */:
            return "Boolean";
        case 2 /* Number */:
            return "Number";
        case 3 /* String */:
            return "String";
        case 4 /* DateTime */:
            return "DateTime";
    }
}
var SyntaxError = (function () {
    function SyntaxError(lineNumber, expected, actual) {
        this.errorKind = 1 /* SyntaxError */;
        this.lineNumber = lineNumber;
        this.expected = expected;
        this.actual = actual;
    }
    return SyntaxError;
}());
// -----------------------------------------------------------------------------
// Semantic contract implementations.
var Node = (function () {
    function Node() {
    }
    return Node;
}());
var Batch = (function (_super) {
    __extends(Batch, _super);
    function Batch() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodeKind = 1 /* Batch */;
        _this.statements = [];
        return _this;
    }
    return Batch;
}(Node));
var UseStatement = (function (_super) {
    __extends(UseStatement, _super);
    function UseStatement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodeKind = 2 /* Statement */;
        _this.statementKind = 1 /* Use */;
        return _this;
    }
    return UseStatement;
}(Node));
var QueryStatement = (function (_super) {
    __extends(QueryStatement, _super);
    function QueryStatement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodeKind = 2 /* Statement */;
        _this.statementKind = 2 /* Query */;
        _this.clauses = [];
        return _this;
    }
    return QueryStatement;
}(Node));
var WhereClause = (function (_super) {
    __extends(WhereClause, _super);
    function WhereClause() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodeKind = 3 /* QueryClause */;
        _this.queryClauseKind = 1 /* Where */;
        return _this;
    }
    return WhereClause;
}(Node));
var Expression = (function (_super) {
    __extends(Expression, _super);
    function Expression() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodeKind = 4 /* Expression */;
        return _this;
    }
    return Expression;
}(Node));
var BinaryOperation = (function (_super) {
    __extends(BinaryOperation, _super);
    function BinaryOperation(signature) {
        var _this = _super.call(this) || this;
        _this.expressionKind = 2 /* BinaryOperation */;
        _this.binaryOperationSymbol = signature.symbol;
        _this.resultType = signature.resultType;
        return _this;
    }
    return BinaryOperation;
}(Expression));
var UnaryOperationTerm = (function (_super) {
    __extends(UnaryOperationTerm, _super);
    function UnaryOperationTerm(signature) {
        var _this = _super.call(this) || this;
        _this.expressionKind = 1 /* Term */;
        _this.termKind = 1 /* UnaryOperation */;
        _this.unaryOperationSymbol = signature.symbol;
        _this.resultType = signature.resultType;
        return _this;
    }
    return UnaryOperationTerm;
}(Expression));
var LiteralTerm = (function (_super) {
    __extends(LiteralTerm, _super);
    function LiteralTerm(token) {
        var _this = _super.call(this) || this;
        _this.expressionKind = 1 /* Term */;
        _this.termKind = 2 /* Literal */;
        switch (token.tokenKind) {
            case Lex.TokenKind.BooleanLiteral:
                _this.literal = token.lexeme.toUpperCase() == "TRUE";
                _this.resultType = 1 /* Boolean */;
                break;
            case Lex.TokenKind.NumberLiteral:
                _this.literal = parseFloat(token.lexeme);
                _this.resultType = 2 /* Number */;
                break;
            case Lex.TokenKind.StringLiteral:
                _this.literal = token.lexeme.substring(1, token.lexeme.length - 1);
                _this.resultType = 3 /* String */;
                break;
            case Lex.TokenKind.DateTimeLiteral:
                _this.literal = new Date(token.lexeme.substring(9, token.lexeme.length - 1));
                _this.resultType = 4 /* DateTime */;
                break;
        }
        return _this;
    }
    return LiteralTerm;
}(Expression));
var PropertyTerm = (function (_super) {
    __extends(PropertyTerm, _super);
    function PropertyTerm(token) {
        var _this = _super.call(this) || this;
        _this.expressionKind = 1 /* Term */;
        _this.termKind = 3 /* Property */;
        _this.propertyName = token.lexeme;
        _this.resultType = 0 /* Any */;
        return _this;
    }
    return PropertyTerm;
}(Expression));
var FunctionCallTerm = (function (_super) {
    __extends(FunctionCallTerm, _super);
    function FunctionCallTerm(signature) {
        var _this = _super.call(this) || this;
        _this.expressionKind = 1 /* Term */;
        _this.termKind = 4 /* FunctionCall */;
        _this.functionSymbol = signature.symbol;
        _this.resultType = signature.resultType;
        _this.arguments = new Array();
        return _this;
    }
    return FunctionCallTerm;
}(Expression));
// -----------------------------------------------------------------------------
// Symbol tables.
function getOperationSignature(signatures, token, argument0Type) {
    var signature = peekOperationSignature(signatures, token, argument0Type);
    if (signature !== undefined) {
        return signature;
    }
    throw new SyntaxError(token.lineNumber, stringifyValueType(argument0Type) + " operation", token.lexeme);
}
function peekOperationSignature(signatures, token, argument0Type) {
    var index = lookupOperationSignature(signatures, token.lexeme.toUpperCase(), argument0Type);
    if (index !== undefined) {
        return signatures[index];
    }
    return undefined;
}
function lookupOperationSignature(signatures, name, argument0Type) {
    for (var i = 0; i < signatures.length; i++) {
        if (argument0Type == 0 /* Any */
            || (signatures[i].argumentTypes.length > 0
                && (signatures[i].argumentTypes[0] === 0 /* Any */
                    || signatures[i].argumentTypes[0] === argument0Type))) {
            for (var n = 0; n < signatures[i].names.length; n++) {
                if (name === signatures[i].names[n]) {
                    return i;
                }
            }
        }
    }
    return undefined;
}
var unaryOperationSignatures = [
    {
        names: ["NOT", "!"],
        symbol: 1 /* LogicalNot */,
        argumentTypes: [1 /* Boolean */],
        resultType: 1 /* Boolean */
    },
    {
        names: ["~"],
        symbol: 2 /* BitwiseNot */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["+"],
        symbol: 3 /* NoOp */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["-"],
        symbol: 4 /* Negate */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
];
var binaryOperationSignatures = [
    {
        names: ["OR", "||"],
        symbol: 1 /* LogicalOr */,
        priority: 1 /* Logical */,
        argumentTypes: [1 /* Boolean */, 1 /* Boolean */],
        resultType: 1 /* Boolean */
    },
    {
        names: ["AND", "&&"],
        symbol: 2 /* LogicalAnd */,
        priority: 1 /* Logical */,
        argumentTypes: [1 /* Boolean */, 1 /* Boolean */],
        resultType: 1 /* Boolean */
    },
    {
        names: ["==", "="],
        symbol: 3 /* Equal */,
        priority: 2 /* Comparison */,
        argumentTypes: [0 /* Any */, 0 /* Any */],
        resultType: 1 /* Boolean */
    },
    {
        names: ["!=", "<>"],
        symbol: 4 /* NotEqual */,
        priority: 2 /* Comparison */,
        argumentTypes: [0 /* Any */, 0 /* Any */],
        resultType: 1 /* Boolean */
    },
    {
        names: ["<"],
        symbol: 5 /* Less */,
        priority: 2 /* Comparison */,
        argumentTypes: [0 /* Any */, 0 /* Any */],
        resultType: 1 /* Boolean */
    },
    {
        names: ["<="],
        symbol: 6 /* LessOrEqual */,
        priority: 2 /* Comparison */,
        argumentTypes: [0 /* Any */, 0 /* Any */],
        resultType: 1 /* Boolean */
    },
    {
        names: [">"],
        symbol: 7 /* Greater */,
        priority: 2 /* Comparison */,
        argumentTypes: [0 /* Any */, 0 /* Any */],
        resultType: 1 /* Boolean */
    },
    {
        names: [">="],
        symbol: 8 /* GreaterOrEqual */,
        priority: 2 /* Comparison */,
        argumentTypes: [0 /* Any */, 0 /* Any */],
        resultType: 1 /* Boolean */
    },
    {
        names: ["|"],
        symbol: 9 /* BitwiseOr */,
        priority: 5 /* Bitwise */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["&"],
        symbol: 10 /* BitwiseAnd */,
        priority: 5 /* Bitwise */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["^"],
        symbol: 11 /* BitwiseXor */,
        priority: 5 /* Bitwise */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["+"],
        symbol: 12 /* Add */,
        priority: 6 /* Addition */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["-"],
        symbol: 13 /* Subtract */,
        priority: 6 /* Addition */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["*"],
        symbol: 14 /* Multiply */,
        priority: 7 /* Multiplication */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["/"],
        symbol: 15 /* Divide */,
        priority: 7 /* Multiplication */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["%"],
        symbol: 16 /* Modulo */,
        priority: 7 /* Multiplication */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["+"],
        symbol: 17 /* Concat */,
        priority: 3 /* String */,
        argumentTypes: [3 /* String */, 3 /* String */],
        resultType: 3 /* String */
    },
    {
        names: ["+"],
        symbol: 18 /* DateTimeAdd */,
        priority: 4 /* DateTime */,
        argumentTypes: [4 /* DateTime */, 2 /* Number */],
        resultType: 4 /* DateTime */
    },
    {
        names: ["-"],
        symbol: 19 /* DateTimeSubtract */,
        priority: 4 /* DateTime */,
        argumentTypes: [4 /* DateTime */, 2 /* Number */],
        resultType: 4 /* DateTime */
    },
    {
        names: ["/"],
        symbol: 20 /* DateTimeDiff */,
        priority: 4 /* DateTime */,
        argumentTypes: [4 /* DateTime */, 4 /* DateTime */],
        resultType: 2 /* Number */
    },
];
var functionSignatures = [
    // Result: Number
    {
        names: ["ABS"],
        symbol: 1 /* Abs */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["CEIL"],
        symbol: 2 /* Ceil */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["EXP"],
        symbol: 3 /* Exp */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["FLOOR"],
        symbol: 4 /* Floor */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["LG"],
        symbol: 5 /* Lg */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["LN"],
        symbol: 6 /* Ln */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["LOG"],
        symbol: 7 /* Log */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["POWER"],
        symbol: 8 /* Power */,
        argumentTypes: [2 /* Number */, 2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["INDEXOF"],
        symbol: 9 /* IndexOf */,
        argumentTypes: [3 /* String */, 3 /* String */],
        resultType: 2 /* Number */
    },
    {
        names: ["LENGTH"],
        symbol: 10 /* Length */,
        argumentTypes: [3 /* String */],
        resultType: 2 /* Number */
    },
    {
        names: ["DAY"],
        symbol: 11 /* Day */,
        argumentTypes: [4 /* DateTime */],
        resultType: 2 /* Number */
    },
    {
        names: ["HOUR"],
        symbol: 12 /* Hour */,
        argumentTypes: [4 /* DateTime */],
        resultType: 2 /* Number */
    },
    {
        names: ["MILLISECOND"],
        symbol: 13 /* Millisecond */,
        argumentTypes: [4 /* DateTime */],
        resultType: 2 /* Number */
    },
    {
        names: ["MINUTE"],
        symbol: 14 /* Minute */,
        argumentTypes: [4 /* DateTime */],
        resultType: 2 /* Number */
    },
    {
        names: ["MONTH"],
        symbol: 15 /* Month */,
        argumentTypes: [4 /* DateTime */],
        resultType: 2 /* Number */
    },
    {
        names: ["SECOND"],
        symbol: 16 /* Second */,
        argumentTypes: [4 /* DateTime */],
        resultType: 2 /* Number */
    },
    {
        names: ["YEAR"],
        symbol: 17 /* Year */,
        argumentTypes: [4 /* DateTime */],
        resultType: 2 /* Number */
    },
    // Result: String
    {
        names: ["SUBSTR"],
        symbol: 18 /* Substr */,
        argumentTypes: [3 /* String */, 2 /* Number */, 2 /* Number */],
        resultType: 3 /* String */
    },
    {
        names: ["TOLOWER"],
        symbol: 19 /* ToLower */,
        argumentTypes: [3 /* String */],
        resultType: 3 /* String */
    },
    {
        names: ["TOSTRING"],
        symbol: 20 /* ToString */,
        argumentTypes: [0 /* Any */],
        resultType: 3 /* String */
    },
    {
        names: ["TOUPPER"],
        symbol: 21 /* ToUpper */,
        argumentTypes: [3 /* String */],
        resultType: 3 /* String */
    },
    // Result: Aggregation
    {
        names: ["AVG"],
        symbol: 22 /* Avg */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    {
        names: ["COUNT"],
        symbol: 23 /* Count */,
        argumentTypes: [0 /* Any */],
        resultType: 2 /* Number */
    },
    {
        names: ["FIRST"],
        symbol: 24 /* First */,
        argumentTypes: [0 /* Any */],
        resultType: 0 /* Any */
    },
    {
        names: ["LAST"],
        symbol: 25 /* Last */,
        argumentTypes: [0 /* Any */],
        resultType: 0 /* Any */
    },
    {
        names: ["MAX"],
        symbol: 26 /* Max */,
        argumentTypes: [0 /* Any */],
        resultType: 0 /* Any */
    },
    {
        names: ["MIN"],
        symbol: 27 /* Min */,
        argumentTypes: [0 /* Any */],
        resultType: 0 /* Any */
    },
    {
        names: ["SUM"],
        symbol: 28 /* Sum */,
        argumentTypes: [2 /* Number */],
        resultType: 2 /* Number */
    },
    // Result: DateTime
    {
        names: ["NOW"],
        symbol: 29 /* Now */,
        argumentTypes: [],
        resultType: 4 /* DateTime */
    },
    {
        names: ["TODAY"],
        symbol: 30 /* Today */,
        argumentTypes: [],
        resultType: 4 /* DateTime */
    },
];

},{"./onesql.lex":3,"./onesql.semantic":4}],6:[function(require,module,exports){
// To see the changes from this file, run this command:
//     browserify ui/onesql.ui.src.js -o ui/onesql.ui.out.js

var onesql = require("../out/lang/src/onesql");

window.onesqlui = {
	load: function(ev) {
		onesqlui.createEditors();

		onesqlui.makeButton("translate", onesqlui.translate, undefined);
		onesqlui.makeButton("copy-sql", onesqlui.copy, "sqlEditor");
		onesqlui.makeButton("help", onesqlui.help, undefined);

		onesqlui.makeButton("copy-semantic", onesqlui.copy, "semanticEditor");

		onesqlui.makeButton("copy-mongo", onesqlui.copy, "mongoEditor");
	},

	translate: function(ev) {
		var sql = onesqlui.sqlEditor.getValue();
		try {
			var semantic = onesql.sqlToSemantic(sql);
			onesqlui.semanticEditor.setValue(JSON.stringify(semantic, undefined, 2));

			var mongoJavascript = onesql.semanticToMongoJavascript(semantic);
			onesqlui.mongoEditor.setValue(mongoJavascript);
		}
		catch (ex) {
			onesqlui.mongoEditor.setValue(JSON.stringify(ex, undefined, 2));
		}
	},

	copy: function(ev) {
		var editorName = ev.target.getAttribute("editor-name");
		var editor = onesqlui[editorName];

		var temp = document.createElement("textarea");
		temp.value = editor.getValue();
		temp.style.width = 1;
		temp.style.height = 1;
		temp.style.border = "none";
		document.body.appendChild(temp);
		temp.select();

		try {
			document.execCommand("copy");
		}
		finally {
			document.body.removeChild(temp);
			ev.target.style.padding = "2px 4px 2px 4px";
		}
	},

	help: function(ev) {
		// TODO:
	},

	makeButton: function(id, click, editorName) {
		var button = document.getElementById(id);
	
		button.setAttribute("class", "button");
		button.setAttribute("href", "");
		if (editorName) {
			button.setAttribute("editor-name", editorName);
		}
		
		button.addEventListener("mouseover", onesqlui.mouseover);
		button.addEventListener("mouseout", onesqlui.mouseout);
		button.addEventListener("click", function(ev) {
			ev.preventDefault();

			ev.target.style.backgroundColor = "#d8d8d8";
			ev.target.style.color = "red";

			try {
				click(ev);
			}
			finally {
				setTimeout(function() {
					ev.target.style.backgroundColor = "white";
					ev.target.style.color = "blue";
				}, 100);
			}
		});
	},

	mouseover: function(ev) {
		ev.target.style.borderWidth = "2px";
		ev.target.style.padding = "2px 4px 2px 4px";
		ev.target.style.color = "blue";
		ev.target.style.borderColor = "black";
	},

	mouseout: function(ev) {
		ev.target.removeAttribute("style");
	},

	createEditors: function() {
		function set(str) {
			var obj = {}, words = str.split(" ");
			for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
			return obj;
		}

		CodeMirror.defineMIME("text/x-onesql", {
			name:       "sql",
			client:     { },
			keywords:   set("and as asc by datetime delete desc from group insert into not or order select set use values where"),
			builtin:    set("abs acos add_months ascii asin atan atan2 average bfile bfilename bigserial bit blob ceil character chartorowid chr clob concat convert cos cosh count dec decode deref dual dump dup_val_on_index empty error exp false float floor found glb greatest hextoraw initcap instr instrb int integer isopen last_day least length lengthb ln lower lpad ltrim lub make_ref max min mlslabel mod months_between natural naturaln nchar nclob new_time next_day nextval nls_charset_decl_len nls_charset_id nls_charset_name nls_initcap nls_lower nls_sort nls_upper nlssort no_data_found notfound null number numeric nvarchar2 nvl others power rawtohex real reftohex round rowcount rowidtochar rowtype rpad rtrim serial sign signtype sin sinh smallint soundex sqlcode sqlerrm sqrt stddev string substr substrb sum sysdate tan tanh to_char text to_date to_label to_multi_byte to_number to_single_byte translate true trunc uid unlogged upper user userenv varchar varchar2 variance varying vsize xml"),
			operatorChars: /^[*+\-%<>!=~]/,
			dateSQL:    { },
			support:    set("commentSlashSlash")
		});

		onesqlui.sqlEditor = CodeMirror.fromTextArea(document.getElementById('mark-sql'), {
			mode: 'text/x-onesql',
			indentWithTabs: false,
			smartIndent: true,
			lineNumbers: true,
			lineWrapping: true,
			matchBrackets : true,
			autofocus: true,
			extraKeys: { "Ctrl-Space": "autocomplete" },
			hintOptions: { tables: {
				users: { name: null, score: null, birthDate: null },
				countries: { name: null, population: null, size: null }
			}}
		});

		onesqlui.semanticEditor = CodeMirror.fromTextArea(document.getElementById('mark-semantic'), {
			mode: 'application/json',
			indentWithTabs: false,
			smartIndent: true,
			lineNumbers: true,
			lineWrapping: true,
			matchBrackets : true,
			autofocus: true,
			readOnly: "nocursor"
		});

		onesqlui.mongoEditor = CodeMirror.fromTextArea(document.getElementById('mark-mongo'), {
			mode: 'application/json',
			indentWithTabs: false,
			smartIndent: true,
			lineNumbers: true,
			lineWrapping: true,
			matchBrackets : true,
			autofocus: true,
			readOnly: "nocursor"
		});

		let sqlEditorElement = document.getElementById('mark-sql').nextSibling;
		let semanticEditorElement = document.getElementById('mark-semantic').nextSibling;
		let mongoEditorElement = document.getElementById('mark-mongo').nextSibling;

		let height = (window.innerHeight - 120) + "px";
		sqlEditorElement.style.height = height;
		semanticEditorElement.style.height = height;
		mongoEditorElement.style.height = height;

		semanticEditorElement.style.backgroundColor = "#f4f4f4";
		mongoEditorElement.style.backgroundColor = "#f4f4f4";
	},
};

window.onload = onesqlui.load;
},{"../out/lang/src/onesql":2}]},{},[6]);
