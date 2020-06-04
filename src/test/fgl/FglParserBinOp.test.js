import { ScanNoWhitespace } from '../../main/fgl/FglScanner';
import { Parse } from '../../main/fgl/FglParser';


test('simple multiplication',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3'} );
    expect(tokens).toHaveLength(4); //including EOF
    const ast = Parse(tokens);
    expectAst(ast).toMatch({
        identifier: '*',
        leftSide: {
            number: '2'
        },
        rightSide: {
            number: '3'
        }
    });
});

test('combined multiplication / division ',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 / 4'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = Parse(tokens);
    expectAst(ast).toMatch({
        identifier: '*',
        leftSide: {
            number: '2'
        },
        rightSide: {
            identifier: '/',
            leftSide: {
                number: '3'
            },
            rightSide: {
                number: '4'
            }
        }
    });
});

test('combined addition and multiplication (* rechts)',() => {
    const tokens = ScanNoWhitespace({ source: '2 + 3 * 4'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = Parse(tokens);
    expectAst(ast).toMatch({
        identifier: '+',
        leftSide: {
            number: '2'
        },
        rightSide: {
            identifier: '*',
            leftSide: {
                number: '3'
            },
            rightSide: {
                number: '4'
            }
        }
    });
})

test('combined addition and multiplication (+ rechts)',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 + 4'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = Parse(tokens);
    expectAst(ast).toMatch({
        identifier: '+',
        leftSide: {
            identifier: '*',
            leftSide: {
                number: '2'
            },
            rightSide: {
                number: '3'
            }
        },
        rightSide: {
            number: '4'
        }
    });
});
test('complex infix',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 > 5 & 4 - 1 ^= 2'} );
    expect(tokens).toHaveLength(12); //including EOF
    const ast = Parse(tokens);

    const expected = {
        identifier: '&',
        leftSide: {
            identifier: '>',
            leftSide: {
                identifier: '*',
                leftSide:  { number: '2' },
                rightSide: { number: '3' }
            },
            rightSide: { number: '5' }
        },
        rightSide: {
            identifier: '^=',
            leftSide: {
                identifier: '-',
                leftSide:  { number: '4' },
                rightSide: { number: '1' }
            },
            rightSide: { number: '2'}
        }
    };

    expectAst(ast).toMatch(expected);
});

test('complex infix',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 > 5 & 4 - 1 ^= 2'} );
    expect(tokens).toHaveLength(12); //including EOF
    const ast = Parse(tokens);

    const expected = {
        identifier: '&',
        leftSide: {
            identifier: '>',
            leftSide: {
                identifier: '*',
                leftSide:  { number: '2' },
                rightSide: { number: '3' }
            },
            rightSide: { number: '5' }
        },
        rightSide: {
            identifier: '^=',
            leftSide: {
                identifier: '-',
                leftSide:  { number: '4' },
                rightSide: { number: '1' }
            },
            rightSide: { number: '2'}
        }
    };

    expectAst(ast).toMatch(expected);
});

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

function expectAst(ast) {
    return new AstExpecter(ast);
}

function matchTree(ast,expected) {
    if (expected.identifier) {
        matchBinOp(ast,expected);
    } else if (expected.number) {
        matchNumberLiteral(ast,expected);
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
}
