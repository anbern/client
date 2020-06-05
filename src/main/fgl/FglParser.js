import {
    FunctionInvocationNode,
    QIdentifierNode,
    NumberLiteralNode, StringLiteralNode, BooleanLiteralNode } from './FglAst';

const Runtime = {
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
                                      : this.parseLowLevelExpressionElement());
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

    parseLowLevelExpressionElement() {
        const nextToken = this.peek();
        if (nextToken.isNumberLiteral()) {
            return this.parseNumberLiteral();
        } else if (nextToken.isStringLiteral()) {
            return this.parseStringLiteral();
        } else if (nextToken.isBooleanLiteral()) {
            return this.parseBooleanLiteral();
        } else if (nextToken.is('(')) {
            return this.parseParenExpression();
        } else if (nextToken.isIdentifier()) {
            return this.parseQIdentifier();
        }
    }

    parseQIdentifier() {
        const nextToken = this.peek();
        if (nextToken.isIdentifier()) {
            this.consumeToken();
            const qIdentifierRest = this.parseQIdentifierRest();
            if (qIdentifierRest) {
                qIdentifierRest.children =
                    [nextToken.lexxem].concat(qIdentifierRest.children);
                return qIdentifierRest;
            } else {
                const newQIdentifierNode = new QIdentifierNode();
                newQIdentifierNode.addChild(nextToken.lexxem);
                return newQIdentifierNode;
            }
        }
        return null;
    }

    parseQIdentifierRest() {
        const nextToken = this.peek();
        if (nextToken.is('.')) {
            this.consumeToken();
            const rest = this.parseQIdentifier();
            if (!rest) {
                throw new Error('Identifier expected');
            }
            return rest;
        }
        return null;

    }

    parseParenExpression() {
        const nextToken = this.peek();
        if (nextToken.is('(')) {
            this.consumeToken();
            const expression = this.parseInfixFunctionInvocationLevel(3);
            const peekedToken = this.peek();
            if (peekedToken.is(')')) {
                this.consumeToken();
            } else {
                throw new Error('Missing (');
            }
            return expression;
        }
    }

    parseNumberLiteral() {
        const nextToken = this.peek();
        if (nextToken.isNumberLiteral()) {
            this.consumeToken();
            return new NumberLiteralNode(nextToken);
        }
        return null;
    }

    parseStringLiteral() {
        const nextToken = this.peek();
        if (nextToken.isStringLiteral()) {
            this.consumeToken();
            return new StringLiteralNode(nextToken);
        }
        return null;
    }

    parseBooleanLiteral() {
        const nextToken = this.peek();
        if (nextToken.isBooleanLiteral()) {
            this.consumeToken();
            return new BooleanLiteralNode(nextToken);
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

