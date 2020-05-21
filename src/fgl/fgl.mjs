export class Scanner {
    constructor(sourceString) {
        if (!sourceString || (sourceString && sourceString === ''))
            throw 'Source must be non-emtpy String';

        this.sourceString = sourceString;
        this.maxPosition  = sourceString.length - 1;
        this.position     = 0;

        this.lineNumber               = 0;
        this.positionInLine           = 0;
        this.tokenStartPositionInLine = 0;
    }

    scan() {
        const tokens = [];
        let peekedCharacter;
        let scannedString, tokenType;
        while(!this.isEOF(peekedCharacter = this.peek())) {
            this.tokenStartPositionInLine = this.positionInLine;
            if (this.isWhitespace(peekedCharacter)) {
                tokenType = 'WHITESPACE';
                scannedString = this.scanWhitespace();
            } else if (this.isNumber(peekedCharacter)) {
                tokenType = 'NUMBER';
                scannedString = this.scanNumber();
            } else if (this.isBracket(peekedCharacter)) {
                tokenType = 'BRACKET';
                scannedString = this.scanBracket();
            } else if (this.isPunctuation(peekedCharacter)) {
                tokenType = 'PUNCTUATION';
                scannedString = this.scanPunctuation();
            } else {
                scannedString = this.scanKeywordOrIdentifier();
                tokenType     = this.getTokenType(scannedString);
            }
            tokens.push({
                tokenType: tokenType,
                lineNumber: this.lineNumber,
                startPosition: this.tokenStartPositionInLine,
                endPosition: this.positionInLine - 1,
                lexxem:    scannedString
            });
        }
        return tokens;
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
                return 'KEYWORD';
            default:
                return 'IDENTIFIER';
        }
    }
    scanBracket() {
        return this.scanSomething(character => !this.isBracket(character));
    }

    scanPunctuation() {
        return this.scanSomething(character => !this.isPunctuation(character));
    }

    scanWhitespace() {
        return this.scanSomething(character => !this.isWhitespace(character));
    }

    scanKeywordOrIdentifier() {
        return this.scanSomething(this.terminatesIdentifierKeywordNumber.bind(this));
    }

    scanNumber() {
        return this.scanSomething(character =>
            !this.isNumber(character));
    }

    scanSomething(breakingFunction) {
        let result = '';
        let nextCharacter = this.consumeCharacterAtCurrentPosition();
        let peekedCharacter;
        while (!this.isEOF(nextCharacter)) {
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
            this.isEOF(character)         ||
            this.isWhitespace(character)  ||
            this.isPunctuation(character) ||
            this.isBracket(character)
        );
    }

    isWhitespace(character) {
        return (
            character === ' ' ||
            character === '\t' ||
            character === '\r' ||
            character === '\n');
    }

    isBracket(character) {
        return (
            character === '(' ||
            character === ')' ||
            character === '[' ||
            character === ']' ||
            character === '{' ||
            character === '}'
        );
    }

    isPunctuation(character) {
        return (
          character === '.' ||
          character === ';' ||
          character === ':' ||
          character === '!' ||
          character === '?'
        );
    }
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
    }

    isEOF (character) {
        return character === '';
    }

}
