import { ScanNoWhitespace } from '../../main/fgl/FglScanner';
import { ParseExpression } from '../../main/fgl/FglParser';
import expectAst from './FglAstMatcher';


test('simple multiplication',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3'} );
    expect(tokens).toHaveLength(4); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['*'] },
        parameters: [
            { number: '2' },
            { number: '3' }
            ]}); //metaLisp :-)
});

test('combined multiplication / division ',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 / 4'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['*'] },
        parameters: [
            { number: '2' },
            { functionName: { identifiers: ['/'] },
              parameters: [
                  { number: '3' },
                  { number: '4' }
        ]}]});
});

test('combined addition and multiplication (* rechts)',() => {
    const tokens = ScanNoWhitespace({ source: '2 + 3 * 4'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['+'] },
        parameters: [
            { number: '2' },
            { functionName: { identifiers: ['*'] },
              parameters: [
                  { number: '3' },
                  { number: '4' }
        ]}]});
});

test('combined addition and multiplication (+ rechts)',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 + 4'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['+'] },
        parameters: [
            { functionName: { identifiers: ['*'] },
              parameters: [
                  { number: '2' },
                  { number: '3' }
              ]
            },
            { number: '4' }
        ]});
});
test('complex infix',() => {
    const tokens = ScanNoWhitespace({ source: '2 * 3 > 5 & 4 - 1 ^= 2'} );
    expect(tokens).toHaveLength(12); //including EOF
    const ast = ParseExpression(tokens);

    const expected = {
        functionName: { identifiers: ['&']},
        parameters: [{
            functionName: { identifiers: ['>'] },
            parameters: [{
                functionName: { identifiers: ['*']},
                parameters:   [ { number: '2' }, { number: '3' } ]
                },
                { number: '5' }
            ]
        },
        {
            functionName: { identifiers: ['^='] },
            parameters: [{
                functionName: { identifiers: ['-']},
                parameters: [ { number: '4' }, { number: '1' } ]
                },
                { number: '2'}
            ]
        }]

    };

    expectAst(ast).toMatch(expected);
});


test('parenthesis to right',() => {
    const tokens = ScanNoWhitespace({ source: '2 * ( 3 + 4 )'} );
    expect(tokens).toHaveLength(8); //including EOF
    const ast = ParseExpression(tokens);

    const expected = {
        functionName: { identifiers: ['*']},
        parameters: [
            { number: '2' },
            {
                functionName: { identifiers: ['+'] },
                parameters:   [ { number: '3' }, { number: '4' } ]
            }]
    };

    expectAst(ast).toMatch(expected);
});

test('parenthesis to left',() => {
    const tokens = ScanNoWhitespace({ source: '( 2 + 3 ) * 4'} );
    expect(tokens).toHaveLength(8); //including EOF
    const ast = ParseExpression(tokens);

    const expected = {
        functionName: { identifiers: ['*']},
        parameters: [
            { functionName: { identifiers: ['+'] },
              parameters: [ { number: '2' }, { number: '3' } ]
            },
            { number: '4' }
        ]
    };

    expectAst(ast).toMatch(expected);
});

test('simple qIdentifier expression left',() => {
    const tokens = ScanNoWhitespace({ source: 'i + 1'} );
    expect(tokens).toHaveLength(4); //including EOF
    const ast = ParseExpression(tokens);

    const expected = {
        functionName: { identifiers: ['+']},
        parameters: [ { identifiers: ['i'] }, { number: '1'} ]
    };

    expectAst(ast).toMatch(expected);
});

test('simple qIdentifier expression right',() => {
    const tokens = ScanNoWhitespace({ source: '1 + i'} );
    expect(tokens).toHaveLength(4); //including EOF
    const ast = ParseExpression(tokens);

    const expected = {
        functionName: { identifiers: ['+']},
        parameters:   [ { number: '1'}, { identifiers: ['i'] } ]
    };

    expectAst(ast).toMatch(expected);
});

test('full qIdentifier expression left',() => {
    const tokens = ScanNoWhitespace({ source: 'person.year + 1'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = ParseExpression(tokens);

    const expected = {
        functionName: { identifiers: ['+']},
        parameters:  [
            { identifiers: ['person','year'] },
            { number: '1'}
        ]
    };

    expectAst(ast).toMatch(expected);
});
test('full qIdentifier expression right',() => {
    const tokens = ScanNoWhitespace({ source: '1 + person.year'} );
    expect(tokens).toHaveLength(6); //including EOF
    const ast = ParseExpression(tokens);

    const expected = {
        functionName: { identifiers: ['+']},
        parameters: [{ number: '1'}, { identifiers: ['person','year'] }]
    };

    expectAst(ast).toMatch(expected);
});
