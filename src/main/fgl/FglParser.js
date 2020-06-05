import {
    EmptyStatementNode, BlockStatementNode, AssignmentStatementNode,
    IfStatementNode, WhileStatementNode, UntilStatementNode,
    FunctionInvocationNode, QIdentifierNode,
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

    parseStatement() {
        const nextToken = this.peek();
        if (nextToken.is('{')) {
            return this.parseBlockStatement();
        } else if (nextToken.isIdentifier()) {
            return this.parseAssignmentStatement();
        } else if (nextToken.is('if')) {
            return this.parseIfStatement();
        } else if (nextToken.is('while')) {
            return this.parseWhileStatement();
        } else if (nextToken.is('do')) {
            return this.parseDoUntilStatement();
        } else if (nextToken.is(';')) {
            return this.parseEmptyStatement();
        }
    }

    parseBlockStatement() {
        const nextToken = this.peek();
        if (nextToken.is('{')) {
            this.consumeToken();
            const blockStatement = new BlockStatementNode();
            while(this.peek() !== '}') {
                const innerStatement = this.parseStatement();
                blockStatement.addChild(innerStatement);
            }
            this.consumeToken();
            return blockStatement;
        }
    }

    parseAssignmentStatement() {
        const nextToken = this.peek();
        if (nextToken.isIdentifier()) {
            const lvalue = this.parseQIdentifier();
            const assignOperatorToken = this.peek();
            if (!assignOperatorToken.is(':=')) {
                throw new Error ('assign operator := expected');
            }
            this.consumeToken();
            const rvalue = this.parseInfixFunctionInvocationLevel(3);
            const newAssignmentStatementNode = new AssignmentStatementNode();
            newAssignmentStatementNode.addChild(lvalue);
            newAssignmentStatementNode.addChild(rvalue);
            return newAssignmentStatementNode;
        }
        return null;
    }

    parseIfStatement() {
        const ifToken = this.peek();
        if (ifToken.is('if')) {
            this.consumeToken();
            const ifExpression = this.parseInfixFunctionInvocationLevel(3);
            const ifBlock    = this.parseBlockStatement();
            let   elseBlock;
            const elseToken = this.peek();
            if (elseToken.is('else')) {
                this.consumeToken();
                elseBlock = this.parseBlockStatement();
            }
            const ifStatement = new IfStatementNode(ifExpression);
            ifStatement.addChild(ifBlock);
            if (elseBlock) { ifStatement.addChild(elseBlock) }
        }
        return null;
    }

    parseWhileStatement() {
        const nextToken = this.peek();
        if (nextToken.is('while')) {
            this.consumeToken();
            const whileExpression = this.parseInfixFunctionInvocationLevel(3);
            const whileBlock = this.parseBlockStatement();
            const whileStatementNode = new WhileStatementNode(whileExpression);
            whileStatementNode.addChild(whileBlock);
            return whileStatementNode;
        }
        return null;
    }

    parseDoUntilStatement() {
        const nextToken = this.peek();
        if (nextToken.is('do')) {
            this.consumeToken();
            const doUntilBlock = this.parseBlockStatement();
            const untilToken = this.peek();
            if (!untilToken.is('until')) {
                throw new Error('<until> expected');
            }
            this.consumeToken();
            const untilExpression = this.parseInfixFunctionInvocationLevel(3);
            const untilStatementNode = new UntilStatementNode(untilExpression);
            untilStatementNode.addChild(doUntilBlock);
            return untilStatementNode;
        }
        return null;
    }



    parseEmptyStatement() {
        const nextToken = this.peek();
        if (nextToken.is(';')) {
            this.consumeToken();
            return new EmptyStatementNode();
        }
        return null;
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

/*
 * Public API for Parser
 */
export function ParseExpression(tokens) {
    const parser = new Parser(tokens);
    return parser.parseInfixFunctionInvocationLevel(3);
}

export function ParseStatement(tokens) {
    const parser = new Parser(tokens);
    return parser.parseStatement();
}

