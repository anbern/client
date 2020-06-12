import { ScanNoWhitespace } from '../../main/fgl/FglScanner';
import { ParseExpression, ParseStatement } from '../../main/fgl/FglParser';
import expectAst from './FglAstMatcher';


test('simple function invocation',() => {
    const tokens = ScanNoWhitespace({ source: 'f(x)'} );
    expect(tokens).toHaveLength(5); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['f'] },
        parameters: [
            { identifiers: ['x'] }
        ]})
});

test('empty function invocation',() => {
    const tokens = ScanNoWhitespace({ source: 'f( )'} );
    expect(tokens).toHaveLength(4); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['f'] },
        parameters: []
        });
});

test('function invocation of function invocation', () => {
    const tokens = ScanNoWhitespace({ source: 'f ( g ( x ) )'} );
    expect(tokens).toHaveLength(8); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['f'] },
        parameters: [{
            functionName: {identifiers: ['g']},
            parameters: [{identifiers: ['x']}]
        }]});
});

test('function invocations of paren expressions', () => {
    const tokens = ScanNoWhitespace({ source: '+ ( 3 * ( 4 + 5 ) )'} );
    expect(tokens).toHaveLength(11); //including EOF
    const ast = ParseExpression(tokens);
    expectAst(ast).toMatch({
        functionName: { identifiers: ['+'] },
        parameters: [{
            functionName: {identifiers: ['*']},
            parameters: [
                { number: '3' },
                {  functionName: { identifiers: ['+'] },
                   parameters: [
                       { number: '4' },
                       { number: '5'}
            ]}]}]}); //wouldn't lisp be just better?
});

test('function declaration 2 params', () => {
    const tokens = ScanNoWhitespace({ source: 'function plus ( a , b ) { plus = a + b }'} );
    expect(tokens).toHaveLength(15); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        declares: { identifiers: ['plus']},
        parameters: [ { identifiers: ['a'] }, { identifiers: ['b'] } ],
        body: {
            statementType: 'block',
            statements: [
                { statementType: 'assignment',
                    lvalue: { identifiers: ['plus']},
                    rvalue: {
                        functionName: { identifiers: ['+']},
                        parameters: [ { identifiers:['a'] }, { identifiers:['b'] }]
                    }
                }
            ]
        }
    });
});

test('function declaration 1 param', () => {
    const tokens = ScanNoWhitespace({ source: 'function uminus ( a ) { uminus = 0 - a }'} );
    expect(tokens).toHaveLength(13); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        declares: { identifiers: ['uminus']},
        parameters: [ { identifiers: ['a'] } ],
        body: {
            statementType: 'block',
            statements: [
                { statementType: 'assignment',
                    lvalue: { identifiers: ['uminus']},
                    rvalue: {
                        functionName: { identifiers: ['-']},
                        parameters: [ { number: '0' }, { identifiers:['a'] }]
                    }
                }
            ]
        }
    });
});

test('function declaration zero param', () => {
    const tokens = ScanNoWhitespace({ source: 'function random ( ) { random = systemtime }'} );
    expect(tokens).toHaveLength(10); //including EOF
    const ast = ParseStatement(tokens);
    expectAst(ast).toMatch({
        declares: { identifiers: ['random']},
        parameters: [ ],
        body: {
            statementType: 'block',
            statements: [
                { statementType: 'assignment',
                    lvalue: { identifiers: ['random']},
                    rvalue: { identifiers:  ['systemtime']}
                }
            ]
        }
    });
});