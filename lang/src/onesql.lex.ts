export enum TokenKind {
    BlankSpace,
    BlockComment,
    LineComment,

    BooleanLiteral,
    NumberLiteral,
    StringLiteral,
    DateTimeLiteral,
    Keyword,

    OpeningParenthesis,
    ClosingParenthesis,
    ItemSeparator,
    EndOfStatement,

    BinaryOperation,
    UnaryOperation,
    Identifier,

    Unknown,
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
