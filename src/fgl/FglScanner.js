
class SourceCodeReference {
    constructor(module,
                startPosition, endPosition,
                startLineNumber, endLineNumber,
                startPositionInLine, endPositionInLine) {
        this.module                 = module;
        this.startPosition          = startPosition;
        this.endPosition            = endPosition;
        this.startLineNumber        = startLineNumber;
        this.endLineNumber          = endLineNumber;
        this.startPositionInLine    = startPositionInLine;
        this.endPositionInLine      = endPositionInLine;
    }
}

export const TokenType  = {
    EOF             : 'EOF',
    IDENTIFIER      : 'IDENTIFIER',
    KEYWORD         : 'KEYWORD',
    BRACKET         : 'BRACKET',
    PUNCTUATION     : 'PUNCTUATION',
    WHITESPACE      : 'WHITESPACE',
    STRINGLITERAL   : 'STRINGLITERAL',
    NUMBERLITERAL   : 'NUMBERLITERAL',
    BOOLEANLITERAL  : 'BOOLEANLITERAL'
};

export class Token {

    constructor(tokenType, lexxem, sourceCodeReference) {
        this.tokenType           = tokenType;
        this.lexxem              = lexxem;
        this.sourceCodeReference = sourceCodeReference;
    }

}
const ScannedCharacters = {
    isWhitespace(character) {
        return (
            character === ' ' ||
            character === '\t' ||
            character === '\r' ||
            character === '\n');
    },

    isBracket(character) {
        return (
            character === '(' ||
            character === ')' ||
            character === '[' ||
            character === ']' ||
            character === '{' ||
            character === '}'
        );
    },

    isPunctuation(character) {
        return (
            character === '.' ||
            character === ';' ||
            character === ':' ||
            character === '!' ||
            character === '?'
        );
    },

    isQuotationMark(character) {
        return (
            character === '"'
        );
    },

    isNumber(character) {
        return (
            character === '0' ||
            character === '1' ||
            character === '2' ||
            character === '3' ||
            character === '4' ||
            character === '5' ||
            character === '6' ||
            character === '7' ||
            character === '8' ||
            character === '9' );
    },

    isEOF (character) {
        return character === '';
    }
};

class Scanner {
    constructor(sourceString) {
        if (!sourceString || (sourceString && sourceString === '')) {
            throw new Error('Source must be non-emtpy String');
        }

        this.sourceString = sourceString;
        this.maxPosition  = sourceString.length - 1;
        this.position     = 0;

        this.tokenStartPosition       = 0;
        this.lineNumber               = 0;
        this.positionInLine           = 0;
        this.tokenStartPositionInLine = 0;

        this.breakStringLiteral       = false;

        this.tokens = [];
    }

    scan() {
        let peekedCharacter;
        let scannedString, tokenType;
        while(!ScannedCharacters.isEOF(peekedCharacter = this.peek())) {
            this.tokenStartPosition         = this.position;
            this.tokenStartPositionInLine   = this.positionInLine;
            if (ScannedCharacters.isWhitespace(peekedCharacter)) {
                tokenType = TokenType.WHITESPACE;
                scannedString = this.scanWhitespace();
            } else if (ScannedCharacters.isQuotationMark(peekedCharacter)) {
                tokenType = TokenType.STRINGLITERAL;
                scannedString = this.scanStringLiteral();
            } else if (ScannedCharacters.isNumber(peekedCharacter)) {
                tokenType = TokenType.NUMBERLITERAL;
                scannedString = this.scanNumberLiteral();
            } else if (ScannedCharacters.isBracket(peekedCharacter)) {
                tokenType = TokenType.BRACKET;
                scannedString = this.scanBracket();
            } else if (ScannedCharacters.isPunctuation(peekedCharacter)) {
                tokenType = TokenType.PUNCTUATION;
                scannedString = this.scanPunctuation();
            } else {
                scannedString = this.scanKeywordOrIdentifier();
                tokenType     = this.getTokenType(scannedString);
            }
            this.pushToken(tokenType,scannedString);
        }
        this.pushToken(TokenType.EOF,TokenType.EOF);
        return this.tokens;
    }

    pushToken(tokenType, lexxem) {
        const sourceCodeReference = this.createSourceCodeReference();
        const newToken = new Token(tokenType, lexxem, sourceCodeReference);
        this.tokens.push(newToken);
    }

    createSourceCodeReference() {
        return new SourceCodeReference(
            null,
            this.tokenStartPosition,
            this.position - 1,
            this.lineNumber,
            this.lineNumber,
            this.tokenStartPositionInLine,
            this.positionInLine - 1
            )
    }

    getTokenType(lexxem) {
        switch(lexxem) {
            case 'if':
            case 'then':
            case 'else':
            case 'do':
            case 'while':
            case 'until':
            case 'end':
                return TokenType.KEYWORD;
            default:
                return TokenType.IDENTIFIER;
        }
    }
    scanBracket() {
        return this.scanSomething(character => !ScannedCharacters.isBracket(character));
    }

    scanPunctuation() {
        return this.scanSomething(character => !ScannedCharacters.isPunctuation(character));
    }

    scanWhitespace() {
        return this.scanSomething(character => !ScannedCharacters.isWhitespace(character));
    }

    scanStringLiteral() {
        return this.scanSomething(character => {
            if (ScannedCharacters.isQuotationMark(character)) {
                //the string stops here, include the closing quotation mark
                //break at position AFTER closing quotation mark
                this.breakStringLiteral = true;
                return false;
            } else {
                if (this.breakStringLiteral) {
                    this.breakStringLiteral = false;
                    return true;
                }
                return false;
            }
        });
    }

    scanKeywordOrIdentifier() {
        return this.scanSomething(this.terminatesIdentifierKeywordNumber.bind(this));
    }

    scanNumberLiteral() {
        return this.scanSomething(character =>
            !ScannedCharacters.isNumber(character));
    }

    scanSomething(breakingFunction) {
        let result = '';
        let nextCharacter = this.consumeCharacterAtCurrentPosition();
        let peekedCharacter;
        while (!ScannedCharacters.isEOF(nextCharacter)) {
            result = result + nextCharacter;
            peekedCharacter = this.peek();
            if (breakingFunction(peekedCharacter)) {
                break;
            } else {
                nextCharacter = this.consumeCharacterAtCurrentPosition();
            }
        }
        return result;
    }

    peek() {
        const peekPosition = this.position; //consumes sets peek position
        return (peekPosition > this.maxPosition) ? ''
            : this.sourceString.charAt(peekPosition);
    }

    consumeCharacterAtCurrentPosition() {
        const characterAtPosition = (this.position <= this.maxPosition) ?
            this.sourceString.charAt(this.position) :
            '';
        this.position = this.position + 1;
        if (characterAtPosition === '\n') {
            this.lineNumber = this.lineNumber + 1;
            this.positionInLine = 0;
        } else {
            this.positionInLine = this.positionInLine + 1;
        }
        return characterAtPosition;
    }

    terminatesIdentifierKeywordNumber(character) {
        return (
            ScannedCharacters.isEOF(character)         ||
            ScannedCharacters.isWhitespace(character)  ||
            ScannedCharacters.isPunctuation(character) ||
            ScannedCharacters.isBracket(character)
        );
    }
}

export function scan(module) {
    const source    = module.source;
    const scanner   = new Scanner(source);
    const tokens    = scanner.scan();
    return tokens;
}
