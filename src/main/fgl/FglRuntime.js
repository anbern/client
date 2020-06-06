import {
    EmptyStatementNode, BlockStatementNode, AssignmentStatementNode,
    IfStatementNode, WhileStatementNode, UntilStatementNode,
    FunctionInvocationNode, QIdentifierNode,
    NumberLiteralNode, StringLiteralNode, BooleanLiteralNode } from './FglAst';
import { ScanNoWhitespace } from './FglScanner';
import  { ParseStatement } from './FglParser';

export class Scope {
    constructor(parentScope) {
        this.parentScope = parentScope;
    }

    setValue(identifier, value) {
        if (identifier && identifier !== '') {
            this[identifier] = value;
        }
    }
    //Convenience API
    getValue(identifier) {
        return this.lookup(identifier);
    }

    lookup(identifier) {
        if (this.hasOwnProperty(identifier)) {
            return this[identifier];
        } else if (this.parentScope) {
            return this.parentScope.lookup(identifier);
        } else {
            return undefined;
        }
    }
}

export class Runtime  {
    static knownFunctionIdentifiersLevels = [
        ['*', '/'],
        ['+', '-'],
        ['>', '>=', '=', '^=', '<=', '<'],
        ['&', '|']
    ];

    constructor() {
        this.globalScope = new Scope(null);
    }

    loadAndRun(module) {
        const tokens     = ScanNoWhitespace(module);
        const ast        = ParseStatement(tokens);
        return this.run(ast);
    }

    run(mainAstNode) {
        return this.interpret(mainAstNode, this.globalScope);
    }

    interpret(astNode, scope) {
        if (astNode instanceof EmptyStatementNode) {
            return this.interpretEmptyStatement(astNode,scope);
        } else if (astNode instanceof BlockStatementNode) {
            return this.interpretBlockStatement(astNode, scope);
        } else if (astNode instanceof AssignmentStatementNode) {
            return this.interpretAssignmentStatement(astNode,scope);
        } else if (astNode instanceof IfStatementNode) {
            return this.interpretIfStatement(astNode, scope);
        } else if (astNode instanceof WhileStatementNode) {
            return this.interpretWhileStatement(astNode, scope);
        } else if (astNode instanceof UntilStatementNode) {
            return this.interpretUntilStatement(astNode, scope);
        }
    }

    interpretEmptyStatement(emptyNode, scope) {
        return undefined;
    }

    interpretBlockStatement(blockNode,parentScope) {
        console.log('entering anonymous block');
        const blockScope = new Scope(parentScope);
        let result = undefined;
        blockNode.children.forEach(statement => result = this.interpret(statement, blockScope));
        this.debugScopeChain(blockScope,0);
        console.log('leaving anonymous block with result ' + result);
        return result;
    }

    interpretAssignmentStatement(assignmentNode,scope) {

        const value       = this.evaluateExpression(assignmentNode.children[1], scope);
        const qIdentifier = assignmentNode.children[0];

        if (qIdentifier.children.length > 1) {
            throw new Error('does not support qualified identifiers yet');
        }
        const targetIdentifier = qIdentifier.children[0];

        scope.setValue(targetIdentifier,value);
        return value;
    }

    interpretIfStatement(ifNode, scope) {

        const value = this.evaluateExpression(ifNode.ifExpression, scope);
        if (value) {
            return this.interpret(ifNode.children[0],scope);
        } else {
            if (ifNode.children.length > 1) {
                return this.interpret(ifNode.children[1], scope);
            } else {
                return undefined;
            }
        }

    }

    interpretWhileStatement(whileNode, scope) {

        let result;
        while(this.evaluateExpression(whileNode.whileExpression, scope)) {
            result = this.interpret(whileNode.children[0],scope);
        }
        return result;

    }

    interpretUntilStatement(untilNode, scope) {
        let result;
        do {
            result = this.interpret(untilNode.children[0],scope);
        } while (!this.evaluateExpression(untilNode.untilExpression, scope));
        return result;
    }

    evaluateExpression(node,scope) {
        if (node instanceof NumberLiteralNode) {
            return node.value;
        } else if (node instanceof StringLiteralNode) {
            return node.value;
        } else if (node instanceof BooleanLiteralNode) {
            return node.value;
        } else if (node instanceof QIdentifierNode) {
            return this.evaluateQIdentifier(node,scope);
        } else if (node instanceof FunctionInvocationNode) {
            return this.evaluateFunctionInvocation(node,scope);
        } else {
            throw new Error ('cannot evaluate ' + node);
        }
    }

    evaluateQIdentifier(qIdentifier,scope) {
        const identifier = qIdentifier.children[0];
        return scope.getValue(identifier);
    }

    //This delegates everything to JavaScript
    //So undefined, null, ===, !==, NaN etc should work

    evaluateFunctionInvocation(functionInvocationNode, scope) {
        const leftValue =
            this.evaluateExpression(functionInvocationNode.children[0], scope);
        const rightValue =
            this.evaluateExpression(functionInvocationNode.children[1], scope);
        let result;
        switch(functionInvocationNode.binOpIdentifier) {
            case '&':
                result = leftValue & rightValue;
                break;
            case '|':
                result = leftValue | rightValue;
                break;
            case '<':
                result = leftValue < rightValue;
                break;
            case '<=':
                result = leftValue <= rightValue;
                break;
            case '=':
                result = leftValue === rightValue;
                break;
            case '^=':
                result = leftValue !== rightValue;
                break;
            case '>=':
                result = leftValue >= rightValue;
                break;
            case '>':
                result = leftValue > rightValue;
                break;
            case '*':
                result = leftValue * rightValue;
                break;
            case '/':
                result = leftValue / rightValue;
                break;
            case '+':
                result = leftValue + rightValue;
                break;
            case '-':
                result = leftValue - rightValue;
                break;
            default:
                result = undefined;
                break;
        }
        return result;
    }

    debugScopeChain(scope,level) {
        for(const property in scope) {
            if (property === 'parentScope' && scope.parentScope) {
                continue;
            }
            if (scope.hasOwnProperty(property)) {
                console.log('level ' + level + ' property ' + property + ' value ' + scope[property]);
            }
        }
        if (scope.parentSocpe) {
            console.log('this scope has a parent scope');
            this.debugScopeChain(scope.parentScope, level-1);
        } else {
            console.log('this scope does not have a parent scope');
        }
    }
}

