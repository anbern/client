import { Token, SourceCodeReference } from './FglScanner';

const knownFunctionIdentifiers = [
  ['*','/']
];

class AstNode {}

class ParentAstNode extends AstNode {
    constructor() {
        super();
        this.children = [];
    }
}

class FunctionInvocationNode extends ParentAstNode {
    constructor(identifier) {
        super();
        this.identifier = identifier;
    }
}

class LiteralNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }
}

class NumberLiteralNode extends LiteralNode {
    constructor(token) {
        super(token);
    }

}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.currentPosition = 0;
        this.maxPosition = tokens.length - 1;
    }

    parseInfixFunctionInvocation() {
        const numberLiteralNode = this.parseNumberLiteral();
        const infixFunctionInvocationRest = this.parseInfixFunctionInvocationRest();
        if (infixFunctionInvocationRest === null) {
            return numberLiteralNode;
        }
        const functionInvocationNode = new FunctionInvocationNode(
            infixFunctionInvocationRest.operatorToken.lexxem
        );
        functionInvocationNode.addChild(numberLiteralNode);
        functionInvocationNode.addChild(infixFunctionInvocationRest.rightSide);
    }

    parseInfixFunctionInvocationRest() {
        const operatorToken = this.peek();
        if (!operatorToken.isIdentifier() ||
            (   //operatorToken.isIdentifier &&
                !this.knownFunctionIdentifiers.includes(operatorToken.lexxem))) {
            return null;
        }

        this.consumeToken();
        const rightSide = this.parseInfixFunctionInvocation();
        return {
            operatorToken,
            rightSide
        };
    }

    parseNumberLiteral() {
        const nextToken = this.peek();
        if (nextToken.isNumberLiteral()) {
            this.consumeToken();
            return new NumberLiteralNode(nextToken);
        }
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

