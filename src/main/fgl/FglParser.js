import {
    EmptyStatementNode, BlockStatementNode, AssignmentStatementNode,
    IfStatementNode, WhileStatementNode, UntilStatementNode,
    FunctionInvocationNode, QIdentifierNode,
    ParamExpressionListNode,
    NumberLiteralNode, StringLiteralNode, BooleanLiteralNode } from './FglAst';
import { Runtime } from './FglRuntime';
import { SourceCodeReference } from './FglSourceCodeReference'


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
            return this.parseUntilStatement();
        } else if (nextToken.is(';')) {
            return this.parseEmptyStatement();
        }
    }

    parseBlockStatement() {
        let endToken;
        const startToken = this.peek();

        if (startToken.is('{')) {
            this.consumeToken();
            const blockSourceCodeReference = SourceCodeReference.copy(startToken.sourceCodeReference);
            const blockStatement = new BlockStatementNode(blockSourceCodeReference);
            endToken = this.peek();
            while(!endToken.is('}')) {
                const innerStatement = this.parseStatement();
                blockStatement.addChild(innerStatement);
                endToken = this.peek();
            }
            this.consumeToken();
            blockStatement.sourceCodeReference.append(endToken.sourceCodeReference);
            return blockStatement;
        }
    }

    parseAssignmentStatement() {
        const nextToken = this.peek();
        if (nextToken.isIdentifier()) {
            const lvalue = this.parseQIdentifier();
            const assignOperatorToken = this.peek();
            if (!assignOperatorToken.is('=')) {
                throw new Error ('assign operator = expected');
            }
            this.consumeToken();
            const rvalue = this.parseInfixFunctionInvocationLevel(3);
            const assignmentSourceCodeReference = SourceCodeReference.copy(lvalue.sourceCodeReference);
            assignmentSourceCodeReference.append(rvalue.sourceCodeReference);
            const newAssignmentStatementNode = new AssignmentStatementNode(assignmentSourceCodeReference);
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
            const ifSourceCodeReference = SourceCodeReference.copy(ifToken.sourceCodeReference);
            ifSourceCodeReference.append(ifBlock.sourceCodeReference);
            if (elseBlock) {
                ifSourceCodeReference.append(elseBlock.sourceCodeReference);
            }
            const ifStatement = new IfStatementNode(ifSourceCodeReference, ifExpression);
            ifStatement.addChild(ifBlock);
            if (elseBlock) { ifStatement.addChild(elseBlock) }
            return ifStatement;
        }
        return null;
    }

    parseWhileStatement() {
        const nextToken = this.peek();
        if (nextToken.is('while')) {
            this.consumeToken();
            const whileExpression = this.parseInfixFunctionInvocationLevel(3);
            const whileBlock = this.parseBlockStatement();
            const whileSourceCodeReference = SourceCodeReference.copy(nextToken.sourceCodeReference);
            whileSourceCodeReference.append(whileBlock.sourceCodeReference);
            const whileStatementNode = new WhileStatementNode(whileSourceCodeReference, whileExpression);
            whileStatementNode.addChild(whileBlock);
            return whileStatementNode;
        }
        return null;
    }

    parseUntilStatement() {
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
            const untilSourceCodeReference = SourceCodeReference.copy(nextToken.sourceCodeReference);
            untilSourceCodeReference.append(untilExpression.sourceCodeReference);
            const untilStatementNode = new UntilStatementNode(untilSourceCodeReference, untilExpression);
            untilStatementNode.addChild(doUntilBlock);
            return untilStatementNode;
        }
        return null;
    }

    parseEmptyStatement() {
        const nextToken = this.peek();
        if (nextToken.is(';')) {
            this.consumeToken();
            return new EmptyStatementNode(nextToken.sourceCodeReference);
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

        const finSourceCodeReference = SourceCodeReference.copy(leftNode.sourceCodeReference);
        finSourceCodeReference.append(infixFunctionInvocationRest.rightSide.sourceCodeReference);

        const functionInvocationNode = new FunctionInvocationNode(
            finSourceCodeReference,
            infixFunctionInvocationRest.operatorIdentifier
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
        const operatorIdentifier = new QIdentifierNode(operatorToken.sourceCodeReference);
        operatorIdentifier.addChild(operatorToken.lexxem);
        const rightSide = this.parseInfixFunctionInvocationLevel(level);

        return {
            operatorIdentifier: operatorIdentifier,
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
            return this.parseQIdentifierOrParenFunctionInvocation();
        }
    }

    parseQIdentifierOrParenFunctionInvocation() {
        const qIdentifier = this.parseQIdentifier();
        let result;
        if (qIdentifier) {
            const openParen = this.peek();
            if (openParen.is('(')) {
                this.consumeToken();
                const functionInvocationSourceCodeReference = SourceCodeReference.copy(qIdentifier.sourceCodeReference);
                result = new FunctionInvocationNode(
                    functionInvocationSourceCodeReference,
                    qIdentifier);
                const paramExpressionList = this.parseParamExpressionList();
                if (paramExpressionList) {
                    functionInvocationSourceCodeReference.append(paramExpressionList.sourceCodeReference);
                    result.children = paramExpressionList.children;
                }
                const closingParen = this.peek();
                if (closingParen.is(')')) {
                    this.consumeToken();
                    result.sourceCodeReference.append(closingParen.sourceCodeReference);
                } else {
                    throw new Error ('Closing paren expected');
                }
            } else {
                result = qIdentifier;
            }
        } else {
            result = null;
        }
        return result;
    }

    parseParamExpressionList() {
        const firstExpression = this.parseInfixFunctionInvocationLevel(3);
        if (!firstExpression) {
            //empty function invocation f()
            return null;
        }
        const paramExpressionSourceCodeReference = SourceCodeReference.copy(firstExpression.sourceCodeReference);
        const result = new ParamExpressionListNode(paramExpressionSourceCodeReference);
        const restList = this.parseParamExpressionListRest();
        if (restList) {
            result.sourceCodeReference.append(restList.sourceCodeReference);
            result.children = [firstExpression].concat(restList.children);
        } else {
            result.children.push(firstExpression);
        }
        return result;
    }

    parseParamExpressionListRest() {
        const comma = this.peek();
        let result;
        if (comma.is(',')) {
            this.consumeToken();
            const restExpression = this.parseParamExpressionList();
            result = restExpression;
        } else {
            result = null;
        }
        return result;
    }
    parseQIdentifier() {
        const nextToken = this.peek();
        if (nextToken.isIdentifier()) {
            this.consumeToken();
            const qIdentifierRest = this.parseQIdentifierRest();
            if (qIdentifierRest) {
                qIdentifierRest.children =
                    [nextToken.lexxem].concat(qIdentifierRest.children);
                qIdentifierRest.sourceCodeReference.prepend(nextToken.sourceCodeReference);
                return qIdentifierRest;
            } else {
                const newQIdentifierNode = new QIdentifierNode(nextToken.sourceCodeReference);
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
            rest.sourceCodeReference.prepend(nextToken.sourceCodeReference);
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
            expression.sourceCodeReference.prepend(nextToken.sourceCodeReference);
            expression.sourceCodeReference.append(peekedToken.sourceCodeReference);
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

