import { Scan, TokenType } from '../../main/fgl/FglScanner';

const mockModule = {};

test('eof', () => {
   mockModule.source = '';
   const tokens = Scan(mockModule);
   expect(tokens.length).toBe(1);
   expect(tokens[0].tokenType).toBe(TokenType.EOF);
});

/*
 * Testing individual token types
 */

test('whitespace: blank, \\t, \\r, \\n', () => {
    testTokenType(TokenType.WHITESPACE,[' ', '\t', '\r', '\n']);
});

test('keywords: if, else, while, until', () => {
   testTokenType(TokenType.KEYWORD,['if', 'else', 'while', 'until']);
});

test('brackets: ()[]{}', () => {
    testTokenType(TokenType.BRACKET,['(', ')', '[', ']', '{', '}']);
});

test('punctuation: .;:!?,', () => {
    testTokenType(TokenType.PUNCTUATION, [',', '.', ';', ':', '?', '!']);
});

test('string literals', () => {
   testTokenType(TokenType.STRINGLITERAL, [
       '"String literal"',
       '"Strange string\t literal \r\n"'
   ]);
});

test('number literals', () => {
    testTokenType(TokenType.NUMBERLITERAL, ['1','09']);
});


test('boolean literals', () => {
    testTokenType(TokenType.BOOLEANLITERAL, ['true', 'false']);
});

test('identifiers', () => {
   testTokenType(TokenType.IDENTIFIER, [
      'bernhard',
      'Bernhard',
       'bernhard-anzeletti',
       'bernhard123',
       '+','-','*','/','^',
       '<','<=','==','#','>=','>',
       '&&','||','~',
       'uswusf'
   ]);
});

/*
 * Testing token positions
 */

test('full parse', () => {
   mockModule.source = 'if (i == 1) {\n\tSystem.out.println("Eins");\n}';
   const tokens = Scan(mockModule);
   isKeyword(       tokens[0], 'if'     ).inLine(0).startingAt(0).endingAt(1);
   isWhitespace(    tokens[1], ' '      ).inLine(0).startingAt(2).endingAt(2);
   isBracket(       tokens[2], '('      ).inLine(0).startingAt(3).endingAt(3);
   isIdentifier(    tokens[3], 'i'      ).inLine(0).startingAt(4).endingAt(4);
   isWhitespace(    tokens[4], ' '      ).inLine(0).startingAt(5).endingAt(5);
   isIdentifier(    tokens[5], '=='     ).inLine(0).startingAt(6).endingAt(7);
   isWhitespace(    tokens[6], ' '      ).inLine(0).startingAt(8).endingAt(8);
   isNumberLiteral( tokens[7], '1'      ).inLine(0).startingAt(9).endingAt(9);
   isBracket(       tokens[8], ')'      ).inLine(0).startingAt(10).endingAt(10);
   isWhitespace(    tokens[9], ' '      ).inLine(0).startingAt(11).endingAt(11);
   isBracket(       tokens[10], '{'     ).inLine(0).startingAt(12).endingAt(12);
   isWhitespace(    tokens[11], '\n\t'  ).inLine(1).startingAt(13).endingAt(0);
   isIdentifier(    tokens[12], 'System').inLine(1).startingAt(1).endingAt(6);
   isPunctuation(   tokens[13], '.'     ).inLine(1).startingAt(7).endingAt(7);
   isIdentifier(    tokens[14], 'out'   ).inLine(1).startingAt(8).endingAt(10);
   isPunctuation(   tokens[15], '.'     ).inLine(1).startingAt(11).endingAt(11);
   isIdentifier(    tokens[16], 'println').inLine(1).startingAt(12).endingAt(18);
   isBracket(       tokens[17], '('     ).inLine(1).startingAt(19).endingAt(19);
   isStringLiteral( tokens[18], '"Eins"').inLine(1).startingAt(20).endingAt(25);
   isBracket(       tokens[19], ')'     ).inLine(1).startingAt(26).endingAt(26);
   isPunctuation(   tokens[20], ';'     ).inLine(1).startingAt(27).endingAt(27);
   isWhitespace(    tokens[21], '\n'    ).inLine(2).startingAt(28).endingAt(-1);
   isBracket(       tokens[22], '}'     ).inLine(2).startingAt(0).endingAt(0);
   isEOF(           tokens[23]                 ).inLine(2).startingAt(1).endingAt(1);

});

/*
 * Helper functions (hoisted)
 */

//for TokenTypes
function testTokenType(tokenType,lexxems) {
    lexxems.forEach(lexxem => {
        mockModule.source = lexxem;
        const tokens = Scan(mockModule);
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexxem).toBe(lexxem);
        expect(tokens[0].tokenType).toBe(tokenType);
        expect(tokens[1].tokenType).toBe(TokenType.EOF);
    });
}

//for TokenPositions

class PositionChecker {
    constructor(token) {
        this.token = token;
    }

    inLine(lineNumber) {
        expect(this.token.sourceCodeReference.startLineNumber).toBe(lineNumber);
        expect(this.token.sourceCodeReference.endLineNumber).toBe(lineNumber);
        return this;
    }

    startingAt(startPositionInLine) {
        expect(this.token.sourceCodeReference.startPositionInLine).toBe(startPositionInLine);
        return this;
    }

    endingAt(endPositionInLine) {
        expect(this.token.sourceCodeReference.endPositionInLine).toBe(endPositionInLine);
        return this;
    }

}
function isKeyword(token, lexxem) {
    isTokenOfType(token,TokenType.KEYWORD,lexxem);
    return new PositionChecker(token);
}

function isIdentifier(token, lexxem) {
    isTokenOfType(token, TokenType.IDENTIFIER,lexxem);
    return new PositionChecker(token);
}

function isNumberLiteral(token, lexxem) {
    isTokenOfType(token, TokenType.NUMBERLITERAL, lexxem);
    return new PositionChecker(token);
}

function isStringLiteral(token, lexxem) {
    isTokenOfType(token, TokenType.STRINGLITERAL, lexxem);
    return new PositionChecker(token);
}
/*
function isBooleanLiteral(token, lexxem) {
    isTokenOfType(token, TokenType.BOOLEANLITERAL, lexxem);
    return new PositionChecker(token);
}
*/

function isBracket(token, lexxem) {
    isTokenOfType(token, TokenType.BRACKET, lexxem);
    return new PositionChecker(token);
}

function isPunctuation(token, lexxem) {
    isTokenOfType(token, TokenType.PUNCTUATION, lexxem);
    return new PositionChecker(token);
}

function isWhitespace(token, lexxem) {
    isTokenOfType(token, TokenType.WHITESPACE,lexxem);
    return new PositionChecker(token);
}

function isEOF(token) {
    isTokenOfType(token, TokenType.EOF, TokenType.EOF);
    return new PositionChecker(token);
}

function isTokenOfType(token, tokenType, lexxem) {
    expect(token.tokenType).toBe(tokenType);
    expect(token.lexxem).toBe(lexxem);
}

