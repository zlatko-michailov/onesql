import * as Semantic from "./onesql.semantic";

export enum TokenKind {
    BlankSpace,
    BlockComment,
    LineComment,

    BooleanLiteral,
    NumberLiteral,
    StringLiteral,
    Keyword,

    OpeningParenthesis,
    ClosingParenthesis,
    ItemSeparator,
    EndOfStatement,

    BinaryMulDivOperation,
    BinaryAddSubOperation,
    UnaryBitwiseOperation,
    BinaryBitwiseOperation,
    ComparisonOperation,
    UnaryBooleanOperation,
    BinaryBooleanOperation,

    FunctionName,
    Identifier,

    Error,
}

interface TokenRule {
    readonly tokenKind: TokenKind;
    readonly regexp: RegExp;
}

const tokenRules: ReadonlyArray<TokenRule> = [
    { tokenKind: TokenKind.BlankSpace, regexp: /\s+/im },
    { tokenKind: TokenKind.BlockComment, regexp: /\/\*(?:.|\n)*?\*\//im },
    { tokenKind: TokenKind.LineComment, regexp: /\/\/.*?\n/im },

    { tokenKind: TokenKind.BooleanLiteral, regexp: /TRUE|FALSE/i },
    { tokenKind: TokenKind.NumberLiteral, regexp: /(\+|\-)?\d+(\.\d+)?/i },
    { tokenKind: TokenKind.StringLiteral, regexp: /\".*?\"|\'.*?\'/i },
    { tokenKind: TokenKind.Keyword, regexp: /AS|BY|FROM|GROUP|ORDER|SELECT|USE|WHERE/i },

    { tokenKind: TokenKind.OpeningParenthesis, regexp: /\(/i },
    { tokenKind: TokenKind.OpeningParenthesis, regexp: /\)/i },
    { tokenKind: TokenKind.ItemSeparator, regexp: /,/i },
    { tokenKind: TokenKind.EndOfStatement, regexp: /;/i },

    { tokenKind: TokenKind.BinaryMulDivOperation, regexp: /\*|\/|\%/i },
    { tokenKind: TokenKind.BinaryAddSubOperation, regexp: /\+|\-/i },
    { tokenKind: TokenKind.UnaryBitwiseOperation, regexp: /\~/i },
    { tokenKind: TokenKind.BinaryBitwiseOperation, regexp: /\&|\||\^/i },
    { tokenKind: TokenKind.ComparisonOperation, regexp: /==|=|<=|<|>=|>|!=|<>/i },
    { tokenKind: TokenKind.UnaryBooleanOperation, regexp: /NOT|\!/i },
    { tokenKind: TokenKind.BinaryBooleanOperation, regexp: /AND|OR|&&|\|\|/i },

    { tokenKind: TokenKind.Identifier, regexp: /\w+/i },

    { tokenKind: TokenKind.Error, regexp: /\S+/i },
];

export interface Token {
    readonly tokenKind: TokenKind;
    readonly lexeme: string;
    readonly lineNumber: number;
}

interface LexState {
    token: Token;
    input: string;
    lineNumber: number;
}

export function tokenize(input: string): ReadonlyArray<Token> {
    let tokens: Array<Token> = [];

    let state: LexState = readToken({ token: undefined, input: input, lineNumber: 1 });
    while(state) {
        tokens.push(state.token);
        state = readToken(state);
    }

    return tokens;
}

function readToken(state: LexState): LexState {
    if (state.input) {
        for (let i: number = 0; i < tokenRules.length; i++) {
            if (state.input.search(tokenRules[i].regexp) == 0) {
                let lexeme: string = state.input.match(tokenRules[i].regexp)[0];
                let tokenKind: TokenKind = tokenRules[i].tokenKind;
                let lineNumber: number = state.lineNumber;

                switch (tokenKind) {
                    case TokenKind.BlankSpace:
                    case TokenKind.BlockComment:
                        lineNumber += countNewLines(lexeme);
                        break;

                    case TokenKind.LineComment:
                        lineNumber++;
                        break;

                    case TokenKind.Identifier:
                        if (isFunctionName(lexeme)) {
                            tokenKind = TokenKind.FunctionName;
                        }
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

function countNewLines(input: string): number {
    return input.match(/$/mg).length - 1; // There is always an extra one.
}

function isFunctionName(input: string): boolean {
    let inputLower: string = input.toLowerCase();

    for (let i: number; i < Semantic.functionSignatures.length; i++) {
        if (Semantic.functionSignatures[i].name.toLowerCase() === inputLower) {
            return true;
        }
    }

    return false;
}
