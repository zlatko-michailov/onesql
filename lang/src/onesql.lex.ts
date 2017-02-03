namespace onesql.lex {
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

    class TokenRules {
        static readonly global: ReadonlyArray<TokenRule> = [
            { tokenKind: TokenKind.BlankSpace, regexp: /\s*/im },
            { tokenKind: TokenKind.BlockComment, regexp: /\/\*.*?\*\//im },
            { tokenKind: TokenKind.LineComment, regexp: /\/\/.*?$/im },

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
    }

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

    export class Lex {
        static tokenize(input: string): ReadonlyArray<Token> {
            let tokens: Array<Token> = [];

            let state: LexState = Lex.readToken({ token: undefined, input: input, lineNumber: 1 });
            while(state) {
                tokens.push(state.token);
                state = Lex.readToken(state);
            }

            return tokens;
        }

        static readToken(state: LexState): LexState {
            if (state.input) {
                for (let i: number = 0; i < TokenRules.global.length; i++) {
                    if (state.input.search(TokenRules.global[i].regexp) == 0) {
                        let lexeme: string = state.input.match(TokenRules.global[i].regexp)[0];
                        
                        let lineNumber = state.lineNumber;
                        if (TokenRules.global[i].tokenKind == TokenKind.BlankSpace
                            || TokenRules.global[i].tokenKind == TokenKind.BlockComment) {
                                lineNumber += Lex.countNewLines(lexeme);
                        }

                        return { 
                            token: { tokenKind: TokenRules.global[i].tokenKind, lexeme: lexeme, lineNumber: lineNumber }, 
                            input: state.input.substr(lexeme.length),
                            lineNumber: lineNumber
                        };
                    }
                }
            }

            return undefined;
        }

        static countNewLines(input: string): number {
            return input.match(/$/mg).length - 1; // There is always an extra one.
        }

    }
}
