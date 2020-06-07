import { AssignmentStatementNode,
    EmptyStatementNode,
    BlockStatementNode,
    IfStatementNode,
    UntilStatementNode,
    WhileStatementNode } from '../../main/fgl/FglAst';

/*
 * Helper Functions
 */

class AstExpecter {
    constructor(ast) {
        this.ast = ast;
    }
    toMatch(expected) {
        matchTree(this.ast,expected);
    }
}

export default function expectAst(ast) {
    return new AstExpecter(ast);
}

function matchTree(ast,expected) {
    if (expected.binOpIdentifier) {
        matchBinOp(ast,expected);
    } else if (expected.number) {
        matchNumberLiteral(ast,expected);
    } else if (expected.string) {
        matchStringLiteral(ast,expected);
    } else if (expected.booleanValue) {
        matchBooleanLiteral(ast,expected);
    } else if (expected.identifiers) {
        matchQIdentifier(ast,expected);
    } else if (expected.statementType) {
        switch(expected.statementType) {
            case 'assignment':
                matchAssignmentStatement(ast,expected);
                break;
            case 'empty':
                matchEmptyStatement(ast,expected);
                break;
            case 'block':
                matchBlockStatement(ast,expected);
                break;
            case 'if':
                matchIfStatement(ast,expected);
                break;
            case 'until':
                matchUntilStatement(ast,expected);
                break;
            case 'while':
                matchWhileStatement(ast,expected);
                break;
            default:
                throw new Error('Unknown statement type expected ' + expected.statementType);
                //break;
        }
    }
}

function matchAssignmentStatement(ast,expected) {
    if (ast instanceof AssignmentStatementNode) {
        expect(ast.children).toHaveLength(2);
        const lvalue = ast.children[0];
        const rvalue = ast.children[1];
        matchTree(lvalue,expected.lvalue);
        matchTree(rvalue,expected.rvalue);
    } else {
        throw new Error ('no assignmentStatementNode');
    }
}

function matchEmptyStatement(ast,expected) {
    if (ast instanceof EmptyStatementNode) {
        expect(expected.statementType).toBe('empty');
    } else {
        throw new Error ('no emptyStatementNode');
    }
}

function matchBlockStatement(ast, expected) {
    if (ast instanceof BlockStatementNode) {
        if (!expected.statements) {
            expect(ast.children).toHaveLength(0);
        } else {
            expect(ast.children.length).toBe(expected.statements.length);
        }
        ast.children.forEach((statement,index) => matchTree(statement,expected.statements[index]));
    } else {
        throw new Error ('no BlockStatementNode');
    }
}

function matchIfStatement(ast, expected) {
    if (ast instanceof IfStatementNode) {
        expect(ast.ifExpression).toBeDefined();
        expect(ast.children.length).toBeGreaterThanOrEqual(1);
        expect(ast.children.length).toBeLessThanOrEqual(2);
        matchTree(ast.ifExpression, expected.ifExpression);
        matchTree(ast.children[0],expected.ifBranch);
        if(ast.children.length === 2) {
            matchTree(ast.children[1],expected.elseBranch);
        }
    } else {
        throw new Error ('no IfStatementNode');
    }
}

function matchUntilStatement(ast, expected) {
    if (ast instanceof UntilStatementNode) {
        expect(ast.untilExpression).toBeDefined();
        expect(ast.children).toHaveLength(1);
        matchTree(ast.untilExpression,expected.untilExpression);
        matchTree(ast.children[0],expected.blockStatement);
    } else {
        throw new Error ('no UntilStatementNode');
    }
}

function matchWhileStatement(ast, expected) {
    if (ast instanceof WhileStatementNode) {
        expect(ast.whileExpression).toBeDefined();
        expect(ast.children).toHaveLength(1);
        matchTree(ast.whileExpression,expected.whileExpression);
        matchTree(ast.children[0],expected.blockStatement);
    } else {
        throw new Error ('no WhileStatementNode');
    }
}

function matchBinOp(ast,operator) {
    expect(ast).toMatchObject({binOpIdentifier:operator.binOpIdentifier});
    expect(ast.children).toHaveLength(2);
    const leftSide = ast.children[0];
    const rightSide = ast.children[1];
    matchTree(leftSide,operator.leftSide);
    matchTree(rightSide,operator.rightSide);
}

function matchNumberLiteral(ast,numberLiteral) {
    expect(ast).toMatchObject({token:{lexxem:numberLiteral.number}});
    expect(ast.value).toBe(parseInt(numberLiteral.number,10));
}

function matchStringLiteral(ast,stringLiteral) {
    expect(ast).toMatchObject({
        value: stringLiteral.string,
    });
    expect(ast.token).toBeDefined();
    expect(ast.token.lexxem).toBe('"' + stringLiteral.string + '"');
}

function matchBooleanLiteral(ast,booleanLiteral) {
    expect(ast.value).toBe(booleanLiteral.booleanValue);
    expect(ast.token).toBeDefined();
    //true and false are 4GL and JavaScript keywords
    //mere happenstance
    expect(ast.token.lexxem).toBe(booleanLiteral.booleanValue.toString());
}

function matchQIdentifier(ast,qIdentifier) {
    expect(ast.children).toHaveLength(qIdentifier.identifiers.length);
    qIdentifier.identifiers.forEach((identifier, index) => {
        expect(ast.children[index]).toBe(identifier);
    });
}

