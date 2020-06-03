import { FunctionInvocationNode, NumberLiteralNode } from './FglAst';

const Runtime = {
    knownFunctionIdentifiers: ['*', '/'],
    knownFunctionIdentifiersLevels: [
        ['*','/'],
        ['+', '-'],
        ['>','>=','=','^=','<=','<'],
        ['&','|']
    ]
};

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        //before begin
        this.currentPosition = -1;
        this.maxPosition = tokens.length - 1;
    }

    parseInfixFunctionInvocationLevel(level) {
        const leftNode = (level >= 0 ? this.parseInfixFunctionInvocationLevel(level -1 )
                                      //end of prioritized binary operators
                                      : this.parseNumberLiteral());
        if (level === -1) {
            return leftNode;
        }

        const infixFunctionInvocationRest = this.parseInfixFunctionInvocationRestLevel(level);
        if (infixFunctionInvocationRest === null) {
            return leftNode;
        }

        const functionInvocationNode = new FunctionInvocationNode(
            infixFunctionInvocationRest.operatorToken.lexxem
        );
        functionInvocationNode.addChild(leftNode);
        functionInvocationNode.addChild(infixFunctionInvocationRest.rightSide);
        return functionInvocationNode;
    }

    parseInfixFunctionInvocationRestLevel(level) {
        const operatorToken = this.peek();
        if (!operatorToken.isIdentifier() ||
            (   //operatorToken.isIdentifier &&
                !Runtime.knownFunctionIdentifiersLevels[level].includes(operatorToken.lexxem))) {
            return null;
        }

        this.consumeToken();
        const rightSide = this.parseInfixFunctionInvocationLevel(level);
        return {
            operatorToken: operatorToken,
            rightSide: rightSide
        };
    }

    parseNumberLiteral() {
        const nextToken = this.peek();
        if (nextToken.isNumberLiteral()) {
            this.consumeToken();
            return new NumberLiteralNode(nextToken);
        }
        return null;
    }

    /*
     * Helper methods
     */
    peek() {
        // The scanner puts EOF token at position maxPosition
        if (this.currentPosition <= this.maxPosition) {
            return this.tokens[this.currentPosition + 1]
        } else {
            return this.tokens[this.maxPosition];
        }
    }

    consumeToken() {
        if (this.currentPosition < this.maxPosition) {
            this.currentPosition = this.currentPosition + 1;
        }
    }
}

export function Parse(tokens) {
    const parser = new Parser(tokens);
    return parser.parseInfixFunctionInvocationLevel(3);
}

