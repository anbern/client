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
export class Scanner {
    constructor(sourceString) {
        if (!sourceString || (sourceString && sourceString === '')) {
            throw new Error('Source must be non-emtpy String');
        }

        this.sourceString = sourceString;
        this.maxPosition  = sourceString.length - 1;
        this.position     = 0;

        this.lineNumber               = 0;
        this.positionInLine           = 0;
        this.tokenStartPositionInLine = 0;

        this.breakStringLiteral       = false;
    }

    scan() {
        const tokens = [];
        let peekedCharacter;
        let scannedString, tokenType;
        while(!ScannedCharacters.isEOF(peekedCharacter = this.peek())) {
            this.tokenStartPositionInLine = this.positionInLine;
            if (ScannedCharacters.isWhitespace(peekedCharacter)) {
                tokenType = 'WHITESPACE';
                scannedString = this.scanWhitespace();
            } else if (ScannedCharacters.isQuotationMark(peekedCharacter)) {
                tokenType = 'STRINGLITERAL';
                scannedString = this.scanStringLiteral();
            } else if (ScannedCharacters.isNumber(peekedCharacter)) {
                tokenType = 'NUMBERLITERAL';
                scannedString = this.scanNumberLiteral();
            } else if (ScannedCharacters.isBracket(peekedCharacter)) {
                tokenType = 'BRACKET';
                scannedString = this.scanBracket();
            } else if (ScannedCharacters.isPunctuation(peekedCharacter)) {
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
        tokens.push({
            tokenType: 'EOF',
            lineNumber: this.lineNumber,
            startPosition: this.tokenStartPositionInLine,
            endPosition: this.positionInLine - 1,
            lexxem: '$'
        });
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

class AstNode {

    constructor(nodeType) {
        this.nodeType = nodeType;
        this.children = [];
    }

    addChild(astNode) {
        this.children.push(astNode);
    }

}

class OpNode extends AstNode {

    constructor(nodeType, opCode) {
        super(nodeType);
        this.opCode = opCode;
    }

}

export class Parser {

    constructor(tokens) {
        this.tokens = tokens;
        this.nextTokenPosition = 0;
        this.maxTokenPosition = this.tokens.length - 1;
    }

    //€ is epsilon :-)

    //factor => number factorRest
    //factorRest => ('*'|'/') factor
    //            | €
    factor() {
        const nextToken = this.peekToken();
        if (this.isNumberLiteral(nextToken)) {
            this.consumeToken();
            const factorRest = this.factorRest();
            if (factorRest === null) {
               return nextToken;
            } else {
               const opNode = new OpNode('FACTOR',factorRest.opCode);
               opNode.addChild(nextToken);
               opNode.addChild(factorRest.factor);
               return opNode;
            }
        } else {
            throw new Error('Factor: expected number literal but found ' + nextToken.lexxem);
        }
    }

    factorRest() {
        const nextToken = this.peekToken();
        if (this.isOperatorTimes(nextToken) || this.isOperatorDivide(nextToken)) {
            this.consumeToken();
            const nextFactor = this.factor();
            return ({
                opCode: nextToken,
                factor: nextFactor
            });
        } else {
            return null;
        }
    }


    //term => factor termRest
    //termRest => ('+'|'-') term
    //          | €

    term() {
        const firstFactor = this.factor();
        const termRest = this.termRest();
        if (termRest === null) {
            return firstFactor;
        } else {
            const opNode = new OpNode('TERM', termRest.opCode);
            opNode.addChild(firstFactor);
            opNode.addChild(termRest.term);
            return opNode;
        }
    }

    termRest() {
        const nextToken = this.peekToken();
        if (this.isOperatorPlus(nextToken) || this.isOperatorMinus(nextToken)) {
            this.consumeToken();
            const nextTerm = this.term();
            return ({
                opCode: nextToken,
                term: nextTerm
            });
        } else {
            return null;
        }
    }

    //comparison => term comparisonRest
    //comparisonRest => ('<'|'<='|'=='|'!='|'>='|'>') comparison
    //          | €

    comparison() {
        const firstTerm = this.term();
        const comparisonRest = this.comparisonRest();
        if (comparisonRest === null) {
            return firstTerm;
        } else {
            const opNode = new OpNode('COMPARISON', comparisonRest.opCode);
            opNode.addChild(firstTerm);
            opNode.addChild(comparisonRest.comparison);
            return opNode;
        }
    }

    comparisonRest() {
        const nextToken = this.peekToken();
        if (this.isOperatorLessThan(nextToken) ||
            this.isOperatorLessEqual(nextToken) ||
            this.isOperatorEqual(nextToken) ||
            this.isOperatorNotEqual(nextToken) ||
            this.isOperatorGreaterEqual(nextToken) ||
            this.isOperatorGreaterThan(nextToken)) {
            this.consumeToken();
            const nextComparison = this.comparison();
            return ({
                opCode: nextToken,
                comparison: nextComparison
            });
        } else {
            //€ - epsiolon
            return null;
        }
    }

    //bool => comparison boolRest
    //boolRest => ('&&'|'||') bool
    //          | €

    bool() {
        const firstComparison = this.comparison();
        const boolRest = this.boolRest();
        if (boolRest === null) {
            return firstComparison;
        } else {
            const opNode = new OpNode('BOOL', boolRest.opCode);
            opNode.addChild(firstComparison);
            opNode.addChild(boolRest.bool);
            return opNode;
        }
    }

    boolRest() {
        const nextToken = this.peekToken();
        if (this.isOperatorAnd(nextToken) ||
            this.isOperatorOr(nextToken)) {
            this.consumeToken();
            const nextBool = this.bool();
            return ({
                opCode: nextToken,
                bool: nextBool
            });
        } else {
            //€ - epsiolon
            return null;
        }
    }

    /*
     * supporting functions
     */

    isOperatorAnd(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '&&');
    }
    isOperatorOr(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '||');
    }

    isOperatorLessThan(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '<');
    }
    isOperatorLessEqual(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '<=');
    }
    isOperatorEqual(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '==');
    }
    isOperatorNotEqual(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '!=');
    }
    isOperatorGreaterEqual(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '>=');
    }
    isOperatorGreaterThan(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '>');
    }

    isOperatorTimes(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '*');
    }
    isOperatorDivide(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '/');
    }

    isOperatorPlus(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '+');
    }
    isOperatorMinus(token) {
        return (token.tokenType === 'IDENTIFIER' && token.lexxem === '-');
    }

    isNumberLiteral(token) {
        return (token.tokenType === 'NUMBERLITERAL');
    }

    peekToken() {
        if (this.nextTokenPosition > this.maxTokenPosition) {
            return this.tokens[this.maxTokenPosition];
        } else {
            return this.tokens[this.nextTokenPosition];
        }
    }

    consumeToken() {
        this.nextTokenPosition = this.nextTokenPosition + 1;
    }

}
