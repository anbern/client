import {
    EmptyStatementNode, BlockStatementNode, AssignmentStatementNode,
    IfStatementNode, WhileStatementNode, UntilStatementNode,
    FunctionInvocationNode, QIdentifierNode,
    NumberLiteralNode, StringLiteralNode, BooleanLiteralNode } from './FglAst';
import { ScanNoWhitespace } from './FglScanner';
import { ParseStatement } from './FglParser';

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
        const result =  this.lookup(identifier);
        return result;
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

    log() {
        console.log('logging scope');
        if (this.parentScope) {
            console.log('\tthis scope has a parent scope');
        } else {
            console.log('\this is the GLOBAL scope which does not have a parent scope');
        }
        for(const property in this) {
            if (this.hasOwnProperty(property)) {
                if (property !== 'parentScope') {
                    console.log('\tProperty: ' + property + ' value: ' + this[property]);
                }
            }
        }
    }
}

export class Debugger {

    static Event = {
        BeforeExpression: 'BeforeExpression',
        AfterExpression: 'AfterExpression',
        BeforeStatement: 'BeforeStatement',
        AfterStatement: 'AfterStatement'
    };

    constructor(runtime) {
        this.runtime = runtime;
        this.lineNumberEntries = [];
    }

    reset() {
        this.lineNumberEntries = [];
    }

    enterExpression(expressionNode, scope) {
        this.processDebugLine(
          expressionNode.sourceCodeReference.startLineNumber,
          Debugger.Event.BeforeExpression,
          expressionNode,
          scope,
            null);
    }
    exitExpression(expressionNode, scope, result) {
        this.processDebugLine(
            expressionNode.sourceCodeReference.endLineNumber,
            Debugger.Event.AfterExpression,
            expressionNode,
            scope,
            result);
    }

    enterStatement(statementNode, scope) {
        this.processDebugLine(
            statementNode.sourceCodeReference.startLineNumber,
            Debugger.Event.BeforeStatement,
            statementNode,
            scope,
            null);
    }
    exitStatement(statementNode, scope, result) {
        this.processDebugLine(
            statementNode.sourceCodeReference.endLineNumber,
            Debugger.Event.AfterStatement,
            statementNode,
            scope,
            result);
    }

    debugScopeChain(scope,level) {
        for(const property in scope) {
            if (property === 'parentScope') {
                continue;
            }
            if (scope.hasOwnProperty(property)) {
                console.log('level ' + level + ' property ' + property + ' value ' + scope[property]);
            }
        }
        if (scope.parentScope) {
            console.log('level ' + level + ' this scope has a parent scope');
            this.debugScopeChain(scope.parentScope, level-1);
        } else {
            console.log('level ' + level + ' this scope does not have a parent scope');
        }
    }

    addDebugLine(lineNumber,  event, nodeScopeResultConsumer) {
        const lineNumberCommand = {
            lineNumber: lineNumber,
            event: event,
            nodeScopeResultConsumer: nodeScopeResultConsumer
        };
        this.lineNumberEntries.push(lineNumberCommand);
    }

    processDebugLine(lineNumber, debugEvent, node, scope, result) {
        const lineCommands = this.lineNumberEntries.filter(entry => entry.lineNumber === lineNumber);
        lineCommands.forEach(command => {
            if (command.event === debugEvent) {
                command.nodeScopeResultConsumer(node, scope, result);
            }
        })
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
        this.debugger = new Debugger(this);
    }

    addDebugLine(lineNumber, event, nodeScopeResultConsumer) {
        this.debugger.addDebugLine(lineNumber, event, nodeScopeResultConsumer);
    }

    resetDebugger() {
        this.debugger.reset();
    }

    loadAndRun(module) {
        const tokens     = ScanNoWhitespace(module);
        const ast        = ParseStatement(tokens);
        return this.run(ast);
    }

    run(mainAstNode) {
        const result = this.interpretStatement(mainAstNode, this.globalScope);
        return result;
    }

    interpretStatement(astNode, scope) {
        this.debugger.enterStatement(astNode, scope);
        let result;
        if (astNode instanceof EmptyStatementNode) {
            result = this.interpretEmptyStatement(astNode,scope);
        } else if (astNode instanceof BlockStatementNode) {
            result = this.interpretBlockStatement(astNode, scope);
        } else if (astNode instanceof AssignmentStatementNode) {
            result = this.interpretAssignmentStatement(astNode,scope);
        } else if (astNode instanceof IfStatementNode) {
            result = this.interpretIfStatement(astNode, scope);
        } else if (astNode instanceof WhileStatementNode) {
            result = this.interpretWhileStatement(astNode, scope);
        } else if (astNode instanceof UntilStatementNode) {
            result = this.interpretUntilStatement(astNode, scope);
        }
        this.debugger.exitStatement(astNode, scope, result);
        return result;
    }

    interpretEmptyStatement(emptyNode, scope) {
        return undefined;
    }

    interpretBlockStatement(blockNode,parentScope) {
        const blockScope = new Scope(parentScope);
        let result = undefined;
        blockNode.children.forEach(statement =>
            result = this.interpretStatement(statement, blockScope));
        return result;
    }

    interpretAssignmentStatement(assignmentNode,scope) {

        const value       = this.evaluateExpression(assignmentNode.children[1], scope);
        const qIdentifier = assignmentNode.children[0];
        const targetInfo  = this.evaluateQIdentifierLValue(qIdentifier, scope);

        targetInfo.lScope.setValue(targetInfo.lIdentifier,value);
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
            result = this.interpretStatement(whileNode.children[0],scope);
        }
        return result;

    }

    interpretUntilStatement(untilNode, scope) {
        let result;
        do {
            result = this.interpretStatement(untilNode.children[0],scope);
        } while (!this.evaluateExpression(untilNode.untilExpression, scope));
        return result;
    }

    evaluateExpression(node,scope) {
        let result;
        this.debugger.enterExpression(node,scope);
        if (node instanceof NumberLiteralNode) {
            result =  node.value;
        } else if (node instanceof StringLiteralNode) {
            result =  node.value;
        } else if (node instanceof BooleanLiteralNode) {
            result =  node.value;
        } else if (node instanceof QIdentifierNode) {
            result =  this.evaluateQIdentifierRValue(node,scope);
        } else if (node instanceof FunctionInvocationNode) {
            result = this.evaluateFunctionInvocation(node,scope);
        } else {
            throw new Error ('cannot evaluate ' + node);
        }
        this.debugger.exitExpression(node,scope,result);
        return result;
    }

    evaluateQIdentifierRValue(qIdentifier,scope) {
        let currentValue = scope;
        qIdentifier.children.forEach(identifier => {
           currentValue = currentValue.lookup(identifier);
        });
        return currentValue;
    }

    evaluateQIdentifierLValue(qIdentifier,scope) {
        let currentScope = scope;
        const lastIdentifier = qIdentifier.children[qIdentifier.children.length - 1];
        if (qIdentifier.children.length > 1) {
            for(let index = 0; index <= qIdentifier.children.length - 2; index++) {
                currentScope = currentScope.lookup(qIdentifier.children[index]);
            }
        }
        const currentValue = currentScope.getValue(lastIdentifier);
        return { lScope: currentScope, lIdentifier: lastIdentifier, rValue: currentValue };
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

}
