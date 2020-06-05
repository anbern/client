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
    if (expected.identifier) {
        matchBinOp(ast,expected);
    } else if (expected.number) {
        matchNumberLiteral(ast,expected);
    } else if (expected.string) {
        matchStringLiteral(ast,expected);
    } else if (expected.booleanValue) {
        matchBooleanLiteral(ast,expected);
    }
}
function matchBinOp(ast,operator) {
    expect(ast).toMatchObject({identifier:operator.identifier});
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
