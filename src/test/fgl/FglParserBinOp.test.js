import { ScanNoWhitespace } from '../../main/fgl/FglScanner';
import { Parse } from '../../main/fgl/FglParser';
import expectAst from './FglAstMatcher';


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

test('parenthesis',() => {
    const tokens = ScanNoWhitespace({ source: '2 * ( 3 + 4 )'} );
    expect(tokens).toHaveLength(8); //including EOF
    const ast = Parse(tokens);

    const expected = {
        identifier: '*',
        leftSide:  { number: '2' },
        rightSide: {
            identifier: '+',
            leftSide:  { number: '3' },
            rightSide: { number: '4' }
        }
    };

    expectAst(ast).toMatch(expected);
});
